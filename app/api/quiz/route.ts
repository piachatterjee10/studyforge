import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const HF_CHAT_COMPLETIONS_URL = "https://router.huggingface.co/v1/chat/completions";

function getModel() {
  const envModel = process.env.HUGGINGFACE_MODEL;
  return (envModel && envModel.trim()) || "openai/gpt-oss-120b:fastest";
}

type QuizQuestion = {
  question: string;
  choices: [string, string, string, string];
  answerIndex: 0 | 1 | 2 | 3;
  explanation: string;
};

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
Create a quiz from the notes below.
Rules:
- Output ONLY in the format below (no markdown fences).
- Make exactly 6 multiple-choice questions.
- Each question must have exactly 4 choices labeled A/B/C/D.
- Provide the correct answer letter and a 1–2 sentence explanation.
- Questions should cover different sections (not repetitive).

FORMAT:
Q1: <question>
A) <choice>
B) <choice>
C) <choice>
D) <choice>
ANSWER: <A|B|C|D>
EXPLANATION: <text>

(repeat for Q2..Q6)

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
        max_tokens: 900,
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

    return NextResponse.json({ questions: parseQuiz(content) });
  } catch (err) {
    console.error("Error in /api/quiz:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function parseQuiz(raw: string): QuizQuestion[] {
  const t = raw.replace(/\r\n/g, "\n").trim();
  const blocks = t.split(/\n(?=Q\d+:)/g).map((b) => b.trim()).filter(Boolean);

  const questions: QuizQuestion[] = [];
  for (const block of blocks) {
    if (questions.length >= 6) break;
    const qMatch = block.match(/^Q\d+:\s*(.+)$/m);
    const a = block.match(/^\s*A\)\s*(.+)$/m);
    const b = block.match(/^\s*B\)\s*(.+)$/m);
    const c = block.match(/^\s*C\)\s*(.+)$/m);
    const d = block.match(/^\s*D\)\s*(.+)$/m);
    const ans = block.match(/^\s*ANSWER:\s*([ABCD])\s*$/m);
    const exp = block.match(/^\s*EXPLANATION:\s*(.+)$/m);

    if (!qMatch || !a || !b || !c || !d || !ans) continue;
    const idx = ({ A: 0, B: 1, C: 2, D: 3 } as const)[ans[1] as "A" | "B" | "C" | "D"];

    questions.push({
      question: qMatch[1].trim(),
      choices: [a[1].trim(), b[1].trim(), c[1].trim(), d[1].trim()],
      answerIndex: idx,
      explanation: (exp?.[1] ?? "").trim(),
    });
  }

  return questions;
}

