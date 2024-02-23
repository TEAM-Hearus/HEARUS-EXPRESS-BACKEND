const socketIO = require('socket.io');
const Queue = require('better-queue');

const processAudioData = require("./processAudioData");
const processNLText = require("./processNLText");
const wsManager = require('./webSocketManager');

// Express BE Client 식별을 위한 RandomToken
function generateRandomToken(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < length; i++)
        token += characters.charAt(Math.floor(Math.random() * characters.length));
    return token;
}

function initSocket(server, app) {
    // BE Client 식별자 Token
    const websocketToken = generateRandomToken(10);

    // Configure FE Socket.io
    // FE Client 데이터를 관리할 필요가 있어 Socket.io 사용
    console.log('Configuring FE Socket.io');
    const io = socketIO(server, {
        // Connection Timeout
        // Only for previous connection
        pingTimeout: 10000,
        cors: {
            credentials: true,
        },
        allowEIO3: true,
    });
    app.set('io', io);

    // Configure FastAPI WebSocket
    // 빈번하게 ML Pipeline과의 데이터 교환이 있어 WebSocket 사용
    // WebSocketManager로 연결성 확보
    wsManager.connect(websocketToken);

    // FE socket.io connection
    io.on('connection', (clientSocket) => {
        console.log('FE Client [' + clientSocket.handshake.headers.origin + '] Socket.io Connected');

        const nlpQueue = new Queue((task, done) => {
            processNLText(task.clientSocket, task.textData)
                .then(() => done())
                .catch(err => done(err));
        }, { concurrent: 1 });

        clientSocket.on('transcription', async (audioBlob) => {
            processAudioData(clientSocket, audioBlob);
        });

        clientSocket.on('nlProcessing', async (textData) => {
            nlpQueue.push({ clientSocket, textData });
        });

        clientSocket.on('disconnect', () => {
            console.log('FE Client [' + clientSocket.handshake.headers.origin + '] Socket.io disconnected');
        });
    });
}

module.exports = initSocket;
