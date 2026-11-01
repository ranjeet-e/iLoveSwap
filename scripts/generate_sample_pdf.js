import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

async function generateSamplePDF() {
  const doc = await PDFDocument.create();
  const timesRoman = await doc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const courier = await doc.embedFont(StandardFonts.Courier);
  const helvetica = await doc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

  // Helper to add standard page
  const pageWidth = 595.28; // A4 standard pt
  const pageHeight = 841.89;

  // PAGE 1: Title, Header, Student Identity details, Problem statements, Code snippet
  const page1 = doc.addPage([pageWidth, pageHeight]);
  
  // Header
  let y = pageHeight - 50;
  page1.drawText("Mahavir Education Trust's", {
    x: 210,
    y: y,
    size: 10,
    font: timesRoman,
    color: rgb(0.2, 0.2, 0.2),
  });

  y -= 18;
  page1.drawText("Shah & Anchor Kutchhi Engineering College", {
    x: 145,
    y: y,
    size: 15,
    font: helveticaBold,
    color: rgb(0.12, 0.23, 0.45),
  });

  y -= 14;
  page1.drawText("Autonomous Institute Affiliated to University of Mumbai", {
    x: 180,
    y: y,
    size: 8.5,
    font: timesRoman,
    color: rgb(0.3, 0.3, 0.3),
  });

  y -= 12;
  page1.drawText("Bestowed with the University of Mumbai's Best College Honor A.Y. 2024-25", {
    x: 155,
    y: y,
    size: 8,
    font: timesRoman,
    color: rgb(0.3, 0.3, 0.3),
  });

  y -= 12;
  page1.drawText("www.sakec.ac.in", {
    x: 250,
    y: y,
    size: 8,
    font: timesRoman,
    color: rgb(0.1, 0.3, 0.7),
  });

  y -= 25;
  page1.drawText("DEPARTMENT OF ELECTRONICS AND COMPUTER SCIENCE", {
    x: 150,
    y: y,
    size: 10,
    font: helveticaBold,
    color: rgb(0.1, 0.1, 0.1),
  });

  // Big Title
  y -= 50;
  page1.drawText("Experiment No. – 1", {
    x: 200,
    y: y,
    size: 20,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  // underline
  page1.drawLine({
    start: { x: 200, y: y - 2 },
    end: { x: 395, y: y - 2 },
    thickness: 1.5,
    color: rgb(0, 0, 0),
  });

  y -= 25;
  page1.drawText("Laplace transform of time-domainfunctions", {
    x: 155,
    y: y,
    size: 14,
    font: timesRoman,
    color: rgb(0.1, 0.1, 0.1),
  });

  // STUDENT DETAILS (The key highlight!)
  y -= 45;
  page1.drawText("Name: TEJAS S. KAMBLE", {
    x: 70,
    y: y,
    size: 13,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  y -= 18;
  page1.drawText("Roll No: 28", {
    x: 70,
    y: y,
    size: 13,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  y -= 18;
  page1.drawText("Batch: B1", {
    x: 70,
    y: y,
    size: 13,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  y -= 18;
  page1.drawText("Division: SYECS2", {
    x: 70,
    y: y,
    size: 13,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  // Subheader
  y -= 45;
  page1.drawText("Experiment No-1", {
    x: 170,
    y: y,
    size: 13,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  page1.drawLine({
    start: { x: 170, y: y - 2 },
    end: { x: 275, y: y - 2 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  y -= 20;
  page1.drawText("Laplace transform of time-domain functions", {
    x: 140,
    y: y,
    size: 11,
    font: timesRoman,
    color: rgb(0.2, 0.2, 0.2),
  });

  // Problems
  y -= 30;
  page1.drawText("Problem N0-1: Determine Laplace Transform of  f(t) = t^2", {
    x: 90,
    y: y,
    size: 10.5,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  y -= 22;
  page1.drawText("Problem N0-2: Determine Laplace Transform of  f(t) = t^3 + 2t + 1", {
    x: 90,
    y: y,
    size: 10.5,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  y -= 22;
  page1.drawText("Problem N0-3: Determine Laplace Transform of  f(t) = e^t cos2t", {
    x: 90,
    y: y,
    size: 10.5,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  // Reference Code
  y -= 70;
  page1.drawText("Reference Code:", {
    x: 70,
    y: y,
    size: 11,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });

  const refCode = [
    "syms t s",
    "f = exp(-t)*cos(2*t);",
    "F = laplace(f,t,s);",
    "disp('Laplace Transform:')",
    "disp(F)",
    "fplot(f,[0 10])",
    "grid on",
    "xlabel('t')",
    "ylabel('f(t)')",
    "title('Time Domain Function')",
  ];

  y -= 20;
  for (const line of refCode) {
    page1.drawText(line, {
      x: 70,
      y: y,
      size: 9.5,
      font: timesRoman,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= 14;
  }

  // Helper function to draw code & plot page
  const addCodePage = (titleHeader, codeLines, plotLabel) => {
    const page = doc.addPage([pageWidth, pageHeight]);
    let py = pageHeight - 60;
    
    page.drawText(titleHeader, {
      x: 70,
      y: py,
      size: 14,
      font: timesRomanBold,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: 70, y: py - 2 },
      end: { x: 70 + titleHeader.length * 8, y: py - 2 },
      thickness: 1.2,
      color: rgb(0, 0, 0),
    });

    py -= 30;
    page.drawText("Code :", {
      x: 70,
      y: py,
      size: 12,
      font: timesRomanBold,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: 70, y: py - 2 },
      end: { x: 110, y: py - 2 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    py -= 22;
    for (const cline of codeLines) {
      page.drawText(cline, {
        x: 70,
        y: py,
        size: 10,
        font: timesRoman,
        color: rgb(0, 0, 0),
      });
      py -= 16;
    }

    py -= 35;
    page.drawText("Output :", {
      x: 70,
      y: py,
      size: 12,
      font: timesRomanBold,
      color: rgb(0, 0, 0),
    });
    page.drawLine({
      start: { x: 70, y: py - 2 },
      end: { x: 120, y: py - 2 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });

    // Draw a simulated MATLAB plot box
    py -= 250;
    page.drawRectangle({
      x: 70,
      y: py,
      width: 450,
      height: 220,
      borderColor: rgb(0.7, 0.7, 0.7),
      borderWidth: 1,
      color: rgb(0.97, 0.98, 0.99),
    });

    // MATLAB window bar
    page.drawRectangle({
      x: 70,
      y: py + 195,
      width: 450,
      height: 25,
      color: rgb(0.9, 0.92, 0.95),
    });
    page.drawText("MATLAB R2024a - Live Editor Plot [" + plotLabel + "]", {
      x: 80,
      y: py + 203,
      size: 9,
      font: helvetica,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Inner plot frame
    page.drawRectangle({
      x: 230,
      y: py + 20,
      width: 250,
      height: 150,
      borderColor: rgb(0.2, 0.2, 0.2),
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });
    page.drawText(plotLabel, {
      x: 270,
      y: py + 155,
      size: 8.5,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    // Simulated curve lines
    page.drawLine({
      start: { x: 235, y: py + 25 },
      end: { x: 470, y: py + 130 },
      thickness: 1.5,
      color: rgb(0, 0.4, 0.8),
    });

    // Output formula text
    page.drawText("Laplace Transform:", {
      x: 100,
      y: py + 140,
      size: 9,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });
    page.drawText("F(s) evaluated successfully", {
      x: 100,
      y: py + 120,
      size: 8.5,
      font: courier,
      color: rgb(0.1, 0.5, 0.2),
    });

    return page;
  };

  // PAGE 2: Program Code & Reference Code
  addCodePage(
    "Program Code:",
    [
      "Reference Code:",
      "syms t s",
      "f = exp(-t)*cos(2*t);",
      "F = laplace(f,t,s);",
      "disp('Laplace Transform:');",
      "disp(F)",
      "fplot(f,[0 10])",
      "grid on",
      "xlabel('t')",
      "ylabel('f(t)')",
      "title('Time Domain Function')",
    ],
    "Time Domain Function"
  );

  // PAGE 3: For Q1
  addCodePage(
    "For Q1",
    [
      "clc;",
      "clear;",
      "syms t",
      "f = t^2;",
      "F = laplace(f,t);",
      "disp('Laplace Transform:');",
      "disp(F)",
      "fplot(f,[0 10])",
      "grid on",
      "xlabel('t')",
      "ylabel('f(t)')",
      "title('Time Domain Function: f(t) = t^2')",
    ],
    "Time Domain Function: f(t) = t^2"
  );

  // PAGE 4: For Q2
  addCodePage(
    "For Q2",
    [
      "clc;",
      "clear;",
      "syms t",
      "f = t^3 + 2*t + 1;",
      "F = laplace(f,t);",
      "disp('Laplace Transform:');",
      "disp(F)",
      "fplot(f,[0 10])",
      "grid on",
      "xlabel('t')",
      "ylabel('f(t)')",
      "title('Time Domain Function: f(t) = t^3 + 2t + 1')",
    ],
    "Time Domain Function: f(t) = t^3 + 2t + 1"
  );

  // PAGE 5: For Q3
  addCodePage(
    "For Q3",
    [
      "clc;",
      "clear;",
      "syms t",
      "f = exp(t)*cos(2*t);",
      "F = laplace(f,t);",
      "disp('Laplace Transform:');",
      "disp(F)",
      "fplot(f,[0 10])",
      "grid on",
      "xlabel('t')",
      "ylabel('f(t)')",
      "title('Time Domain Function: f(t) = e^t cos(2t)')",
    ],
    "Time Domain Function: f(t) = e^t cos(2t)"
  );

  // PAGE 6: Conclusion
  const page6 = doc.addPage([pageWidth, pageHeight]);
  page6.drawText("Conclusion: Successfully Executed", {
    x: 70,
    y: pageHeight - 80,
    size: 13,
    font: timesRomanBold,
    color: rgb(0, 0, 0),
  });
  page6.drawLine({
    start: { x: 70, y: pageHeight - 82 },
    end: { x: 145, y: pageHeight - 82 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await doc.save();
  const outPath = path.resolve('public', 'sample_lab_manual.pdf');
  fs.writeFileSync(outPath, pdfBytes);
  console.log('Sample PDF generated at:', outPath, 'Bytes:', pdfBytes.length);
}

generateSamplePDF().catch(console.error);
