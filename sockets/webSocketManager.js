const WebSocket = require('ws');
const ffmpeg = require('fluent-ffmpeg');
const stream = require('stream');

// WebSocket Connection
class WebSocketManager {
    constructor() {
        this.socket = null;
        this.clientSocket = null;
    }

    // Set FE Client Socket.io
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

        // message를 받으면 Client Socket으로 전송
        this.socket.on('message', (result) => {
            console.log("[WebSocket] Transition Result : " + result);
            self.clientSocket.emit('transitionResult', result.toString());
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

    // 메모리 내 버퍼 데이터를 PCM 형식으로 변환
    // 이후 WebSocket을 통해 전달
    transcribeBufferAndSend(bufferData) {
        try {
            const self = this;

            const readableStream = new stream.PassThrough();
            // 스트림에 버퍼 데이터 전달 및 종료
            readableStream.end(bufferData);

            let buffers = [];
            const command = ffmpeg(readableStream)
                .inputFormat('webm')
                .audioCodec('pcm_s16le')
                .audioFrequency(16000)
                .audioChannels(1)
                .format('s16le')
                .on('error', (err) => {
                    console.error('An error occurred: ' + err.message);
                })
                .on('end', () => {
                    // 수집된 데이터 청크를 하나의 버퍼로
                    const audioData = Buffer.concat(buffers);
                    if (self.socket.readyState === WebSocket.OPEN) {
                        // 합쳐진 버퍼 데이터를 WebSocket을 통해 전송
                        self.socket.send(audioData);
                    }
                });

            command.pipe(new stream.Writable({
                write(chunk, encoding, callback) {
                    buffers.push(chunk);
                    callback();
                }
            }));
        } catch (error) {
            console.error('Error during audio processing:', error);
        }
    }

    getSocket() {
        return this.socket;
    }
}

const wsManager = new WebSocketManager();

module.exports = wsManager;