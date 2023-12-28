const axios = require('axios');

function processNLText(clientSocket, textData) {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axios.post(
                process.env.FLASK_HOST + '/process',
                textData,
                { headers: { 'Content-Type': 'application/json' } }
            );

            //console.log("NLProcessing result: " + JSON.stringify(response.data, null, 2));
            clientSocket.emit('NLPResult', response.data);
            resolve();
        } catch (error) {
            console.error('Error in NLProcessing ', error);
            reject(error);
        }
    });
}

module.exports = processNLText;