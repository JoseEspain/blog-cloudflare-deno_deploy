/**
 * @file api/src/index.ts
 * @description Hono后端API核心实现，提供AI聊天接口
 */

import { Hono } from 'hono';
import OpenAI from 'openai';
import { cors } from 'hono/cors';

// Define the binding types for environment variables for type safety
type Bindings = {
  API_KEY: string;
  API_BASE_URL: string;
  AI_MODEL_NAME?: string; // Model name is optional
}

const app = new Hono<{ Bindings: Bindings }>();

// Use CORS middleware to allow cross-origin requests, essential for local development
app.use('/chat', cors());

app.post('/chat', async (c) => {
  try {
    // Runtime-aware environment variable access
    const API_KEY = typeof Deno !== 'undefined' ? Deno.env.get('API_KEY') : c.env.API_KEY;
    const API_BASE_URL = typeof Deno !== 'undefined' ? Deno.env.get('API_BASE_URL') : c.env.API_BASE_URL;
    const AI_MODEL_NAME = typeof Deno !== 'undefined' ? Deno.env.get('AI_MODEL_NAME') : c.env.AI_MODEL_NAME;

    if (!API_KEY || !API_BASE_URL) {
      return c.json({ error: 'API configuration environment variables are not set.' }, 500);
    }

    const openai = new OpenAI({
      baseURL: API_BASE_URL,
      apiKey: API_KEY,
    });

    const rawBody = await c.req.text();

    if (!rawBody) {
      return c.json({ error: 'Request body is empty.' }, 400);
    }

    const { message, lang } = JSON.parse(rawBody);

    if (!message) {
      return c.json({ error: 'Message is required in the request body.' }, 400);
    }

    const system_prompt = lang === 'en' 
      ? 'You are a professional assistant who provides accurate, concise, and helpful answers in English. You can use LaTeX-formatted mathematical formulas, enclosing inline formulas with $ and display formulas with $$.'
      : '你是一个专业的助手，用中文给出精准、简洁而有用的答案。你可以使用LaTeX格式的数学公式，用$包裹行内公式，用$$包裹块级公式。'

    const stream = await openai.chat.completions.create({
      model: AI_MODEL_NAME || 'gpt-3.5-turbo', // Use variable or fallback to a default
      messages: [
        {
          role: 'system',
          content: system_prompt
        },
        {
          role: 'user',
          content: message
        }
      ],
      stream: true
    });
    
    const readableStream = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(new TextEncoder().encode(content));
          }
        }
        controller.close();
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return c.json({ error: 'Internal Server Error', details: errorMessage }, 500);
  }
});

export default app;
