const Logger = require('./logger');

class GroupHelper {
    static async listGroups(client) {
        try {
            Logger.info('Starting to fetch chats...');
            const chats = await client.getChats();
            Logger.info(`Total chats found: ${chats.length}`);
            
            // Log a sample chat structure to understand the data
            if (chats.length > 0) {
                Logger.info('Sample chat properties:');
                const sampleChat = chats[0];
                Logger.info(JSON.stringify({
                    isGroup: sampleChat.isGroup,
                    type: sampleChat.type,
                    name: sampleChat.name,
                    id: sampleChat.id ? sampleChat.id._serialized : 'No ID',
                    properties: Object.keys(sampleChat)
                }, null, 2));
            }

            // Try different group detection methods
            const groupsByIsGroup = chats.filter(chat => chat.isGroup);
            const groupsByType = chats.filter(chat => chat.type === 'group');
            const groupsByParticipants = chats.filter(chat => chat.participants && chat.participants.length > 0);

            Logger.info(`Groups by isGroup: ${groupsByIsGroup.length}`);
            Logger.info(`Groups by type: ${groupsByType.length}`);
            Logger.info(`Groups by participants: ${groupsByParticipants.length}`);

            // Use the most promising method
            const groups = groupsByIsGroup.length > 0 ? groupsByIsGroup : 
                         groupsByType.length > 0 ? groupsByType :
                         groupsByParticipants;

            Logger.info('Available WhatsApp Groups:');
            if (groups.length === 0) {
                Logger.info('No groups found using any detection method.');
            } else {
                groups.forEach(group => {
                    Logger.info(`Name: ${group.name || 'Unnamed'} | Type: ${group.type} | ID: ${group.id ? group.id._serialized : 'No ID'}`);
                });
            }
            
            return groups;
        } catch (error) {
            Logger.error('Failed to fetch groups:', error);
            Logger.error('Error details:', error.message);
            throw error;
        }
    }
}

module.exports = GroupHelper;