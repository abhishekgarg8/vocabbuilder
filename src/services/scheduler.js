const cron = require('node-cron');
const Logger = require('../utils/logger');

class Scheduler {
    constructor(whatsappClient, config) {
        if (!whatsappClient) {
            throw new Error('WhatsApp client is required for scheduler');
        }
        this.whatsappClient = whatsappClient;
        this.config = config;
    }

    async sendDailyWord() {
        try {
            Logger.info('Scheduler: Attempting to send daily word...');
            const message = "🎯 Test Message from VocabBuilder"; // We'll implement actual word fetching later
            await this.whatsappClient.sendMessage(this.config.groupId, message);
            Logger.info('Scheduler: Daily word sent successfully');
        } catch (error) {
            Logger.error('Scheduler: Failed to send daily word:', error);
        }
    }

    start() {
        try {
            Logger.info('==== Scheduler Configuration ====');
            
            // 1. Production schedule - 5 AM daily
            const productionExpression = '0 5 * * *';
            Logger.info(`Setting up production schedule for 5 AM Pacific Time`);
            
            // 2. Test schedule - 10 minutes from now
            const testTime = new Date();
            testTime.setMinutes(testTime.getMinutes() + 10);
            const testMinutes = testTime.getMinutes();
            const testHours = testTime.getHours();
            const testExpression = `${testMinutes} ${testHours} * * *`;
            Logger.info(`Setting up test schedule for: ${testTime.toLocaleString()}`);
    
            // Validate both expressions
            if (!cron.validate(productionExpression) || !cron.validate(testExpression)) {
                throw new Error('Invalid cron expression');
            }
    
            // Schedule both jobs
            cron.schedule(productionExpression, 
                () => {
                    Logger.info('Production schedule triggered, sending daily word...');
                    this.sendDailyWord();
                },
                {
                    timezone: 'America/Los_Angeles'
                }
            );
    
            cron.schedule(testExpression, 
                () => {
                    Logger.info('Test schedule triggered, sending test word...');
                    this.sendDailyWord();
                },
                {
                    timezone: 'America/Los_Angeles'
                }
            );
    
            Logger.info('Schedulers started successfully');
            Logger.info(`Production schedule: ${productionExpression} (5 AM Pacific daily)`);
            Logger.info(`Test schedule: ${testExpression} (${testTime.toLocaleString()})`);
    
            return true;
        } catch (error) {
            Logger.error('Failed to start scheduler:', error);
            Logger.error('Error details:', error.stack);
            throw error;
        }
    }
}

module.exports = Scheduler;