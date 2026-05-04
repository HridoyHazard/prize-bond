"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import {
  FileSpreadsheet,
  FileText,
  Upload,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  BarChart3,
  Copy,
  Check,
  Image as ImageIcon,
  Zap,
} from "lucide-react";
import type { ComparisonResult } from "@/lib/bengali-utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type Status = "idle" | "processing" | "done" | "error";

interface ProcessResponse {
  success: boolean;
  result?: ComparisonResult;
  ocrText?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(file: File) {
  if (file.type.includes("pdf")) return FileText;
  return ImageIcon;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

/** Animated spinner used during processing */
function Spinner() {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border-2 border-border" />
      <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
      <div className="absolute inset-[6px] rounded-full border border-border-bright opacity-60" />
      <Zap className="w-5 h-5 text-accent animate-pulse" />
    </div>
  );
}

/** Drag-and-drop / click-to-upload file dropzone */
function DropZone({
  label,
  accept,
  icon: Icon,
  file,
  onChange,
  hint,
}: {
  label: string;
  accept: string;
  icon: React.ElementType;
  file: File | null;
  onChange: (f: File) => void;
  hint: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) onChange(dropped);
    },
    [onChange],
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onChange(selected);
  };

  return (
    <div
      className={[
        "relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer group",
        dragging
          ? "dropzone-active"
          : file
            ? "border-success/40 bg-success/5"
            : "border-border hover:border-border-bright hover:bg-bg-hover",
      ].join(" ")}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleChange}
      />

      <div className="p-6 flex flex-col items-center text-center gap-3">
        {/* Icon area */}
        <div
          className={[
            "w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200",
            file
              ? "bg-success/15 text-success"
              : "bg-bg-elevated text-text-muted group-hover:text-accent group-hover:bg-accent/10",
          ].join(" ")}
        >
          {file ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : (
            <Icon className="w-7 h-7" />
          )}
        </div>

        {/* Label */}
        <div>
          <p className="font-semibold text-text-primary text-sm">{label}</p>
          <p className="text-text-muted text-xs mt-0.5">{hint}</p>
        </div>

        {/* File info or upload prompt */}
        {file ? (
          <div className="w-full bg-bg-elevated rounded-lg px-3 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-text-primary truncate font-mono">
                {file.name}
              </p>
              <p className="text-xs text-text-muted">
                {formatBytes(file.size)}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-text-muted group-hover:text-accent transition-colors">
            <Upload className="w-3.5 h-3.5" />
            <span>Drop here or click to browse</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Stat card in the results summary row */
function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  color: "blue" | "green" | "red" | "yellow";
  icon: React.ElementType;
}) {
  const colorMap = {
    blue: "text-accent bg-accent/10 border-accent/20",
    green: "text-success bg-success/10 border-success/20",
    red: "text-red-400 bg-red-400/10 border-red-400/20",
    yellow: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  };

  return (
    <div
      className={`rounded-xl border p-4 flex flex-col gap-2 ${colorMap[color]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium opacity-70">{label}</span>
        <Icon className="w-4 h-4 opacity-60" />
      </div>
      <span className="text-2xl font-bold font-mono">{value}</span>
    </div>
  );
}

/** Copyable number chip */
function NumberChip({ arabic, bengali }: { arabic: string; bengali: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(bengali);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={copy}
      title="Click to copy Bengali number"
      className="group flex items-center gap-2 bg-bg-elevated hover:bg-bg-hover border border-border hover:border-success/40 rounded-lg px-3 py-2 transition-all duration-150"
    >
      <div>
        <span className="block text-sm font-mono text-success">{bengali}</span>
        <span className="block text-[10px] font-mono text-text-muted">
          {arabic}
        </span>
      </div>
      <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
        {copied ? (
          <Check className="w-3 h-3 text-success" />
        ) : (
          <Copy className="w-3 h-3 text-text-muted" />
        )}
      </div>
    </button>
  );
}

/** Collapsible section for number lists */
function Section({
  title,
  count,
  color,
  children,
  defaultOpen = false,
}: {
  title: string;
  count: number;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-2xl border border-border bg-bg-surface overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-bg-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className={`text-sm font-semibold ${color}`}>{title}</span>
          <span className="text-xs font-mono bg-bg-elevated text-text-secondary px-2 py-0.5 rounded-full border border-border">
            {count}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-border pt-4">{children}</div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [error, setError] = useState("");
  const [showOcrText, setShowOcrText] = useState(false);

  const canProcess = excelFile && documentFile && status !== "processing";

  const reset = () => {
    setExcelFile(null);
    setDocumentFile(null);
    setStatus("idle");
    setResult(null);
    setOcrText("");
    setError("");
    setShowOcrText(false);
  };

  const process = async () => {
    if (!excelFile || !documentFile) return;

    setStatus("processing");
    setError("");
    setResult(null);

    const fd = new FormData();
    fd.append("excelFile", excelFile);
    fd.append("documentFile", documentFile);

    try {
      const res = await fetch("/api/process", { method: "POST", body: fd });
      const data: ProcessResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? `Server error: ${res.status}`);
      }

      setResult(data.result!);
      setOcrText(data.ocrText ?? "");
      setStatus("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error occurred.");
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen grid-bg relative overflow-hidden">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-success/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-accent/6 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12 md:py-20">
        {/* ── Header ── */}
        <div className="text-center mb-12 animate-fade-up">
          <div className="inline-flex items-center gap-2 bg-bg-surface border border-border rounded-full px-4 py-1.5 text-xs text-accent font-medium mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Bengali Number Verification System
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-text-primary leading-tight tracking-tight mb-4">
            Match Numbers
            <br />
            <span className="text-accent">Across Documents</span>
          </h1>

          <p className="text-text-secondary text-base max-w-md mx-auto leading-relaxed">
            Upload an Excel sheet with Bengali 7-digit numbers and a PDF or
            image. The system will extract, compare, and show you what matches.
          </p>
        </div>

        {/* ── Upload Panel ── */}
        {status === "idle" || status === "error" ? (
          <div className="bg-bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-glow animate-fade-up">
            {/* File dropzones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <DropZone
                label="Excel File"
                accept=".xlsx,.xls"
                icon={FileSpreadsheet}
                file={excelFile}
                onChange={setExcelFile}
                hint=".xlsx — Bengali numbers list"
              />
              <DropZone
                label="PDF or Image"
                accept=".pdf,image/*"
                icon={FileText}
                file={documentFile}
                onChange={setDocumentFile}
                hint=".pdf, .png, .jpg — document to scan"
              />
            </div>

            {/* Error banner */}
            {status === "error" && (
              <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400">
                    Processing failed
                  </p>
                  <p className="text-xs text-red-400/70 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="border-t border-border pt-5 mb-6">
              <p className="text-xs text-text-muted font-medium uppercase tracking-widest mb-3">
                How it works
              </p>
              <ol className="grid grid-cols-3 gap-3">
                {[
                  { step: "01", text: "Upload your Excel sheet with numbers" },
                  {
                    step: "02",
                    text: "Upload the PDF or image to scan via OCR",
                  },
                  { step: "03", text: "View matched & unmatched numbers" },
                ].map(({ step, text }) => (
                  <li key={step} className="flex flex-col gap-1">
                    <span className="font-mono text-xs text-accent">
                      {step}
                    </span>
                    <span className="text-xs text-text-secondary leading-snug">
                      {text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={process}
                disabled={!canProcess}
                className={[
                  "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
                  canProcess
                    ? "bg-accent hover:bg-accent-dim text-white shadow-lg hover:shadow-accent/25 active:scale-95"
                    : "bg-bg-elevated text-text-muted cursor-not-allowed",
                ].join(" ")}
              >
                <Zap className="w-4 h-4" />
                Verify Numbers
              </button>

              {(excelFile || documentFile) && (
                <button
                  onClick={reset}
                  className="px-4 py-3 rounded-xl border border-border text-text-muted hover:text-text-primary hover:border-border-bright transition-all text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* ── Processing State ── */}
        {status === "processing" && (
          <div className="bg-bg-surface border border-border rounded-2xl p-12 flex flex-col items-center gap-6 text-center animate-fade-up">
            <Spinner />
            <div>
              <p className="text-base font-semibold text-text-primary">
                Processing your files…
              </p>
              <p className="text-sm text-text-secondary mt-1">
                Running OCR and comparing numbers. This may take a moment.
              </p>
            </div>
            <div className="w-full max-w-xs space-y-2">
              {[
                "Parsing Excel file",
                "Extracting text via OCR",
                "Comparing numbers",
              ].map((step, i) => (
                <div key={step} className="flex items-center gap-3">
                  <div className="w-4 h-4 flex-shrink-0 relative">
                    <div
                      className={`absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin`}
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  </div>
                  <span className="text-xs text-text-secondary">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {status === "done" && result && (
          <div className="space-y-5 animate-fade-up">
            {/* Summary header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-text-primary">
                Verification Results
              </h2>
              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors border border-border rounded-lg px-3 py-1.5 hover:border-accent/40"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                New Verification
              </button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-1 animate-fade-up">
              <StatCard
                label="In Excel"
                value={result.stats.totalExcel}
                color="blue"
                icon={FileSpreadsheet}
              />
              <StatCard
                label="In Document"
                value={result.stats.totalOcr}
                color="yellow"
                icon={FileText}
              />
              <StatCard
                label="Matched"
                value={result.stats.totalMatched}
                color="green"
                icon={CheckCircle2}
              />
              <StatCard
                label="Match Rate"
                value={`${result.stats.matchRate}%`}
                color={
                  result.stats.matchRate === 100
                    ? "green"
                    : result.stats.matchRate > 50
                      ? "yellow"
                      : "red"
                }
                icon={BarChart3}
              />
            </div>

            {/* No match alert */}
            {result.stats.totalMatched === 0 && (
              <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/25 rounded-2xl px-5 py-4 stagger-2 animate-fade-up">
                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-red-400">No matches found</p>
                  <p className="text-sm text-red-400/70 mt-0.5">
                    None of the {result.stats.totalExcel} numbers from the Excel
                    file were detected in the uploaded document.
                  </p>
                </div>
              </div>
            )}

            {/* Matched numbers */}
            {result.matched.length > 0 && (
              <div className="stagger-2 animate-fade-up">
                <Section
                  title="✓ Matched Numbers"
                  count={result.matched.length}
                  color="text-success"
                  defaultOpen={true}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {result.matched.map((m) => (
                      <NumberChip
                        key={m.arabic}
                        arabic={m.arabic}
                        bengali={m.bengali}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-text-muted mt-3">
                    Click any number to copy the Bengali version.
                  </p>
                </Section>
              </div>
            )}

            {/* Not found in document */}
            {result.notFoundInDocument.length > 0 && (
              <div className="stagger-3 animate-fade-up">
                <Section
                  title="✗ Not Found in Document"
                  count={result.notFoundInDocument.length}
                  color="text-red-400"
                >
                  <div className="flex flex-wrap gap-2">
                    {result.notFoundInDocument.map((num) => (
                      <span
                        key={num}
                        className="font-mono text-xs bg-bg-elevated text-red-400 border border-red-400/20 rounded-lg px-3 py-1.5"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* Extra numbers in document */}
            {result.notFoundInExcel.length > 0 && (
              <div className="stagger-4 animate-fade-up">
                <Section
                  title="△ Extra Numbers in Document (not in Excel)"
                  count={result.notFoundInExcel.length}
                  color="text-amber-400"
                >
                  <div className="flex flex-wrap gap-2">
                    {result.notFoundInExcel.map((num) => (
                      <span
                        key={num}
                        className="font-mono text-xs bg-bg-elevated text-amber-400 border border-amber-400/20 rounded-lg px-3 py-1.5"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </Section>
              </div>
            )}

            {/* Raw OCR text (debug/transparency) */}
            {ocrText && (
              <div className="rounded-2xl border border-border bg-bg-surface overflow-hidden">
                <button
                  onClick={() => setShowOcrText((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-bg-hover transition-colors"
                >
                  <span className="text-sm font-semibold text-text-secondary">
                    Raw OCR Output
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-text-muted transition-transform duration-200 ${showOcrText ? "rotate-180" : ""}`}
                  />
                </button>
                {showOcrText && (
                  <div className="border-t border-border px-5 py-4">
                    <pre className="text-xs font-mono text-text-secondary whitespace-pre-wrap break-all leading-relaxed max-h-48 overflow-y-auto">
                      {ocrText}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Footer ── */}
        <p className="text-center text-xs text-text-muted mt-12">
          Powered by Next.js · Tesseract OCR · Bengali ০১২৩৪৫৬৭৮৯
        </p>
      </div>
    </main>
  );
}
