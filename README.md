# 🚀 iLoveSwap - Smart PDF Section Bifurcator & Tag Editor

> **Like iLovePDF for students!** Automatically bifurcates PDF lab manuals and reports into semantic sections, extracts student identity labels (Name, Roll No, Batch, Division, PRN), allows instant in-place modifications, and exports to modified **PDF** or **Microsoft Word (.docx)** with custom renaming!

---

## ✨ Key Features

1. **📄 iLovePDF-Inspired Interface**
   - Clean drag-and-drop file upload zone.
   - 1-click **"Try Sample Lab Manual"** button preloaded with the Shah & Anchor Engineering College lab manual featuring *Tejas S. Kamble* (Roll 28).

2. **🏷️ Primary Student Identity Section (Bifurcated)**
   - Automatically isolates personal labels from the document:
     - **Name:** (e.g. `TEJAS S. KAMBLE`)
     - **Roll No:** (e.g. `28`)
     - **Batch:** (e.g. `B1`)
     - **Division / Class:** (e.g. `SYECS2`)
     - **PRN / SAP ID**
     - **Experiment Title**
   - **1-Click Preset:** "Apply 'Ranjeet Epili' Preset" instantly updates `Name: ranjeet epili`, `Roll No: 12`, `Batch: B1`, `Division: SYECS2`.
   - **Profile Memory:** Save your profile once to `localStorage` and auto-fill any lab manual in the future with 1 click.
   - **🎉 Yuppy !! Feedback:** Instant celebratory confetti and visual diff summary when changes are applied.

3. **📑 Section-by-Section Chunker & Navigator**
   - **Header & Institute:** College name, trust, accreditation, and department.
   - **Experiment & Aim:** Experiment number and title.
   - **Problem Statements:** Questions (e.g. Problem N0-1, N0-2, N0-3, For Q1...).
   - **Code Chunks:** MATLAB / Python / C++ code blocks with monospace font.
   - **Outputs & Plots:** Plot titles and graph references.
   - **Conclusion:** "Conclusion: Successfully Executed" and remarks.
   - **Universal Find & Replace:** Replace any other text throughout the document.

4. **👀 Live High-Definition PDF Preview**
   - Interactive canvas preview of Page 1 to Page 6.
   - Hovering over any field in the editor highlights its exact location on the PDF page.
   - Live visual overlays showing updated text in place.

5. **💾 Flexible Export & Smart Renaming**
   - **Smart Renaming:** Rename your output file with dynamic presets:
     - `[Exp]_[Roll]_[Name].pdf` ➔ `Exp1_Roll12_ranjeet_epili.pdf`
     - `[Name]_[Roll]_[Div].pdf`
     - Custom user input.
   - **Download as Modified PDF:** Pixel-perfect text replacement preserving all original graphics, MATLAB plots, and pages.
   - **Download as Word (.docx):** Clean Microsoft Word document with headings, student info box/table, shaded code blocks, and conclusion.

---

## 🧩 How to Load as a Chrome Extension

1. Open your browser (Google Chrome, Brave, or Microsoft Edge).
2. Navigate to:
   ```
   chrome://extensions
   ```
3. Enable **Developer mode** (toggle in the top-right corner).
4. Click **Load unpacked** (button in top-left).
5. Select the `dist` directory inside this project:
   ```
   /Users/ranjeetepili8022007/Documents/EaseWay/dist
   ```
6. **Done!** The **iLoveSwap** icon will appear in your browser extensions toolbar. Click it to open the quick popup or the full-screen editor!

---

## 💻 How to Run Locally (Web App)

```bash
# In this directory:
npm run dev
# Or preview the production build:
npm run preview
```
Then open [http://localhost:5173](http://localhost:5173) in your browser!

---

## 📁 Project Structure

```
iLoveSwap/
├── dist/                     # Extension build output (ready to load in Chrome)
│   ├── manifest.json         # Chrome Extension Manifest V3
│   ├── index.html            # Full-page web app / extension dashboard
│   ├── popup.html            # Quick toolbar popup
│   ├── icons/                # 16x16, 48x48, 128x128 icons
│   └── sample_lab_manual.pdf # Multi-page sample PDF
├── src/
│   ├── components/
│   │   ├── Navbar.jsx               # Header & brand
│   │   ├── DropZone.jsx             # iLovePDF style dropzone
│   │   ├── PersonalTagsEditor.jsx   # Primary student identity editor
│   │   ├── SectionList.jsx          # Bifurcated sections navigator
│   │   ├── PdfViewer.jsx            # Live canvas renderer & overlays
│   │   ├── ExportBar.jsx            # Renaming & PDF/DOCX export bar
│   │   ├── YuppyCelebration.jsx     # Celebratory feedback toast
│   │   └── ExtensionGuideModal.jsx  # Chrome install instructions
│   ├── utils/
│   │   ├── pdfParser.js             # Semantic section chunking & tag detector
│   │   ├── pdfModifier.js           # Precision pdf-lib text replacement engine
│   │   └── docxExporter.js          # Microsoft Word (.docx) generator
│   ├── App.jsx                      # Main app state & logic
│   └── popup.jsx                    # Extension popup app
├── manifest.json             # Manifest V3
└── package.json
```
