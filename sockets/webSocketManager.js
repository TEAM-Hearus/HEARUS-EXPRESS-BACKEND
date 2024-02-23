const WebSocket = require('ws');

// WebSocket Connection
class WebSocketManager {
    constructor() {
        this.socket = null;
    }

    connect(token) {
        console.log('Configuring FastAPI WebSocket')

        const fastAPIURL = process.env.FASTAPI_HOST + '/ws';
        this.socket = new WebSocket(fastAPIURL);

        // 미리 self에 this를 할당
        // scope와 무관하게 class의 socket을 활용할 수 있도록 함
        const self = this;

        this.socket.on('open', function open() {
            console.log('FastAPI WebSocket Connected');
            // 최초 연결시 websocketToken 전송
            self.socket.send(token);
        });

        this.socket.on('close', function close() {
            console.log('FastAPI Web Socket Disconnected');
            // 연결이 닫힐 때 자동으로 재연결 시도
            setTimeout(() => self.connect(token), 1000);
        });

        this.socket.on('error', function error(error) {
            console.error('FastAPI Web Socket Error');
            // 에러 발생시 연결 닫기
            self.socket.close();
        });
    }

    getSocket() {
        return this.socket;
    }
}

const wsManager = new WebSocketManager();

module.exports = wsManager;