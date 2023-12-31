import { Configuration, OpenAIApi } from "openai";
import { Bot, webhookCallback } from "grammy";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const CHAT_GPT_MODEL = 'gpt-3.5-turbo';

// Open AI Configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});

const openai = new OpenAIApi(configuration);

const bot = new Bot(process.env.BOTKEY);

const systemMessage = 'You are a helpful assistant.';
let userMessages = [];

bot.on('message', async (ctx) => {
    try {
        // Check if the user wants to delete the context
        if (ctx.message.text.toLowerCase() === '/deletecontext') {
            userMessages = []; // Clear the context
            await ctx.reply('Context deleted.');
            return;
        }

        // Add user message to the context
        userMessages.push({ role: 'user', content: ctx.message.text });

        // Create chat completion
        const response = await openai.createChatCompletion({
            model: CHAT_GPT_MODEL,
            messages: [{ role: 'system', content: systemMessage }, ...userMessages],
            temperature: 0.5,
            max_tokens: 3000
        });

        // send a message to the chat acknowledging receipt of their message
        await ctx.reply(response.data.choices[0].message.content);
    } catch (error) {
        await ctx.reply(error.message);
    }
});

if (process.env.NODE_ENV === "production") {
    // Use Webhooks for the production server
    const app = express();
    app.use(express.json());
    app.use(webhookCallback(bot, "express"));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Bot listening on port ${PORT}`);
    });
} else {
    // Use Long Polling for development
    bot.start();
}
