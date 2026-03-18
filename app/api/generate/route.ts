import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const HF_BASE_URL = "https://router.huggingface.co/v1";
const HF_CHAT_COMPLETIONS_URL = `${HF_BASE_URL}/chat/completions`;

// Pick a reasonable default that matches Hugging Face's router docs.
// You can override this via HUGGINGFACE_MODEL in .env.local.
const DEFAULT_MODEL = "openai/gpt-oss-120b:fastest";

function getModel() {
  const envModel = process.env.HUGGINGFACE_MODEL;
  return (envModel && envModel.trim()) || DEFAULT_MODEL;
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

    // Ask for a predictable plain-text format (NOT JSON), then parse it ourselves.
    const prompt = `
You are a study assistant. Convert the student's notes into a clean study guide and flashcards.

Rules:
- Output ONLY the sections below (no preface, no extra commentary).
- Preserve important details (names, dates, numbers, treaties, outcomes). Do not overly summarize.
- If the input has numbered sections/headings, keep that structure.
- You MAY use **bold** inside the STUDY GUIDE section for truly important terms.
- For the STUDY GUIDE: use headings/subheadings, but include EXACTLY ONE bullet per heading (one key point each).
- Prefer keeping the student's original headings. If a heading has subheadings, give one bullet for the heading and one bullet for each subheading.
- Keep each flashcard question on ONE line and each answer on ONE line.
- Make the 5 flashcards meaningfully different and cover different parts of the notes.

STUDY GUIDE:
<outline where each heading/subheading has exactly one bullet underneath it>

FLASHCARDS:
1) Q: <question>
   A: <answer>
2) Q: <question>
   A: <answer>
3) Q: <question>
   A: <answer>
4) Q: <question>
   A: <answer>
5) Q: <question>
   A: <answer>

Notes:
"""${text}"""
`.trim();

    const model = getModel();
    const body = {
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 900,
      stream: false,
    };

    const hfResponse = await fetchWithRetries(HF_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      return NextResponse.json(
        {
          error: "Hugging Face API request failed",
          status: hfResponse.status,
          details: errorText,
        },
        { status: 502 },
      );
    }

    const hfJson = (await hfResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      error?: unknown;
    };

    const content = hfJson.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        {
          error: "Unexpected Hugging Face response format",
          details: JSON.stringify(hfJson),
        },
        { status: 502 },
      );
    }

    const parsed = parsePlainText(content);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Error in /api/generate:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

type GenerateResult = {
  summary: string;
  flashcards: { question: string; answer: string }[];
};

async function fetchWithRetries(
  url: string,
  init: RequestInit,
  attempts = 3,
): Promise<Response> {
  let last: Response | null = null;
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url, init);
    last = res;
    if (res.ok) return res;
    // Retry transient HF errors (model loading, gateway, timeouts).
    if (![502, 503, 504].includes(res.status)) return res;
    await new Promise((r) => setTimeout(r, 500 * (i + 1)));
  }
  return last ?? fetch(url, init);
}

function parsePlainText(raw: string): GenerateResult {
  const text = raw.replace(/\r\n/g, "\n").trim();

  const section = (name: string) => {
    const re = new RegExp(
      `^${name}:\\s*\\n([\\s\\S]*?)(?=\\n\\n[A-Z][A-Z ]+:\\s*\\n|\\n\\n[A-Z][A-Z ]+:\\s*$|$)`,
      "m",
    );
    const m = text.match(re);
    return (m?.[1] ?? "").trim();
  };

  const summaryBlock = section("STUDY GUIDE") || section("SUMMARY");

  let flashcardsBlock = section("FLASHCARDS");
  if (!flashcardsBlock && text.includes("FLASHCARDS:")) {
    const start = text.indexOf("FLASHCARDS:") + "FLASHCARDS:".length;
    flashcardsBlock = text.slice(start).trim();
  }

  const flashcards: GenerateResult["flashcards"] = [];
  if (flashcardsBlock) {
    // Matches patterns like:
    // 1) Q: ...
    //    A: ...
    const cardRe =
      /(?:^|\n)\s*\d+\)\s*Q:\s*(.+?)\s*\n\s*A:\s*(.+?)(?=\n\s*\d+\)\s*Q:|\n*$)/gs;
    let match: RegExpExecArray | null;
    while ((match = cardRe.exec(flashcardsBlock)) && flashcards.length < 5) {
      const q = (match[1] ?? "").trim();
      const a = (match[2] ?? "").trim();
      if (q && a) flashcards.push({ question: q, answer: a });
    }
  }
  if (flashcards.length < 5) {
    // Fallback: pick up any Q:/A: pairs even if numbering/spacing is off.
    const qaRe = /(?:^|\n)\s*Q:\s*(.+?)\s*\n\s*A:\s*(.+?)(?=\n\s*Q:|\n*$)/gs;
    let m: RegExpExecArray | null;
    while ((m = qaRe.exec(text)) && flashcards.length < 5) {
      const q = (m[1] ?? "").trim();
      const a = (m[2] ?? "").trim();
      if (q && a) flashcards.push({ question: q, answer: a });
    }
  }
  // Always return exactly 5 flashcards.
  if (flashcards.length < 5) {
    const lines =
      summaryBlock
        ?.split("\n")
        .map((l) => l.trim())
        .filter(Boolean) ?? [];

    const candidates = lines
      .filter((l) => l.length > 12)
      .slice(0, 10);

    for (const line of candidates) {
      if (flashcards.length >= 5) break;
      const cleaned = line.replace(/^-+\s*/, "").trim();
      if (!cleaned) continue;
      flashcards.push({
        question: `Explain: ${cleaned}`,
        answer: cleaned,
      });
    }

    while (flashcards.length < 5) {
      flashcards.push({
        question: "What is the key concept from these notes?",
        answer: summaryBlock || "Review the notes and extract the key concept.",
      });
    }
  } else if (flashcards.length > 5) {
    flashcards.splice(5);
  }

  const normalizedSummary =
    summaryBlock ||
    text.slice(0, 1200) ||
    "No summary generated.";

  return {
    summary: normalizedSummary,
    flashcards,
  };
}

