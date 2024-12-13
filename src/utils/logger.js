const moment = require('moment');

class Logger {
    static log(message, type = 'INFO') {
        const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        console.log(`[${timestamp}] [${type}] ${message}`);
    }

    static error(message) {
        this.log(message, 'ERROR');
    }

    static info(message) {
        this.log(message, 'INFO');
    }
}

module.exports = Logger;