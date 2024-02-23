const WebSocket = require('ws');

// WebSocket Connection
class WebSocketManager {
    constructor() {
        this.socket = null;
        this.clientSocket = null;
    }

    // Set Fe Client Socket.io
    setClientSocket(clientSocket) {
        console.log("[WebSocket] WebSocketManager Client Socket Configured");
        this.clientSocket = clientSocket;
    }

    connect(token) {
        console.log('[WebSocket] Configuring FastAPI WebSocket');

        const fastAPIURL = process.env.FASTAPI_HOST + '/ws';
        this.socket = new WebSocket(fastAPIURL);

        // 미리 self에 this를 할당
        // scope와 무관하게 class의 socket을 활용할 수 있도록 함
        const self = this;

        this.socket.on('open', function open() {
            console.log('[WebSocket] FastAPI WebSocket Connected');
            // 최초 연결시 websocketToken 전송
            self.socket.send(token);
        });

        // Transition Result 이후 Client Socket으로 전송
        this.socket.on('transitionResult', (result) => {
            console.log("[WebSocket] Transition Result" + result);
            self.clientSocket.emit('transitionResult', result);
        });

        this.socket.on('close', function close() {
            console.log('[WebSocket] FastAPI Web Socket Disconnected');
            // 연결이 닫힐 때 자동으로 재연결 시도
            setTimeout(() => self.connect(token), 1000);
        });

        this.socket.on('error', function error(error) {
            console.error('[WebSocket] FastAPI Web Socket Error');
            // 에러 발생시 연결 닫기
            self.socket.close();
        });
    }

    sendAudioData(audioBlob) {
        this.socket.send(audioBlob);
    }

    getSocket() {
        return this.socket;
    }
}

const wsManager = new WebSocketManager();

module.exports = wsManager;