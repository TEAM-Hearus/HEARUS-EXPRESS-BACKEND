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
        console.log('Socket Client connected');

        clientSocket.on('clientData', (data) => {
            console.log('Data from client ' + data);
        });

        clientSocket.on('audioData', (data) => {
            console.log(data);
            // Buffer Data to Audio
            text = data;
            // Speech To Text Logic
            const recognitionResult = text;
            clientSocket.emit('recognitionResult', recognitionResult);
        });

        clientSocket.on('disconnect', () => {
            console.log('Socket Client disconnected');
        });
    });
}

module.exports = initSocket;
