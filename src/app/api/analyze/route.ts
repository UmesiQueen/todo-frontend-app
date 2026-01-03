import { NextRequest } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
    const { tasks } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'Missing API key' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Given these tasks: ${JSON.stringify(tasks)}. Provide a 2-sentence summary suggesting the priority focus for the next hour based on the title, priority_level and status. Ignore any task that has status value 'done'. At the end, enter a new line and give a max 5 word hype or encouragement, it could have an exclamation or emoji or neither. Overall, express a witty personality`;

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    const response = await ai.models.generateContentStream({
                        model: "gemini-2.5-flash",
                        contents: prompt,
                    });

                    for await (const chunk of response) {
                        if (chunk.text) {
                            const data = `data: ${JSON.stringify({ text: chunk.text })}\n\n`;
                            controller.enqueue(encoder.encode(data));
                        }
                    }

                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to analyze' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}