document.addEventListener('DOMContentLoaded', function () {

    const public_api_url = "http://127.0.0.1:5000"
    const predict_url_end = "/predict";
    let modelType = "MultinomialNB";

    const botLogo = document.getElementById('botLogo');
    const botReminder = document.getElementById('botReminder');
    const botContainer = document.getElementById('botContainer');
    const botBody = document.getElementById('botBody');
    const submitButton = document.getElementById('botSubmit');
    const stopButton = document.getElementById('botStop');
    const botInput = document.getElementById('botInput');
    const closer = document.getElementById("botHeaderClose");

    function init() {
        setOnClickers();
        setPreQuestions();
        setDraggablebot();
    }

    function setOnClickers() {
        function togglebotWindow() {
            botContainer.classList.toggle("showing");
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
        const elmnt = document.getElementById('chatBot');
        const logo = document.getElementById('botLogo')
        logo.onmousedown = dragMouseDown;
        var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            let botRight = (parseInt(getComputedStyle(elmnt).right) + pos1);
            let chatBottom = (parseInt(getComputedStyle(elmnt).bottom) + pos2);
            elmnt.style.right = botRight + "px";
            elmnt.style.bottom = chatBottom + "px";

            let mode = ['S', 'E'];
            const [windowHeight, windowWidth] = getWindowSize();

            if (chatBottom < windowHeight / 2) {
                mode[0] = 'S'
                botReminder.style.top = "unset";
                botReminder.style.bottom = "100px";

                botContainer.style.top = "unset";
                botContainer.style.bottom = "100px";
            }
            else if (chatBottom >= windowHeight / 2) {
                mode[0] = 'N'
                botReminder.style.top = "100px";
                botReminder.style.bottom = "unset";

                botContainer.style.top = "100px";
                botContainer.style.bottom = "unset";
            }

            if (botRight < windowWidth / 2) {
                mode[1] = 'E'
                botReminder.style.right = "20px";
                botReminder.style.left = "unset";

                botContainer.style.right = "20px";
                botContainer.style.left = "unset";
            }
            else if (botRight >= windowWidth / 2) {
                mode[1] = 'W'
                botReminder.style.right = "unset";
                botReminder.style.left = "20px";

                botContainer.style.right = "unset";
                botContainer.style.left = "20px";
            }

        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    //MAIN FS
    async function sendStaticMessageFromBotToUser(botMessage) {
        const botMessageTopDiv = document.createElement('div');
        botMessageTopDiv.classList.add('bot-body-bot-part')

        const botMessagesDiv = document.createElement('div');
        botMessagesDiv.classList.add('bot-body-bot-messages')

        const botImg = document.createElement('img');
        botImg.src = "static/images/logo.png"
        botImg.classList.add('bot-img');

        const botMessageTag = document.createElement('p');
        botMessageTag.classList.add('bot-message');
        botMessageTag.id = "botMessage"

        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('bot-message-div')

        const responseDiv = document.createElement('div');
        responseDiv.classList.add('bot-body-bot-responses')

        botMessageDiv.appendChild(botMessageTag)
        responseDiv.appendChild(botMessageDiv)
        botMessagesDiv.appendChild(botImg);
        botMessagesDiv.appendChild(responseDiv)
        botMessageTopDiv.appendChild(botMessagesDiv);
        botBody.appendChild(botMessageTopDiv)

        typewriterEffect(botMessageTag, '. . .', 100);
        await delay(1500)
        typewriterEffect(botMessageTag, botMessage, 25)

        botBody.scrollTop = botBody.scrollHeight;
    }

    async function sendDynamicMessageFromBotToUser(userMessage) {

        const botMessageTopDiv = document.createElement('div');
        botMessageTopDiv.classList.add('bot-body-bot-part');

        const botMessagesDiv = document.createElement('div');
        botMessagesDiv.classList.add('bot-body-bot-messages');

        const botImg = document.createElement('img');
        botImg.src = "static/images/logo.png"
        botImg.classList.add('bot-img')

        const botMessageTag = document.createElement('p');
        botMessageTag.classList.add('bot-message');
        botMessageTag.id = "botMessage"

        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('bot-message-div');

        const responseDiv = document.createElement('div');
        responseDiv.classList.add('bot-body-bot-responses');

        botMessageDiv.appendChild(botMessageTag)
        responseDiv.appendChild(botMessageDiv)
        botMessagesDiv.appendChild(botImg);
        botMessagesDiv.appendChild(responseDiv)
        botMessageTopDiv.appendChild(botMessagesDiv);
        botBody.appendChild(botMessageTopDiv);

        typewriterEffect(botMessageTag, '. . .', 100)
        let responseData = await predict(userMessage, modelType);
        let return_code_ACCAPTABLE = "predict-is-acceptable"
        let return_code_BETWEEN = 'predict-is-between-min-and-max-prob'
        let return_code_BELOW = 'predict-is-below-min-prob'
        let return_code_ERROR = 'error'
        await delay(1500)

        let removeOnClick = true
        if (responseData.return_code == return_code_ACCAPTABLE) {
            const text = responseData.response[0]
            typewriterEffect(botMessageTag, text, 25);
            responseDiv.appendChild(botMessageDiv)
            botMessagesDiv.appendChild(responseDiv)

        }
        else if (responseData.return_code == return_code_BETWEEN) {
            if (modelType == "MultinomialNB") {
                const text = "Hangisini demek istediniz?";
                typewriterEffect(botMessageTag, text, 25);
            }
            else {
                const text = "Seçeneklerim";
                typewriterEffect(botMessageTag, text, 25);
            }
            responseDiv.appendChild(botMessageDiv);

            const responseButtonsDiv = document.createElement('div');
            responseButtonsDiv.classList.add('bot-message-buttons');

            var responseButtons = [];
            for (var i = 0; i < responseData.tag.length; i++) {

                var response = responseData.tag[i];
                const responseButton = document.createElement('button');
                responseButton.classList.add('bot-message-button');
                responseButton.id = "botMessageButton"
                responseButton.textContent = response;
                responseButtons.push(responseButton);

                responseButton.onclick = function () {
                    sendDynamicMessageFromUserToBot(responseButton.textContent)
                    if (removeOnClick == true) {
                        responseDiv.removeChild(responseButtonsDiv);
                    }
                };

                responseButtonsDiv.appendChild(responseButton)
                responseDiv.appendChild(responseButtonsDiv);

            }

            const notFindOption = document.createElement('button');
            notFindOption.id = "botMessageButtonNFO";
            notFindOption.classList.add('bot-message-button');
            notFindOption.textContent = "Aradığım burada değil";
            responseButtonsDiv.appendChild(notFindOption)

            notFindOption.onclick = function () {
                if (removeOnClick == true) {
                    responseDiv.removeChild(responseButtonsDiv);
                }

                sendStaticMessageFromUserToBot("Aradığım burada değil");
                if (modelType == "MultinomialNB") {
                    modelType = "LinearSVC"
                    sendDynamicMessageFromBotToUser(responseData.question);
                }
                else {
                    sendStaticMessageFromBotToUser("Daha fazla bilgi için: ebasaran999@gmail.com");
                }

            };
            botMessagesDiv.appendChild(responseDiv);
        }
        else if (responseData.return_code == return_code_BELOW) {
            let text = "Üzgünüm, sorunu anlamadım.";
            typewriterEffect(botMessageTag, text, 25)
            responseDiv.appendChild(botMessageDiv)
            botMessagesDiv.appendChild(responseDiv)
        }
        else if (responseData.return_code == return_code_ERROR) {
            let text = "Üzgünüm, şu an sana yardım edemiyorum.";
            typewriterEffect(botMessageTag, text, 25)
            responseDiv.appendChild(botMessageDiv)
            botMessagesDiv.appendChild(responseDiv)
        }

        botMessageTopDiv.appendChild(botMessagesDiv);
        botBody.appendChild(botMessageTopDiv);

        botBody.scrollTop = botBody.scrollHeight;
    }

    function sendStaticMessageFromUserToBot(userMessage) {
        if (userMessage === '') return;
        const preQuestionsArea = document.getElementById("preQuestionsArea");
        if (botBody.contains(preQuestionsArea)) {
            botBody.removeChild(preQuestionsArea);
        }

        const userMessageTopDiv = document.createElement('div');
        userMessageTopDiv.classList.add('bot-body-user-part');

        const userMessageElement = document.createElement('p');
        userMessageElement.textContent = userMessage;
        userMessageElement.classList.add('user-message');
        userMessageElement.id = "userMessage"

        const userMessagesDiv = document.createElement('div');
        userMessagesDiv.classList.add('bot-body-user-messages');

        userMessagesDiv.append(userMessageElement)
        userMessageTopDiv.appendChild(userMessagesDiv);
        botBody.appendChild(userMessageTopDiv);

        botInput.value = '';
        botBody.scrollTop = botBody.scrollHeight;
    }

    function sendDynamicMessageFromUserToBot(userMessage) {
        if (userMessage === '') return;
        const preQuestionsArea = document.getElementById("preQuestionsArea");
        if (botBody.contains(preQuestionsArea)) {
            botBody.removeChild(preQuestionsArea);
        }

        const userMessageTopDiv = document.createElement('div');
        userMessageTopDiv.classList.add('bot-body-user-part');

        const userMessageElement = document.createElement('p');
        userMessageElement.textContent = userMessage;
        userMessageElement.classList.add('user-message');
        userMessageElement.id = "userMessage"

        const userMessagesDiv = document.createElement('div');
        userMessagesDiv.classList.add('bot-body-user-messages');

        userMessagesDiv.append(userMessageElement)
        userMessageTopDiv.appendChild(userMessagesDiv);
        botBody.appendChild(userMessageTopDiv);

        botInput.value = '';
        modelType = "MultinomialNB"
        sendDynamicMessageFromBotToUser(userMessage)
        botBody.scrollTop = botBody.scrollHeight;
    }

    //API FS
    async function predict(userMessage, modelType) {
        const url = public_api_url + predict_url_end;
        const data = {
            'question': userMessage,
            'model_type': modelType
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();

            return responseData

        } catch (error) {
            console.error('Error:', error);
            return {
                'return_code': 'error'
            };
        }
    }

    //VISUAL FS
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    function typewriterEffect(element, text, typewriterSpeed) {
        element.innerHTML = '';
        submitButton.style.display = 'none';
        stopButton.style.display = 'block';

        let index = 0;
        const interval = setInterval(() => {
            element.innerHTML += text.charAt(index++);
            if (index > text.length) {
                completeTyping();
            }

        }, typewriterSpeed);
        stopButton.tabIndex = 0;
        stopButton.addEventListener('click', () => {
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
            stopButton.style.display = 'none';
        }
    }

    function getWindowSize() {
        const height = window.innerHeight;
        const width = window.innerWidth;

        return [height, width];
    }

    init()

});