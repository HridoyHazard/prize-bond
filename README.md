# Prize Bond Checker

<<<<<<< HEAD
A responsive web application that compares 7-digit numbers from an Excel file against a prize bond image using Mistral OCR via Puter.js. **Completely free — no API key, no backend, no credit card required.**

---
=======
A responsive web application that compares 7-digit numbers from an Excel file against a prize bond image using **Poppler** for PDF rendering and **Tesseract OCR** for optical character recognition. **Completely free — no API key, no paid service required.**

***
>>>>>>> c3843d1c2fe5f0d6130bc65de4ca387a76ee1bfe

## How It Works

1. Upload your `.xlsx` file containing 7-digit bond numbers
<<<<<<< HEAD
2. Upload a prize bond image (PNG, JPG, JPEG, WebP)
3. Mistral OCR (via Puter.js) extracts all numbers from the image
4. The app compares both lists and shows **matched** and **missing** numbers instantly

---
=======
2. Upload a prize bond image (PNG, JPG, JPEG, WebP) or PDF
3. The Python backend (FastAPI) uses Poppler + Tesseract to extract all numbers from the image
4. The app compares both lists and shows **matched** and **missing** numbers instantly

***
>>>>>>> c3843d1c2fe5f0d6130bc65de4ca387a76ee1bfe

## Prerequisites

Make sure you have the following installed before proceeding:

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
<<<<<<< HEAD

To verify your versions:
=======
- **Python** v3.9 or higher — [Download](https://python.org)
- **Poppler** — PDF rendering utilities
- **Tesseract OCR** — open-source OCR engine

### Installing Poppler

**Ubuntu / Debian:**
```bash
sudo apt-get install poppler-utils
```

**macOS (Homebrew):**
```bash
brew install poppler
```

**Windows:**
Download the latest binary from [poppler-windows releases](https://github.com/oschwartz10612/poppler-windows/releases) and add the `bin/` folder to your system `PATH`.

### Installing Tesseract OCR

**Ubuntu / Debian:**
```bash
sudo apt-get install tesseract-ocr
```

**macOS (Homebrew):**
```bash
brew install tesseract
```

**Windows:**
Download the installer from [UB Mannheim Tesseract releases](https://github.com/UB-Mannheim/tesseract/wiki) and follow the setup instructions. Add Tesseract to your system `PATH`.

### Verify Installations
>>>>>>> c3843d1c2fe5f0d6130bc65de4ca387a76ee1bfe

```bash
node -v
npm -v
<<<<<<< HEAD
```

---
=======
python --version
pdftoppm -v       # Poppler
tesseract --version
```

***
>>>>>>> c3843d1c2fe5f0d6130bc65de4ca387a76ee1bfe

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

<<<<<<< HEAD
### 2. Install dependencies

```bash
=======
### 2. Install Python backend dependencies

```bash
cd ocr-service
pip install -r requirements.txt
```

### 3. Install frontend dependencies

```bash
cd ..          # back to project root
>>>>>>> c3843d1c2fe5f0d6130bc65de4ca387a76ee1bfe
npm install
```

This installs all required packages including:

<<<<<<< HEAD
| Package               | Purpose                                  |
| --------------------- | ---------------------------------------- |
| `next`                | React framework                          |
| `react` + `react-dom` | UI layer                                 |
| `xlsx`                | Parse `.xlsx` Excel files in the browser |
| `tailwindcss`         | Utility-first CSS styling                |

> **No API keys needed.** OCR is handled by [Puter.js](https://puter.com) which loads from CDN at runtime — no installation required.

---

## Running the Project

### Development mode
=======
| Package               | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `next`                | React framework                              |
| `react` + `react-dom` | UI layer                                     |
| `xlsx`                | Parse `.xlsx` Excel files                    |
| `tailwindcss`         | Utility-first CSS styling                    |

The Python backend dependencies (in `ocr-service/requirements.txt`) include:

| Package        | Purpose                                    |
| -------------- | ------------------------------------------ |
| `fastapi`      | Web framework for the OCR API              |
| `uvicorn`      | ASGI server to run FastAPI                 |
| `python-poppler` / `pdf2image` | PDF-to-image rendering via Poppler |
| `pytesseract`  | Python wrapper for Tesseract OCR           |
| `Pillow`       | Image processing                           |

***

## Running the Project

The app has two processes you need to run — **the backend first, then the frontend.**

### Step 1 — Start the backend (FastAPI + Uvicorn)

Open a terminal, navigate to the `ocr-service` folder, and run:

```bash
cd ocr-service
uvicorn main:app --port 8000 --reload
```

The API will be available at [http://localhost:8000](http://localhost:8000).  
The `--reload` flag auto-restarts the server whenever you edit backend files.

### Step 2 — Start the frontend (Next.js)

Open a **second terminal** at the project root and run:
>>>>>>> c3843d1c2fe5f0d6130bc65de4ca387a76ee1bfe

```bash
npm run dev
```

<<<<<<< HEAD
Open [http://localhost:3000](http://localhost:3000) in your browser.  
The page auto-updates whenever you edit any file.

### Production build

```bash
npm run build
npm start
```

---

## Project Structure

```
ocr-app/
├── app/
│   ├── page.tsx          ← Main UI (upload + compare logic)
│   ├── layout.tsx        ← Root layout + font wiring
│   └── globals.css       ← Tailwind base styles
├── public/               ← Static assets
├── package.json
├── tailwind.config.ts    ← Tailwind design tokens
└── next.config.ts
```

> There is **no `/api` backend route** — OCR runs entirely in the browser via Puter.js.

---

## Usage

=======
Open [http://localhost:3000](http://localhost:3000) in your browser.

> Both terminals must stay open while using the app — the frontend calls the backend at `http://localhost:8000`.

### Production build

```bash
# Terminal 1 — backend (without --reload in production)
cd ocr-service
uvicorn main:app --port 8000

# Terminal 2 — frontend
npm run build
npm start
```

***

## Project Structure

```
your-repo-name/
├── ocr-service/              ← Python FastAPI backend
│   ├── main.py               ← API entry point (Poppler + Tesseract pipeline)
│   └── requirements.txt      ← Python dependencies
├── app/
│   ├── page.tsx              ← Main UI (upload + compare logic)
│   ├── layout.tsx            ← Root layout + font wiring
│   └── globals.css           ← Tailwind base styles
├── public/                   ← Static assets
├── package.json
├── tailwind.config.ts        ← Tailwind design tokens
└── next.config.ts
```

***

## Usage

>>>>>>> c3843d1c2fe5f0d6130bc65de4ca387a76ee1bfe
### Step 1 — Prepare your Excel file

- File format: `.xlsx`
- The first sheet is used automatically
- Each 7-digit bond number should be in its own cell
- Example layout:

  | A       |
  | ------- |
  | 1234567 |
  | 2345678 |
  | 9876543 |

<<<<<<< HEAD
### Step 2 — Prepare your prize bond image

- Supported formats: **PNG, JPG, JPEG, WebP**
=======
### Step 2 — Prepare your prize bond image or PDF

- Supported image formats: **PNG, JPG, JPEG, WebP**
- PDF files are supported — Poppler converts pages to images before OCR
>>>>>>> c3843d1c2fe5f0d6130bc65de4ca387a76ee1bfe
- Higher resolution images produce better OCR results
- Bengali numerals (০১২৩৪৫৬৭৮৯) are automatically converted to English digits

### Step 3 — Run the comparison

<<<<<<< HEAD
1. Click **Choose File** under _Excel File_ and select your `.xlsx`
2. Wait for the confirmation: _"✓ X numbers loaded"_
3. Click **Choose File** under _Prize Bond Image_ and select your image
4. Wait for Mistral OCR to finish — _"⏳ Running Mistral OCR..."_
5. Results appear automatically — **Matched** (green) and **Not Found** (red)

---

## Deploying to Vercel (Free)

### Option A — Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts. Your app will be live at `https://your-app.vercel.app`.

### Option B — Deploy via GitHub

1. Push your project to a GitHub repository:

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your GitHub repository
4. Click **Deploy** — no environment variables needed

> No `.env` file is required. Puter.js requires no API key.

---

## Troubleshooting

| Problem                             | Solution                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------ |
| `Puter.js is still loading` message | Wait 2–3 seconds after page load for the CDN script to initialize              |
| OCR returns empty text              | Use a higher resolution image; ensure numbers are clearly visible              |
| Excel numbers not detected          | Make sure bond numbers are plain text cells, not formatted as currency or date |
| `Cannot find module 'xlsx'`         | Run `npm install` again                                                        |
| Port 3000 already in use            | Run `npm run dev -- -p 3001` to use port 3001                                  |

---

## Tech Stack

| Layer         | Technology                                    |
| ------------- | --------------------------------------------- |
| Framework     | Next.js 14 (App Router)                       |
| Language      | TypeScript                                    |
| Styling       | Tailwind CSS                                  |
| Excel parsing | SheetJS (`xlsx`)                              |
| OCR           | Mistral OCR via Puter.js (free, browser-side) |
| Deployment    | Vercel (free tier)                            |

---
=======
1. Click **Choose File** under *Excel File* and select your `.xlsx`
2. Wait for the confirmation: *"✓ X numbers loaded"*
3. Click **Choose File** under *Prize Bond Image* and select your image or PDF
4. Wait for OCR to finish — *"⏳ Running OCR..."*
5. Results appear automatically — **Matched** (green) and **Not Found** (red)

***

## Deploying to a VPS or Server

Since this app requires Poppler and Tesseract installed on the server, serverless platforms like Vercel are **not recommended** unless you use a custom Docker image.

### Option A — Deploy on a VPS (e.g., Ubuntu)

1. Install Node.js, Python, Poppler, and Tesseract on your server (see Prerequisites above)
2. Clone and build the project:

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo

# Backend
cd ocr-service
pip install -r requirements.txt
uvicorn main:app --port 8000 &

# Frontend
cd ..
npm install
npm run build
npm start
```

Pair with **Nginx** as a reverse proxy to serve both the frontend (port 3000) and backend (port 8000) under a single domain.

### Option B — Deploy with Docker Compose

Create a `docker-compose.yml` at the project root:

```yaml
version: "3.9"
services:
  backend:
    build:
      context: ./ocr-service
    ports:
      - "8000:8000"
    command: uvicorn main:app --host 0.0.0.0 --port 8000

  frontend:
    build:
      context: .
    ports:
      - "3000:3000"
    depends_on:
      - backend
    command: npm start
```

Create `ocr-service/Dockerfile`:

```dockerfile
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker compose up --build
```

***

## Troubleshooting

| Problem                                          | Solution                                                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `tesseract: command not found`                   | Ensure Tesseract is installed and added to your system `PATH`                                   |
| `pdftoppm: command not found`                    | Ensure Poppler utilities are installed and available in `PATH`                                  |
| `Cannot connect to backend`                      | Make sure `uvicorn main:app --port 8000 --reload` is running in the `ocr-service` folder        |
| OCR returns empty or garbled text                | Use a higher resolution image; ensure numbers are clearly visible and not skewed                |
| Poor accuracy on Bengali numerals                | Install the Bengali language pack: `sudo apt-get install tesseract-ocr-ben`                     |
| Excel numbers not detected                       | Make sure bond numbers are plain text cells, not formatted as currency or date                  |
| `Cannot find module 'xlsx'`                      | Run `npm install` again at the project root                                                     |
| Port 3000 already in use                         | Run `npm run dev -- -p 3001` to use port 3001                                                   |
| Port 8000 already in use                         | Run `uvicorn main:app --port 8001 --reload` and update the frontend API base URL accordingly    |
| Docker OCR fails                                 | Confirm the `Dockerfile` installs `poppler-utils` and `tesseract-ocr` before the `COPY` steps  |

***

## Tech Stack

| Layer          | Technology                                            |
| -------------- | ----------------------------------------------------- |
| Framework      | Next.js 14 (App Router)                               |
| Language       | TypeScript (frontend) · Python (backend)              |
| Styling        | Tailwind CSS                                          |
| Excel parsing  | SheetJS (`xlsx`)                                      |
| Backend API    | FastAPI + Uvicorn                                     |
| PDF rendering  | Poppler (`poppler-utils`)                             |
| OCR engine     | Tesseract OCR (`pytesseract`)                         |
| Deployment     | VPS or Docker Compose (self-hosted)                   |

***
>>>>>>> c3843d1c2fe5f0d6130bc65de4ca387a76ee1bfe

## License

MIT
