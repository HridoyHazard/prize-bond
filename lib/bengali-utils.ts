const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
const ARABIC_DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

export function bengaliToArabic(str: string): string {
  return str.replace(/[০-৯]/g, (d) => ARABIC_DIGITS[BENGALI_DIGITS.indexOf(d)]);
}

export function arabicToBengali(str: string): string {
  return str.replace(/[0-9]/g, (d) => BENGALI_DIGITS[parseInt(d)]);
}

export function isBengaliNumber(str: string): boolean {
  return /^[০-৯]{7}$/.test(str);
}

export function isArabicNumber(str: string): boolean {
  return /^[0-9]{7}$/.test(str);
}

export function extractBengaliNumbers(raw: string): string[] {
  if (!raw || raw.trim() === "NONE") return [];

  const strict = raw
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => isBengaliNumber(l));

  if (strict.length > 0) return Array.from(new Set(strict));

  const matches = raw.match(/(?:[০-৯][\s\-]*){7}/g) ?? [];
  const cleaned = matches
    .map((n) => n.replace(/[\s\-]/g, ""))
    .filter((n) => n.length === 7);

  return Array.from(new Set(cleaned));
}

export type MatchedNumber = {
  arabic: string;
  bengali: string;
  confidence: "high" | "medium" | "low";
};

export interface ComparisonResult {
  matched: MatchedNumber[];
  notFoundInDocument: string[];
  notFoundInExcel: string[];
  stats: {
    totalExcel: number;
    totalOcr: number;
    totalMatched: number;
    matchRate: number;
  };
}

export function scoreNumbers(
  tessNumbers: string[],
  groqNumbers: string[],
): { number: string; confidence: "high" | "medium" | "low" }[] {
  const all = new Set([...groqNumbers, ...tessNumbers]);
  return Array.from(all).map((num) => ({
    number: num,
    confidence:
      tessNumbers.includes(num) && groqNumbers.includes(num)
        ? "high"
        : groqNumbers.includes(num)
          ? "medium"
          : "low",
  }));
}

export function compareNumbers(
  excelNumbers: string[],
  ocrNumbers: { number: string; confidence: "high" | "medium" | "low" }[],
): ComparisonResult {
  const ocrArabic = ocrNumbers.map((n) => ({
    arabic: bengaliToArabic(n.number),
    bengali: n.number,
    confidence: n.confidence,
  }));

  const excelSet = new Set(excelNumbers);
  const ocrSet = new Set(ocrArabic.map((n) => n.arabic));

  const matched = ocrArabic.filter((n) => excelSet.has(n.arabic));
  const notFoundInDocument = excelNumbers.filter((n) => !ocrSet.has(n));
  const notFoundInExcel = ocrArabic
    .filter((n) => !excelSet.has(n.arabic))
    .map((n) => n.bengali);

  const totalMatched = matched.length;
  const matchRate =
    excelNumbers.length > 0
      ? Math.round((totalMatched / excelNumbers.length) * 100)
      : 0;

  return {
    matched,
    notFoundInDocument: notFoundInDocument.map((n) => arabicToBengali(n)),
    notFoundInExcel,
    stats: {
      totalExcel: excelNumbers.length,
      totalOcr: ocrNumbers.length,
      totalMatched,
      matchRate,
    },
  };
}
