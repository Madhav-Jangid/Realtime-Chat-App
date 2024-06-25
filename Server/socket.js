const { Server } = require('socket.io');


function setupSocket(httpServer) {
    const io = new Server(httpServer, { cors: { origin: "*", methods: ["GET", "POST"] } });

    io.on("connection", (socket) => {

        socket.on('sent_message', (data) => {
            io.emit('get_message', data);
        });

    });

    return io;
}

module.exports = setupSocket;
