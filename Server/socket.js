const { Server } = require('socket.io');
const Redis = require('ioredis');

const pub = new Redis({
    host: process.env.REACT_APP_REDIS_HOST,
    port: process.env.REACT_APP_REDIS_PORT,
    username: process.env.REACT_APP_REDIS_USERNAME,
    password: process.env.REACT_APP_REDIS_PASSWORD,
});

const sub = new Redis({
    host: process.env.REACT_APP_REDIS_HOST,
    port: process.env.REACT_APP_REDIS_PORT,
    username: process.env.REACT_APP_REDIS_USERNAME,
    password: process.env.REACT_APP_REDIS_PASSWORD,
});

function setupSocket(httpServer) {
    const io = new Server(httpServer, { cors: { origin: "*", methods: ["GET", "POST"] } });
    sub.subscribe('MESSAGES');

    io.on("connection", (socket) => {
        console.log(`New client connected: ${socket.id}`);

        socket.on('sent_message', async (data) => {
            await pub.publish('MESSAGES', JSON.stringify(data));
        });
        
        sub.on('message',(channel,message) => {
            if(channel === 'MESSAGES'){
                io.emit('get_message', JSON.parse(message));
                console.log('message sent: '+ message.message );
            }
        });

        socket.on('disconnect', (reason) => {
            console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
        });

        socket.on('error', (error) => {
            console.log(`Socket error: ${error}`);
        });
    });

    io.on('error', (error) => {
        console.log(`Socket.io error: ${error}`);
    });

    return io;
}

module.exports = setupSocket;