const fs = require('fs').promises;
const path = require('path');
const Logger = require('../utils/logger');
const GoogleSheetsService = require('./googleSheets');

class VocabularyService {
    constructor() {
        this.lastSentWordPath = path.join(__dirname, '../data/lastSentWord.json');
        this.googleSheets = new GoogleSheetsService();
    }

    async getLastSentWordId() {
        try {
            Logger.info('Reading last sent word ID...');
            const data = await fs.readFile(this.lastSentWordPath, 'utf8');
            const lastId = JSON.parse(data).lastId || 0;
            Logger.info(`Last sent word ID: ${lastId}`);
            return lastId;
        } catch (error) {
            Logger.info('No previous word ID found, starting from beginning');
            await this.updateLastSentWordId(0);
            return 0;
        }
    }

    async updateLastSentWordId(id) {
        try {
            // Ensure the directory exists
            const dir = path.dirname(this.lastSentWordPath);
            await fs.mkdir(dir, { recursive: true });
            
            await fs.writeFile(
                this.lastSentWordPath, 
                JSON.stringify({ lastId: id, lastUpdated: new Date().toISOString() })
            );
            Logger.info(`Updated last sent word ID to: ${id}`);
        } catch (error) {
            Logger.error('Error updating last sent word ID:', error);
            throw error;
        }
    }

    async getNextWord() {
        try {
            Logger.info('Getting next word...');
            const lastId = await this.getLastSentWordId();
            Logger.info(`Fetching sheet data...`);
            const data = await this.googleSheets.getSheetData();
            Logger.info(`Fetched ${data.length} words from sheet`);

            // Find next word (wrap around if reached end)
            const nextId = (lastId % data.length) + 1;
            Logger.info(`Looking for word with ID: ${nextId}`);
            const nextWord = data.find(row => row.ID === nextId);

            if (nextWord) {
                Logger.info(`Found word: ${nextWord.Word}`);
                await this.updateLastSentWordId(nextId);
                return nextWord;
            } else {
                throw new Error(`Word with ID ${nextId} not found in dataset`);
            }
        } catch (error) {
            Logger.error(`Error getting next word: ${error.message}`);
            throw error;
        }
    }
}

module.exports = VocabularyService;