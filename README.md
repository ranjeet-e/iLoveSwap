# iLoveSwap - Smart Document Section Bifurcator & Identity Editor

A high-performance web application and Chrome Extension designed for academic reports, lab manuals, and assignments. Automatically parses PDF and Microsoft Word (`.docx`) documents into semantic sections, isolates student identity tags (Name, Roll No, Batch, Division, PRN), enables direct on-page editing or line removal, and exports to customized PDF, Word, or ZIP packages.

---

## Architecture & Directory Structure

```
EaseWay/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Automated GitHub Actions deployment to GitHub Pages
├── public/                       # Static public assets copied directly to dist/
│   ├── icons/                    # Chrome extension icons (16px, 48px, 128px)
│   ├── icon.svg                  # Vector application logo
│   └── manifest.json             # Chrome Extension Manifest V3 configuration
├── src/
│   ├── components/               # Modular UI components
│   │   ├── DocumentTabs.jsx      # Multi-document tabs (PDF / Word) with batch apply
│   │   ├── DropZone.jsx          # Drag-and-drop file upload interface
│   │   ├── ExportBar.jsx         # Floating export toolbar with dynamic file renaming
│   │   ├── ExtensionGuideModal.jsx # Visual setup guide for Chromium extensions
│   │   ├── FixedIdentityModal.jsx# Global student profile configuration
│   │   ├── Navbar.jsx            # Top application header with document stats
│   │   ├── NotificationToast.jsx # Real-time modification confirmation toast
│   │   ├── PdfViewer.jsx         # Interactive PDF canvas viewer with Word-mode editing
│   │   ├── PersonalTagsEditor.jsx# Student identity fields editor with remove/restore
│   │   └── SectionList.jsx       # Bifurcated section accordion & find-and-replace
│   ├── utils/                    # Core processing engines
│   │   ├── docxExporter.js       # Generates formatted Word (.docx) documents
│   │   ├── docxParser.js         # Word (.docx) parser & in-place XML modifier
│   │   ├── identityHelper.js     # Identity mapping & composite field handlers
│   │   ├── pdfModifier.js        # PDF text replacement & whiteout masking engine
│   │   ├── pdfParser.js          # Semantic section chunking & tag detector
│   │   └── pdfSetup.js           # PDF.js worker, memory cloner & WinAnsi sanitizer
│   ├── App.jsx                   # Central state management & document orchestration
│   ├── index.css                 # Tailwind CSS styles & custom scrollbars
│   ├── main.jsx                  # Web application entry point
│   └── popup.jsx                 # Chrome Extension popup entry point
├── dist/                         # Production build output (ready for web & extension)
├── index.html                    # Single Page Application HTML template
├── popup.html                    # Chrome extension popup HTML template
├── netlify.toml                  # Netlify deployment configuration
├── vercel.json                   # Vercel deployment configuration
├── vite.config.js                # Vite build and multi-page bundler configuration
└── package.json                  # Dependencies and execution scripts
```

---

## Core Capabilities

1. **Multi-Document Batch Processing**: Upload multiple PDF or Word (`.docx`) documents simultaneously and switch between them with document tabs.
2. **Semantic Section Bifurcation**: Automatically detects:
   - Institute & Department Headers
   - Experiment Number & Aim
   - Student Identity Tags (Name, Roll No, Batch, Division, PRN)
   - Problem Statements & Questions
   - Program Implementation & Code Blocks
   - Outputs & Plot Captions
   - Conclusions & Results
3. **Word Mode (Direct On-Page Editing & Removal)**: Click directly on any text line in the live canvas viewer to modify content or erase lines completely with clean whiteout masking.
4. **Fixed Identity Profiles**: Save your personal details once. Future uploads automatically substitute previous student credentials across all loaded documents.
5. **Lossless Word Document Editing**: Modifies `word/document.xml` directly to preserve 100% of original Word tables, styling, embedded images, and layouts.
6. **Robust WinAnsi Sanitization**: Automatically normalizes Indian Rupee symbols (`₹`), math operators, Greek letters, and smart quotes to prevent font encoding crashes in `pdf-lib`.
7. **Batch ZIP Export**: Download individual modified PDFs, Word documents, or bundle an entire batch into an organized `.zip` file with standard academic file naming.

---

## Quick Start (Local Development)

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd EaseWay

# Install dependencies
npm install

# Start the development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Production Build & Preview

```bash
# Generate production bundle in dist/
npm run build

# Preview production build locally
npm run preview
```

---

## Deployment Guide

### Deploy to GitHub Pages (Automatic)
The repository includes a ready-to-run GitHub Actions workflow (`.github/workflows/deploy.yml`).
1. Push your code to GitHub on the `main` branch.
2. In your GitHub repository, navigate to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select **GitHub Actions**.
4. The deployment workflow will trigger automatically upon every push.

### Deploy to Vercel
1. Install the Vercel CLI: `npm i -g vercel` or connect via the [Vercel Dashboard](https://vercel.com).
2. The included `vercel.json` automatically configures Vite SPA routes and static outputs.
3. Run:
```bash
vercel
```

### Deploy to Netlify
1. Connect via the [Netlify Dashboard](https://app.netlify.com) or run `netlify deploy`.
2. The included `netlify.toml` handles build commands and SPA redirect handling.

---

## Loading as a Chrome Extension

1. Build the production files:
   ```bash
   npm run build
   ```
2. Open Google Chrome (or any Chromium browser like Brave, Edge, Opera).
3. Navigate to `chrome://extensions/`.
4. Turn on the **Developer mode** toggle in the top-right corner.
5. Click **Load unpacked** in the top-left corner.
6. Select the `dist/` folder inside this project directory.
7. The **iLoveSwap** icon will appear in your browser toolbar ready to use!

---

## License
ISC
