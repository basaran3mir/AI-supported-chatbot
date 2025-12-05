import { applyStrings } from './language.js';
import { predict } from './services/botService.js';

document.addEventListener('DOMContentLoaded', async () => {

    try {
        await applyStrings();
    }
    catch (err) {
        console.error('Initialization failed:', err);
    }

    let modelType = "MultinomialNB";

    const bot = document.getElementById('chatBot')
    const botLogo = document.getElementById('botLogo');
    const botReminder = document.getElementById('botReminder');
    const botContainer = document.getElementById('botContainer');
    const closer = document.getElementById("botHeaderClose");
    const botBody = document.getElementById('botBody');
    const getLAQButton = document.getElementById("getLAQ");
    const getFAQButton = document.getElementById("getFAQ");
    const botInput = document.getElementById('botInput');
    const submitButton = document.getElementById('submitButton');
    const submitButtonLogo = document.getElementById("submitButton").querySelector("i");

    let initDone = false;

    const botState = {
        mode: "idle",
        stopFn: null
    };

    function init() {
        if (initDone) return;
        initDone = true;

        setPreQuestions();
        setOnClickers();
        setDraggablebot();
    }

    function toggleBotWindow() {
        bot.classList.toggle("showing");
    }

    function setOnClickers() {
        botLogo.addEventListener('click', function () {
            toggleBotWindow();
        })
        submitButton.addEventListener("click", () => {
            if (botState.mode === "thinking" || botState.mode === "typing") {
                if (botState.stopFn) botState.stopFn();
                return;
            }

            sendUserMessage(botInput.value);

            const message = botInput.value.trim();
            if (message !== '') {
                sendUserMessage(message);
            }

        });
        closer.addEventListener('click', function () {
            toggleBotWindow();
        })
        getLAQButton.addEventListener('click', function () {
            sendUserMessage("Son Sorulan Sorular");
        })
        getFAQButton.addEventListener('click', function () {
            sendUserMessage("Sık Sorulan Sorular");
        })
        botBody.addEventListener("click", (event) => {
            if (event.target.classList.contains("start-button")) {
                const text = event.target.textContent;
                sendUserMessage(text);
            }
        });
    }

    function setPreQuestions() {
        const preQuestionsArea = document.createElement('div');
        preQuestionsArea.classList.add('pre-questions-area');
        preQuestionsArea.id = "preQuestionsArea";

        const preQuestions = [
            "Merhaba",
            "Kendinizi tanıtır mısınız?",
            "Mevcut işiniz nedir?",
            "Size nasıl ulaşabilirim?"
        ];

        preQuestions.forEach(text => {
            const button = document.createElement('button');
            button.classList.add('start-button');
            button.textContent = text;
            preQuestionsArea.appendChild(button);
        });

        botBody.appendChild(preQuestionsArea);
    }

    function setDraggablebot() {
        const bot = document.getElementById('chatBot');
        const logo = document.getElementById('botLogo');
        if (!bot || !logo) return;

        logo.onmousedown = dragMouseDown;

        let startX = 0, startY = 0;
        let origLeft = 0, origTop = 0;
        const PADDING = 20;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();

            startX = e.clientX;
            startY = e.clientY;

            const rect = bot.getBoundingClientRect();
            origLeft = rect.left;
            origTop = rect.top;

            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();

            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;

            let newLeft = origLeft + deltaX;
            let newTop = origTop + deltaY;

            const maxLeft = window.innerWidth - bot.offsetWidth - PADDING;
            const maxTop = window.innerHeight - bot.offsetHeight - PADDING;

            if (newLeft < PADDING) newLeft = PADDING;
            if (newLeft > maxLeft) newLeft = maxLeft;
            if (newTop < PADDING) newTop = PADDING;
            if (newTop > maxTop) newTop = maxTop;

            bot.style.left = newLeft + 'px';
            bot.style.top = newTop + 'px';
            bot.style.right = 'unset';
            bot.style.bottom = 'unset';

            const centerX = newLeft + bot.offsetWidth / 2;
            const centerY = newTop + bot.offsetHeight / 2;
            const windowCenterX = window.innerWidth / 2;
            const windowCenterY = window.innerHeight / 2;

            if (centerY < windowCenterY) {
                botReminder.style.top = '100px';
                botReminder.style.bottom = 'unset';
                botContainer.style.top = '100px';
                botContainer.style.bottom = 'unset';
            } else {
                botReminder.style.top = 'unset';
                botReminder.style.bottom = '100px';
                botContainer.style.top = 'unset';
                botContainer.style.bottom = '100px';
            }
            if (centerX < windowCenterX) {
                botReminder.style.left = '20px';
                botReminder.style.right = 'unset';
                botContainer.style.left = '20px';
                botContainer.style.right = 'unset';
            } else {
                botReminder.style.left = 'unset';
                botReminder.style.right = '20px';
                botContainer.style.left = 'unset';
                botContainer.style.right = '20px';
            }
        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }

        window.addEventListener('resize', () => {
            const rect = bot.getBoundingClientRect();
            const maxLeft = window.innerWidth - bot.offsetWidth - PADDING;
            const maxTop = window.innerHeight - bot.offsetHeight - PADDING;
            let left = rect.left, top = rect.top;
            if (left > maxLeft) left = maxLeft;
            if (top > maxTop) top = maxTop;
            if (left < PADDING) left = PADDING;
            if (top < PADDING) top = PADDING;
            bot.style.left = left + 'px';
            bot.style.top = top + 'px';
            bot.style.right = 'unset';
            bot.style.bottom = 'unset';
        });
    }

    //MAIN FS
    function removePreQuestionsArea() {
        const area = document.getElementById("preQuestionsArea");
        if (botBody.contains(area)) {
            botBody.removeChild(area);
        }
    }

    function addUserMessage(message) {
        const userMessageTopDiv = document.createElement('div');
        userMessageTopDiv.classList.add('bot-body-user-part');

        const userMessageElement = document.createElement('p');
        userMessageElement.textContent = message;
        userMessageElement.classList.add('user-message');

        const userMessagesDiv = document.createElement('div');
        userMessagesDiv.classList.add('bot-body-user-messages');

        userMessagesDiv.appendChild(userMessageElement);
        userMessageTopDiv.appendChild(userMessagesDiv);
        botBody.appendChild(userMessageTopDiv);

        botInput.value = '';
        botBody.scrollTop = botBody.scrollHeight;
    }

    function sendUserMessage(message, isStatic = false) {
        if (!message || message.trim() === "") return;

        removePreQuestionsArea();
        addUserMessage(message);

        if (!isStatic) {
            modelType = "MultinomialNB";
            sendBotMessage(message);
        }
    }

    async function addBotMessage() {

        const botMessageTopDiv = document.createElement('div');
        botMessageTopDiv.classList.add('bot-body-bot-part');

        const botMessagesDiv = document.createElement('div');
        botMessagesDiv.classList.add('bot-body-bot-messages');

        const botImg = document.createElement('img');
        botImg.src = "static/images/logo.png";
        botImg.classList.add('bot-img');

        const botMessageTag = document.createElement('p');
        botMessageTag.classList.add('bot-message');

        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('bot-message-div');

        const responseDiv = document.createElement('div');
        responseDiv.classList.add('bot-body-bot-responses');

        botMessageDiv.appendChild(botMessageTag);
        responseDiv.appendChild(botMessageDiv);
        botMessagesDiv.appendChild(botImg);
        botMessagesDiv.appendChild(responseDiv);
        botMessageTopDiv.appendChild(botMessagesDiv);
        botBody.appendChild(botMessageTopDiv);

        return { botMessageTag, responseDiv };
    }

    function showThinkingAnimation(element) {
        botState.mode = "thinking";

        submitButtonLogo.classList.replace("fa-paper-plane", "fa-stop");

        let dots = 1;
        element.textContent = ".";

        const interval = setInterval(() => {
            if (botState.mode !== "thinking") {
                clearInterval(interval);
                return;
            }
            dots = (dots % 3) + 1;
            element.textContent = ".".repeat(dots);
            botBody.scrollTop = botBody.scrollHeight;
        }, 300);

        const stopThinking = () => {
            clearInterval(interval);
            botState.mode = "idle";
            botState.stopFn = null;
            submitButtonLogo.classList.replace("fa-stop", "fa-paper-plane");
        };

        botState.stopFn = stopThinking;

        return stopThinking;
    }

    async function sendBotMessage(message, isStatic = false) {
        if (!message) return;

        const { botMessageTag } = await addBotMessage();

        const stopThinking = showThinkingAnimation(botMessageTag);
        const predictPromise = predict(message, modelType);
        await delay(1500);
        stopThinking();

        if (isStatic) {
            botTypeWriterEffect(botMessageTag, botMessage, 25);
        }
        else {
            let responseData;
            try {
                responseData = await predictPromise;
            } catch (e) {
                botTypeWriterEffect(botMessageTag, "Üzgünüm, şu an yardımcı olamıyorum.", 25);
                return;
            }

            const OK = "predict-is-acceptable";
            const BETWEEN = "predict-is-between-min-and-max-prob";
            const BELOW = "predict-is-below-min-prob";
            const ERROR = "error";

            if (responseData.return_code === OK) {
                botTypeWriterEffect(botMessageTag, responseData.response[0], 25);
            }
            else if (responseData.return_code === BELOW) {
                botTypeWriterEffect(botMessageTag, "Üzgünüm, sorunu anlamadım.", 25);
            }
            else if (responseData.return_code === ERROR) {
                botTypeWriterEffect(botMessageTag, "Üzgünüm, şu an yardımcı olamıyorum.", 25);
            }
            else if (responseData.return_code === BETWEEN) {

                const text = (modelType === "MultinomialNB")
                    ? "Hangisini sormak istediniz?"
                    : "Tekrar deneyelim.";

                botTypeWriterEffect(botMessageTag, text, 25);

                const buttonArea = document.createElement('div');
                buttonArea.classList.add('bot-message-buttons');

                responseData.tag.forEach(option => {
                    const btn = document.createElement('button');
                    btn.classList.add('bot-message-button');
                    btn.textContent = option;
                    btn.onclick = () => {
                        sendUserMessage(option);
                        buttonArea.remove();
                    };
                    buttonArea.appendChild(btn);
                });

                const notFoundBtn = document.createElement('button');
                notFoundBtn.classList.add('bot-message-button');
                notFoundBtn.classList.add('not-found-button');
                notFoundBtn.textContent = "Aradığım burada değil";

                notFoundBtn.onclick = () => {
                    buttonArea.remove();
                    sendUserMessage("Aradığım burada değil", true);

                    if (modelType === "MultinomialNB") {
                        modelType = "LinearSVC";
                        sendBotMessage(responseData.question);
                    }
                    else {
                        sendBotMessage("Daha fazla bilgi için: ebasaran999@gmail.com mail adresinden iletişim kurabilirsiniz.", true);
                    }
                };

                buttonArea.appendChild(notFoundBtn);
                responseDiv.appendChild(buttonArea);
            }
        }



    }

    //VISUAL FS
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function botTypeWriterEffect(element, text, typewriterSpeed) {
        element.innerHTML = '';
        let index = 0;

        botState.mode = "typing";
        submitButtonLogo.classList.replace("fa-paper-plane", "fa-stop");

        const interval = setInterval(() => {
            if (botState.mode !== "typing") {
                clearInterval(interval);
                return;
            }

            element.innerHTML += text.charAt(index++);
            botBody.scrollTop = botBody.scrollHeight;

            if (index > text.length) completeTyping();
        }, typewriterSpeed);

        function completeTyping() {
            clearInterval(interval);
            botState.mode = "idle";
            botState.stopFn = null;
            submitButtonLogo.classList.replace("fa-stop", "fa-paper-plane");
        }

        botState.stopFn = completeTyping;
    }

    init()

});