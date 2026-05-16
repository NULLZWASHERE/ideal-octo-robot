// api/index.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const SSH2Promise = require('ssh2-promise');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// simple check endpoint
app.get('/api', (req, res) => {
    res.status(200).send('api is alive. send post requests to /api/check or /api/execute.');
});

// endpoint to check a single credential
app.post('/api/check', async (req, res) => {
    const { host, user, password } = req.body;
    if (!host || !user || !password) {
        return res.status(400).json({ success: false, error: 'host, user, and password are required.' });
    }

    const ssh = new SSH2Promise({ host, username: user, password });

    try {
        await ssh.connect();
        res.status(200).json({ success: true, message: `login successful: ${user}@${host}` });
    } catch (err) {
        res.status(401).json({ success: false, error: 'login failed.' });
    } finally {
        ssh.close();
    }
});

// endpoint to execute a single command
app.post('/api/execute', async (req, res) => {
    const { host, user, password, command } = req.body;
    if (!host || !user || !password || !command) {
        return res.status(400).json({ success: false, error: 'host, user, password, and command are required.' });
    }

    const ssh = new SSH2Promise({ host, username: user, password });

    try {
        await ssh.connect();
        const output = await ssh.exec(command);
        res.status(200).json({ success: true, output: output });
    } catch (err) {
        res.status(500).json({ success: false, error: `command execution failed: ${err.message}` });
    } finally {
        ssh.close();
    }
});

// vercel needs to export the app
module.exports = app;
