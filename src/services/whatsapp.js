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
                Logger.info('Current working directory:', process.cwd());
                const sessionsPath = './sessions';
                Logger.info('Sessions directory exists:', fs.existsSync(sessionsPath));
                if (fs.existsSync(sessionsPath)) {
                    const files = fs.readdirSync(sessionsPath);
                    Logger.info('Session files found:', JSON.stringify(files));
                } else {
                    Logger.info('No sessions directory found at:', sessionsPath);
                    // Try to create directory
                    fs.mkdirSync(sessionsPath, { recursive: true });
                    Logger.info('Created sessions directory');
                }
            } catch (error) {
                Logger.error('Error checking sessions:', error);
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