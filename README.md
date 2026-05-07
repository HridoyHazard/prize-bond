# Prize Bond Checker

A responsive web application that compares 7-digit numbers from an Excel file against a prize bond image using Mistral OCR via Puter.js. **Completely free — no API key, no backend, no credit card required.**

---

## How It Works

1. Upload your `.xlsx` file containing 7-digit bond numbers
2. Upload a prize bond image (PNG, JPG, JPEG, WebP)
3. Mistral OCR (via Puter.js) extracts all numbers from the image
4. The app compares both lists and shows **matched** and **missing** numbers instantly

---

## Prerequisites

Make sure you have the following installed before proceeding:

- **Node.js** v18 or higher — [Download](https://nodejs.org)
- **npm** v9 or higher (comes with Node.js)

To verify your versions:

```bash
node -v
npm -v
```

---

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

### Step 2 — Prepare your prize bond image

- Supported formats: **PNG, JPG, JPEG, WebP**
- Higher resolution images produce better OCR results
- Bengali numerals (০১২৩৪৫৬৭৮৯) are automatically converted to English digits

### Step 3 — Run the comparison

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

## License

MIT
