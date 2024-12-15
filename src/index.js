const config = require('./config/config');
const Logger = require('./utils/logger');
const WhatsAppClient = require('./services/whatsapp');
const Scheduler = require('./services/scheduler');
require('./server');

let whatsappClient = null;
let scheduler = null;
global.scheduler = null;
async function initialize() {
    Logger.info('Starting VocabBuilder Service...');
    Logger.info(`Environment: ${config.environment}`);

    try {
        whatsappClient = new WhatsAppClient();
        await whatsappClient.start();

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