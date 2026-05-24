export const typingHandler = {
    start(io, socket, data) {
        const { conversationId } = data;
        const userId = socket.userId;
        // Emit typing status to conversation room
        io.to(conversationId).emit('typing:update', {
            conversationId,
            userId,
            isTyping: true,
        });
    },
    stop(io, socket, data) {
        const { conversationId } = data;
        const userId = socket.userId;
        // Emit stop typing to conversation room
        io.to(conversationId).emit('typing:update', {
            conversationId,
            userId,
            isTyping: false,
        });
    },
};
