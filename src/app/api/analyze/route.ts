import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
    const { tasks } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json({ error: 'Missing API key' }, {
            status: 400,
        });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Given these tasks: ${JSON.stringify(tasks)}. Provide a 2-sentence summary suggesting the priority focus for the next hour based on the title, priority_level and status. Ignore any task that has status value 'done'. At the end, enter a new line and give a max 5 word hype or encouragement, it could have an exclamation, an emoji or neither (be creative). Overall, express a witty personality`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return NextResponse.json({
            success: true,
            text: response.text,
        });

    } catch (error) {
        let errorMessage = "Unknown error occurred";

        if (error instanceof Error) {
            try {
                const parsedError = JSON.parse(error.message);
                errorMessage = parsedError.error?.message || error.message;
            } catch {
                errorMessage = error.message;
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}