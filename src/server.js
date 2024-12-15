const express = require('express');
const app = express();
const Logger = require('./utils/logger');

// Use Render's assigned port or fallback to 3000
const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    Logger.info(`Server running on port ${port}`);
});

app.get('/test-word', async (req, res) => {
    try {
        await scheduler.sendDailyWord();
        res.send('Test word sent successfully');
    } catch (error) {
        res.status(500).send('Error sending test word: ' + error.message);
    }
});

// In src/server.js
app.get('/next-run', (req, res) => {
    const cronExpression = '0 5 * * *';
    const timezone = 'America/Los_Angeles';
    const next = cron.nextDate(cronExpression, {
        timezone: timezone
    });
    res.json({
        nextRun: next.toLocaleString('en-US', { timeZone: timezone }),
        currentTime: new Date().toLocaleString('en-US', { timeZone: timezone })
    });
});

module.exports = app;