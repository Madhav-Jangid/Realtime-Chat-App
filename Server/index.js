const cluster = require('cluster');
const os = require('os');
const totalCPU = os.availableParallelism();

if (cluster.isPrimary) {
    for (let i = 0; i < totalCPU; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Forking a new worker...`);
        cluster.fork();
    });

} else {
    const express = require('express');
    const app = express();
    const bodyParser = require('body-parser');
    const { createServer } = require('http');
    const cors = require('cors');
    const mongoose = require('mongoose');
    require('dotenv').config();

    const REACT_APP_MONGO_URL = process.env.REACT_APP_MONGO_URL;
    const PORT = process.env.PORT || 5000;

    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb' , extended: true }));
    app.use(cors({ origin: "*" }));

    const httpServer = createServer(app);



    mongoose.connect(REACT_APP_MONGO_URL)
        .then(() => console.log('MongoDB connected'))
        .catch(err => console.error('MongoDB connection error:', err));



    const setupSocket = require('./socket.js');
    const io = setupSocket(httpServer);

    const routes = [
        { path: '/register', route: './routes/register' },
        { path: '/fetchClerkUsers', route: './routes/users' },
        { path: '/conversation', route: './routes/chats' },
        { path: '/conversation/message', route: './routes/convoMessage' },
        { path: '/user', route: './routes/getUser' },
    ];

    routes.forEach(({ path, route }) => {
        app.use(path, require(route));
    });

    app.get('/status', (req, res) => {
        res.json({
            state: true,
            message: 'Server is running fine.'
        });
    });

    app.use((req, res, next) => {
        res.status(404).json({ error: "Not found" });
    });

    httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    const gracefulShutdown = () => {
        console.log(`Worker ${process.pid} received shutdown signal`);
        httpServer.close(() => {
            console.log(`Worker ${process.pid} closed server`);
            process.exit(0);
        });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
}