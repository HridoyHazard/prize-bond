import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";
export const runtime = "nodejs";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, tesseractRaw } = await req.json();

    const prompt = `You are an expert OCR correction engine specializing in Bengali script.

Your ONLY job: find ALL 7-digit Bengali numeral sequences in this image.
Bengali digits: ০ ১ ২ ৩ ৪ ৫ ৬ ৭ ৮ ৯

${
  tesseractRaw
    ? `== Tesseract already scanned this image and produced ==
${tesseractRaw}
== End of Tesseract output ==

Tesseract often makes Bengali mistakes:
- Confuses ৩↔৮, ৬↔০, ৭↔৯
- Inserts spaces or dashes between digits
- Misses digits in low-contrast areas

Cross-check Tesseract's output against what you actually see in the image. Correct any errors.`
    : "No prior OCR data available. Scan the image carefully."
}

RESPONSE FORMAT — strictly one 7-digit Bengali number per line. Example:
১২৩৪৫৬৭
৯৮৭৬৫৪৩

If none found, respond with exactly: NONE
No explanations, labels, English text, or punctuation.`;

    const response = await groq.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageBase64 } },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 512,
    });

    const raw = response.choices[0]?.message?.content?.trim() ?? "";
    return NextResponse.json({ raw });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Groq API error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
