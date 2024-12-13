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
            Logger.info('QR Code received. Scan with WhatsApp mobile app:');
            qrcode.generate(qr, { small: true });
        });

        // Handle successful authentication
        this.client.on('ready', () => {
            Logger.info('WhatsApp client is ready!');
        });

        // Handle connection events
        this.client.on('authenticated', () => {
            Logger.info('WhatsApp client authenticated');
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