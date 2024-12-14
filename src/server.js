const express = require('express');
const app = express();
const Logger = require('./utils/logger');

// Use Render's assigned port or fallback to 3000
const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.listen(port, () => {
    Logger.info(`Server running on port ${port}`);
});

module.exports = app;