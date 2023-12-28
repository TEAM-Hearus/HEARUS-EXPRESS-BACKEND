const socketIO = require('socket.io');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function convertToWav(inputFilePath, outputFilePath) {
    console.log("convertToWav : " + inputFilePath);
    return new Promise((resolve, reject) => {
        ffmpeg(inputFilePath)
            .toFormat('wav')
            .on('end', () => {
                console.log('Conversion Finished');
                resolve(outputFilePath);
            })
            .on('error', (err) => {
                reject(err);
            })
            .save(outputFilePath);
    });
}

function processAudioData(clientSocket, audioBlob) {
    return new Promise(async (resolve, reject) => {
        const uuidString = uuidv4();
        const tempInputPath = `./temp/${uuidString}.webm`;
        const tempOutputPath = `./temp/${uuidString}.wav`;

        try {
            // Force fs.writefile to Sync
            const buffer = Buffer.from(audioBlob);
            await fs.promises.writeFile(tempInputPath, buffer);
            console.log(tempInputPath);
            await convertToWav(tempInputPath, tempOutputPath);

            const form = new FormData();
            form.append('audio', fs.createReadStream(tempOutputPath));

            const response = await axios.post(process.env.FLASK_HOST + '/transcribe', form, { headers: form.getHeaders() });

            console.log("Transcription result : " + response.data);
            clientSocket.emit('recognitionResult', response.data);

            fs.unlinkSync(tempInputPath);
            fs.unlinkSync(tempOutputPath);
            resolve();
        } catch (error) {
            if (fs.existsSync(tempInputPath)) fs.unlinkSync(tempInputPath);
            if (fs.existsSync(tempOutputPath)) fs.unlinkSync(tempOutputPath);
            console.error('Error in transcription ', error);
            reject(error);
        }
    });
}

module.exports = processAudioData;