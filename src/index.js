const config = require('./config/config');
const Logger = require('./utils/logger');
const WhatsAppClient = require('./services/whatsapp');
const Scheduler = require('./services/scheduler');

global.scheduler = null;

async function initialize() {
    Logger.info('Starting VocabBuilder Service...');
    Logger.info(`Environment: ${config.environment}`);

    try {
        const whatsappClient = new WhatsAppClient();
        
        // Add timeout for ready state
        const readyTimeout = setTimeout(() => {
            Logger.error('WhatsApp client ready timeout after 2 minutes');
        }, 120000); // 2 minutes timeout

        whatsappClient.client.on('ready', async () => {
            clearTimeout(readyTimeout);
            Logger.info('WhatsApp client is ready, initializing scheduler...');
            
            try {
                global.scheduler = new Scheduler(whatsappClient, config);
                global.scheduler.start();
                Logger.info('Scheduler initialized and started successfully');
            } catch (error) {
                Logger.error('Failed to initialize scheduler:', error);
            }
        });

        // Add more event listeners
        whatsappClient.client.on('disconnected', (reason) => {
            Logger.error('WhatsApp client disconnected:', reason);
        });

        whatsappClient.client.on('auth_failure', (message) => {
            Logger.error('WhatsApp authentication failed:', message);
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
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection at:', promise);
    Logger.error('Reason:', reason);
});

initialize();

module.exports = { initialize };