import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const HF_CHAT_COMPLETIONS_URL = "https://router.huggingface.co/v1/chat/completions";

function getModel() {
  const envModel = process.env.HUGGINGFACE_MODEL;
  return (envModel && envModel.trim()) || "openai/gpt-oss-120b:fastest";
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'text' in request body." },
        { status: 400 },
      );
    }

    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "HUGGINGFACE_API_KEY is not set on the server. Add it to your .env.local.",
        },
        { status: 500 },
      );
    }

    const prompt = `
Turn the notes into a structured outline.
Rules:
- Output ONLY the outline (no preface).
- Use headings and subheadings.
- Under each heading, use many bullet points and sub-bullets (not just 1).
- Preserve important details (names, dates, definitions, numbers).
- You may use **bold** for truly important terms.

NOTES:
"""${text}"""
`.trim();

    const res = await fetch(HF_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: getModel(),
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4,
        max_tokens: 1200,
        stream: false,
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      return NextResponse.json(
        { error: "Hugging Face API request failed", status: res.status, details },
        { status: 502 },
      );
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Unexpected Hugging Face response format", details: JSON.stringify(data) },
        { status: 502 },
      );
    }

    return NextResponse.json({ outline: content.trim() });
  } catch (err) {
    console.error("Error in /api/summary:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

