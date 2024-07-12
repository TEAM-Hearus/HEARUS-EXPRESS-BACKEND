const socketIO = require('socket.io');
const Queue = require('better-queue');

const processNLText = require("./processNLText");
const wsManager = require('./webSocketManager');

const processedScript = [
    "현대 주류경제학은 자원 등 경제적 가치가 있는 대상이 희소하고 이를 선택할 때에는 기회 비용이 발생한다는 것을 기본적인 전제로 한다.",
    "경우에 따라서는 공기와 같은 것마저 공짜가 아니다.",
    "개인, 기업, 국가와 같은 경제 주체들은 시장에 참여하여 재화와 용역의 수요와 공급을 창출하고, 이 과정에서 최대한 이익이 되는 방향으로 행동하려한다.",
    "따라서 경제 활동은 각 경제 주체가 가장 합리적인 선택을 하려는 경향성을 보이게 되고 이때문에 일정한 규칙이 성립하게 된다.",
    "경제학은 이러한 경제 활동의 규칙을 찾고 이를 바탕으로 미래의 경제를 예측한다.",
    "경제학은 현재의 상황을 분석하여 그 원인과 결과를 규명하는 실증경제학과 가치 판단에 따라 경제 활동을 평가하는 규범경제학으로 나뉠 수 있다.",
    "한편, 경제학은 시장에 참여한 경제 주체의 활동을 연구대상으로 하는 미시경제학과 국가 단위 규모의 경제 활동과 정책을 연구 대상으로 하는 거시경제학으로 구분되기도 한다.",
    "인간은 다양한 욕구를 가지고 있다.",
    "인간이 욕구를 만족시키기 위해 자원을 사용하는 모든 과정이 경제학의 연구 대상이 된다.",
    "인간의 욕구를 만족시키는데 사용되는 최종적인 대상을 재화와 서비스라고 한다.",
    "재화는 유형적인 대상, 서비스는 무형적인 대상을 가리킨다.",
    "구체적으로 예를 들면, 머리빗은 재화이고, 미용실에서 머리를 자르는 것은 서비스이다.",
    "재화와 서비스는 노동, 자본, 원자재 같은 생산요소를 결합하여 생산된다.",
    "예를 들어 플라스틱 머리빗은 노동력과 머리빗 만드는 기계(자본), 플라스틱의 원료가 되는 석유(원자재)를 결합하여 생산된다.",
    "생산된 재화와 서비스는 경제 행위자들 사이에서 교환되어 분배된다.",
    "분배된 재화와 서비스는 최종적으로 소비되어 인간의 욕구를 만족시키게 된다.",
    "이 각각의 과정, 즉 생산, 교환, 분배, 소비 등이 경제학의 연구 대상이 된다.",
    "생산, 교환, 분배, 소비 등의 과정에 영향을 미치는 요소들이나 혹은 특정한 산업 역시 경제학의 연구 대상이 된다.",
    "노동이라는 생산요소에 초점을 맞추는 노동경제학, 농업이라는 산업에 특화된 농업경제학 등이 그 예이다.",
    "산업 내의 구도를 연구하는 산업조직론, 국가 간 무역을 연구하는 국제무역론, 국가 간 금융 거래와 흐름을 연구하는 국제금융론 등도 있다.",
    "장기적이고 경제 전체를 연구하는 분야로는 거시경제학이 있으며, 거시경제학에서는 경제성장, 경기변동, 실업률, 물가 등을 다룬다.",
    "직접적으로 경제와 관련된 문제 이외에도 현대의 경제학은 경제학 제국주의라고 불릴만큼 인접 학문의 주제들을 넓게 연구하고 있다.",
    "법, 투표, 범죄, 정보, 교육 등이 대표적으로 인접 학문과 겹치는 분야들이다.",
    "경제학이 체계적인 학문으로 자리매김한 것은 애덤 스미스가 국부론을 출판한 1776년 이후이다.",
    "애덤 스미스 이전에 경제에 대한 연구가 없었던 것은 아닌데, 이를테면 경제에 대한 노동가치설의 효시가 되는 내용은 아리스토텔레스의 저작에서 확인할 수 있다.",
    "애덤 스미스가 국부론을 출판할 당시, 각 개인의 경제적 자유는 지금처럼 중요하게 여겨지고 있지 않았다.",
    "국가가 개인의 경제 활동을 통제하는 것은 자연스럽게 여겨졌고, 세금, 수출입 규제 등은 체계적인 이론 없이 자의적으로 이뤄지고 있었다.",
    "애덤 스미스는 시장의 자율적인 조정 능력을 강조하며, 개인이 사적 이익을 추구할 수 있도록 내버려두는 것이 사회 전체의 이익에 기여한다는 것을 보였다.",
    "애덤 스미스는 국가가 개인의 경제 활동에 개입하지 않아도 시장에서의 가격 조정을 통해 수요와 공급이 균형을 이룬다고 주장했다.",
    "이런 시장의 기능을 그는 보이지 않는 손이라고 표현하기도 했다.",
    "애덤 스미스는 또한 분업의 이점을 논리적으로 설명하였고, 노동가치설을 설명하기도 했다.",
    "국부론 이후, 토마스 맬서스, 데이비드 리카도, 존 스튜어트 밀, 카를 마르크스 등이 애덤 스미스를 계승하여 가치론, 분배 이론, 국제 무역에 대한 설명을 제공했다.",
    "애덤 스미스 이후, 경제학이 방법론 상의 큰 변화를 겪은 것은 한계 효용 학파의 등장 이후이다.",
    "한계 효용 학파는 물리학의 프레임워크를 받아들여 미적분을 사용한 수학적인 모형을 개발했다.",
    "일반 균형 모형이 연구된 것이 한계 효용 학파 시대이다.",
    "경제학이 현대의 주류 경제학과 가까운 모습으로 정착한 것은 한계 효용 학파 이후다.",
    "한계 효용 학파 이전의 경제학에는 수학이 제한적으로 사용되었고, 많은 부분이 말로 설명되었다.",
    "한계 효용 학파에 따르면, 합리적인 경제주체는 한계 효용이 한계 비용과 같아지는 지점을 선택한다.",
    "이 원리는 현대에서도 다수의 경제 모형의 결론에서 발견할 수 있는 원리이다.",
    "한계 효용 학파 시대에 경제학은 처음으로 대학에 독립된 학과로 개설되었다.",
    "알프레드 마셜이 1903년에 케임브리지 대학에 경제학과를 개설한 것이 최초이다.",
    "알프레드 마셜의 제자였던 존 메이너드 케인즈는 국가의 전체적인 관점에서 경제를 설명하려 했다.",
    "그는 현대에 사용되는 재정 정책과 통화 정책 등의 경기 부양 정책의 기초적인 논리를 마련했다.",
    "그는 거시경제학의 아버지로 불린다.",
    "그는 경기 불황시에 국가의 적극적인 개입을 강조했다.",
    "1944년에 존 폰 노이만과 오스카 모겐스턴은 게임의 이론과 경제 행위라는 책을 출간한다.",
    "이는 게임 이론의 시초가 되는 저작으로 여겨진다.",
    "게임 이론은 경제 행위자간 상호작용을 다루는 경제학의 분야이다.",
    "현대의 경제학은 학문으로서 성공적인 지위를 누리고 있으며, 대부분의 국가의 정책 결정에 필수적으로 사용된다.",
    "초창기에는 도덕 철학이나 정치학의 일부로 여겨졌으나, 오늘날에는 심리학과 더불어 사회과학 중 정말로 과학으로 분류되다시피 하는 영역이다.",
    "현재 전세계에서 이들 경제학자들이 남겨 놓은 경제이론을 바탕으로 국가의 경제정책을 펼치고 있으며 여전히 많은 경제이론 등이 개발되거나 발전되고 있다."
]
let cnt = 1;

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
    console.log('[Socket.io] Configuring FE Socket.io');
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
        cnt = 1;
        console.log('[Socket.io] FE Client [' + clientSocket.handshake.headers.origin + '] Socket.io Connected');

        // Set ClientSocket into Web Socket Manager
        // wsManager.setClientSocket(clientSocket)

        // const nlpQueue = new Queue((task, done) => {
        //     processNLText(task.clientSocket, task.textData)
        //         .then(() => done())
        //         .catch(err => done(err));
        // }, { concurrent: 1 });

        clientSocket.on('transcription', async (audioBlob) => {
            // wsManager를 통해 FastAPI에 audioBlob 데이터 전송8
            // wsManager.transcribeBufferAndSend(audioBlob);

            // FE 테스를 위해 코드 수정
            cnt++;
            if (cnt > processedScript.length)
                cnt = 1;
            await new Promise(resolve => setTimeout(resolve, 3000 * cnt));

            // processedScript 배열의 요소를 순서대로 전송
            clientSocket.emit('transitionResult', processedScript[cnt - 1]);
            console.log("[Socket.io] Send Data {} : {}", cnt, processedScript[cnt - 1]);
        });

        // clientSocket.on('nlProcessing', async (textData) => {
        //     nlpQueue.push({ clientSocket, textData });
        // });

        clientSocket.on('disconnect', () => {
            console.log('[Socket.io] FE Client [' + clientSocket.handshake.headers.origin + '] Socket.io disconnected');
        });
    });
}

module.exports = initSocket;
