const { format } = require('crypto-js');
const moment = require('moment');

function formatMessage(username, text, stream, info) {
    return {
        text,
        username,
        stream,
        time: moment().format('DD-MM-YYYY HH:mm'),
        timeWithMilliSeconds: moment().format('DD-MM-YYYY HH-mm ss:SS')
    };
}

module.exports = formatMessage;