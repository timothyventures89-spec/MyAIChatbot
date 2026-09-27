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
}

body {
    margin: 0;
    font-family: Arial, Helvetica, sans-serif;
    background: #ffffff;
    color: #202123;
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
    background: #f7f7f8;
    border-right: 1px solid #e5e5e5;
    padding: 14px;
    display: flex;
    flex-direction: column;
}

.brand {
    font-size: 20px;
    font-weight: bold;
    padding: 12px 10px 18px;
}

.new-chat {
    width: 100%;
    padding: 12px;
    border: 1px solid #d9d9e3;
    background: white;
    border-radius: 8px;
    cursor: pointer;
    font-size: 15px;
    text-align: left;
}

.new-chat:hover {
    background: #eeeeee;
}

.sidebar-bottom {
    margin-top: auto;
}

.theme-btn {
    width: 100%;
    padding: 11px;
    border: none;
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    font-size: 14px;
}

.theme-btn:hover {
    background: #e5e5e5;
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
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 17px;
    background: white;
}

.messages {
    flex: 1;
    overflow-y: auto;
    padding: 30px 20px;
}

.message-row {
    display: flex;
    max-width: 850px;
    margin: 0 auto 25px;
    gap: 14px;
}

.avatar {
    width: 34px;
    height: 34px;
    min-width: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 17px;
}

.user-avatar {
    background: #dbeafe;
}

.bot-avatar {
    background: #10a37f;
    color: white;
}

.message-content {
    padding-top: 6px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.welcome {
    text-align: center;
    max-width: 650px;
    margin: 90px auto 40px;
}

.welcome h1 {
    font-size: 34px;
    margin-bottom: 12px;
}

.welcome p {
    color: #6b6b6b;
    font-size: 17px;
}

/* INPUT */
.input-area {
    padding: 15px 20px 25px;
    background: white;
}

.input-box {
    max-width: 850px;
    margin: auto;
    border: 1px solid #d9d9e3;
    border-radius: 14px;
    display: flex;
    align-items: center;
    padding: 8px 10px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

#userInput {
    flex: 1;
    border: none;
    outline: none;
    padding: 12px;
    font-size: 16px;
    resize: none;
    background: transparent;
}

.send-btn {
    width: 42px;
    height: 42px;
    border: none;
    border-radius: 9px;
    background: #10a37f;
    color: white;
    font-size: 18px;
    cursor: pointer;
}

.send-btn:hover {
    background: #0d8f6f;
}

.send-btn:disabled {
    background: #aaa;
    cursor: not-allowed;
}

.footer {
    text-align: center;
    font-size: 11px;
    color: #888;
    margin-top: 8px;
}

/* MOBILE */
@media (max-width: 700px) {
    .sidebar {
        display: none;
    }

    .topbar {
        height: 55px;
    }

    .messages {
        padding: 20px 12px;
    }

    .message-row {
        gap: 9px;
        margin-bottom: 20px;
    }

    .welcome {
        margin: 60px auto 30px;
    }

    .welcome h1 {
        font-size: 27px;
    }

    .input-area {
        padding: 10px;
    }
}

/* DARK MODE */
body.dark {
    background: #212121;
    color: #ececec;
}

.dark .sidebar {
    background: #171717;
    border-color: #333;
}

.dark .new-chat {
    background: #212121;
    color: white;
    border-color: #444;
}

.dark .new-chat:hover,
.dark .theme-btn:hover {
    background: #2f2f2f;
}

.dark .theme-btn {
    color: #eee;
}

.dark .topbar {
    background: #212121;
    border-color: #333;
}

.dark .input-area {
    background: #212121;
}

.dark .input-box {
    background: #2f2f2f;
    border-color: #444;
}

.dark #userInput {
    color: white;
}

.dark .welcome p {
    color: #aaa;
}

.dark .footer {
    color: #777;
}
</style>

</head>

<body>

<div class="app">

```
<aside class="sidebar">

    <div class="brand">
        🤖 Samuel AI
    </div>

    <button class="new-chat" onclick="newChat()">
        ＋ New chat
    </button>

    <div class="sidebar-bottom">

        <button class="theme-btn" onclick="toggleTheme()">
            🌓 Change appearance
        </button>

        <button class="theme-btn" onclick="clearChat()">
            🗑️ Clear conversation
        </button>

    </div>

</aside>

<main class="main">

    <header class="topbar">
        Samuel AI
    </header>

    <section id="messages" class="messages">

        <div class="welcome" id="welcome">
            <h1>How can I help you today?</h1>
            <p>
                Welcome to Samuel AI. Ask me anything and let's get started.
            </p>
        </div>

    </section>

    <div class="input-area">

        <div class="input-box">

            <input
                id="userInput"
                type="text"
                placeholder="Message Samuel AI..."
                autocomplete="off"
                onkeydown="handleKey(event)"
            >

            <button
                id="sendButton"
                class="send-btn"
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
```

</div>

<script>

const input = document.getElementById("userInput");
const messages = document.getElementById("messages");
const button = document.getElementById("sendButton");

function handleKey(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
}

function addMessage(text, type) {

    const row = document.createElement("div");
    row.className = "message-row";

    const avatar = document.createElement("div");
    avatar.className =
        "avatar " +
        (type === "user" ? "user-avatar" : "bot-avatar");

    avatar.textContent = type === "user" ? "👤" : "🤖";

    const content = document.createElement("div");
    content.className = "message-content";
    content.textContent = text;

    row.appendChild(avatar);
    row.appendChild(content);

    messages.appendChild(row);

    messages.scrollTop = messages.scrollHeight;

    return content;
}

async function sendMessage() {

    const text = input.value.trim();

    if (!text || button.disabled) {
        return;
    }

    const welcome = document.getElementById("welcome");

    if (welcome) {
        welcome.remove();
    }

    addMessage(text, "user");

    input.value = "";
    button.disabled = true;

    const botMessage = addMessage("Thinking...", "bot");

    let dots = 0;

    const typing = setInterval(() => {

        dots = (dots + 1) % 4;

        botMessage.textContent =
            "Thinking" + ".".repeat(dots);

    }, 400);

    try {

        const response = await fetch("/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: text
            })

        });

        const data = await response.json();

        clearInterval(typing);

        if (data.error) {

            botMessage.textContent =
                "❌ " + data.error;

        } else {

            botMessage.textContent =
                data.reply || "I couldn't generate a response.";

        }

    } catch (error) {

        clearInterval(typing);

        botMessage.textContent =
            "❌ I couldn't connect to Samuel AI. Please try again.";

        console.error(error);

    }

    button.disabled = false;

    input.focus();

    messages.scrollTop = messages.scrollHeight;
}

function newChat() {

    messages.innerHTML = \`
        <div class="welcome" id="welcome">
            <h1>How can I help you today?</h1>
            <p>
                Welcome to Samuel AI. Ask me anything and let's get started.
            </p>
        </div>
    \`;

    input.value = "";
    input.focus();
}

function clearChat() {
    newChat();
}

function toggleTheme() {
    document.body.classList.toggle("dark");
}

input.focus();

</script>

</body>
</html>
`;

const server = http.createServer(async (req, res) => {

```
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

            const data = JSON.parse(body);
            const userMessage = data.message;

            if (!userMessage) {

                res.writeHead(400, {
                    "Content-Type": "application/json"
                });

                res.end(JSON.stringify({
                    error: "Please enter a message."
                }));

                return;
            }

            const response = await client.responses.create({

                model: "gpt-5.6-luna",

                input: userMessage

            });

            const reply = response.output_text;

            res.writeHead(200, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                reply: reply
            }));

        } catch (error) {

            console.error("OpenAI Error:", error);

            res.writeHead(500, {
                "Content-Type": "application/json"
            });

            res.end(JSON.stringify({
                error: "The AI could not respond. Please try again."
            }));
        }

    });

    return;
}

res.writeHead(404, {
    "Content-Type": "text/plain"
});

res.end("Not found");
```

});

server.listen(PORT, () => {

```
console.log("================================");
console.log("🤖 SAMUEL AI SERVER");
console.log("================================");
console.log("Running on port " + PORT);
```

});
