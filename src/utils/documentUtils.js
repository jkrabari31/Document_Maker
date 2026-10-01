// Utility functions for variable extraction, template rendering, and file export

/**
 * Extracts all unique placeholder variables from text formatted as {{variable_name}}
 * Returns an array of variable names without {{ }}
 */
export function extractVariables(content) {
  if (!content) return [];
  const regex = /\{\{([^}]+)\}\}/g;
  const matches = new Set();
  let match;
  while ((match = regex.exec(content)) !== null) {
    const varName = match[1].trim();
    if (varName) {
      matches.add(varName);
    }
  }
  return Array.from(matches);
}

/**
 * Replaces all {{variable}} placeholders with the provided values.
 * If a variable has no value yet, returns a placeholder or empty string.
 */
export function renderDocument(content, values = {}, highlightEmpty = false) {
  if (!content) return "";
  let rendered = content.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
    const key = varName.trim();
    const val = values[key];
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      return val;
    }
    if (highlightEmpty) {
      return `<mark class="empty-placeholder" title="આ વિગત ભરવાની બાકી છે">[ ${key.replace(/_/g, " ")} ]</mark>`;
    }
    return `[ ${key.replace(/_/g, " ")} ]`;
  });

  // Convert Header tags into formatted legal header box
  rendered = rendered.replace(
    /::HEADER_START::([\s\S]*?)::HEADER_END::/g,
    '<div class="doc-header-box">$1</div>'
  );

  // Convert Verification Block into formatted legal verification box
  rendered = rendered.replace(
    /::VERIFICATION_BLOCK::([\s\S]*)/g,
    '<div class="doc-verification-box"><div style="font-weight:700; margin-bottom: 8pt; border-bottom: 1px dashed #94a3b8; padding-bottom: 4pt; color: #1e293b;">⚖️ સત્યતા અને નોટરી ખરાઈ (LEGAL VERIFICATION & NOTARIZATION)</div>$1</div>'
  );

  return rendered;
}

/**
 * Clean up header markers for standard clean preview or print
 */
export function cleanDocumentForExport(renderedText) {
  if (!renderedText) return "";
  return renderedText
    .replace(/::HEADER_START::/g, "")
    .replace(/::HEADER_END::/g, "")
    .replace(/::VERIFICATION_BLOCK::/g, "\n\n--- સત્યતા અને નોટરી ખરાઈ (VERIFICATION) ---\n");
}

/**
 * Export rendered document to Microsoft Word (.doc) format with Gujarati UTF-8 support
 */
export function exportToWord(filename, documentTitle, htmlContent) {
  const header = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
<meta charset='utf-8'>
<title>${documentTitle || "દસ્તાવેજ"}</title>
<style>
  body {
    font-family: 'Noto Sans Gujarati', 'Shruti', 'Gujarati', 'Times New Roman', serif;
    font-size: 13pt;
    line-height: 1.6;
    color: #111;
    margin: 1.5in 1in 1in 1in;
  }
  h1, h2, h3 {
    text-align: center;
    font-weight: bold;
    margin-bottom: 16pt;
  }
  p {
    margin-bottom: 12pt;
    text-align: justify;
  }
  .verification-block {
    margin-top: 30pt;
    border-top: 1px solid #777;
    padding-top: 15pt;
  }
</style>
</head>
<body>
${htmlContent}
</body>
</html>`;

  const blob = new Blob(["\ufeff", header], {
    type: "application/msword;charset=utf-8"
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename || "document"}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Save / Load helpers for LocalStorage
 */
const STORAGE_KEY_TEMPLATES = "dastavej_master_templates_v1";
const STORAGE_KEY_RECORDS = "dastavej_master_records_v1";
const STORAGE_KEY_SETTINGS = "dastavej_master_settings_v1";

export function loadSavedTemplates(initialTemplates) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TEMPLATES);
    if (!raw) return initialTemplates;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialTemplates;
  } catch (e) {
    console.error("Failed to load templates from localStorage", e);
    return initialTemplates;
  }
}

export function saveTemplatesToStorage(templates) {
  try {
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
    return true;
  } catch (e) {
    console.error("Failed to save templates to localStorage", e);
    return false;
  }
}

export function loadSavedRecords() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to load records from localStorage", e);
    return [];
  }
}

export function saveRecordToStorage(record) {
  try {
    const records = loadSavedRecords();
    const existingIndex = records.findIndex(r => r.id === record.id);
    if (existingIndex >= 0) {
      records[existingIndex] = { ...records[existingIndex], ...record, updatedAt: new Date().toISOString() };
    } else {
      records.unshift({
        ...record,
        id: record.id || "rec-" + Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    return true;
  } catch (e) {
    console.error("Failed to save record to storage", e);
    return false;
  }
}

export function deleteRecordFromStorage(recordId) {
  try {
    const records = loadSavedRecords();
    const filtered = records.filter(r => r.id !== recordId);
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error("Failed to delete record", e);
    return [];
  }
}

export function loadUserSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (!raw) return {
      advocateName: "",
      officeAddress: "",
      barRegNumber: "",
      phone: "",
      defaultLanguage: "ગુજરાતી",
      printMarginTopMm: 110,
      stampPaperMode: false
    };
    return JSON.parse(raw);
  } catch (e) {
    return {
      advocateName: "",
      officeAddress: "",
      barRegNumber: "",
      phone: "",
      defaultLanguage: "ગુજરાતી",
      printMarginTopMm: 110,
      stampPaperMode: false
    };
  }
}

export function saveUserSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    return true;
  } catch (e) {
    return false;
  }
}

const STORAGE_KEY_PAGE_SETUP = "dastavej_master_pagesetup_v1";

export function loadPageSetup() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PAGE_SETUP);
    if (!raw) return {
      paperSize: "A4",
      paperWidthMm: 210,
      paperHeightMm: 297,
      lineHeight: 1.7,
      paragraphSpacing: 16,
      marginTop: 25,
      marginBottom: 25,
      marginLeft: 28,
      marginRight: 20,
      showPageNumbers: true,
      viewMode: "pages" // 'pages' (Real Multi-Sheet) | 'continuous'
    };
    return JSON.parse(raw);
  } catch (e) {
    return {
      paperSize: "A4",
      paperWidthMm: 210,
      paperHeightMm: 297,
      lineHeight: 1.7,
      paragraphSpacing: 16,
      marginTop: 25,
      marginBottom: 25,
      marginLeft: 28,
      marginRight: 20,
      showPageNumbers: true,
      viewMode: "pages"
    };
  }
}

export function savePageSetup(setup) {
  try {
    localStorage.setItem(STORAGE_KEY_PAGE_SETUP, JSON.stringify(setup));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Splits document HTML into distinct pages for multi-page real print sheet view
 */
export function splitContentIntoPages(renderedHtml) {
  if (!renderedHtml) return [""];

  // 1. Explicit user page breaks
  if (renderedHtml.includes("---PAGE_BREAK---") || renderedHtml.includes("::PAGE_BREAK::")) {
    const rawParts = renderedHtml.split(/---PAGE_BREAK---|::PAGE_BREAK::/g);
    return rawParts.map(p => p.trim()).filter(Boolean);
  }

  // 2. If it contains verification box and is a multi-page document
  if (renderedHtml.includes('class="doc-verification-box"')) {
    const splitIndex = renderedHtml.indexOf('<div class="doc-verification-box"');
    const page1 = renderedHtml.substring(0, splitIndex).trim();
    const page2 = renderedHtml.substring(splitIndex).trim();
    if (page1 && page2) {
      return [page1, page2];
    }
  }

  // 3. Otherwise return as single continuous page
  return [renderedHtml];
}
