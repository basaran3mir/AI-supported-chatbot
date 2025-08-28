document.addEventListener('DOMContentLoaded', function () {

    const public_api_url = "http://127.0.0.1:5000"
    const predict_url_end = "/predict";

    let isChatOpen = false;
    let modelType = "MultinomialNB";

    const chatBot = document.getElementById('chatBot');
    const chatLogo = document.getElementById('chatLogo');
    const mipoLogo = document.getElementById('mipoLogo');
    const chatReminder = document.getElementById('chatReminder');
    const chatContainer = document.getElementById('chatContainer');
    const chatBody = document.getElementById('chatBody');
    const submitButton = document.getElementById('chatSubmit');
    const stopButton = document.getElementById('chatStop');
    const chatInput = document.getElementById('chatInput');
    const closer = document.getElementById("closeDiv");
    const removeButton = document.getElementById("removeButton");

    closer.addEventListener('click', function () {
        closeChatWindow()
    })
    mipoLogo.addEventListener('click', function () {
        closer.classList.remove('close')
        closeChatWindow()
    })
    submitButton.addEventListener('click', function () {
        const userMessage = chatInput.value.trim()
        sendDynamicMessageFromUserToBot(userMessage);
        chatInput.blur();
    })
    chatInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            const userMessage = chatInput.value.trim()
            sendDynamicMessageFromUserToBot(userMessage);
            chatInput.blur();
        }
    });
    chatInput.addEventListener('focus', function () {
        this.setAttribute('placeholder', '');
    });
    chatInput.addEventListener('blur', function () {
        this.setAttribute('placeholder', '. . .');
    })
    removeButton.addEventListener('click', function (event) {
        event.stopPropagation();
        chatBot.style.display = "none";
        chatLogo.style.display = "none";
        chatReminder.style.display = "none";
        chatContainer.style.display = "none";
    });

    startChat()

    //MAIN FS
    async function sendStaticMessageFromBotToUser(botMessage) {
        const botMessageTopDiv = document.createElement('div');
        botMessageTopDiv.classList.add('chat-body-bot-part')

        const botMessagesDiv = document.createElement('div');
        botMessagesDiv.classList.add('chat-body-bot-messages')

        const botImg = document.createElement('img');
        botImg.src = "static/images/mipo.png"
        botImg.classList.add('bot-img');

        const botMessageTag = document.createElement('p');
        botMessageTag.classList.add('bot-message');
        botMessageTag.id = "botMessage"

        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('bot-message-div')

        const responseDiv = document.createElement('div');
        responseDiv.classList.add('chat-body-bot-responses')

        botMessageDiv.appendChild(botMessageTag)
        responseDiv.appendChild(botMessageDiv)
        botMessagesDiv.appendChild(botImg);
        botMessagesDiv.appendChild(responseDiv)
        botMessageTopDiv.appendChild(botMessagesDiv);
        chatBody.appendChild(botMessageTopDiv)

        typewriterEffect(botMessageTag, '. . .', 100);
        await delay(1500)
        typewriterEffect(botMessageTag, botMessage, 25)

        chatBody.scrollTop = chatBody.scrollHeight;
    }

    async function sendDynamicMessageFromBotToUser(userMessage) {

        const botMessageTopDiv = document.createElement('div');
        botMessageTopDiv.classList.add('chat-body-bot-part');

        const botMessagesDiv = document.createElement('div');
        botMessagesDiv.classList.add('chat-body-bot-messages');

        const botImg = document.createElement('img');
        botImg.src = "static/images/mipo.png"
        botImg.classList.add('bot-img')

        const botMessageTag = document.createElement('p');
        botMessageTag.classList.add('bot-message');
        botMessageTag.id = "botMessage"

        const botMessageDiv = document.createElement('div');
        botMessageDiv.classList.add('bot-message-div');

        const responseDiv = document.createElement('div');
        responseDiv.classList.add('chat-body-bot-responses');

        botMessageDiv.appendChild(botMessageTag)
        responseDiv.appendChild(botMessageDiv)
        botMessagesDiv.appendChild(botImg);
        botMessagesDiv.appendChild(responseDiv)
        botMessageTopDiv.appendChild(botMessagesDiv);
        chatBody.appendChild(botMessageTopDiv);

        typewriterEffect(botMessageTag, '. . .', 100)
        responseData = await predict(userMessage, modelType);
        return_code_ACCAPTABLE = "predict-is-acceptable"
        return_code_BETWEEN = 'predict-is-between-min-and-max-prob'
        return_code_BELOW = 'predict-is-below-min-prob'
        return_code_ERROR = 'error'
        await delay(1500)

        removeOnClick = true
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
            text = "Üzgünüm, sorunu anlamadım.";
            typewriterEffect(botMessageTag, text, 25)
            responseDiv.appendChild(botMessageDiv)
            botMessagesDiv.appendChild(responseDiv)
        }
        else if (responseData.return_code == return_code_ERROR) {
            text = "Üzgünüm, şu an sana yardım edemiyorum.";
            typewriterEffect(botMessageTag, text, 25)
            responseDiv.appendChild(botMessageDiv)
            botMessagesDiv.appendChild(responseDiv)
        }

        botMessageTopDiv.appendChild(botMessagesDiv);
        chatBody.appendChild(botMessageTopDiv);

        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function sendStaticMessageFromUserToBot(userMessage) {
        if (userMessage === '') return;
        const startDiv = document.getElementById("startDiv");
        if (chatBody.contains(startDiv)) {
            chatBody.removeChild(startDiv);
        }

        const userMessageTopDiv = document.createElement('div');
        userMessageTopDiv.classList.add('chat-body-user-part');

        const userMessageElement = document.createElement('p');
        userMessageElement.textContent = userMessage;
        userMessageElement.classList.add('user-message');
        userMessageElement.id = "userMessage"

        const userMessagesDiv = document.createElement('div');
        userMessagesDiv.classList.add('chat-body-user-messages');

        userMessagesDiv.append(userMessageElement)
        userMessageTopDiv.appendChild(userMessagesDiv);
        chatBody.appendChild(userMessageTopDiv);

        chatInput.value = '';
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    function sendDynamicMessageFromUserToBot(userMessage) {
        if (userMessage === '') return;
        const startDiv = document.getElementById("startDiv");
        if (chatBody.contains(startDiv)) {
            chatBody.removeChild(startDiv);
        }

        const userMessageTopDiv = document.createElement('div');
        userMessageTopDiv.classList.add('chat-body-user-part');

        const userMessageElement = document.createElement('p');
        userMessageElement.textContent = userMessage;
        userMessageElement.classList.add('user-message');
        userMessageElement.id = "userMessage"

        const userMessagesDiv = document.createElement('div');
        userMessagesDiv.classList.add('chat-body-user-messages');

        userMessagesDiv.append(userMessageElement)
        userMessageTopDiv.appendChild(userMessagesDiv);
        chatBody.appendChild(userMessageTopDiv);

        chatInput.value = '';
        modelType = "MultinomialNB"
        sendDynamicMessageFromBotToUser(userMessage)
        chatBody.scrollTop = chatBody.scrollHeight;
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
        chatInput.addEventListener('keydown', function (event) {
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

    function startChat() {

        const startDiv = document.createElement('div');
        startDiv.classList.add('start-div');
        startDiv.id = "startDiv"

        const buttonData = [
            "Merhaba",
            "Kendinizi tanıtır mısınız?",
            "Mevcut işiniz nedir?",
            "Size nasıl ulaşabilirim?"
        ];

        for (let i = 0; i < buttonData.length; i++) {
            const button = document.createElement('button');
            button.classList.add('start-button');
            button.id = "startButton"
            button.textContent = buttonData[i];

            button.addEventListener('click', function () {
                sendDynamicMessageFromUserToBot(button.textContent)
            });

            startDiv.appendChild(button);
        }

        chatBody.appendChild(startDiv);
        draggableChatOn()
    }

    function closeChatWindow() {
        chatContainer.classList.toggle("showing");
        isChatOpen = !isChatOpen;

        if (isChatOpen) {
            chatReminder.style.display = "none";
            removeButton.style.display = "none";
        } else {
            chatReminder.style.display = "block";
            removeButton.style.display = "block";
        }
    }

    function draggableChatOn() {
        elmnt = document.getElementById("chatLogo");
        document.getElementById("mipoLogo").onmousedown = dragMouseDown;
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

            botRight = (parseInt(getComputedStyle(elmnt).right) + pos1);
            botBottom = (parseInt(getComputedStyle(elmnt).bottom) + pos2);
            elmnt.style.right = botRight + "px";
            elmnt.style.bottom = botBottom + "px";

            let mode = ['S', 'E'];
            const [windowHeight, windowWidth] = getWindowSize();

            if (botBottom < windowHeight / 2) {
                mode[0] = 'S'
                removeButton.style.top = "0px";
                removeButton.style.bottom = "unset";

                chatReminder.style.top = "unset";
                chatReminder.style.bottom = "100px";

                chatContainer.style.top = "unset";
                chatContainer.style.bottom = "100px";
            }
            else if (botBottom >= windowHeight / 2) {
                mode[0] = 'N'
                removeButton.style.top = "unset";
                removeButton.style.bottom = "0px";

                chatReminder.style.top = "100px";
                chatReminder.style.bottom = "unset";

                chatContainer.style.top = "100px";
                chatContainer.style.bottom = "unset";
            }

            if (botRight < windowWidth / 2) {
                mode[1] = 'E'
                removeButton.style.right = "-2px";
                removeButton.style.left = "unset";

                chatReminder.style.right = "20px";
                chatReminder.style.left = "unset";

                chatContainer.style.right = "20px";
                chatContainer.style.left = "unset";
            }
            else if (botRight >= windowWidth / 2) {
                mode[1] = 'W'
                removeButton.style.right = "unset";
                removeButton.style.left = "-2px";

                chatReminder.style.right = "unset";
                chatReminder.style.left = "20px";

                chatContainer.style.right = "unset";
                chatContainer.style.left = "20px";
            }

        }

        function closeDragElement() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }

    function getWindowSize() {
        const height = window.innerHeight;
        const width = window.innerWidth;

        return [height, width];
    }

});