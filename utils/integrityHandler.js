global.window = {};
const axios = require('axios');
const { sendLog } = require('./logmanager');
let lastUpdate;
let userMap = new Map();
let messageMap = new Map();

const crypto = require('crypto');
const sha256 = require('crypto-js/sha256');
const moment = require('moment');

const replayTimeOutInMinutes = 1;

function verifyMessage(message, username) {
    if (Date.now() - lastUpdate > 900000) {
        userMap.clear();
    }

    return new Promise((resolve, reject) => {
        if (userMap.has(username)) {
            const verified = verifyMessageRSA(message, username);

            return verified ?
                resolve(true) :
                reject(false);
        } else {
            axios.get(process.env.SERVER_URL + username)
                .then(response => {
                    lastUpdate = Date.now()
                    userMap.set(username, response.data.public_key);

                    //TRUYOU INTEGRITY
                    const remoteStrippedKey = response.data.thruyou_public_key
                        .replace(/-----BEGIN PUBLIC KEY-----/g, '-----BEGIN PUBLIC KEY-----\n')
                        .replace(/-----END PUBLIC KEY-----/g, '\n-----END PUBLIC KEY-----');

                    const encryptedHash = response.headers["x-hash"];
                    const decryptedHash = crypto.publicDecrypt({
                            key: remoteStrippedKey
                        },
                        Buffer.from(encryptedHash, "base64")
                    )

                    const hash = sha256(response.data.username + response.data.public_key).toString();

                    if (decryptedHash.toString() !== hash) {
                        console.log("Het bericht van ThruYou is aangepast, pas op!");
                        //sendLog(username + ': invalid signature')
                        return reject("Invalid signature on Message");
                    }

                    console.log("Integriteit van het bericht van thruyou is gewaarborgd!");

                    const verified = verifyMessageRSA(message, username);

                    return verified ?
                        resolve(true) :
                        reject("Invalid signature on Message");
                });
        }
    });
}

function signMessage(msg) {
    const privateKey = process.env.PRIVATE_KEY
        .replace(/-----BEGIN RSA PRIVATE KEY-----/g, '-----BEGIN RSA PRIVATE KEY-----\n')
        .replace(/-----END RSA PRIVATE KEY-----/g, '\n-----END RSA PRIVATE KEY-----');

    const hash = sha256(msg).toString();
    const encryptedHash = crypto.privateEncrypt({
            key: privateKey
        },
        Buffer.from(hash)
    ).toString("base64");

    const timestamp = Date.now();

    return {
        message: msg,
        signature: encryptedHash,
        timestamp: timestamp
    }
}

function verifyMessageRSA(message, username) {
    const remoteStrippedKeyUser = userMap.get(username)
        .replace(/-----BEGIN PUBLIC KEY-----/g, '-----BEGIN PUBLIC KEY-----\n')
        .replace(/-----END PUBLIC KEY-----/g, '\n-----END PUBLIC KEY-----');

    const decryptedHashMessage = crypto.publicDecrypt({
            key: remoteStrippedKeyUser
        },
        Buffer.from(message.signature, "base64")
    )

    const hashMessage = sha256(message.message).toString();

    if (decryptedHashMessage.toString() === hashMessage) {
        // Replay Attack Prevention
        if (moment(message.message.timestamp).add(replayTimeOutInMinutes, 'm').toDate() < Date.now()) {
            console.log(username + ': possible replay attack')
            //sendLog(username + ': possible replay attack')
            return false;
        }
        return true;
    } else {
        console.log(username + ': invalid signature')
        //sendLog(username + ': invalid signature')
        return false;
    }
}

module.exports = {
    verifyMessage,
    signMessage
};
