const http = require("http");
const OpenAI = require("openai");

const PORT = 3000;

// Get your API key from Windows environment variables
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const html = `
<!DOCTYPE html>
<html>
<head>
    <title>My AI Chatbot</title>

    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f2f2f2;
        }

        .chat-container {
            width: 90%;
            max-width: 700px;
            margin: 50px auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.15);
            overflow: hidden;
        }

        .header {
            background: #2563eb;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
        }

        #messages {
            height: 400px;
            overflow-y: auto;
            padding: 20px;
        }

        .message {
            padding: 12px;
            margin: 10px 0;
            border-radius: 10px;
            max-width: 80%;
            white-space: pre-wrap;
        }

        .user {
            background: #dbeafe;
            margin-left: auto;
        }

        .bot {
            background: #eeeeee;
            margin-right: auto;
        }

        .input-area {
            display: flex;
            padding: 15px;
            border-top: 1px solid #ddd;
        }

        input {
            flex: 1;
            padding: 12px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 16px;
        }

        button {
            margin-left: 10px;
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            background: #2563eb;
            color: white;
            font-size: 16px;
            cursor: pointer;
        }

        button:hover {
            background: #1d4ed8;
        }

        button:disabled {
            background: #999;
            cursor: not-allowed;
        }
    </style>
</head>

<body>

<div class="chat-container">

    <div class="header">
        🤖 My AI Chatbot
    </div>

    <div id="messages">
        <div class="message bot">
            Hello! 👋 I'm your AI chatbot. Ask me anything!
        </div>
    </div>

    <div class="input-area">

        <input
            id="userInput"
            type="text"
            placeholder="Type your message..."
            onkeydown="if(event.key === 'Enter') sendMessage()"
        >

        <button id="sendButton" onclick="sendMessage()">
            Send
        </button>

    </div>

</div>

<script>

async function sendMessage() {

    const input = document.getElementById("userInput");
    const messages = document.getElementById("messages");
    const button = document.getElementById("sendButton");

    const text = input.value.trim();

    if (text === "") {
        return;
    }

    // Show user's message
    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    userMessage.textContent = text;

    messages.appendChild(userMessage);

    input.value = "";
    button.disabled = true;
    button.textContent = "Thinking...";

    // Show temporary thinking message
    const botMessage = document.createElement("div");
    botMessage.className = "message bot";
    botMessage.textContent = "Thinking... 🤔";

    messages.appendChild(botMessage);
    messages.scrollTop = messages.scrollHeight;

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

        if (data.error) {
            botMessage.textContent = "❌ Error: " + data.error;
        } else {
            botMessage.textContent = data.reply;
        }

    } catch (error) {

        botMessage.textContent =
            "❌ I couldn't connect to the AI. Please try again.";

        console.error(error);

    }

    button.disabled = false;
    button.textContent = "Send";

    messages.scrollTop = messages.scrollHeight;
}

</script>

</body>
</html>
`;

const server = http.createServer(async (req, res) => {

    // Show chatbot webpage
    if (req.method === "GET" && req.url === "/") {

        res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });

        res.end(html);
        return;
    }

    // Receive chatbot messages
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

                // Send message to OpenAI
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
                    error: "The AI could not respond. Check your API key and account."
                }));
            }
        });

        return;
    }

    // Page not found
    res.writeHead(404, {
        "Content-Type": "text/plain"
    });

    res.end("Not found");
});

server.listen(PORT, () => {

    console.log("================================");
    console.log("🤖 MY AI CHATBOT SERVER");
    console.log("================================");
    console.log("Running at:");
    console.log("http://localhost:" + PORT);

});