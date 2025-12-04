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

    function init() {
        setOnClickers();
        setPreQuestions();
        setDraggablebot();
    }

    function setOnClickers() {
        function togglebotWindow() {
            bot.classList.toggle("showing");
        }

        function handleUserMessage() {
            const userMessage = botInput.value.trim();
            if (userMessage !== '') {
                sendDynamicMessageFromUserToBot(userMessage);
                botInput.blur();
            }
        }

        botLogo.addEventListener('click', function () {
            togglebotWindow();
        })
        submitButton.addEventListener('click', function () {
            handleUserMessage();
        })
        botInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                handleUserMessage();
            }
        });
        botInput.addEventListener('focus', function () {
            this.setAttribute('placeholder', '');
        });
        botInput.addEventListener('blur', function () {
            this.setAttribute('placeholder', '. . .');
        })
        closer.addEventListener('click', function () {
            togglebotWindow();
        })

        getLAQButton.addEventListener('click', function () {
            sendDynamicMessageFromUserToBot("Son Sorulan Sorular");
        })
        getFAQButton.addEventListener('click', function () {
            sendDynamicMessageFromUserToBot("Sık Sorulan Sorular");
        })
    }

    function setPreQuestions() {
        const preQuestionsArea = document.createElement('div');
        preQuestionsArea.classList.add('pre-questions-area');
        preQuestionsArea.id = "preQuestionsArea"

        const preQuestions = [
            "Merhaba",
            "Kendinizi tanıtır mısınız?",
            "Mevcut işiniz nedir?",
            "Size nasıl ulaşabilirim?"
        ];

        for (let i = 0; i < preQuestions.length; i++) {
            const button = document.createElement('button');
            button.classList.add('start-button');
            button.id = "startButton"
            button.textContent = preQuestions[i];

            button.addEventListener('click', function () {
                sendDynamicMessageFromUserToBot(button.textContent)
            });

            preQuestionsArea.appendChild(button);
        }

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
    function createBotMessageContainer() {
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

    function addUserMessage(userMessage) {
        const userMessageTopDiv = document.createElement('div');
        userMessageTopDiv.classList.add('bot-body-user-part');

        const userMessageElement = document.createElement('p');
        userMessageElement.textContent = userMessage;
        userMessageElement.classList.add('user-message');

        const userMessagesDiv = document.createElement('div');
        userMessagesDiv.classList.add('bot-body-user-messages');

        userMessagesDiv.appendChild(userMessageElement);
        userMessageTopDiv.appendChild(userMessagesDiv);
        botBody.appendChild(userMessageTopDiv);

        botInput.value = '';
        botBody.scrollTop = botBody.scrollHeight;
    }

    function removePreQuestionsArea() {
        const area = document.getElementById("preQuestionsArea");
        if (botBody.contains(area)) {
            botBody.removeChild(area);
        }
    }

    async function sendStaticMessageFromBotToUser(botMessage) {
        const { botMessageTag } = createBotMessageContainer();

        botTypeWriterEffect(botMessageTag, '. . .', 100);
        await delay(1500);
        botTypeWriterEffect(botMessageTag, botMessage, 25);

        botBody.scrollTop = botBody.scrollHeight;
    }

    async function sendDynamicMessageFromBotToUser(userMessage) {

        const { botMessageTag, responseDiv } = createBotMessageContainer();

        botTypeWriterEffect(botMessageTag, '. . .', 100);
        const responseData = await predict(userMessage, modelType);
        await delay(1500);

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
                ? "Hangisini demek istediniz?"
                : "Seçeneklerim";

            botTypeWriterEffect(botMessageTag, text, 25);

            const buttonArea = document.createElement('div');
            buttonArea.classList.add('bot-message-buttons');

            responseData.tag.forEach(option => {
                const btn = document.createElement('button');
                btn.classList.add('bot-message-button');
                btn.textContent = option;
                btn.onclick = () => {
                    sendDynamicMessageFromUserToBot(option);
                    buttonArea.remove();
                };
                buttonArea.appendChild(btn);
            });

            const notFoundBtn = document.createElement('button');
            notFoundBtn.classList.add('bot-message-button');
            notFoundBtn.textContent = "Aradığım burada değil";

            notFoundBtn.onclick = () => {
                buttonArea.remove();
                sendStaticMessageFromUserToBot("Aradığım burada değil");

                if (modelType === "MultinomialNB") {
                    modelType = "LinearSVC";
                    sendDynamicMessageFromBotToUser(responseData.question);
                }
                else {
                    sendStaticMessageFromBotToUser("Daha fazla bilgi için: ebasaran999@gmail.com");
                }
            };

            buttonArea.appendChild(notFoundBtn);
            responseDiv.appendChild(buttonArea);
        }

        botBody.scrollTop = botBody.scrollHeight;
    }

    function sendStaticMessageFromUserToBot(userMessage) {
        if (!userMessage) return;
        removePreQuestionsArea();
        addUserMessage(userMessage);
    }

    function sendDynamicMessageFromUserToBot(userMessage) {
        if (!userMessage) return;
        removePreQuestionsArea();
        addUserMessage(userMessage);
        modelType = "MultinomialNB";
        sendDynamicMessageFromBotToUser(userMessage);
    }

    //VISUAL FS
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function botTypeWriterEffect(element, text, typewriterSpeed) {
        element.innerHTML = '';
        submitButton.style.display = 'none';

        let index = 0;
        const interval = setInterval(() => {
            element.innerHTML += text.charAt(index++);
            botBody.scrollTop = botBody.scrollHeight;
            if (index > text.length) {
                completeTyping();
            }

        }, typewriterSpeed);
        submitButton.tabIndex = 0;
        submitButton.addEventListener('click', () => {
            completeTyping();
        });
        botInput.addEventListener('keydown', function (event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                completeTyping();
            }
        });

        function completeTyping() {
            clearInterval(interval);
            submitButton.style.display = 'block';
        }
    }

    init()

});