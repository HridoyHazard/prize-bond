"""
OCR Microservice — FastAPI + Tesseract
======================================
Accepts a PDF or image file and returns extracted text + 7-digit numbers.

Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Requirements:
    pip install fastapi uvicorn python-multipart pytesseract Pillow pdf2image
"""

import io
import os
import re
import shutil

import pytesseract
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageEnhance, ImageFilter, ImageOps
from pdf2image import convert_from_bytes


# ─────────────────────────────────────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Bengali OCR Service",
    description="Extracts 7-digit numbers from PDFs and images (Bengali + English).",
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────────────────────────────────────

POPPLER_PATH = r"C:\poppler-26.02.0\Library\bin"

ALLOWED_IMAGE_TYPES      = {"image/png", "image/jpeg", "image/jpg", "image/tiff", "image/webp"}
ALLOWED_PDF_TYPES        = {"application/pdf"}
ALLOWED_IMAGE_EXTENSIONS = (".png", ".jpg", ".jpeg", ".tiff", ".webp")

# Bengali/Devanagari digit → ASCII digit
BENGALI_DIGIT_MAP = str.maketrans(
    "০১২৩৪৫৬৭৮৯"   # Bengali digits U+09E6–U+09EF
    "٠١٢٣٤٥٦٧٨٩",  # Arabic-Indic digits (sometimes OCR'd instead)
    "01234567890123456789"
)

# OCR passes:
# Pass 1 — eng only, PSM 6:  best for clean printed ASCII digits
# Pass 2 — ben only, PSM 6:  best for Bengali digit script
# Pass 3 — ben+eng, PSM 11: sparse text — catches anything missed above
OCR_PASSES = [
    ("eng",     "--psm 6 --oem 3"),
    ("ben",     "--psm 6 --oem 3"),
    ("ben+eng", "--psm 11 --oem 3"),
    ("ben+eng", "--psm 4 --oem 3"),
]


# ─────────────────────────────────────────────────────────────────────────────
# Digit Normalisation
# ─────────────────────────────────────────────────────────────────────────────

def normalize_digits(text: str) -> str:
    """
    1. Convert Bengali/Arabic-Indic numerals → ASCII digits
    2. Strip invisible OCR noise chars that split numbers
    3. Collapse common OCR substitutions (O→0, l→1, I→1, S→5, Z→2)
       only when surrounded by digits
    """
    # Bengali + Arabic-Indic → ASCII
    text = text.translate(BENGALI_DIGIT_MAP)

    # Remove zero-width / soft-hyphen characters
    text = re.sub(r"[\u00ad\u200b\u200c\u200d\ufeff]", "", text)

    # Fix common OCR letter→digit substitutions between digit neighbours
    # e.g. "123O456" → "1230456", "l23456" → "1234567"
    text = re.sub(r"(?<=\d)[OoQD](?=\d)", "0", text)
    text = re.sub(r"(?<=\d)[lIi](?=\d)", "1", text)
    text = re.sub(r"(?<=\d)[S](?=\d)",   "5", text)
    text = re.sub(r"(?<=\d)[Z](?=\d)",   "2", text)
    text = re.sub(r"(?<=\d)[B](?=\d)",   "8", text)

    return text


def extract_7digit_numbers(text: str) -> list[str]:
    """
    Extract all unique 7-digit numbers after normalisation.
    Handles numbers separated by spaces, newlines, commas, pipes, tabs.
    """
    normalized = normalize_digits(text)

    # Match exactly 7 consecutive digits not adjacent to other digits
    matches = re.findall(r"(?<!\d)(\d{7})(?!\d)", normalized)

    # Deduplicate, preserve order
    seen:   set[str]  = set()
    unique: list[str] = []
    for m in matches:
        if m not in seen:
            seen.add(m)
            unique.append(m)

    return unique


# ─────────────────────────────────────────────────────────────────────────────
# Image Preprocessing
# ─────────────────────────────────────────────────────────────────────────────

def preprocess_image(img: Image.Image) -> Image.Image:
    """
    Prepare image for Tesseract:
      normalize mode → grayscale → auto-level → upscale → contrast → sharpen
    """
    # Normalize unusual modes (RGBA, P, CMYK, etc.)
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    # Grayscale
    img = img.convert("L")

    # Auto-level: stretches histogram — helps faded/photocopied documents
    img = ImageOps.autocontrast(img, cutoff=1)

    # Upscale only if below 1200px wide (≈300 DPI for A4)
    if img.width < 1200:
        scale = 1200 / img.width
        img = img.resize(
            (int(img.width * scale), int(img.height * scale)),
            Image.LANCZOS,
        )

    # Moderate contrast boost (1.5 safer than 1.8 — avoids blowing out thin strokes)
    img = ImageEnhance.Contrast(img).enhance(1.5)

    # Sharpen to clarify digit edges
    img = img.filter(ImageFilter.SHARPEN)

    return img


# ─────────────────────────────────────────────────────────────────────────────
# OCR Functions
# ─────────────────────────────────────────────────────────────────────────────

def ocr_image_multipass(img: Image.Image) -> str:
    """
    Run multiple Tesseract passes (different lang + PSM combos).
    Merge all output — extract_7digit_numbers() deduplicates later.
    """
    processed = preprocess_image(img)
    results: list[str] = []

    for lang, config in OCR_PASSES:
        try:
            text = pytesseract.image_to_string(
                processed,
                lang=lang,
                config=config,
            ).strip()
            if text:
                results.append(text)
        except Exception:
            continue  # skip failed pass, don't abort

    return "\n".join(results)


def ocr_pdf(pdf_bytes: bytes) -> tuple[str, int]:
    """
    Render each PDF page at 300 DPI → OCR each page.
    Returns (combined_raw_text, page_count).
    """
    pages: list[Image.Image] = convert_from_bytes(
        pdf_bytes,
        dpi=300,
        fmt="png",
        poppler_path=POPPLER_PATH,
    )

    page_texts: list[str] = []
    for page_num, page_img in enumerate(pages, start=1):
        text = ocr_image_multipass(page_img)
        if text:
            page_texts.append(f"--- Page {page_num} ---\n{text}")

    return "\n\n".join(page_texts), len(pages)


# ─────────────────────────────────────────────────────────────────────────────
# API Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    """Health check."""
    return {
        "service": "Bengali OCR Service",
        "status": "running",
        "tesseract_version": str(pytesseract.get_tesseract_version()),
        "poppler_found": shutil.which("pdftoppm") is not None,
    }


@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    """
    OCR endpoint. Accepts PDF or image.

    Returns:
        text    — raw merged OCR text from all passes
        numbers — unique 7-digit numbers extracted and normalised
        pages   — pages processed (always 1 for images)
        mime    — detected MIME type
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    content: bytes = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    mime: str          = file.content_type or ""
    fname: str         = file.filename.lower()

    try:
        # ── PDF ──────────────────────────────────────────────────────────────
        if mime in ALLOWED_PDF_TYPES or fname.endswith(".pdf"):
            text, page_count = ocr_pdf(content)
            numbers = extract_7digit_numbers(text)
            return {"text": text, "numbers": numbers, "pages": page_count, "mime": mime}

        # ── Image ─────────────────────────────────────────────────────────────
        elif mime in ALLOWED_IMAGE_TYPES or fname.endswith(ALLOWED_IMAGE_EXTENSIONS):
            img  = Image.open(io.BytesIO(content))
            text = ocr_image_multipass(img)
            numbers = extract_7digit_numbers(text)
            return {"text": text, "numbers": numbers, "pages": 1, "mime": mime}

        # ── Unsupported ───────────────────────────────────────────────────────
        else:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported type: '{mime}'. Accepted: PDF, PNG, JPG, TIFF, WebP.",
            )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(exc)}",
        ) from exc