const http = require("http");
const OpenAI = require("openai");

const PORT = process.env.PORT || 3000;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Samuel AIChatbot</title>

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
    display: flex;
    flex-direction: column;
    padding: 14px;
}

.logo {
    font-size: 20px;
    font-weight: bold;
    padding: 12px 10px 20px;
}

.new-chat {
    border: 1px solid #d9d9e3;
    background: white;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    font-size: 15px;
    text-align: left;
}

.new-chat:hover {
    background: #eeeeee;
}

.sidebar-buttons {
    margin-top: 12px;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.sidebar-button {
    border: none;
    background: transparent;
    padding: 11px;
    text-align: left;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
}

.sidebar-button:hover {
    background: #e9e9e9;
}

.chat-history {
    margin-top: 18px;
    overflow-y: auto;
    flex: 1;
}

.history-title {
    font-size: 12px;
    color: #777;
    padding: 8px;
}

.history-item {
    padding: 10px;
    border-radius: 7px;
    cursor: pointer;
    font-size: 14px;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.history-item:hover {
    background: #e5e5e5;
}

/* MAIN */

.main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.header {
    height: 60px;
    border-bottom: 1px solid #e5e5e5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
}

.header-title {
    font-size: 17px;
    font-weight: 600;
}

.header-actions button {
    border: none;
    background: transparent;
    font-size: 20px;
    cursor: pointer;
}

/* CHAT */

.chat {
    flex: 1;
    overflow-y: auto;
    padding: 30px 20px 120px;
}

.welcome {
    max-width: 750px;
    margin: 80px auto;
    text-align: center;
}

.welcome h1 {
    font-size: 32px;
    margin-bottom: 10px;
}

.welcome p {
    color: #666;
}

/* MESSAGES */

.message {
    max-width: 850px;
    margin: 0 auto 25px;
    display: flex;
    gap: 14px;
}

.avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 17px;
}

.user-avatar {
    background: #5436da;
    color: white;
}

.ai-avatar {
    background: #10a37f;
    color: white;
}

.message-content {
    flex: 1;
    line-height: 1.65;
    font-size: 15px;
    white-space: pre-wrap;
    word-wrap: break-word;
}

.message-actions {
    margin-top: 8px;
    display: flex;
    gap: 5px;
}

.message-actions button {
    border: none;
    background: transparent;
    color: #777;
    cursor: pointer;
    padding: 4px 7px;
    border-radius: 5px;
}

.message-actions button:hover {
    background: #eeeeee;
}

/* INPUT */

.input-area {
    position: fixed;
    bottom: 0;
    left: 260px;
    right: 0;
    padding: 15px 20px 20px;
    background: linear-gradient(
        transparent,
        white 30%
    );
}

.input-box {
    max-width: 850px;
    margin: auto;
    border: 1px solid #d9d9e3;
    background: white;
    border-radius: 14px;
    display: flex;
    align-items: flex-end;
    padding: 10px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    font-family: inherit;
    font-size: 15px;
    max-height: 160px;
    min-height: 25px;
    padding: 7px;
}

.send-button {
    width: 38px;
    height: 38px;
    border: none;
    border-radius: 8px;
    background: #10a37f;
    color: white;
    cursor: pointer;
    font-size: 18px;
}

.send-button:hover {
    background: #0d8f6f;
}

.send-button:disabled {
    background: #aaa;
    cursor: not-allowed;
}

.footer {
    text-align: center;
    font-size: 11px;
    color: #888;
    margin-top: 6px;
}

/* MEMORY PANEL */

.memory-panel {
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.35);
    z-index: 20;
}

.memory-box {
    width: 420px;
    max-width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    background: white;
    border-radius: 12px;
    margin: 10vh auto;
    padding: 22px;
}

.memory-box h2 {
    margin-top: 0;
}

.memory-item {
    background: #f5f5f5;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 14px;
}

.close-memory {
    float: right;
    border: none;
    background: transparent;
    font-size: 20px;
    cursor: pointer;
}

/* DARK MODE */

body.dark {
    background: #212121;
    color: #ececec;
}

body.dark .sidebar {
    background: #171717;
    border-color: #333;
}

body.dark .header {
    border-color: #333;
}

body.dark .new-chat,
body.dark .input-box,
body.dark .memory-box {
    background: #2b2b2b;
    color: white;
}

body.dark .sidebar-button:hover,
body.dark .history-item:hover,
body.dark .message-actions button:hover {
    background: #333;
}

body.dark textarea {
    background: #2b2b2b;
    color: white;
}

body.dark .input-area {
    background: linear-gradient(
        transparent,
        #212121 30%
    );
}

body.dark .memory-item {
    background: #3a3a3a;
}

/* MOBILE */

@media (max-width: 700px) {

    .sidebar {
        display: none;
    }

    .input-area {
        left: 0;
    }

    .chat {
        padding-left: 12px;
        padding-right: 12px;
    }

    .message {
        gap: 9px;
    }

    .welcome {
        margin-top: 60px;
    }

    .welcome h1 {
        font-size: 25px;
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

        <div class="sidebar-buttons">

            <button class="sidebar-button" onclick="showMemory()">
                🧠 My memory
            </button>

            <button class="sidebar-button" onclick="toggleDarkMode()">
                🌙 Dark mode
            </button>

            <button class="sidebar-button" onclick="clearEverything()">
                🗑️ Clear data
            </button>

        </div>

        <div class="chat-history">

            <div class="history-title">
                CHAT HISTORY
            </div>

            <div id="history"></div>

        </div>

    </aside>

    <main class="main">

        <header class="header">

            <div class="header-title">
                Samuel AIChatbot
            </div>

            <div class="header-actions">
                <button onclick="newChat()" title="New chat">
                    ＋
                </button>
            </div>

        </header>

        <section class="chat" id="chat">

            <div class="welcome" id="welcome">

                <h1>
                    How can I help you today?
                </h1>

                <p>
                    I'm Samuel, your AI assistant.
                </p>

            </div>

        </section>

    </main>

</div>

<div class="input-area">

    <div class="input-box">

        <textarea
            id="messageInput"
            placeholder="Message Samuel..."
            rows="1"
        ></textarea>

        <button
            class="send-button"
            id="sendButton"
            onclick="sendMessage()"
        >
            ➤
        </button>

    </div>

    <div class="footer">
        Samuel AI can make mistakes. Check important information.
    </div>

</div>

<div class="memory-panel" id="memoryPanel">

    <div class="memory-box">

        <button
            class="close-memory"
            onclick="closeMemory()"
        >
            ×
        </button>

        <h2>🧠 My Memory</h2>

        <p>
            Samuel remembers these things on this device.
        </p>

        <div id="memoryList"></div>

    </div>

</div>

<script>

let chats =
    JSON.parse(
        localStorage.getItem("samuel_chats") || "[]"
    );

let memories =
    JSON.parse(
        localStorage.getItem("samuel_memories") || "[]"
    );

let currentChatId =
    localStorage.getItem("samuel_current_chat");

let darkMode =
    localStorage.getItem("samuel_dark") === "true";

if (darkMode) {
    document.body.classList.add("dark");
}

function saveData() {

    localStorage.setItem(
        "samuel_chats",
        JSON.stringify(chats)
    );

    localStorage.setItem(
        "samuel_memories",
        JSON.stringify(memories)
    );

    if (currentChatId) {
        localStorage.setItem(
            "samuel_current_chat",
            currentChatId
        );
    }
}

function createChat() {

    const chat = {
        id: Date.now().toString(),
        title: "New chat",
        messages: []
    };

    chats.unshift(chat);

    currentChatId = chat.id;

    saveData();

    renderHistory();

    renderChat();

    return chat;
}

function getCurrentChat() {

    let chat = chats.find(
        c => c.id === currentChatId
    );

    if (!chat) {
        chat = createChat();
    }

    return chat;
}

function newChat() {

    createChat();

}

function renderHistory() {

    const history =
        document.getElementById("history");

    history.innerHTML = "";

    chats.forEach(chat => {

        const item =
            document.createElement("div");

        item.className = "history-item";

        item.textContent =
            chat.title || "New chat";

        item.onclick = function() {

            currentChatId = chat.id;

            saveData();

            renderChat();

        };

        history.appendChild(item);

    });

}

function renderChat() {

    const chat =
        document.getElementById("chat");

    const current =
        getCurrentChat();

    chat.innerHTML = "";

    if (current.messages.length === 0) {

        chat.innerHTML = \`
            <div class="welcome" id="welcome">
                <h1>How can I help you today?</h1>
                <p>I'm Samuel, your AI assistant.</p>
            </div>
        \`;

        return;
    }

    current.messages.forEach(message => {

        addMessageToScreen(
            message.text,
            message.role,
            false
        );

    });

    scrollToBottom();

}

function addMessageToScreen(
    text,
    role,
    showActions = true
) {

    const chat =
        document.getElementById("chat");

    const welcome =
        document.getElementById("welcome");

    if (welcome) {
        welcome.remove();
    }

    const wrapper =
        document.createElement("div");

    wrapper.className = "message";

    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar " +
        (role === "user"
            ? "user-avatar"
            : "ai-avatar");

    avatar.textContent =
        role === "user"
            ? "U"
            : "S";

    const content =
        document.createElement("div");

    content.className =
        "message-content";

    content.textContent = text;

    wrapper.appendChild(avatar);

    const inner =
        document.createElement("div");

    inner.style.flex = "1";

    inner.appendChild(content);

    if (
        role === "ai" &&
        showActions
    ) {

        const actions =
            document.createElement("div");

        actions.className =
            "message-actions";

        actions.innerHTML = \`
            <button onclick="copyText(this)">📋</button>
            <button onclick="this.textContent='👍'">👍</button>
            <button onclick="this.textContent='👎'">👎</button>
        \`;

        inner.appendChild(actions);

    }

    wrapper.appendChild(inner);

    chat.appendChild(wrapper);

    scrollToBottom();

}

function copyText(button) {

    const message =
        button
        .closest(".message")
        .querySelector(".message-content")
        .textContent;

    navigator.clipboard.writeText(message);

    button.textContent = "✓";

    setTimeout(() => {
        button.textContent = "📋";
    }, 1200);

}

function scrollToBottom() {

    const chat =
        document.getElementById("chat");

    chat.scrollTop =
        chat.scrollHeight;

}

async function sendMessage() {

    const input =
        document.getElementById("messageInput");

    const sendButton =
        document.getElementById("sendButton");

    const userMessage =
        input.value.trim();

    if (!userMessage) {
        return;
    }

    const current =
        getCurrentChat();

    if (
        current.messages.length === 0
    ) {

        current.title =
            userMessage.length > 35
                ? userMessage.substring(0, 35) + "..."
                : userMessage;

    }

    current.messages.push({
        role: "user",
        text: userMessage
    });

    addMessageToScreen(
        userMessage,
        "user"
    );

    input.value = "";

    input.style.height = "auto";

    saveData();

    sendButton.disabled = true;

    const typing =
        document.createElement("div");

    typing.className = "message";

    typing.id = "typing";

    typing.innerHTML = \`
        <div class="avatar ai-avatar">S</div>
        <div class="message-content">
            Samuel is thinking...
        </div>
    \`;

    document
        .getElementById("chat")
        .appendChild(typing);

    scrollToBottom();

    try {

        const response =
            await fetch("/chat", {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    message: userMessage,

                    memory: memories,

                    conversation:
                        current.messages

                })

            });

        const data =
            await response.json();

        const typingElement =
            document.getElementById("typing");

        if (typingElement) {
            typingElement.remove();
        }

        if (data.reply) {

            addMessageToScreen(
                data.reply,
                "ai"
            );

            current.messages.push({
                role: "ai",
                text: data.reply
            });

            /*
             * SAVE NEW MEMORY
             *
             * If Samuel detects that the
             * user explicitly asked him to
             * remember something, the server
             * sends it back as data.memory.
             */

            if (data.memory) {

                if (
                    !memories.includes(
                        data.memory
                    )
                ) {

                    memories.push(
                        data.memory
                    );

                }

            }

            saveData();

            renderHistory();

        } else {

            addMessageToScreen(
                "Sorry, something went wrong.",
                "ai"
            );

        }

    } catch (error) {

        const typingElement =
            document.getElementById("typing");

        if (typingElement) {
            typingElement.remove();
        }

        addMessageToScreen(
            "I couldn't connect to the AI server. Please try again.",
            "ai"
        );

        console.error(error);

    }

    sendButton.disabled = false;

}

function showMemory() {

    const panel =
        document.getElementById(
            "memoryPanel"
        );

    const list =
        document.getElementById(
            "memoryList"
        );

    list.innerHTML = "";

    if (memories.length === 0) {

        list.innerHTML =
            "<p>Samuel hasn't saved anything yet.</p>";

    } else {

        memories.forEach(
            (memory, index) => {

                const item =
                    document.createElement("div");

                item.className =
                    "memory-item";

                item.textContent =
                    (index + 1) +
                    ". " +
                    memory;

                list.appendChild(item);

            }
        );

    }

    panel.style.display = "block";

}

function closeMemory() {

    document.getElementById(
        "memoryPanel"
    ).style.display = "none";

}

function toggleDarkMode() {

    document.body.classList.toggle(
        "dark"
    );

    darkMode =
        document.body.classList.contains(
            "dark"
        );

    localStorage.setItem(
        "samuel_dark",
        darkMode
    );

}

function clearEverything() {

    const answer =
        confirm(
            "Delete all Samuel chats and memories from this device?"
        );

    if (!answer) {
        return;
    }

    localStorage.removeItem(
        "samuel_chats"
    );

    localStorage.removeItem(
        "samuel_memories"
    );

    localStorage.removeItem(
        "samuel_current_chat"
    );

    chats = [];

    memories = [];

    currentChatId = null;

    createChat();

    renderHistory();

    renderChat();

}

document
    .getElementById("messageInput")
    .addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

document
    .getElementById("messageInput")
    .addEventListener(
        "input",
        function() {

            this.style.height =
                "auto";

            this.style.height =
                Math.min(
                    this.scrollHeight,
                    160
                ) + "px";

        }
    );

/*
 * START APPLICATION
 */

if (!currentChatId || chats.length === 0) {

    createChat();

} else {

    renderHistory();

    renderChat();

}

</script>

</body>
</html>`;

const server = http.createServer(async (req, res) => {

    /*
     * MAIN WEBSITE
     */

    if (
        req.method === "GET" &&
        req.url === "/"
    ) {

        res.writeHead(200, {
            "Content-Type":
                "text/html; charset=utf-8"
        });

        res.end(html);

        return;
    }

    /*
     * CHAT API
     */

    if (
        req.method === "POST" &&
        req.url === "/chat"
    ) {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {

            try {

                const data =
                    JSON.parse(body);

                const userMessage =
                    data.message || "";

                const memory =
                    Array.isArray(data.memory)
                        ? data.memory
                        : [];

                const conversation =
                    Array.isArray(
                        data.conversation
                    )
                        ? data.conversation
                        : [];

                /*
                 * CHECK FOR MEMORY REQUEST
                 */

                const lower =
                    userMessage.toLowerCase();

                const memoryWords = [
                    "remember that",
                    "remember this",
                    "don't forget",
                    "do not forget",
                    "please remember",
                    "save this",
                    "keep in mind"
                ];

                let newMemory = null;

                for (
                    const phrase of memoryWords
                ) {

                    if (
                        lower.includes(phrase)
                    ) {

                        newMemory =
                            userMessage;

                        break;

                    }

                }

                /*
                 * PREPARE MEMORY
                 */

                let memoryText =
                    "No saved memories.";

                if (memory.length > 0) {

                    memoryText =
                        memory
                            .map(
                                (m, i) =>
                                    `${i + 1}. ${m}`
                            )
                            .join("\n");

                }

                /*
                 * PREPARE CONVERSATION
                 */

                let conversationText =
                    "";

                if (
                    conversation.length > 0
                ) {

                    conversationText =
                        conversation
                            .slice(-20)
                            .map(message => {

                                const role =
                                    message.role === "user"
                                        ? "User"
                                        : "Samuel";

                                return (
                                    role +
                                    ": " +
                                    message.text
                                );

                            })
                            .join("\n");

                }

                /*
                 * SYSTEM INSTRUCTIONS
                 */

                const systemPrompt = `
You are Samuel AIChatbot, a helpful,
friendly and intelligent AI assistant.

Your job is to answer the user's questions
clearly and naturally.

You have access to the user's local memories
and recent conversation.

SAVED USER MEMORIES:
${memoryText}

RECENT CONVERSATION:
${conversationText}

Use saved memories naturally when they are
relevant.

Do not claim to remember something that is
not contained in the provided memories or
conversation.

If the user asks you to remember something,
acknowledge it naturally.

Be helpful, friendly and concise unless the
user asks for more detail.
`;

                /*
                 * OPENAI REQUEST
                 */

                const completion =
                    await client.chat.completions.create({

                        model: "gpt-5.6-luna",

                        messages: [
                            {
                                role: "system",
                                content:
                                    systemPrompt
                            },
                            {
                                role: "user",
                                content:
                                    userMessage
                            }
                        ]

                    });

                const reply =
                    completion
                        .choices[0]
                        .message
                        .content;

                /*
                 * SEND RESPONSE
                 */

                res.writeHead(200, {
                    "Content-Type":
                        "application/json"
                });

                res.end(
                    JSON.stringify({
                        reply: reply,
                        memory: newMemory
                    })
                );

            } catch (error) {

                console.error(
                    "OPENAI ERROR:",
                    error
                );

                res.writeHead(500, {
                    "Content-Type":
                        "application/json"
                });

                res.end(
                    JSON.stringify({
                        reply:
                            "Sorry, I couldn't connect to the AI right now."
                    })
                );

            }

        });

        return;
    }

    /*
     * NOT FOUND
     */

    res.writeHead(404, {
        "Content-Type":
            "text/plain"
    });

    res.end("Not found.");

});

/*
 * START SERVER
 */

server.listen(
    PORT,
    () => {

        console.log(
            "🤖 SAMUEL AICHATBOT SERVER"
        );

        console.log(
            "Running on port:",
            PORT
        );

    }
);
