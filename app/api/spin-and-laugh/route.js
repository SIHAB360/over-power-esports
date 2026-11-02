import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI joke generation is not configured. Add GROQ_API_KEY to the Vercel project." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        temperature: 1.15,
        max_completion_tokens: 220,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You write original, genuinely funny, family-friendly Bangla/Banglish jokes for a Bangladesh esports community. Every response must be fresh and surprising, not a quote or a repeat of common templates. Rotate topics broadly: gaming fails, squad chaos, lag, loot, exams, food, sleep, phones, friendship, everyday situations, harmless tech humor and funny non-gaming topics. Avoid insults targeting real people or protected groups, profanity, sexual content, politics, and dangerous challenges. Keep it punchy and suitable for all ages. Return only JSON with keys tag, title, text. tag: short category in uppercase English; title: short funny headline; text: one or two concise Bangla/Banglish sentences."
          },
          {
            role: "user",
            content: "Generate one completely new, unpredictable joke now. Do not reuse a previous punchline or phrase. Choose a topic unpredictably."
          }
        ],
      }),
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      console.error("Spin & Laugh Groq error:", response.status, detail.slice(0, 500));
      return NextResponse.json(
        { error: response.status === 429
          ? "আজকের free AI limit সাময়িকভাবে শেষ। কিছুক্ষণ পর আবার Spin করো!"
          : "AI service is temporarily unavailable. Please spin again." },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    const payload = await response.json();
    const raw = payload.choices?.[0]?.message?.content;
    if (!raw || typeof raw !== "string") throw new Error("Empty AI response");

    const cleaned = raw.replace(/^```(?:json)?\\s*/i, "").replace(/\\s*```$/, "").trim();
    const joke = JSON.parse(cleaned);
    const result = {
      tag: String(joke.tag || "RANDOM FUN").slice(0, 32),
      title: String(joke.title || "SURPRISE!").slice(0, 90),
      text: String(joke.text || "").slice(0, 400),
    };
    if (!result.text) throw new Error("AI joke text is empty");

    return NextResponse.json(result, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (error) {
    console.error("Spin & Laugh generation failed:", error);
    return NextResponse.json(
      { error: "নতুন Joke তৈরি করা যায়নি। একটু পরে আবার Spin করো!" },
      { status: 502 }
    );
  }
}
