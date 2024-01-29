const axios = require('axios');
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function callGPTApi(keyword) {
    const prompt =
        `대한민국 대학교 강의에서 ${keyword}의 의미와 ` +
        `학생들을 학습을 도와줄 수 있는 부가 정보에 대해 128자 이내로 답변해줘`;

    const chatCompletion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'gpt-3.5-turbo-1106',
    });

    return chatCompletion.data.choices[0].text.trim();
}

function processNLText(clientSocket, textData) {
    return new Promise(async (resolve, reject) => {
        try {
            console.log(callGPTApi("관성"));
            const response = await axios.post(
                process.env.FLASK_HOST + '/process',
                textData,
                { headers: { 'Content-Type': 'application/json' } }
            );


            const nlpResponse = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
            const unProcessedText = nlpResponse.unProcessedText;

            for (let i = 0; i < unProcessedText.length; i++) {
                if (unProcessedText[i][1] === 'comment') {
                    const keyword = unProcessedText[i][0];
                    const description = await callGPTApi(keyword);
                    console.log(keyword + ' : ' + description);
                    nlpResponse.unProcessedText[i][2] = description;
                }
            }

            clientSocket.emit('NLPResult', nlpResponse);
            resolve();
        } catch (error) {
            console.error('Error in NLProcessing ', error);
            reject(error);
        }
    });
}

module.exports = processNLText;