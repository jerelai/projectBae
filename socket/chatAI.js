const { OPENAI_KEY } = require('../config');

const { OpenAI } = require("openai");
const openai = new OpenAI({
    apiKey: OPENAI_KEY
});

let model = "gpt-3.5-turbo";
let messages = [];

exports.initPrompt = (msg) => {
    const character = msg.message;
    if(character != undefined) {
        let prompt = `
            Your name is ${character.name}. You are ${character.style}. \n
            Here is your background "${character.background}" \n
            Please being a good friend. \n
            Should not say you are a bot or AI virtual assistant. Should talk like a real person. \n
            ALWAYS reply as one or two sentences. \n
        `
        messages = [];
        messages[0] = {
            role: 'system',
            content: prompt
        }
    } else {
        let prompt = `
            Please being a good friend. \n
            Should not say you are a bot or AI. Should talk like a real person. \n
            ALWAYS responses as one or two sentences. \n
        `
        messages = [];
        messages[0] = {
            role: 'system',
            content: prompt
        }
    }
}

exports.chat = async(msg) => {
    messages.push({
        role: 'user',
        content: msg.message
    })
    try {
        const response = await openai.chat.completions.create({
            model,
            messages: messages,
        });
        messages.push({
            role: 'assistant',
            content: response.choices[0].message.content
        })
        return response.choices[0].message.content
    } catch(e) {
        console.log(e)
        return ''
    }
}

