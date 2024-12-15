const config = require('./config/config');
const Logger = require('./utils/logger');
const WhatsAppClient = require('./services/whatsapp');
const Scheduler = require('./services/scheduler');
const express = require('express');

const app = express();
global.scheduler = null;

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

async function initialize() {
    Logger.info('Starting VocabBuilder Service...');
    Logger.info(`Environment: ${config.environment}`);

    try {
        const whatsappClient = new WhatsAppClient();
        
        whatsappClient.client.on('ready', async () => {
            Logger.info('WhatsApp client is ready, initializing scheduler...');
            try {
                global.scheduler = new Scheduler(whatsappClient, config);
                global.scheduler.start();
                Logger.info('Scheduler initialized and started successfully');
            } catch (error) {
                Logger.error('Failed to initialize scheduler:', error);
            }
        });

        await whatsappClient.start();

        // Start the server
        const port = process.env.PORT || 10000;
        app.listen(port, '0.0.0.0', () => {
            Logger.info(`Server is running on port ${port}`);
        });

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
});

initialize();