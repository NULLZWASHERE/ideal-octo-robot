// api/check.js
const SSH2Promise = require('ssh2-promise');

module.exports = async (req, res) => {
    // allow cross-origin requests, because of course you'll have a separate frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'method not allowed. use post.' });
    }

    const { host, user, password } = req.body;
    if (!host || !user || !password) {
        return res.status(400).json({ success: false, error: 'host, user, and password are required.' });
    }

    const ssh = new SSH2Promise({ host, username: user, password, readyTimeout: 5000 });

    try {
        await ssh.connect();
        res.status(200).json({ success: true, message: `login successful: ${user}@${host}` });
    } catch (err) {
        res.status(401).json({ success: false, error: 'login failed.' });
    } finally {
        ssh.close();
    }
};
