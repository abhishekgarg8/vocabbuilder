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
                args: ['--no-sandbox', '--disable-setuid-sandbox','--disable-dev-shm-usage', '--disable-extensions','--disable-gpu','--enable-logging','--v=1']
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
            Logger.info('Client connection state:', this.client.getState());
            Logger.info('Checking if client can send messages...');
            
            // Test if basic client functions are available
            if (this.client.sendMessage) {
                Logger.info('Message sending capability is available');
            }
        });

        // Handle connection events
        this.client.on('authenticated', () => {
            const fs = require('fs');
            Logger.info('WhatsApp client authenticated');
            Logger.info('Session directory contents:', fs.readdirSync('./sessions'));
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

        this.client.on('disconnected', async (reason) => {
            Logger.error('WhatsApp client disconnected:', reason);
            let retryCount = 0;
            const MAX_RETRIES = 2;
            while (retryCount < MAX_RETRIES) {
                try {
                    retryCount++;
                    Logger.info(`Attempting to reconnect (${retryCount}/${MAX_RETRIES})...`);
                    await this.start();
                    break; // Exit loop if successful
                } catch (err) {
                    Logger.error('Reconnection attempt failed:', err);
                    if (retryCount === MAX_RETRIES) {
                        Logger.error('Max reconnection attempts reached. Exiting.');
                    }
                }
            }
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
            Logger.info('WhatsApp initialization completed');
        } catch (error) {
            Logger.error('Failed to initialize WhatsApp client:', error);
            throw error;
        }
    }

    async sendMessage(groupId, message) {
        try {
            Logger.info(`Attempting to send message to group ${groupId}`);
            const chat = await this.client.getChatById(groupId);
            if (!chat) {
                throw new Error('Chat not found');
            }
            Logger.info('Chat found, sending message...');
            await chat.sendMessage(message);
            Logger.info(`Message successfully sent to group ${groupId}`);
            return true;
        } catch (error) {
            Logger.error('Detailed error in sendMessage:', {
                error: error.message,
                stack: error.stack,
                groupId,
                messageLength: message?.length
            });
            throw error;
        }
    }
}

module.exports = WhatsAppClient;