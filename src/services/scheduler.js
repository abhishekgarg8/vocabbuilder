const cron = require('node-cron');
const Logger = require('../utils/logger');
const VocabularyService = require('./vocabulary');
const groupId = "120363377431957386@g.us"; // Hardcoded Group ID

class Scheduler {
    constructor(whatsappClient, config) {
        if (!whatsappClient) {
            throw new Error('WhatsApp client is required for scheduler');
        }
        this.whatsappClient = whatsappClient;
        this.config = config;
        this.vocabularyService = new VocabularyService();
    }

    async sendDailyWord() {
        let word = null; // Ensure word is always defined
        try {
            Logger.info('Scheduler: Attempting to send daily word...');
            const word = await this.vocabularyService.getNextWord();
            if (!word || !word.Message) {
                throw new Error('Invalid word or message format');
            }
            Logger.info(`Preparing to send word: ${word.Word}`);
          //  Logger.info(`Using group ID: ${this.config.groupId}`);
            Logger.info(`Using group ID: ${groupId}`);
            await this.whatsappClient.sendMessage(groupId, word.Message);
            Logger.info(`Scheduler: Daily word "${word.Word}" sent successfully`);
        } catch (error) {
            Logger.error('Scheduler: Failed to send daily word:', error);
            Logger.error('Word data:', word);
            Logger.error('Group ID:', groupId);
        }
    }

    start() {
        Logger.info('Scheduler start called, but cron scheduling is now handled externally.');
    }
}

process.on('unhandledRejection', (reason, promise) => {
    Logger.error('Unhandled Rejection:', reason);
    if (reason && reason.stack) {
        Logger.error('Stack trace:', reason.stack);
    }
});

module.exports = Scheduler;