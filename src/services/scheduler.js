const cron = require('node-cron');
const Logger = require('../utils/logger');
const VocabularyService = require('./vocabulary');

class Scheduler {
    constructor(whatsappClient, config) {
        if (!whatsappClient) {
            throw new Error('WhatsApp client is required for scheduler');
        }
        this.whatsappClient = whatsappClient;
        this.config = config;
        this.vocabularyService = new VocabularyService();
        this.cronTasks = []; // Track all cron jobs
    }

    async sendDailyWord() {
        try {
            Logger.info('Scheduler: Attempting to send daily word...');
            const word = await this.vocabularyService.getNextWord();
            if (!word || !word.Message) {
                throw new Error('Invalid word or message format');
            }
            Logger.info(`Preparing to send word: ${word.Word}`);
            Logger.info(`Using group ID: ${this.config.groupId}`);
            
            await this.whatsappClient.sendMessage(this.config.groupId, word.Message);
            Logger.info(`Scheduler: Daily word "${word.Word}" sent successfully`);
        } catch (error) {
            Logger.error('Scheduler: Failed to send daily word:', error);
            Logger.error('Word data:', word);
            Logger.error('Group ID:', this.config.groupId);
        }
    }

    start() {
        try {
            Logger.info('==== Scheduler Configuration ====');
            // Stop existing cron tasks
            this.cronTasks.forEach(task => task.stop());
            this.cronTasks = []; // Clear the array 
            // Log the configuration
            Logger.info('Scheduler Config:', this.config);
           // Production schedule - 5 AM daily
            const productionExpression = '0 5 * * *';
            const productionTask = cron.schedule(
               productionExpression,
               () => {
                   Logger.info('Production schedule triggered, sending daily word...');
                   this.sendDailyWord();
               },
               { timezone: 'America/Los_Angeles' }
            );
            this.cronTasks.push(productionTask); // Track the task

            // 2. Test schedule - 10 minutes from now
            const testTime = new Date();
            testTime.setMinutes(testTime.getMinutes() + 4);
            const testMinutes = testTime.getMinutes();
            const testHours = testTime.getHours();
            const testExpression = `${testMinutes} ${testHours} * * *`;
            Logger.info(`Setting up test schedule for: ${testTime.toLocaleString()}`);
            Logger.info('Production cron expression valid:', cron.validate(productionExpression));
            Logger.info('Test cron expression valid:', cron.validate(testExpression));
            const testTask = cron.schedule(
                testExpression,
                () => {
                    Logger.info('Test schedule triggered, sending test word...');
                    this.sendDailyWord();
                },
                { timezone: 'America/Los_Angeles' }
            );
            this.cronTasks.push(testTask); // Track the task

            Logger.info('Schedulers started successfully');
            return true;
        } catch (error) {
            Logger.error('Failed to start scheduler:', error);
            Logger.error('Error details:', error.stack);
            throw error;
        }
    }
}

module.exports = Scheduler;