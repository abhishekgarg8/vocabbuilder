const cron = require('node-cron');
const Logger = require('../utils/logger');
const VocabularyService = require('./vocabulary');

class Scheduler {
    constructor(whatsappClient, config) {
        this.whatsappClient = whatsappClient;
        this.config = config;
        this.vocabService = new VocabularyService();
    }
/*
    async sendDailyWord() {
        try {
            Logger.info('Scheduler: Fetching daily word...');
            const word = await this.vocabService.getNextWord();
            
            Logger.info(`Scheduler: Sending word "${word.Word}" to group...`);
            await this.whatsappClient.sendMessage(
                this.config.groupId,
                word.Message
            );
            Logger.info(`Scheduler: Successfully sent word ${word.Word} (ID: ${word.ID})`);
        } catch (error) {
            Logger.error('Scheduler: Failed to send daily word:', error);
        }
    }
*/

async sendDailyWord() {
    try {
        Logger.info('Scheduler: Fetching daily word...');
        const word = await this.vocabService.getNextWord();
        
        // Format the message
        const message = `📚 *Word of the Day*\n\n` +
            `*${word.Word}*\n` +
            `_(${word.Pronunciation})_\n\n` +
            `*Definition:* ${word.Definition}\n\n` +
            `*Example:* ${word.Sentence}\n\n` +
            `*PM Samples:*\n${word.Examples}`;

        Logger.info(`Scheduler: Sending word "${word.Word}" to group...`);
        Logger.info('Message to be sent:', message);  // Log the message for debugging
        
        await this.whatsappClient.sendMessage(
            this.config.groupId,
            message
        );
        Logger.info(`Scheduler: Successfully sent word ${word.Word} (ID: ${word.ID})`);
    } catch (error) {
        Logger.error('Scheduler: Failed to send daily word:', error);
        Logger.error('Word data:', error.word);  // Log the word data if available
    }
}
start() {
    const cronExpression = '0 5 * * *'; // 5 AM daily
    Logger.info('==== Scheduler Verification ====');
    Logger.info(`Setting up scheduler with expression: ${cronExpression}`);
    
    try {
        const job = cron.schedule(cronExpression, 
            () => {
                Logger.info('Cron job triggered');
                this.sendDailyWord();
            }, 
            {
                timezone: 'America/Los_Angeles',
                scheduled: true
            }
        );

        Logger.info('Scheduler status:', job.getStatus());
        
        // Calculate next run
        const nextRun = new Date();
        nextRun.setHours(5, 0, 0, 0);
        if (nextRun < new Date()) {
            nextRun.setDate(nextRun.getDate() + 1);
        }
        Logger.info(`Next scheduled run: ${nextRun.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`);
        
        return job;
    } catch (error) {
        Logger.error('Failed to start scheduler:', error);
        throw error;
    }
}
}

module.exports = Scheduler;