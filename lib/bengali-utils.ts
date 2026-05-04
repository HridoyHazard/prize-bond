/**
 * Utility functions for Bengali number processing and normalization.
 * Bengali digits: ০১২৩৪৫৬৭৮৯ map to 0123456789
 */

// --- Conversion Maps ---

const BENGALI_TO_ARABIC: Record<string, string> = {
  "০": "0",
  "১": "1",
  "২": "2",
  "৩": "3",
  "৪": "4",
  "৫": "5",
  "৬": "6",
  "৭": "7",
  "৮": "8",
  "৯": "9",
};

const ARABIC_TO_BENGALI: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

// --- Conversion Functions ---

/** Converts Bengali digit characters to Arabic (Western) digits */
export function bengaliToArabic(str: string): string {
  return str.replace(/[০-৯]/g, (ch) => BENGALI_TO_ARABIC[ch] ?? ch);
}

/** Converts Arabic (Western) digits to Bengali digit characters */
export function arabicToBengali(str: string): string {
  return str.replace(/[0-9]/g, (ch) => ARABIC_TO_BENGALI[ch] ?? ch);
}

/**
 * Normalizes any number string to Arabic digits for comparison.
 * Works on both Arabic and Bengali digit strings.
 */
export function normalizeToArabic(str: string): string {
  return bengaliToArabic(str);
}

// --- Extraction Functions ---

/**
 * Extracts all 7-digit numbers from a text string.
 * Supports both Bengali (০-৯) and Arabic (0-9) digit formats.
 * Returns results as Arabic digit strings for consistent comparison.
 */
export function extract7DigitNumbers(text: string): string[] {
  const found = new Set<string>();

  // Match 7-digit sequences of Bengali digits
  const bengaliPattern = /[০-৯]{7}/g;
  const bengaliMatches = text.match(bengaliPattern) ?? [];
  for (const match of bengaliMatches) {
    found.add(bengaliToArabic(match));
  }

  // Match 7-digit sequences of Arabic digits (word-boundary aware)
  // Use lookahead/lookbehind to avoid matching subsets of larger numbers
  const arabicPattern = /(?<![0-9০-৯])([0-9]{7})(?![0-9০-৯])/g;
  let arabicMatch;
  while ((arabicMatch = arabicPattern.exec(text)) !== null) {
    found.add(arabicMatch[1]);
  }

  return Array.from(found);
}

// --- Comparison Logic ---

export interface ComparisonResult {
  /** Numbers from the Excel file (as Arabic digits) */
  excelNumbers: string[];
  /** Numbers extracted from PDF/image via OCR (as Arabic digits) */
  ocrNumbers: string[];
  /** Numbers found in BOTH sources */
  matched: MatchedNumber[];
  /** Numbers in Excel but NOT found in PDF/image */
  notFoundInDocument: string[];
  /** Numbers in PDF/image but NOT in Excel */
  notFoundInExcel: string[];
  /** Total count stats */
  stats: {
    totalExcel: number;
    totalOcr: number;
    totalMatched: number;
    matchRate: number; // percentage
  };
}

export interface MatchedNumber {
  arabic: string; // e.g. "1234567"
  bengali: string; // e.g. "১২৩৪৫৬৭"
}

/**
 * Compares two lists of 7-digit numbers (both normalized to Arabic).
 * Returns a structured comparison result.
 */
export function compareNumbers(
  excelNumbers: string[],
  ocrNumbers: string[],
): ComparisonResult {
  const excelSet = new Set(excelNumbers);
  const ocrSet = new Set(ocrNumbers);

  const matched: MatchedNumber[] = [];
  const notFoundInDocument: string[] = [];

  for (const num of excelSet) {
    if (ocrSet.has(num)) {
      matched.push({ arabic: num, bengali: arabicToBengali(num) });
    } else {
      notFoundInDocument.push(num);
    }
  }

  const notFoundInExcel: string[] = [];
  for (const num of ocrSet) {
    if (!excelSet.has(num)) {
      notFoundInExcel.push(num);
    }
  }

  const matchRate =
    excelSet.size > 0 ? Math.round((matched.length / excelSet.size) * 100) : 0;

  return {
    excelNumbers: Array.from(excelSet),
    ocrNumbers: Array.from(ocrSet),
    matched,
    notFoundInDocument,
    notFoundInExcel,
    stats: {
      totalExcel: excelSet.size,
      totalOcr: ocrSet.size,
      totalMatched: matched.length,
      matchRate,
    },
  };
}
