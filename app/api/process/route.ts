import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import Tesseract, { PSM } from "tesseract.js";
import {
  extractBengaliNumbers,
  scoreNumbers,
  compareNumbers,
  bengaliToArabic,
  isBengaliNumber,
  isArabicNumber,
} from "@/lib/bengali-utils";

// ✅ App Router segment config
export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// ─── Excel parser ─────────────────────────────────────────────────────────────

function parseExcel(buffer: ArrayBuffer): string[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });

  const numbers: string[] = [];

  for (const row of rows) {
    for (const cell of row as unknown[]) {
      const val = String(cell ?? "").trim();

      if (isBengaliNumber(val)) {
        numbers.push(bengaliToArabic(val));
        continue;
      }
      if (isArabicNumber(val)) {
        numbers.push(val);
        continue;
      }
      if (/^\d+$/.test(val)) {
        const padded = val.padStart(7, "0");
        if (padded.length === 7) numbers.push(padded);
      }
    }
  }

  return Array.from(new Set(numbers));
}

// ─── File → base64 data URL ───────────────────────────────────────────────────

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const b64 = Buffer.from(buffer).toString("base64");
  const mime = file.type || "image/png";
  return `data:${mime};base64,${b64}`;
}

// ─── Tesseract runner ────────────────────────────────────────────────────────

async function runTesseract(
  base64Image: string,
): Promise<{ numbers: string[]; raw: string }> {
  try {
    const worker = await Tesseract.createWorker("ben", 1);
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    });
    const {
      data: { text },
    } = await worker.recognize(base64Image);
    await worker.terminate();
    return { numbers: extractBengaliNumbers(text), raw: text };
  } catch {
    return { numbers: [], raw: "" };
  }
}

// ─── Groq runner ─────────────────────────────────────────────────────────────

async function runGroq(
  base64Image: string,
  tesseractRaw: string,
  host: string,
): Promise<{ numbers: string[]; raw: string }> {
  try {
    const res = await fetch(`${host}/api/groq-ocr`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64Image, tesseractRaw }),
    });
    const data = await res.json();
    if (data.error) return { numbers: [], raw: "" };
    return { numbers: extractBengaliNumbers(data.raw), raw: data.raw };
  } catch {
    return { numbers: [], raw: "" };
  }
}

// ─── PDF text extraction ─────────────────────────────────────────────────────

async function extractFromPDF(buffer: ArrayBuffer): Promise<string> {
  const text = Buffer.from(buffer).toString("latin1");
  const bengaliChunks = text.match(/[\u09E6-\u09EF০-৯]{4,}/g) ?? [];
  return bengaliChunks.join("\n");
}

// ─── Main POST handler ───────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const excelFile = formData.get("excelFile") as File | null;
    const documentFile = formData.get("documentFile") as File | null;

    if (!excelFile || !documentFile) {
      return NextResponse.json(
        { success: false, error: "Both files are required." },
        { status: 400 },
      );
    }

    // ── 1. Parse Excel ──────────────────────────────────────────────────────
    const excelBuffer = await excelFile.arrayBuffer();
    const excelNumbers = parseExcel(excelBuffer);

    if (excelNumbers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No 7-digit numbers found in the Excel file.",
        },
        { status: 422 },
      );
    }

    const host = `${req.nextUrl.protocol}//${req.nextUrl.host}`;

    let ocrRawText: string = "";
    let tessNumbers: string[] = [];
    let groqNumbers: string[] = [];

    const isPDF =
      documentFile.type === "application/pdf" ||
      documentFile.name.toLowerCase().endsWith(".pdf");

    if (isPDF) {
      // ── 2a. PDF path ──────────────────────────────────────────────────────
      const pdfBuffer = await documentFile.arrayBuffer();
      ocrRawText = await extractFromPDF(pdfBuffer);
      tessNumbers = extractBengaliNumbers(ocrRawText);
      groqNumbers = tessNumbers; // no vision needed for embedded text
    } else {
      // ── 2b. Image path — full dual-engine pipeline ────────────────────────
      const base64Image = await fileToBase64(documentFile);

      // Stage 1: Tesseract
      const tessResult = await runTesseract(base64Image);
      tessNumbers = tessResult.numbers;
      ocrRawText = tessResult.raw;

      // Stage 2: Groq corrects using Tesseract's raw output as context
      const groqResult = await runGroq(base64Image, tessResult.raw, host);
      groqNumbers = groqResult.numbers;
    }

    // ── 3. Score confidence ─────────────────────────────────────────────────
    const scoredNumbers = scoreNumbers(tessNumbers, groqNumbers);

    // ── 4. Compare against Excel ────────────────────────────────────────────
    const result = compareNumbers(excelNumbers, scoredNumbers);

    return NextResponse.json({
      success: true,
      result,
      ocrText: ocrRawText,
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
