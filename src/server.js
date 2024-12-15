const express = require('express');
const cron = require('node-cron');
const app = express();
const Logger = require('./utils/logger');

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// Test word endpoint
app.get('/test-word', async (req, res) => {
    try {
        Logger.info('Manual test word request received');
        if (!global.scheduler) {
            throw new Error('Scheduler not initialized');
        }
        await global.scheduler.sendDailyWord();
        res.send('Test word sent successfully');
    } catch (error) {
        Logger.error('Error sending test word:', error);
        res.status(500).send(`Error: ${error.message}`);
    }
});

// Scheduler status endpoint
app.get('/scheduler-status', (req, res) => {
    try {
        const status = {
            schedulerInitialized: !!global.scheduler,
            currentTime: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }),
            nextRun: null
        };
        
        if (global.scheduler) {
            const nextRun = new Date();
            nextRun.setHours(5, 0, 0, 0);
            if (nextRun < new Date()) {
                nextRun.setDate(nextRun.getDate() + 1);
            }
            status.nextRun = nextRun.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' });
        }
        
        res.json(status);
    } catch (error) {
        res.status(500).send(`Error: ${error.message}`);
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    Logger.info(`Server running on port ${port}`);
});

module.exports = app;