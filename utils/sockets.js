const formatMessage = require('./messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getStreamUsers
} = require('./users');
const { sendLog } = require('./logmanager');
const { verifyMessage, signMessage } = require('./integrityHandler');
const mongoose = require('mongoose');
const Chat = require('../models/chat');

function startChatServer(io) {
    const botName = '';

    io.on('connection', socket => {

        socket.on('joinStream', (message) => {
            //message = signMessage(message); //temporary

            verifyMessage(message, message.message.username)
                .then(() => {
                    const user = userJoin(socket.id, message.message.username, message.message.stream);
                    socket.join(user.stream);

                    emitMessage(user, formatMessage(botName, `Welcome to the chat!`, user.stream, true));

                    socket.broadcast
                        .to(user.stream)
                        .emit(
                            'message',
                            signMessage(formatMessage(botName, `${user.username} has joined the chat`, user.stream, true))
                        );
                    sendLog(`${ message.message.username} joined stream ${message.message.stream}`)

                    io.to(user.stream).emit('streamUsers', signMessage(getStreamUsers(user.stream)));
                })
                .catch(() => {
                    //
                });
        });

        socket.on('chatMessage', message => {
            //message = signMessage(message); //temporary

            verifyMessage(message, message.message.username) // Username moet uit user komen
                .then(() => {
                    const user = getCurrentUser(socket.id);
                    emitMessage(user, formatMessage(user.username, message.message.msg, user.stream, false));
                    saveToMongoDB(message.message.msg, user, message.signature, true);

                    sendLog(`${user.username} Sent a chat message`) //Timestamp from frontend
                })
                .catch(() => {

                });
        });

        socket.on('disconnect', () => {
            const user = userLeave(socket.id);

            if (user) {
                emitMessage(user, formatMessage(botName, `${user.username} has left the chat`, user.stream, true));
                sendLog(`${user.username} disconnnect from stream`)
                io.to(user.stream).emit('streamUsers', signMessage(getStreamUsers(user.stream)));
            }
        });

        socket.on('disconnectUserFromStream', msg => {
            verifyMessage(msg, msg.username)
                .then(() => {
                    const user = userLeave(msg.message);

                    if (user) {
                        emitMessage(user, formatMessage(botName, `${user.username} has left the chat`, user.stream, true));
                        sendLog(`${user.username} disconnectedUserFromStream`)
                        io.to(user.stream).emit('streamUsers', signMessage(getStreamUsers(user.stream)));
                    }
                });
        });
    });

    function emitMessage(user, message) {
        io.to(user.stream).emit('message', signMessage(message));
    }

    function saveToMongoDB(message, user, signature, verified) {
        const chat = new Chat({
            message: message,
            username: user.username,
            verified: verified,
            signature: signature,
        });

        chat
            .save()
            .then(() => {
                console.log('Message saved to MongoDB');
            })
            .catch(err => {
                console.log('Error saving message to MongoDB');
                console.log(err);
            });
    }
}



module.exports = startChatServer;