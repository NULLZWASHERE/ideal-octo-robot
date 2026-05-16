// api/execute.js
const SSH2Promise = require('ssh2-promise');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'method not allowed. use post.' });
    }

    const { host, user, password, command } = req.body;
    if (!host || !user || !password || !command) {
        return res.status(400).json({ success: false, error: 'host, user, password, and command are required.' });
    }

    const ssh = new SSH2Promise({ host, username: user, password, readyTimeout: 5000 });

    try {
        await ssh.connect();
        const output = await ssh.exec(command);
        res.status(200).json({ success: true, output: output });
    } catch (err) {
        res.status(500).json({ success: false, error: `command execution failed: ${err.message}` });
    } finally {
        ssh.close();
    }
};
