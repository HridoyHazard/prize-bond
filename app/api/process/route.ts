import { NextRequest, NextResponse } from "next/server";
import {
  extractBengaliNumbers,
  scoreNumbers,
  compareNumbers,
} from "@/lib/bengali-utils";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { excelNumbers, tessRawText, imageBase64 } = (await req.json()) as {
      excelNumbers: string[];
      tessRawText: string;
      imageBase64?: string;
    };

    if (!excelNumbers?.length) {
      return NextResponse.json(
        { success: false, error: "No Excel numbers provided." },
        { status: 400 },
      );
    }

    // ── 1. Extract numbers from Tesseract raw text ────────────────────────────
    const tessNumbers = extractBengaliNumbers(tessRawText ?? "");

    // ── 2. Groq correction (image path only) ─────────────────────────────────
    let groqNumbers: string[] = tessNumbers; // default: PDF path / fallback

    if (imageBase64) {
      try {
        const host = `${req.nextUrl.protocol}//${req.nextUrl.host}`;
        const res = await fetch(`${host}/api/groq-ocr`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64, tesseractRaw: tessRawText }),
        });
        const data = await res.json();
        if (!data.error && data.raw) {
          groqNumbers = extractBengaliNumbers(data.raw);
        }
      } catch {
        // Groq failed — fall back to tessNumbers only (still returns a result)
      }
    }

    // ── 3. Score + compare ────────────────────────────────────────────────────
    const scoredNumbers = scoreNumbers(tessNumbers, groqNumbers);
    const result = compareNumbers(excelNumbers, scoredNumbers);

    return NextResponse.json({
      success: true,
      result,
      ocrText: tessRawText ?? "",
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    console.error("[/api/process]", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
