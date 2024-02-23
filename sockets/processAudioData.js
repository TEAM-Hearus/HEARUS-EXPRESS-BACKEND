const socketIO = require('socket.io');
const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);

const WebSocketManager = require('./webSocketManager');

// function delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }

// function convertToWav(inputFilePath, outputFilePath) {
//     console.log("convertToWav : " + inputFilePath);
//     return new Promise((resolve, reject) => {
//         ffmpeg(inputFilePath)
//             .toFormat('wav')
//             .on('end', () => {
//                 // console.log('Conversion Finished');
//                 resolve(outputFilePath);
//             })
//             .on('error', (err) => {
//                 reject(err);
//             })
//             .save(outputFilePath);
//     });
// }

function processAudioData(clientSocket, audioBlob) {
    return new Promise(async (resolve, reject) => {
        try {
            resolve();
        } catch (error) {
            console.error('Error in transcription ', error);
            reject(error);
        }
    });
}

module.exports = processAudioData;