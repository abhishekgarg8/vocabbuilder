require('dotenv').config();
console.log('Environment Variables:', process.env);

module.exports = {
    environment: process.env.NODE_ENV || 'development',
    groupId: process.env.GROUP_ID,
    messageSchedule: process.env.MESSAGE_SCHEDULE,
    sessionPath: '../sessions/',
    // Add more config as needed
};