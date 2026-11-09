# iLoveSwap - Academic Document Standardization & Formatting Utility

> **Created with precision by [Ranjeet Epili](https://github.com/ranjeet-e)**  
> *A privacy-first, client-side academic document formatter and template standardization tool.*

---

## 🎯 Purpose & Ethical Mission

In academic institutions and universities, students, lab assistants, and instructors frequently manage dozens of laboratory reports, assignments, and practical manuals every semester. These submissions demand strict adherence to departmental cover formats, batch classifications, and identification headers.

Traditionally, making necessary administrative updates—such as correcting typographical errors in roll numbers, aligning division tags, or adjusting academic year headers—required cumbersome re-typing or third-party web tools that frequently distort MATLAB plots, mathematical equations, and code formatting.

**iLoveSwap was engineered by Ranjeet Epili to solve this administrative challenge ethically and securely:**

1. **Academic Template Standardization**: Enables students and educators to maintain uniform, professional departmental report templates across batches and courses without altering or corrupting original scientific findings, code blocks, or graphs.
2. **Administrative Correction & Accuracy**: Allows instant correction of personal academic identifiers (Student Name, Roll Number, Batch, Division, and PRN/SAP ID) across batches of documents, ensuring accurate record-keeping and grade attribution.
3. **Privacy & Security by Design (Zero-Knowledge Architecture)**: Unlike commercial online converters that upload private academic reports to external servers, **iLoveSwap operates 100% locally in the client browser**. No documents, personal data, or coursework ever leave the user's device or touch an external server.
4. **Preservation of Educational Content**: Uses lossless XML and PDF manipulation engines to ensure program code blocks, circuit schematics, vector graphs, and output results remain untouched during header and identification updates.

---

## 🛡️ Academic Integrity Statement

iLoveSwap is designed exclusively as an assistive administrative and formatting utility:
- It is intended to help students, teaching assistants, and educators streamline document preparation, standardize lab manual templates, and correct personal administrative details on their own authorized submissions.
- It promotes organized documentation, consistent academic presentation, and data privacy.
- Users are expected to employ this software in accordance with their respective educational institution's academic integrity policies and guidelines.

---

## 🏛️ Architecture & Directory Overview

```
EaseWay/
├── public/                       # Static assets bundled into dist/
│   ├── icons/                    # Chrome Extension icons (16px, 48px, 128px)
│   ├── icon.svg                  # Vector SVG application logo
│   └── manifest.json             # Chrome Extension Manifest V3 configuration
├── src/
│   ├── components/                # Modular UI components
│   │   ├── DocumentTabs.jsx       # Multi-document tabs (PDF / Word) with batch apply
│   │   ├── DropZone.jsx           # Drag-and-drop file upload interface
│   │   ├── ExportBar.jsx          # Floating export toolbar with dynamic file renaming
│   │   ├── ExtensionGuideModal.jsx# Setup instructions for Chromium browsers
│   │   ├── FixedIdentityModal.jsx # Saved student profile modal for automated auto-fill
│   │   ├── Navbar.jsx             # Top application header with author credit
│   │   ├── NotificationToast.jsx  # Real-time modification confirmation toast
│   │   ├── PdfViewer.jsx          # Interactive PDF canvas viewer with Word-mode editing
│   │   ├── PersonalTagsEditor.jsx # Student identity tags editor with remove/restore
│   │   └── SectionList.jsx        # Bifurcated section accordion & find-and-replace
│   ├── utils/                     # Core processing engines
│   │   ├── docxExporter.js        # Generates structured Microsoft Word (.docx) files
│   │   ├── docxParser.js          # Word (.docx) parser & lossless XML modifier
│   │   ├── identityHelper.js      # Identity mapping & composite field handlers
│   │   ├── pdfModifier.js         # PDF text replacement & whiteout masking engine
│   │   ├── pdfParser.js           # Semantic section chunking & tag detector
│   │   └── pdfSetup.js            # PDF.js worker, memory cloner & WinAnsi sanitizer
│   ├── App.jsx                    # Central state management & document orchestration
│   ├── index.css                  # Tailwind CSS styles & custom scrollbars
│   ├── main.jsx                   # Web application entry point
│   └── popup.jsx                  # Chrome Extension popup entry point
├── dist/                          # Production build output (ready for web & extension)
├── index.html                     # Web application HTML template
├── popup.html                     # Chrome extension popup HTML template
├── netlify.toml                   # Netlify deployment configuration
├── vercel.json                    # Vercel deployment configuration
├── vite.config.js                 # Multi-page bundler configuration
└── package.json                   # Dependencies and build scripts
```

---

## ⚡ Core Capabilities

- **Multi-Document Batch Processing**: Load multiple PDF or Word (`.docx`) lab manuals simultaneously and apply student details across all files in a single click.
- **Semantic Section Bifurcation**: Automatically isolates institution headers, experiment titles, student metadata, problem questions, code snippets, outputs, and conclusions.
- **Direct Canvas Editing ("Word Mode")**: Click directly on any text on the live rendered page to edit phrasing or erase lines with clean whiteout masking.
- **Lossless Word Document Modification**: Directly parses and updates `word/document.xml` using `JSZip`, preserving 100% of original tables, fonts, margins, and embedded diagrams.
- **WinAnsi Symbol Normalization**: Built-in sanitization for Indian Rupee (`₹`), mathematical operators, Greek symbols, and curly quotes, preventing PDF generation encoding errors.
- **Flexible Academic Export**: Export individual corrected documents as PDF or Word, or download a consolidated `.zip` archive formatted with standard university naming conventions (`[Exp]_[Roll]_[Name].pdf`).

---

## 💻 Local Development

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### Setup & Run
```bash
# Clone the repository
git clone https://github.com/ranjeet-e/iLoveSwap.git
cd iLoveSwap

# Install dependencies
npm install

# Start the local development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Production Build

```bash
# Create production build in dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Production Deployment Guide

### Option 1: Cloudflare Pages (Recommended for High Traffic & Campus Networks)
Cloudflare Pages provides unlimited bandwidth, zero edge request quota caps, and global DDoS mitigation.
1. Connect your repository on the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages**.
2. Set the build parameters:
   - **Framework Preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Single-page application routing is automatically handled via `public/_redirects`.

### Option 2: GitHub Pages
Deploy directly using the built-in deployment script:
```bash
npm run deploy
```
Live at: `https://ranjeet-e.github.io/iLoveSwap/`

### Option 3: Vercel (Static Pure Frontend)
1. Import repository at [vercel.com/new](https://vercel.com/new) with the `Vite` preset.
2. `vercel.json` is configured purely for static assets with zero backend proxy rewrites, preventing edge quota depletion.

---

## 🧩 Running as a Chrome Extension

1. Run `npm run build` to generate the production bundle in `dist/`.
2. Open Google Chrome (or any Chromium browser like Brave, Edge, or Opera).
3. Navigate to `chrome://extensions/`.
4. Enable **Developer mode** via the top-right toggle.
5. Click **Load unpacked** and select the `dist/` directory.
6. The **iLoveSwap** extension icon will appear in your browser toolbar.

---

## 👤 Author & Maintainer

**Ranjeet Epili**
- GitHub: [@ranjeet-e](https://github.com/ranjeet-e)
- Project: [iLoveSwap Repository](https://github.com/ranjeet-e/iLoveSwap)

---

## 📄 License

ISC License. Distributed for legitimate educational and administrative productivity use.
