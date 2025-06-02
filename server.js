const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const startChatServer = require('./utils/sockets');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
app.use(cors());

const server = http.createServer(app);
const io = socketio(server, {
    allowEIO3: true
});

dotenv.config();

const { MONGODB_URL } = process.env;

mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, () => {
    console.log('Connected to MongoDB');
});

startChatServer(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
