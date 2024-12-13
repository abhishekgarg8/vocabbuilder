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
        Logger.info(`Scheduler: Setting up daily messages for ${cronExpression} Pacific Time`);
        
        cron.schedule(cronExpression, 
            () => this.sendDailyWord(), 
            {
                timezone: 'America/Los_Angeles'
            }
        );
        
        Logger.info('Scheduler: Successfully started! Next word will be sent at 5 AM Pacific Time');
        
        // Optional: Log when the next word will be sent
        const now = new Date();
        const next5AM = new Date();
        next5AM.setHours(5, 0, 0, 0);
        if (now.getHours() >= 5) {
            next5AM.setDate(next5AM.getDate() + 1);
        }
        Logger.info(`Scheduler: Next word will be sent at: ${next5AM.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}`);
    }
}

module.exports = Scheduler;