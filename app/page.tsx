"use client";

import { useState, useRef, useCallback, DragEvent } from "react";
import type { ComparisonResult } from "@/lib/bengali-utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type Status = "idle" | "processing" | "done" | "error";
interface ProcessResponse {
  success: boolean;
  result?: ComparisonResult;
  ocrText?: string;
  error?: string;
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

// ─── Inline SVG Icons ─────────────────────────────────────────────────────────
const IconGrid = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 3v18" />
  </svg>
);
const IconFile = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
  >
    <path d="M9 12h6M9 16h6M9 8h2" />
    <rect x="3" y="3" width="18" height="18" rx="2" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconZap = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconUp = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);
const IconRefresh = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);
const IconCopy = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconCopied = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconChevron = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconX = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <div style={{ position: "relative", width: 56, height: 56 }}>
      <div
        className="spinner-track"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2px solid var(--border)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          border: "2px solid transparent",
          borderTopColor: "var(--accent)",
          animation: "spin .85s linear infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 8,
          borderRadius: "50%",
          border: "1px solid var(--border-bright)",
          opacity: 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          animation: "pulse 1.8s ease-in-out infinite",
        }}
      >
        ⚡
      </div>
    </div>
  );
}

// ─── DropZone ─────────────────────────────────────────────────────────────────
function DropZone({
  label,
  hint,
  accept,
  icon: Icon,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  accept: string;
  icon: React.ElementType;
  file: File | null;
  onChange: (f: File) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) onChange(f);
    },
    [onChange],
  );

  const cls = [
    "dropzone",
    file ? "has-file" : "",
    dragging ? "is-dragging" : "",
  ].join(" ");

  return (
    <div
      className={cls}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
        }}
      />
      <div className="dz-icon">{file ? <IconCheck /> : <Icon />}</div>
      <div>
        <div
          style={{
            fontSize: "var(--tx-sm)",
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "var(--tx-xs)",
            color: "var(--text-muted)",
            marginTop: 2,
          }}
        >
          {hint}
        </div>
      </div>
      {file ? (
        <div
          style={{
            width: "100%",
            background: "var(--surface-3)",
            borderRadius: "var(--r-sm)",
            padding: "7px 10px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 4,
          }}
        >
          <div
            className="dot-success"
            style={{ animation: "pulse 2s infinite", flexShrink: 0 }}
          />
          <span
            style={{
              fontSize: "var(--tx-xs)",
              fontFamily: "var(--font-mono)",
              color: "var(--text)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              flex: 1,
            }}
          >
            {file.name}
          </span>
          <span
            style={{
              fontSize: "var(--tx-xs)",
              color: "var(--text-faint)",
              flexShrink: 0,
            }}
          >
            {formatBytes(file.size)}
          </span>
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: "var(--tx-xs)",
            color: "var(--text-faint)",
          }}
        >
          <IconUp />
          {dragging ? "Release to upload" : "Drop here or click to browse"}
        </div>
      )}
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  variant,
}: {
  label: string;
  value: string | number;
  variant: "stat-accent" | "stat-green" | "stat-red" | "stat-yellow";
}) {
  return (
    <div className={`stat-card ${variant}`}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span className="stat-label">{label}</span>
      </div>
      <span className="stat-value">{value}</span>
    </div>
  );
}

// ─── NumberChip ───────────────────────────────────────────────────────────────
function NumberChip({
  arabic,
  bengali,
  confidence,
}: {
  arabic: string;
  bengali: string;
  confidence?: "high" | "medium" | "low";
}) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(bengali);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const dotColor =
    confidence === "high"
      ? "var(--success)"
      : confidence === "medium"
        ? "#f59e0b"
        : confidence === "low"
          ? "var(--danger)"
          : "transparent";

  const dotTitle =
    confidence === "high"
      ? "High confidence — confirmed by both engines"
      : confidence === "medium"
        ? "Medium confidence — Groq found it, Tesseract missed"
        : "Low confidence — Tesseract found it, Groq did not confirm";

  return (
    <div className="chip" onClick={copy} title="Click to copy Bengali number">
      <div
        className="chip-nums"
        style={{ display: "flex", flexDirection: "column", gap: 1 }}
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--tx-sm)",
            color: "var(--success)",
            fontWeight: 500,
          }}
        >
          {bengali}
        </span>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "var(--text-faint)",
          }}
        >
          {arabic}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          flexShrink: 0,
        }}
      >
        {confidence && (
          <div
            title={dotTitle}
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: dotColor,
              flexShrink: 0,
            }}
          />
        )}
        <span className="chip-copy" style={{ color: "var(--text-faint)" }}>
          {copied ? <IconCopied /> : <IconCopy />}
        </span>
      </div>
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────
function Section({
  title,
  count,
  nameClass,
  defaultOpen = false,
  children,
}: {
  title: string;
  count?: number;
  nameClass: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section-block">
      <button className="section-toggle" onClick={() => setOpen((o) => !o)}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className={`section-name ${nameClass}`}
            style={{ fontSize: "var(--tx-sm)", fontWeight: 600 }}
          >
            {title}
          </span>
          {count !== undefined && (
            <span
              style={{
                fontSize: "var(--tx-xs)",
                fontFamily: "var(--font-mono)",
                background: "var(--surface-3)",
                color: "var(--text-muted)",
                border: "1px solid var(--border)",
                borderRadius: "var(--r-full)",
                padding: "2px 9px",
              }}
            >
              {count}
            </span>
          )}
        </div>
        <span
          style={{
            color: "var(--text-faint)",
            display: "flex",
            transition: "transform .2s",
            transform: open ? "rotate(180deg)" : "none",
          }}
        >
          <IconChevron />
        </span>
      </button>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

// ─── Confidence Legend ────────────────────────────────────────────────────────
function ConfidenceLegend() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        fontSize: "var(--tx-xs)",
        color: "var(--text-faint)",
        marginTop: 8,
      }}
    >
      {[
        { color: "var(--success)", label: "High — both engines agreed" },
        { color: "#f59e0b", label: "Medium — Groq only" },
        { color: "var(--danger)", label: "Low — Tesseract only" },
      ].map(({ color, label }) => (
        <span
          key={label}
          style={{ display: "flex", alignItems: "center", gap: 6 }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: color,
              display: "inline-block",
            }}
          />
          {label}
        </span>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [ocrText, setOcrText] = useState("");
  const [error, setError] = useState("");

  const canProcess = excelFile && documentFile && status !== "processing";

  const reset = () => {
    setExcelFile(null);
    setDocumentFile(null);
    setStatus("idle");
    setResult(null);
    setOcrText("");
    setError("");
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
      if (!res.ok || !data.success)
        throw new Error(data.error ?? `Server error ${res.status}`);
      setResult(data.result!);
      setOcrText(data.ocrText ?? "");
      setStatus("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStatus("error");
    }
  };

  const matchRate = result?.stats.matchRate ?? 0;
  const rateVariant: "stat-green" | "stat-yellow" | "stat-red" =
    matchRate === 100
      ? "stat-green"
      : matchRate > 50
        ? "stat-yellow"
        : "stat-red";

  return (
    <>
      {/* Ambient blobs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        <div
          className="blob"
          style={{
            width: 500,
            height: 500,
            top: -150,
            left: "10%",
            background: "rgba(124,106,247,.07)",
          }}
        />
        <div
          className="blob"
          style={{
            width: 400,
            height: 400,
            top: "40%",
            right: -100,
            background: "rgba(52,211,153,.05)",
          }}
        />
        <div
          className="blob"
          style={{
            width: 360,
            height: 360,
            bottom: -80,
            left: -60,
            background: "rgba(124,106,247,.05)",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: 740,
          margin: "0 auto",
          padding: "64px 20px 48px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 16,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "var(--surface-2)",
              border: "1px solid var(--border-bright)",
              borderRadius: "var(--r-full)",
              padding: "5px 14px",
              fontSize: "var(--tx-xs)",
              color: "var(--accent)",
              fontWeight: 500,
              letterSpacing: ".02em",
            }}
          >
            <div
              className="dot-accent"
              style={{ animation: "pulse 2.2s ease-in-out infinite" }}
            />
            Bengali Number Verification System
          </div>
          <h1
            style={{
              fontSize: "var(--tx-xl)",
              fontWeight: 700,
              color: "var(--text)",
              letterSpacing: "-.03em",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            Match Numbers
            <br />
            <em style={{ fontStyle: "normal", color: "var(--accent)" }}>
              Across Documents
            </em>
          </h1>
          <p
            style={{
              fontSize: "var(--tx-sm)",
              color: "var(--text-muted)",
              maxWidth: "42ch",
              lineHeight: 1.7,
              margin: 0,
            }}
          >
            Upload an Excel sheet with Bengali 7-digit numbers and a PDF or
            image. The system extracts, compares, and shows you exactly what
            matches.
          </p>
        </div>

        {/* Idle / Error */}
        {(status === "idle" || status === "error") && (
          <div className="card">
            <div
              className="dropzone-row"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <DropZone
                label="Excel File"
                hint=".xlsx — Bengali numbers list"
                accept=".xlsx,.xls"
                icon={IconGrid}
                file={excelFile}
                onChange={setExcelFile}
              />
              <DropZone
                label="PDF or Image"
                hint=".pdf, .png, .jpg — document to scan"
                accept=".pdf,image/*"
                icon={IconFile}
                file={documentFile}
                onChange={setDocumentFile}
              />
            </div>

            {status === "error" && (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  background: "var(--danger-bg)",
                  border: "1px solid var(--danger-border)",
                  borderRadius: "var(--r-md)",
                  padding: "12px 16px",
                  marginBottom: 20,
                }}
              >
                <span
                  style={{
                    color: "var(--danger)",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <IconX />
                </span>
                <div>
                  <p
                    style={{
                      fontSize: "var(--tx-sm)",
                      fontWeight: 600,
                      color: "var(--danger)",
                      margin: 0,
                    }}
                  >
                    Processing failed
                  </p>
                  <p
                    style={{
                      fontSize: "var(--tx-xs)",
                      color: "var(--danger)",
                      opacity: 0.7,
                      marginTop: 4,
                    }}
                  >
                    {error}
                  </p>
                </div>
              </div>
            )}

            <div
              className="how-strip"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 12,
                borderTop: "1px solid var(--border)",
                paddingTop: 20,
                marginBottom: 20,
              }}
            >
              {[
                { n: "01", t: "Upload your Excel sheet with numbers" },
                { n: "02", t: "Upload the PDF or image for OCR scanning" },
                { n: "03", t: "View matched & unmatched results" },
              ].map(({ n, t }) => (
                <div
                  key={n}
                  style={{ display: "flex", flexDirection: "column", gap: 4 }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "var(--tx-xs)",
                      color: "var(--accent)",
                      opacity: 0.7,
                    }}
                  >
                    {n}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--tx-xs)",
                      color: "var(--text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {t}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                className="btn-primary"
                style={{ flex: 1 }}
                onClick={process}
                disabled={!canProcess}
              >
                <IconZap /> Verify Numbers
              </button>
              {(excelFile || documentFile) && (
                <button className="btn-ghost" onClick={reset}>
                  Clear
                </button>
              )}
            </div>
          </div>
        )}

        {/* Processing */}
        {status === "processing" && (
          <div className="card">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
                padding: "24px 32px",
                textAlign: "center",
              }}
            >
              <Spinner />
              <div>
                <p
                  style={{
                    fontSize: "var(--tx-base)",
                    fontWeight: 600,
                    color: "var(--text)",
                    margin: 0,
                  }}
                >
                  Processing your files…
                </p>
                <p
                  style={{
                    fontSize: "var(--tx-sm)",
                    color: "var(--text-muted)",
                    marginTop: 4,
                  }}
                >
                  Running OCR and comparing numbers. This may take a moment.
                </p>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  width: "100%",
                  maxWidth: 240,
                }}
              >
                {[
                  "Parsing Excel file",
                  "Stage 1 — Tesseract OCR scan",
                  "Stage 2 — Groq AI correction",
                  "Scoring & comparing",
                ].map((s, i) => (
                  <div
                    key={s}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontSize: "var(--tx-xs)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <div
                      className="step-spinner"
                      style={{ animationDelay: `${i * 0.25}s` }}
                    />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {status === "done" && result && (
          <div style={{ animation: "fadeUp .35s ease forwards" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: "var(--tx-base)",
                  fontWeight: 700,
                  color: "var(--text)",
                  letterSpacing: "-.01em",
                }}
              >
                Verification Results
              </div>
              <button className="btn-new" onClick={reset}>
                <IconRefresh /> New Verification
              </button>
            </div>

            <div
              className="stat-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4,1fr)",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <StatCard
                label="In Excel"
                value={result.stats.totalExcel}
                variant="stat-accent"
              />
              <StatCard
                label="In Document"
                value={result.stats.totalOcr}
                variant="stat-yellow"
              />
              <StatCard
                label="Matched"
                value={result.stats.totalMatched}
                variant="stat-green"
              />
              <StatCard
                label="Match Rate"
                value={`${result.stats.matchRate}%`}
                variant={rateVariant}
              />
            </div>

            {result.stats.totalMatched === 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  background: "var(--danger-bg)",
                  border: "1px solid var(--danger-border)",
                  borderRadius: "var(--r-lg)",
                  padding: "16px 20px",
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--danger-bg)",
                    border: "1px solid var(--danger-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span style={{ color: "var(--danger)" }}>
                    <IconX />
                  </span>
                </div>
                <div>
                  <p
                    style={{
                      fontWeight: 600,
                      color: "var(--danger)",
                      margin: 0,
                      fontSize: "var(--tx-sm)",
                    }}
                  >
                    No matches found
                  </p>
                  <p
                    style={{
                      fontSize: "var(--tx-xs)",
                      color: "var(--danger)",
                      opacity: 0.7,
                      marginTop: 4,
                    }}
                  >
                    None of the {result.stats.totalExcel} numbers from the Excel
                    file were detected in the uploaded document.
                  </p>
                </div>
              </div>
            )}

            {result.matched.length > 0 && (
              <Section
                title="✓ Matched Numbers"
                count={result.matched.length}
                nameClass="green"
                defaultOpen
              >
                <div
                  className="chips-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))",
                    gap: 8,
                  }}
                >
                  {result.matched.map((m) => (
                    <NumberChip
                      key={m.arabic}
                      arabic={m.arabic}
                      bengali={m.bengali}
                      confidence={m.confidence}
                    />
                  ))}
                </div>
                <ConfidenceLegend />
              </Section>
            )}

            {result.notFoundInDocument.length > 0 && (
              <Section
                title="✗ Not Found in Document"
                count={result.notFoundInDocument.length}
                nameClass="red"
              >
                <div
                  className="plain-chips"
                  style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                >
                  {result.notFoundInDocument.map((n) => (
                    <span key={n} className="plain-chip chip-red">
                      {n}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {result.notFoundInExcel.length > 0 && (
              <Section
                title="△ Extra in Document"
                count={result.notFoundInExcel.length}
                nameClass="yellow"
              >
                <div
                  className="plain-chips"
                  style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
                >
                  {result.notFoundInExcel.map((n) => (
                    <span key={n} className="plain-chip chip-yellow">
                      {n}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {ocrText && (
              <Section title="Raw OCR Output" nameClass="gray">
                <pre className="ocr-pre">{ocrText}</pre>
              </Section>
            )}
          </div>
        )}

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            fontSize: "var(--tx-xs)",
            color: "var(--text-faint)",
            marginTop: 48,
            fontFamily: "var(--font-mono)",
          }}
        >
          Powered by Next.js · Tesseract.js · Groq AI · HridoyHazard
        </p>
      </div>
    </>
  );
}
