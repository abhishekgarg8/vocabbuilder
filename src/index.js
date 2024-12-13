const config = require('./config/config');
const Logger = require('./utils/logger');
const WhatsAppClient = require('./services/whatsapp');
const Scheduler = require('./services/scheduler');
require('./server');

let whatsappClient = null;
let scheduler = null;

async function initialize() {
    Logger.info('Starting VocabBuilder Service...');
    Logger.info(`Environment: ${config.environment}`);

    try {
        whatsappClient = new WhatsAppClient();
        await whatsappClient.start();

        whatsappClient.client.on('ready', async () => {
            Logger.info('WhatsApp client is ready');
            
            try {
                // Start scheduler
                scheduler = new Scheduler(whatsappClient, config);
                scheduler.start();
                Logger.info('Scheduler started successfully - Words will be sent daily at 5 AM Pacific Time');
            } catch (error) {
                Logger.error('Error in initialization:', error);
            }
        });
    } catch (error) {
        Logger.error('Failed to start service:', error);
        process.exit(1);
    }
}

// Error handlers
process.on('uncaughtException', (error) => {
    Logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', promise);
    Logger.error('Reason:', reason);
});

initialize();