import JSZip from 'jszip';
import { saveAs } from 'file-saver';

/**
 * Packages and downloads the Chrome Extension package as a .zip archive
 */
export async function downloadExtensionZip() {
  const zip = new JSZip();

  // 1. Fetch manifest.json
  let manifestText = '';
  try {
    const res = await fetch('./manifest.json');
    if (res.ok) {
      manifestText = await res.text();
    }
  } catch (e) {}

  if (!manifestText) {
    manifestText = JSON.stringify(
      {
        manifest_version: 3,
        name: "iLoveSwap - Document Editor & Section Bifurcator",
        version: "1.0.0",
        description: "Bifurcate PDF/Word sections, edit text in-place, and export clean documents.",
        action: {
          default_popup: "popup.html",
          default_title: "iLoveSwap Quick Editor",
          default_icon: {
            "16": "icons/icon16.png",
            "48": "icons/icon48.png",
            "128": "icons/icon128.png"
          }
        },
        icons: {
          "16": "icons/icon16.png",
          "48": "icons/icon48.png",
          "128": "icons/icon128.png"
        },
        permissions: ["storage"],
        content_security_policy: {
          extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
        }
      },
      null,
      2
    );
  }
  zip.file('manifest.json', manifestText);

  // 2. Fetch popup.html
  try {
    const res = await fetch('./popup.html');
    if (res.ok) {
      zip.file('popup.html', await res.text());
    }
  } catch (e) {}

  // 3. Fetch index.html
  try {
    const res = await fetch('./index.html');
    if (res.ok) {
      zip.file('index.html', await res.text());
    }
  } catch (e) {}

  // 4. Fetch icon.svg
  try {
    const res = await fetch('./icon.svg');
    if (res.ok) {
      zip.file('icon.svg', await res.text());
    }
  } catch (e) {}

  // 5. Add clear installation guide
  zip.file(
    'HOW_TO_INSTALL.txt',
    `iLoveSwap - Chrome Extension Installation Guide
===============================================

1. Extract this entire ZIP file into a folder on your computer.
2. Open Google Chrome (or any Chromium browser like Brave, Edge, Opera).
3. In the address bar, go to:
   chrome://extensions
4. In the top-right corner, turn ON the "Developer mode" toggle.
5. In the top-left corner, click the "Load unpacked" button.
6. Select the folder where you extracted this ZIP.
7. Done! The iLoveSwap icon will now appear in your browser toolbar.
`
  );

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'iLoveSwap-Chrome-Extension.zip');
}
