const { Server } = require('socket.io');

function setupSocket(httpServer) {
    const io = new Server(httpServer, { cors: { origin: "*", methods: ["GET", "POST"] } });

    io.on("connection", (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on('sent_message', (data) => {
            console.log(`Message received: ${data}`);
            io.emit('get_message', data);
        });

        socket.on('disconnect', (reason) => {
            console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
        });

        socket.on('error', (error) => {
            console.error(`Socket error: ${error}`);
        });
    });

    io.on('error', (error) => {
        console.error(`Socket.io error: ${error}`);
    });

    return io;
}

module.exports = setupSocket;