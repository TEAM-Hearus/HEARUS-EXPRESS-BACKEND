const socketIO = require('socket.io');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');


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

        clientSocket.on('audioData', async (audioBlob) => {
            const isDeleted = false;
            const tempFilePath = `./temp/${uuidv4()}.wav`;
            try {
                fs.writeFileSync(tempFilePath, audioBlob);

                const form = new FormData();
                form.append('audio', fs.createReadStream(tempFilePath));

                const response = await axios.post('http://127.0.0.1:5001/transcribe', form, { headers: form.getHeaders() });

                console.log(response.data);
                socket.emit('recognitionResult', response.data);

                isDeleted = true;
                fs.unlinkSync(tempFilePath);
            } catch (error) {
                if (!isDeleted)
                    fs.unlinkSync(tempFilePath);
                console.error('Error in transcription:', error);
            }
        });

        clientSocket.on('disconnect', () => {
            console.log('Socket Client disconnected');
        });
    });
}

module.exports = initSocket;
