const axios = require('axios');
const sha256 = require('crypto-js/sha256');
const crypto = require ('crypto');

async function sendLog(actionToLog) {
    const timestamp = new Date(); 

    const privateKey = process.env.PRIVATE_KEY
        .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '-----BEGIN RSA PRIVATE KEY-----\n')
        .replace(/-----END RSA PRIVATE KEY-----/g, '\n-----END RSA PRIVATE KEY-----');

    const hash = sha256(actionToLog + timestamp.toISOString()).toString();
    const encryptedHash = crypto.privateEncrypt(
        {
            key: privateKey
        },
        Buffer.from(hash)
    ).toString("base64");

    userName = "chatserver";

    const log = {
        actionToLog: actionToLog,
        userName: userName,
        digitalSingature: encryptedHash,
        timestamp: timestamp.toISOString()
    }

    await axios.post('http://localhost:3000/api/logs', log)
        .then(function (response) {
            console.log(actionToLog + ":")
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
}

module.exports = {
    sendLog
};
