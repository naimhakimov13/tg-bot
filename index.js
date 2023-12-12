import { Configuration, OpenAIApi } from "openai";
import TelegramBot from "node-telegram-bot-api";
import dotenv from "dotenv";

dotenv.config();

const CHAT_GPT_MODEL = 'gpt-3.5-turbo';

// Open AI Configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

const bot = new TelegramBot(process.env.BOTKEY, { polling: true });

const systemMessage = 'You are a helpful assistant.';
let userMessages = [];

bot.on('message', async (msg) => {
    try {
        // Check if the user wants to delete the context
        if (msg.text.toLowerCase() === '/deletecontext') {
            userMessages = []; // Clear the context
            bot.sendMessage(msg.chat.id, 'Context deleted.');
            return;
        }

        // Add user message to the context
        userMessages.push({ role: 'user', content: msg.text });

        // Create chat completion
        const response = await openai.createChatCompletion({
            model: CHAT_GPT_MODEL,
            messages: [{ role: 'system', content: systemMessage }, ...userMessages],
            temperature: 0.5,
            max_tokens: 3000
        });

        // send a message to the chat acknowledging receipt of their message
        bot.sendMessage(msg.chat.id, response.data.choices[0].message.content);
    } catch (error) {
        bot.sendMessage(msg.chat.id, error.message);
    }
});
