const socketIO = require('socket.io');
const Queue = require('better-queue');

const processAudioData = require("./processAudioData");

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
            // console.log('Data from client ' + data);
        });

        const audioQueue = new Queue((task, done) => {
            processAudioData(task.clientSocket, task.audioBlob)
                .then(() => done())
                .catch(err => done(err));
        }, { concurrent: 1 });

        clientSocket.on('audioData', async (audioBlob) => {
            audioQueue.push({ clientSocket, audioBlob });
        });

        clientSocket.on('disconnect', () => {
            console.log('Socket Client disconnected');
        });
    });
}

module.exports = initSocket;
