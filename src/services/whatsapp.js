const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const Logger = require('../utils/logger');

class WhatsAppClient {
    constructor() {
        this.client = new Client({
            authStrategy: new LocalAuth({
                clientId: "vocab-builder",
                dataPath: "./sessions"
            }),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        });

        this.initializeClient();
    }

    initializeClient() {
        // Handle QR code generation
        this.client.on('qr', (qr) => {
            // Print QR in a more visible format
            Logger.info('='.repeat(50));
            Logger.info('SCAN QR CODE BELOW:');
            Logger.info('='.repeat(50));
            qrcode.generate(qr, { small: false }); // Changed to larger QR code
            Logger.info('='.repeat(50));
            Logger.info('After scanning, wait for the "WhatsApp client is ready!" message');
            Logger.info('='.repeat(50));
        });

        // Handle successful authentication
        this.client.on('ready', () => {
            Logger.info('WhatsApp client is ready!');
        });

        // Handle connection events
        this.client.on('authenticated', () => {
            const fs = require('fs');
            Logger.info('WhatsApp client authenticated');
            try {
                const cwd = process.cwd();
                Logger.info(`Current working directory: ${cwd}`);
                
                const sessionsPath = './sessions';
                const exists = fs.existsSync(sessionsPath);
                Logger.info(`Sessions directory exists: ${exists}`);
        
                // Try to list all directories in current path
                Logger.info('Directory contents:', fs.readdirSync('.'));
                
                if (exists) {
                    try {
                        const files = fs.readdirSync(sessionsPath);
                        Logger.info(`Number of session files: ${files.length}`);
                        Logger.info(`Session files: ${JSON.stringify(files)}`);
                        
                        // Check permissions
                        const stats = fs.statSync(sessionsPath);
                        Logger.info(`Sessions directory permissions: ${stats.mode}`);
                    } catch (e) {
                        Logger.error(`Error reading sessions directory: ${e.message}`);
                    }
                } else {
                    Logger.info(`Attempting to create sessions directory at: ${sessionsPath}`);
                    try {
                        fs.mkdirSync(sessionsPath, { recursive: true, mode: 0o777 });
                        Logger.info('Successfully created sessions directory');
                    } catch (e) {
                        Logger.error(`Error creating sessions directory: ${e.message}`);
                    }
                }
            } catch (error) {
                Logger.error(`Error in session check: ${error.message}`);
                Logger.error(`Full error: ${error.stack}`);
            }
        });

        this.client.on('auth_failure', (msg) => {
            Logger.error('WhatsApp authentication failed:', msg);
        });

        this.client.on('disconnected', (reason) => {
            Logger.error('WhatsApp client disconnected:', reason);
        });

        // Handle errors
        this.client.on('error', (error) => {
            Logger.error('WhatsApp client error:', error);
        });
    }

    async start() {
        try {
            Logger.info('Initializing WhatsApp client...');
            await this.client.initialize();
        } catch (error) {
            Logger.error('Failed to initialize WhatsApp client:', error);
            throw error;
        }
    }

    async sendMessage(groupId, message) {
        try {
            const chat = await this.client.getChatById(groupId);
            await chat.sendMessage(message);
            Logger.info(`Message sent to group ${groupId}`);
            return true;
        } catch (error) {
            Logger.error('Failed to send message:', error);
            throw error;
        }
    }
}

module.exports = WhatsAppClient;