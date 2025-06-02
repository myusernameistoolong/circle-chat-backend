const mongoose = require('mongoose');

// Chat mongoose model
const chatSchema = new mongoose.Schema({
    message: String,
    username: String,
    verified: Boolean,
    time: {
        type: Date,
        default: Date.now
    },
    signature: String
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;