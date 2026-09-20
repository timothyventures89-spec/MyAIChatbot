const http = require("http");
const OpenAI = require("openai");

const PORT = process.env.PORT || 3000;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Samuel AI</title>

<style>
* {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: Arial, Helvetica, sans-serif;
    background: #f7f7f8;
    color: #222;
    height: 100vh;
    overflow: hidden;
}

.app {
    display: flex;
    height: 100vh;
}

/* SIDEBAR */
.sidebar {
    width: 260px;
    background: #202123;
    color: white;
    padding: 15px;
    display: flex;
    flex-direction: column;
}

.logo {
    font-size: 20px;
    font-weight: bold;
    padding: 15px 10px 25px;
}

.new-chat {
    width: 100%;
    padding: 13px;
    border: 1px solid #565869;
    border-radius: 8px;
    background: transparent;
    color: white;
    font-size: 15px;
    cursor: pointer;
    text-align: left;
}

.new-chat:hover {
    background: #343541;
}

.sidebar-bottom {
    margin-top: auto;
}

.sidebar-button {
    width: 100%;
    border: none;
    background: transparent;
    color: white;
    padding: 13px 10px;
    text-align: left;
    cursor: pointer;
    border-radius: 7px;
    font-size: 14px;
}

.sidebar-button:hover {
    background: #343541;
}

/* MAIN */
.main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.topbar {
    height: 60px;
    background: white;
    border-bottom: 1px solid #ddd;
    display: flex;
    align-items: center;
    padding: 0 25px;
    font-weight: bold;
    font-size: 18px;
}

/* CHAT */
.chat {
    flex: 1;
    overflow-y: auto;
    padding: 30px 15%;
}

.welcome {
    text-align: center;
    margin-top: 12vh;
}

.welcome h1 {
    font-size: 32px;
    margin-bottom: 12px;
}

.welcome p {
    color: #666;
    font-size: 16px;
}

.message {
    display: flex;
    gap: 15px;
    margin-bottom: 25px;
    line-height: 1.6;
}

.avatar {
    width: 36px;
    height: 36px;
    min-width: 36px;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 19px;
}

.user-avatar {
    background: #5436da;
}

.ai-avatar {
    background: #10a37f;
}

.message-content {
    flex: 1;
    padding-top: 5px;
    white-space: pre-wrap;
}

/* INPUT */
.input-area {
    padding: 20px 15%;
    background: #f7f7f8;
}

.input-box {
    display: flex;
    align-items: center;
    background: white;
    border: 1px solid #d9d9e3;
    border-radius: 12px;
    padding: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

input {
    flex: 1;
    border: none;
    outline: none;
    padding: 13px;
    font-size: 16px;
    background: transparent;
}

.send {
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 8px;
    background: #10a37f;
    color: white;
    font-size: 20px;
    cursor: pointer;
}

.send:hover {
    background: #0d8c6d;
}

.send:disabled {
    background: #aaa;
    cursor: not-allowed;
}

.footer {
    text-align: center;
    color: #777;
    font-size: 11px;
    margin-top: 8px;
}

/* TYPING */
.typing {
    display: flex;
    gap: 4px;
    padding-top: 10px;
}

.typing span {
    width: 7px;
    height: 7px;
    background: #777;
    border-radius: 50%;
    animation: bounce 1.4s infinite;
}

.typing span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes bounce {
    0%, 60%, 100% {
        transform: translateY(0);
    }

    30% {
        transform: translateY(-5px);
    }
}

/* DARK MODE */
body.dark {
    background: #343541;
    color: #fff;
}

body.dark .main {
    background: #343541;
}

body.dark .topbar {
    background: #343541;
    border-color: #565869;
    color: white;
}

body.dark .input-area {
    background: #343541;
}

body.dark .input-box {
    background: #40414f;
    border-color: #565869;
}

body.dark input {
    color: white;
}

body.dark .welcome p {
    color: #bbb;
}

body.dark .footer {
    color: #aaa;
}

/* MOBILE */
@media (max-width: 700px) {

    .sidebar {
        display: none;
    }

    .chat {
        padding: 25px 15px;
    }

    .input-area {
        padding: 12px;
    }

    .welcome h1 {
        font-size: 26px;
    }

    .topbar {
        padding: 0 15px;
    }
}
</style>
</head>

<body>

<div class="app">

    <aside class="sidebar">

        <div class="logo">
            🤖 Samuel AI
        </div>

        <button class="new-chat" onclick="newChat()">
            ＋ New chat
        </button>

        <div class="sidebar-bottom">

            <button class="sidebar-button" onclick="toggleDarkMode()">
                🌓 Change appearance
            </button>

            <button class="sidebar-button" onclick="clearChat()">
                🗑️ Clear conversation
            </button>

        </div>

    </aside>

    <main class="main">

        <div class="topbar">
            Samuel AI
        </div>

        <div class="chat" id="chat">

            <div class="welcome" id="welcome">
                <h1>How can I help you today?</h1>
                <p>Ask Samuel AI anything.</p>
            </div>

        </div>

        <div class="input-area">

            <div class="input-box">

                <input
                    id="messageInput"
                    type="text"
                    placeholder="Message Samuel AI..."
                    autocomplete="off"
                >

                <button
                    class="send"
                    id="sendButton"
                    onclick="sendMessage()"
                >
                    ↑
                </button>

            </div>

            <div class="footer">
                Samuel AI can make mistakes. Check important information.
            </div>

        </div>

    </main>

</div>

<script>

const input = document.getElementById("messageInput");
const chat = document.getElementById("chat");
const sendButton = document.getElementById("sendButton");

input.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});

async function sendMessage() {

    const message = input.value.trim();

    if (!message) return;

    const welcome = document.getElementById("welcome");

    if (welcome) {
        welcome.remove();
    }

    addMessage(message, "user");

    input.value = "";

    sendButton.disabled = true;

    const typing = document.createElement("div");

    typing.className = "message";

    typing.id = "typing";

    typing.innerHTML = \`
        <div class="avatar ai-avatar">🤖</div>

        <div class="message-content">

            <div class="typing">
                <span></span>
                <span></span>
                <span></span>
            </div>

        </div>
    \`;

    chat.appendChild(typing);

    scrollToBottom();

    try {

        const response = await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: message
            })

        });

        const data = await response.json();

        typing.remove();

        if (data.reply) {

            addMessage(data.reply, "ai");

        } else {

            addMessage(
                "❌ Sorry, Samuel AI could not respond.",
                "ai"
            );

        }

    } catch (error) {

        typing.remove();

        addMessage(
            "❌ Connection error. Please try again.",
            "ai"
        );

    }

    sendButton.disabled = false;

    input.focus();

}

function addMessage(text, type) {

    const message = document.createElement("div");

    message.className = "message";

    if (type === "user") {

        message.innerHTML = \`
            <div class="avatar user-avatar">👤</div>
            <div class="message-content"></div>
        \`;

    } else {

        message.innerHTML = \`
            <div class="avatar ai-avatar">🤖</div>
            <div class="message-content"></div>
        \`;

    }

    message.querySelector(".message-content").textContent = text;

    chat.appendChild(message);

    scrollToBottom();

}

function scrollToBottom() {

    chat.scrollTop = chat.scrollHeight;

}

function newChat() {

    chat.innerHTML = \`
        <div class="welcome" id="welcome">
            <h1>How can I help you today?</h1>
            <p>Ask Samuel AI anything.</p>
        </div>
    \`;

    input.focus();

}

function clearChat() {

    newChat();

}

function toggleDarkMode() {

    document.body.classList.toggle("dark");

}

</script>

</body>
</html>
`;

const server = http.createServer(async (req, res) => {

    if (req.method === "GET" && req.url === "/") {

        res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });

        res.end(html);

        return;
    }

    if (req.method === "POST" && req.url === "/chat") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {

            try {

                const { message } = JSON.parse(body);

                if (!message) {

                    res.writeHead(400, {
                        "Content-Type": "application/json"
                    });

                    res.end(JSON.stringify({
                        error: "No message provided"
                    }));

                    return;
                }

                const response = await client.responses.create({

                    model: "gpt-5.6-luna",

                    input: message

                });

                const reply = response.output_text;

                res.writeHead(200, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    reply: reply
                }));

            } catch (error) {

                console.error(error);

                res.writeHead(500, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error: "The AI could not respond."
                }));

            }

        });

        return;
    }

    res.writeHead(404, {
        "Content-Type": "text/plain"
    });

    res.end("Not found");

});

server.listen(PORT, () => {

    console.log("🤖 SAMUEL AI CHATBOT SERVER");
    console.log("Running on port " + PORT);

});
