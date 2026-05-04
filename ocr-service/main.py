"""
OCR Microservice — FastAPI + Tesseract
======================================
Accepts a PDF or image file and returns extracted text using Tesseract OCR
with Bengali language support.

Run with:
    uvicorn main:app --host 0.0.0.0 --port 8000 --reload

Requirements:
    pip install -r requirements.txt
    sudo apt-get install tesseract-ocr tesseract-ocr-ben poppler-utils
"""

import io
import os
import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import pytesseract
from PIL import Image, ImageEnhance, ImageFilter

# pdf2image requires poppler to be installed on the system
from pdf2image import convert_from_bytes

# ─────────────────────────────────────────────────────────────────────────────
# App Setup
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Bengali OCR Service",
    description="Extracts text from PDFs and images using Tesseract with Bengali language support.",
    version="1.0.0",
)

# Allow requests from the Next.js dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Tesseract language — use 'ben' for Bengali, 'ben+eng' to also detect English
TESSERACT_LANG = os.getenv("TESSERACT_LANG", "ben+eng")

# OCR config: PSM 6 = assume uniform block of text (good for number lists)
TESSERACT_CONFIG = "--psm 6 --oem 3"

# Allowed MIME types
ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg", "image/tiff", "image/webp"}
ALLOWED_PDF_TYPES   = {"application/pdf"}

# ─────────────────────────────────────────────────────────────────────────────
# Image Preprocessing
# ─────────────────────────────────────────────────────────────────────────────

def preprocess_image(img: Image.Image) -> Image.Image:
    """
    Enhance image quality before OCR to improve accuracy.
    Steps: convert to grayscale → increase contrast → mild sharpening → upscale if small.
    """
    # Convert to RGB if needed (handles RGBA, palette images, etc.)
    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    # Grayscale
    img = img.convert("L")

    # Upscale small images (Tesseract works best at ~300 DPI)
    min_width = 1200
    if img.width < min_width:
        scale = min_width / img.width
        img = img.resize(
            (int(img.width * scale), int(img.height * scale)),
            Image.LANCZOS,
        )

    # Increase contrast to make text stand out
    img = ImageEnhance.Contrast(img).enhance(1.8)

    # Sharpen slightly
    img = img.filter(ImageFilter.SHARPEN)

    return img


# ─────────────────────────────────────────────────────────────────────────────
# OCR Functions
# ─────────────────────────────────────────────────────────────────────────────

def ocr_image(img: Image.Image) -> str:
    """Run Tesseract OCR on a PIL Image and return extracted text."""
    processed = preprocess_image(img)
    text = pytesseract.image_to_string(
        processed,
        lang=TESSERACT_LANG,
        config=TESSERACT_CONFIG,
    )
    return text.strip()


def ocr_pdf(pdf_bytes: bytes) -> tuple[str, int]:
    """
    Convert each page of a PDF to an image and run OCR.
    Returns: (combined_text, page_count)
    """
    # Convert PDF pages to PIL images at 300 DPI for best quality
    pages: list[Image.Image] = convert_from_bytes(
        pdf_bytes,
        dpi=300,
        fmt="png",
    )

    page_texts: list[str] = []
    for page_num, page_img in enumerate(pages, start=1):
        text = ocr_image(page_img)
        if text:
            page_texts.append(f"--- Page {page_num} ---\n{text}")

    combined = "\n\n".join(page_texts)
    return combined, len(pages)


# ─────────────────────────────────────────────────────────────────────────────
# API Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    """Health check endpoint."""
    return {
        "service": "Bengali OCR Service",
        "status": "running",
        "tesseract_lang": TESSERACT_LANG,
        "tesseract_version": pytesseract.get_tesseract_version(),
    }


@app.post("/ocr")
async def perform_ocr(file: UploadFile = File(...)):
    """
    OCR endpoint. Accepts PDF or image file.
    
    Returns:
        text    — extracted text (all pages combined for PDFs)
        pages   — number of pages processed (1 for images)
        mime    — detected MIME type
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    # Read file bytes
    content: bytes = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    mime: str = file.content_type or ""

    try:
        # ── PDF ──
        if mime in ALLOWED_PDF_TYPES or file.filename.lower().endswith(".pdf"):
            text, pages = ocr_pdf(content)
            return {"text": text, "pages": pages, "mime": mime}

        # ── Image ──
        elif mime in ALLOWED_IMAGE_TYPES or any(
            file.filename.lower().endswith(ext)
            for ext in (".png", ".jpg", ".jpeg", ".tiff", ".webp")
        ):
            img = Image.open(io.BytesIO(content))
            text = ocr_image(img)
            return {"text": text, "pages": 1, "mime": mime}

        # ── Unsupported ──
        else:
            raise HTTPException(
                status_code=415,
                detail=f"Unsupported file type: '{mime}'. Use PDF, PNG, JPG, TIFF, or WebP.",
            )

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"OCR processing failed: {str(exc)}",
        ) from exc
