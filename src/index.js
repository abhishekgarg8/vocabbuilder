const config = require('./config/config');
const Logger = require('./utils/logger');
const WhatsAppClient = require('./services/whatsapp');
const Scheduler = require('./services/scheduler');
const express = require('express');

const app = express();
global.scheduler = null;

//global error handler
process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', promise, 'Reason:', reason);
    // Optionally exit the process
    process.exit(1);
});

// Add basic routes
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.get('/scheduler-status', (req, res) => {
    res.json({
        schedulerInitialized: !!global.scheduler,
        currentTime: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
    });
});

app.get('/test-word', async (req, res) => {
    try {
        if (!global.scheduler) {
            throw new Error('Scheduler not initialized');
        }
        await global.scheduler.sendDailyWord();
        res.send('Test word sent successfully');
    } catch (error) {
        Logger.error('Test word error:', error);
        res.status(500).send(`Error: ${error.message}`);
    }
});

app.get('/send-daily-word', async (req, res) => {
    try {
        if (!global.scheduler) {
            throw new Error('Scheduler not initialized');
        }
        await global.scheduler.sendDailyWord();
        res.status(200).send('Daily word sent successfully');
    } catch (error) {
        Logger.error('Error in /send-daily-word endpoint:', error);
        res.status(500).send(`Error: ${error.message}`);
    }
});

async function startServer() {
    return new Promise((resolve, reject) => {
        try {
            const port = process.env.PORT || 10000;
            const server = app.listen(port, '0.0.0.0', () => {
                Logger.info(`Server is running on port ${port}`);
                Logger.info(`Loaded groupId from config: ${config.groupId}`);
                resolve(server);
            });
        } catch (error) {
            reject(error);
        }
    });
}

async function initialize() {
    Logger.info('Starting VocabBuilder Service...');
    Logger.info(`Environment: ${config.environment}`);

    try {
        // Start server first
        await startServer();
        Logger.info('Server started successfully');

        // Then initialize WhatsApp
        const whatsappClient = new WhatsAppClient();
        whatsappClient.client.on('ready', async () => {
            Logger.info('WhatsApp client is ready, initializing scheduler...');
            try {
                global.scheduler = new Scheduler(whatsappClient, config);
                // global.scheduler.start();
                Logger.info('Scheduler initialized and started successfully');
            } catch (error) {
                Logger.error('Failed to initialize scheduler:', error);
            }
        });

        await whatsappClient.start();
    } catch (error) {
        Logger.error('Failed to start service:', error);
        process.exit(1);
    }
}

// Error handlers
process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', promise);
    Logger.error('Reason:', reason);
    if (reason && reason.stack) {
        Logger.error('Stack trace:', reason.stack);
    }
});

initialize();