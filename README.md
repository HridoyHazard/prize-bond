# Prize Bond Checker

A responsive web application that compares 7-digit numbers from an Excel file against a prize bond image using **Poppler** for PDF rendering and **Tesseract OCR** for optical character recognition. **Completely free — no API key, no paid service required.**

***

## How It Works

1. Upload your `.xlsx` file containing 7-digit bond numbers
2. Upload a prize bond image (PNG, JPG, JPEG, WebP) or PDF
3. Poppler renders the image; Tesseract OCR extracts all numbers from it
4. The app compares both lists and shows **matched** and **missing** numbers instantly

***

## Prerequisites

Make sure you have the following installed before proceeding:

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)
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

```bash
node -v
npm -v
pdftoppm -v       # Poppler
tesseract --version
```

***

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name
```

### 2. Install dependencies

```bash
npm install
```

This installs all required packages including:

| Package               | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `next`                | React framework                              |
| `react` + `react-dom` | UI layer                                     |
| `xlsx`                | Parse `.xlsx` Excel files                    |
| `tailwindcss`         | Utility-first CSS styling                    |
| `node-poppler`        | Node.js wrapper for Poppler PDF utilities    |
| `node-tesseract.js`   | Node.js wrapper for Tesseract OCR            |

***

## Running the Project

### Development mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.  
The page auto-updates whenever you edit any file.

### Production build

```bash
npm run build
npm start
```

***

## Project Structure

```
ocr-app/
├── app/
│   ├── page.tsx              ← Main UI (upload + compare logic)
│   ├── layout.tsx            ← Root layout + font wiring
│   └── globals.css           ← Tailwind base styles
├── pages/
│   └── api/
│       └── ocr.ts            ← API route: Poppler + Tesseract OCR pipeline
├── public/                   ← Static assets
├── package.json
├── tailwind.config.ts        ← Tailwind design tokens
└── next.config.ts
```

> OCR runs **server-side** via the `/api/ocr` route using Poppler and Tesseract — no third-party OCR service is needed.

***

## Usage

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

### Step 2 — Prepare your prize bond image or PDF

- Supported image formats: **PNG, JPG, JPEG, WebP**
- PDF files are supported — Poppler converts pages to images before OCR
- Higher resolution images produce better OCR results
- Bengali numerals (০১২৩৪৫৬৭৮৯) are automatically converted to English digits

### Step 3 — Run the comparison

1. Click **Choose File** under *Excel File* and select your `.xlsx`
2. Wait for the confirmation: *"✓ X numbers loaded"*
3. Click **Choose File** under *Prize Bond Image* and select your image or PDF
4. Wait for OCR to finish — *"⏳ Running OCR..."*
5. Results appear automatically — **Matched** (green) and **Not Found** (red)

***

## Deploying to a VPS or Server

Since this app requires Poppler and Tesseract installed on the server, serverless platforms like Vercel are **not recommended** unless you use a custom Docker image.

### Option A — Deploy on a VPS (e.g., Ubuntu)

1. Install Node.js, Poppler, and Tesseract on your server (see Prerequisites above)
2. Clone and build the project:

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
npm run build
npm start
```

Your app will be live on port `3000` by default. Pair with **Nginx** as a reverse proxy for production.

### Option B — Deploy with Docker

Create a `Dockerfile` that installs both system dependencies and Node packages:

```dockerfile
FROM node:18-slim

RUN apt-get update && apt-get install -y \
    poppler-utils \
    tesseract-ocr \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t prize-bond-checker .
docker run -p 3000:3000 prize-bond-checker
```

***

## Troubleshooting

| Problem                                          | Solution                                                                                        |
| ------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `tesseract: command not found`                   | Ensure Tesseract is installed and added to your system `PATH`                                   |
| `pdftoppm: command not found`                    | Ensure Poppler utilities are installed and available in `PATH`                                  |
| OCR returns empty or garbled text                | Use a higher resolution image; ensure numbers are clearly visible and not skewed                |
| Poor accuracy on Bengali numerals                | Install the Bengali language pack: `sudo apt-get install tesseract-ocr-ben`                     |
| Excel numbers not detected                       | Make sure bond numbers are plain text cells, not formatted as currency or date                  |
| `Cannot find module 'xlsx'`                      | Run `npm install` again                                                                         |
| Port 3000 already in use                         | Run `npm run dev -- -p 3001` to use port 3001                                                   |
| Docker OCR fails                                 | Confirm the `Dockerfile` installs `poppler-utils` and `tesseract-ocr` before the `COPY` steps  |

***

## Tech Stack

| Layer          | Technology                                            |
| -------------- | ----------------------------------------------------- |
| Framework      | Next.js 14 (App Router)                               |
| Language       | TypeScript                                            |
| Styling        | Tailwind CSS                                          |
| Excel parsing  | SheetJS (`xlsx`)                                      |
| PDF rendering  | Poppler (`poppler-utils` / `node-poppler`)            |
| OCR engine     | Tesseract OCR (`tesseract-ocr` / `node-tesseract.js`) |
| Deployment     | VPS or Docker (self-hosted)                           |

***

## License

MIT
