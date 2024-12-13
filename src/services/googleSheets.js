const Logger = require('../utils/logger');
const Papa = require('papaparse');

class GoogleSheetsService {
    constructor() {
        this.spreadsheetId = '1vlmteFFgQEQPWydGNWSXVhwYYoS6fFNG5cyxNu-koU8';
        this.csvUrl = `https://docs.google.com/spreadsheets/d/${this.spreadsheetId}/export?format=csv`;
    }

    async getSheetData() {
        try {
            Logger.info('Fetching data from Google Sheets...');
            
            const response = await fetch(this.csvUrl);
            if (!response.ok) {
                throw new Error(`Failed to fetch sheet data: ${response.statusText}`);
            }
            
            const csvText = await response.text();
            
            return new Promise((resolve, reject) => {
                Papa.parse(csvText, {
                    header: true,
                    dynamicTyping: true,
                    complete: (results) => {
                        // Log the first row to see exact structure
                        Logger.info('Sample row data:', JSON.stringify(results.data[0], null, 2));
                        
                        if (results.errors.length > 0) {
                            Logger.error('CSV parsing errors:', results.errors);
                        }
                        
                        resolve(results.data);
                    },
                    error: (error) => {
                        Logger.error('Error parsing CSV:', error);
                        reject(error);
                    }
                });
            });
        } catch (error) {
            Logger.error('Error in getSheetData:', error);
            throw error;
        }
    }
}

module.exports = GoogleSheetsService;