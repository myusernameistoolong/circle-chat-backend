# Real-Time Chat Server – Express.js + Socket.IO

A lightweight real-time chat server built with **Express.js** and **Socket.IO**, using the **WebSocket** protocol to enable fast and efficient two-way communication. This project allows multiple clients to join a specific chat stream, send messages, and receive updates about who is present. This solution communicates with the circle-client-laravel front-end web application.

> This project was developed as part of a school assignment for an **Security & Computer Networking** course.

---

## 🛠️ Stack & Technology

- **Node.js** / **Express.js** – Web server
- **Socket.IO** – WebSocket abstraction for real-time communication
- **Socket.IO Client** – Compatible with web, mobile, or other backend apps

---

## 📡 Socket Events

### 🔻 Listens for:

| Event                    | Payload   | Description                                 |
|--------------------------|-----------|---------------------------------------------|
| `joinStream`             | `message` | User joins a specific stream                |
| `chatMessage`            | `message` | User sends a message to the joined stream   |
| `disconnect`             | —         | Triggered when a user disconnects           |
| `disconnectUserFromStream` | `message` | User leaves a stream                      |

### 🔺 Emits:

| Event         | Payload       | Description                                   |
|---------------|---------------|-----------------------------------------------|
| `message`     | `message`     | Broadcasted message to stream participants    |
| `streamUsers` | `user list`   | Updated list of users in a stream             |
