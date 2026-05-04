/**
 * POST /api/process
 *
 * Accepts a multipart form with:
 *   - excelFile: .xlsx file containing Bengali 7-digit numbers
 *   - documentFile: PDF or image file to OCR
 *
 * Returns: ComparisonResult JSON
 */

import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import {
  extract7DigitNumbers,
  bengaliToArabic,
  compareNumbers,
  type ComparisonResult,
} from "@/lib/bengali-utils";

// URL of the Python OCR microservice (set via .env.local)
const OCR_SERVICE_URL = process.env.OCR_SERVICE_URL ?? "http://localhost:8000";

// ─── Main Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Parse uploaded files from the request
    const formData = await request.formData();
    const excelFile = formData.get("excelFile") as File | null;
    const documentFile = formData.get("documentFile") as File | null;

    if (!excelFile || !documentFile) {
      return NextResponse.json(
        { error: "Both excelFile and documentFile are required." },
        { status: 400 },
      );
    }

    // 2. Extract numbers from the Excel file
    const excelNumbers = await extractNumbersFromExcel(excelFile);

    if (excelNumbers.length === 0) {
      return NextResponse.json(
        { error: "No 7-digit numbers found in the Excel file." },
        { status: 422 },
      );
    }

    // 3. Send document to OCR service and extract numbers
    const ocrText = await getOcrText(documentFile);
    const ocrNumbers = extract7DigitNumbers(ocrText);

    // 4. Compare and return results
    const result: ComparisonResult = compareNumbers(excelNumbers, ocrNumbers);

    return NextResponse.json({ success: true, result, ocrText });
  } catch (err: unknown) {
    console.error("[/api/process] Error:", err);
    const message =
      err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ─── Excel Parser ─────────────────────────────────────────────────────────────

/**
 * Reads an xlsx file and extracts all 7-digit numbers from every cell.
 * Handles both Bengali (০-৯) and Arabic (0-9) digit formats.
 */
async function extractNumbersFromExcel(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const allNumbers = new Set<string>();

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];

    // Convert sheet to an array of arrays (raw values)
    const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1, // Use numeric headers → gives us raw rows
      raw: false, // Get formatted strings, not raw numbers
      defval: "", // Empty cells → empty string
    });

    for (const row of rows) {
      for (const cell of row) {
        if (cell === null || cell === undefined || cell === "") continue;

        // Convert cell value to string for regex matching
        const cellStr = String(cell).trim();

        // Extract any 7-digit numbers from the cell (Bengali or Arabic)
        const numbers = extract7DigitNumbers(cellStr);
        for (const num of numbers) {
          allNumbers.add(bengaliToArabic(num)); // normalize to Arabic
        }

        // Also handle cells that are numeric — Excel may store as plain number
        // Check if the cell itself, when normalized, is exactly 7 digits
        const normalized = bengaliToArabic(cellStr).replace(/\s/g, "");
        if (/^\d{7}$/.test(normalized)) {
          allNumbers.add(normalized);
        }
      }
    }
  }

  return Array.from(allNumbers);
}

// ─── OCR Client ───────────────────────────────────────────────────────────────

/**
 * Sends a file to the Python OCR microservice and returns the extracted text.
 * The Python service handles both PDFs (via pdf2image) and images (via PIL).
 */
async function getOcrText(file: File): Promise<string> {
  const body = new FormData();
  body.append("file", file, file.name);

  const response = await fetch(`${OCR_SERVICE_URL}/ocr`, {
    method: "POST",
    body,
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`OCR service error (${response.status}): ${detail}`);
  }

  const data = (await response.json()) as { text: string; pages?: number };
  return data.text ?? "";
}
