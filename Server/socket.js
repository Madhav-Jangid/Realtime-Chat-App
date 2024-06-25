const { Server } = require('socket.io');

let WarDetails = {
    warName: '',
    warId: '',
    warrior: []
};

function getClientsInRoom(io, roomId) {
    const room = io.sockets.adapter.rooms.get(roomId);
    return room ? room.size : 0;
}

function setupSocket(httpServer) {
    const io = new Server(httpServer, { cors: { origin: "*", methods: ["GET", "POST"] } });

    io.on("connection", (socket) => {
        socket.on('join-room', (data) => {
            socket.join(data.roomId);
            console.log(`this is data: ${data}`);
            const numberOfClients = getClientsInRoom(io, data.roomId);

            let warrior = {
                socketId: socket.id,
                uid: data.uid || 'Mod',
                username: data.username || 'Mod',
                warId: data.roomId,
                warName: data.warName || 'Mod',
                disqualified: false,
                submittedCode: false,
            };

            if (data.uid && data.warName && data.username) {
                WarDetails = { ...WarDetails, warrior: [...WarDetails.warrior, warrior] };
            }


            io.emit('newWarrior', { warriorList: WarDetails.warrior, roomId: data.roomId });
            io.emit('updatedWarriorList', { warriorList: WarDetails.warrior, roomId: data.roomId });
            io.emit('room-joined', { message: 'Joined room successfully', warrior });
            // console.log(`Number of clients in room ${data.warName}: ${numberOfClients}`);
        });

        socket.on('conversation', (data) => {
            io.emit('startConversation', data);
        });

        socket.on('submitCode', (data) => {
            io.emit('receiveCode', data);
        });

        socket.on('sendData', (data) => {
            io.emit('receiveData', data);
        });

        socket.on('refreshDashboard', (roomId) => {
            io.emit('getNewDataForRefresh', WarDetails);
        });

        socket.on('leaveRoom', (data) => {
            socket.leave(data.roomId);
            io.emit('aUserHasLeft', { message: `${data.name} left room: ${data.roomId}`, roomId: data.roomId });
        });

        socket.on('disqualifiedUser', (data) => {
            try {
                WarDetails = {
                    ...WarDetails,
                    warrior: WarDetails.warrior.filter(warrior => warrior.username !== data.name && warrior.uid !== data.uid),
                };
                io.emit('updatedWarriorList', { warriorList: WarDetails.warrior, roomId: data.roomId });
                io.emit('removedUser', { data: data, roomId: data.roomId });
            } catch (err) {
                console.log(err.message);
            }
        });

        socket.on('disconnect', () => {
            WarDetails = {
                ...WarDetails,
                warrior: WarDetails.warrior.filter(warrior => warrior.socketId !== socket.id),
            };
            io.emit('updatedWarriorList', { warriorList: WarDetails.warrior, roomId: null });
            io.emit('warDetailsUpdate', WarDetails);
        });
    });

    return io;
}

module.exports = setupSocket;
