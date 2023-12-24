const socketIO = require('socket.io');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

async function convertToWav(inputFilePath, outputFilePath) {
    return new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
            .toFormat('wav')
            .on('end', () => {
                console.log('Conversion Finished');
                resolve(outputFilePath);
            })
            .on('error', (err) => {
                console.error('Error:', err);
                reject(err);
            })
            .save(outputFilePath);
    });
}

function processAudioData(clientSocket, audioBlob) {
    return new Promise(async (resolve, reject) => {
        const tempInputPath = `./temp/${uuidv4()}.webm`;
        const tempOutputPath = `./temp/${uuidv4()}.wav`;

        try {
            fs.writeFileSync(tempInputPath, audioBlob);
            await convertToWav(tempInputPath, tempOutputPath);

            const form = new FormData();
            form.append('audio', fs.createReadStream(tempOutputPath));

            const response = await axios.post('http://127.0.0.1:5001/transcribe', form, { headers: form.getHeaders() });

            console.log("Transcription result : " + response.data);
            clientSocket.emit('recognitionResult', response.data);

            fs.unlinkSync(tempInputPath);
            fs.unlinkSync(tempOutputPath);
            resolve();
        } catch (error) {
            if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
            if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
            console.error('Error in transcription:', error);
            reject(error);
        }
    });
}

module.exports = processAudioData;