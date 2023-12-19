const socketIO = require('socket.io');

function initSocket(server, app) {
    console.log('Configuring Socket');
    const io = socketIO(server, {
        cors: {
            credentials: true,
        },
        allowEIO3: true,
    });
    app.set('io', io);

    io.on('connection', (clientSocket) => {
        console.log('Client connected');

        clientSocket.on('audioData', (data) => {
            const recognitionResult = 'Recognition result from the server';
            clientSocket.emit('recognitionResult', recognitionResult);
        });

        clientSocket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });
}

module.exports = initSocket;
