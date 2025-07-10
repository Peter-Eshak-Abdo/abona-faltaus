import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const religiousQA = [
  { q: "ما هو الصوم؟", a: "الصوم هو الامتناع عن الطعام والشراب..." },
  // ... أضف الأسئلة اللي أنت هتزودها
];

export async function POST(request: Request) {
  const { messages } = await request.json();
  // messages: [{ role: 'user', content: '...' }, ...]

  // نبني system prompt يأخذ الـ religiousQA:
  const systemContent = `
  أنت مساعد ذكي تجيب فقط من منظور العقيدة المسيحية الأرثوذكسية.
  أي سؤال ديني يجب أن تكون إجابته أرثوذكسية فقط، ولا ترد بأي إجابة عامة أو تخص ديانات أخرى.
  ${religiousQA.map((item) => `سؤال: ${item.q}\nجواب: ${item.a}`).join("\n")}
  `;
  
  const chatRes = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: systemContent }, ...messages],
  });

  return NextResponse.json({ reply: chatRes.choices[0].message });
}
