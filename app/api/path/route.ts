import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const HF_BASE_URL = "https://router.huggingface.co/v1";
const HF_CHAT_COMPLETIONS_URL = `${HF_BASE_URL}/chat/completions`;

function getModel() {
  const envModel = process.env.HUGGINGFACE_MODEL;
  return (envModel && envModel.trim()) || "openai/gpt-oss-120b:fastest";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fields, colleges, gpa, scores, awards, activities } = body ?? {};

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

    const model = getModel();

    const prompt = `
You are a helpful counselor for high school and early college students.
Based on the student's information, suggest:
- At least 2 (ideally 3–6) concrete passion project ideas
- At least 2 (ideally 4–8) related extracurricular activities or ways to deepen involvement
- At least 2 (ideally 4–8) classes or topics they should consider taking

Respond in this exact plain-text format (no markdown, no JSON):

PROJECT IDEAS:
- <idea 1>
- <idea 2>
...

EXTRACURRICULARS:
- <activity 1>
- <activity 2>
...

CLASSES:
- <class or topic 1>
- <class or topic 2>
...

Student info:
- Fields of interest: ${fields || "Not specified"}
- Target colleges: ${colleges || "Not specified"}
- GPA: ${gpa || "Not specified"}
- Scores: ${scores || "Not specified"}
- Awards: ${awards || "Not specified"}
- Current extracurriculars: ${activities || "Not specified"}
`.trim();

    const hfResponse = await fetch(HF_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.6,
        max_tokens: 700,
        stream: false,
      }),
    });

    if (!hfResponse.ok) {
      const text = await hfResponse.text();
      return NextResponse.json(
        {
          error: "Hugging Face API request failed",
          status: hfResponse.status,
          details: text,
        },
        { status: 502 },
      );
    }

    const data = (await hfResponse.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        {
          error: "Unexpected Hugging Face response format",
          details: JSON.stringify(data),
        },
        { status: 502 },
      );
    }

    const parsed = parsePathText(content);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("Error in /api/path:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

type PathResult = {
  projects: string[];
  activities: string[];
  classes: string[];
};

function parsePathText(raw: string): PathResult {
  const text = raw.replace(/\r\n/g, "\n").trim();

  const section = (name: string) => {
    const re = new RegExp(
      `^${name}:\\s*\\n([\\s\\S]*?)(?=\\n\\n[A-Z][A-Z ]+:\\s*\\n|\\n\\n[A-Z][A-Z ]+:\\s*$|$)`,
      "m",
    );
    const match = text.match(re);
    return (match?.[1] ?? "").trim();
  };

  const projectsBlock = section("PROJECT IDEAS");
  const extracurricularsBlock = section("EXTRACURRICULARS");
  const classesBlock = section("CLASSES");

  const toList = (block: string, min: number, fallbackLabel: string) => {
    const items = block
      .split("\n")
      .map((l) => l.replace(/^\s*[-*]\s*/, "").trim())
      .filter(Boolean);

    if (items.length >= min) return items;

    const padded = [...items];
    while (padded.length < min) {
      padded.push(
        `Think about ${fallbackLabel} that connect your interests to real-world impact.`,
      );
    }
    return padded;
  };

  return {
    projects: toList(
      projectsBlock,
      2,
      "small, manageable projects you could start this month",
    ),
    activities: toList(
      extracurricularsBlock,
      2,
      "clubs, teams, or community groups you could join or deepen",
    ),
    classes: toList(
      classesBlock,
      2,
      "classes or self-study topics that would stretch you",
    ),
  };
}

