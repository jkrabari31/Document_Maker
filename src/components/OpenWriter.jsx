import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  FileDown,
  Download,
  Printer,
  Save,
  Copy,
  Check,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Mic,
  MicOff,
  RotateCcw,
  Sparkles,
  Sliders,
  FileText,
  PlusCircle,
  Scissors,
  Minus,
  CheckCircle,
  HelpCircle,
  Eye,
  Maximize2,
  Minimize2,
  Volume2,
  FilePlus,
  Trash2,
  Plus
} from 'lucide-react';
import {
  exportToPdf,
  exportToWord,
  saveRecordToStorage,
  LEGAL_FONTS
} from '../utils/documentUtils';
import { handlePhoneticKeyDown } from '../utils/gujaratiTransliterate';
import { isSpeechSupported, createSpeechRecognizer } from '../utils/speechRecognition';
import SubscriptionGuard from './SubscriptionGuard';
import { useAuth } from '../contexts/AuthContext';

const DEFAULT_WRITER_HTML = `
  <h2 style="text-align: center; margin-bottom: 1.2rem; font-weight: 800;">|| કાનૂની દસ્તાવેજ ||</h2>
  <p style="text-align: justify; margin-bottom: 1rem;">
    અમો નીચે સહી કરનાર પક્ષકારો આથી રાજીખુશીથી, હોશહવાશમાં અને કોઈપણ જાતના દાબ-દબાણ વગર આ દસ્તાવેજ લખી આપીએ છીએ કે:
  </p>
  <p style="text-align: justify; margin-bottom: 1rem;">
    (૧) અત્રે પક્ષકાર નં. ૧ ની વિગત તથા શરતો અહીંથી સીધી ટાઇપ કરો...
  </p>
  <p style="text-align: justify; margin-bottom: 1rem;">
    (૨) સદરહુ લખાણ અમોએ વાંચી, સમજી, વિચારીને બરાબર હોવાની ખાતરી કરીને સહીઓ કરેલ છે.
  </p>
`;

export default function OpenWriter({ onBackToStudio, userSettings, onRecordSaved }) {
  const { isPremium, currentUser } = useAuth();
  
  // Document state
  const [docTitle, setDocTitle] = useState('કાનૂની દસ્તાવેજ (મુક્ત મુસદ્દો)');
  const [isPhoneticActive, setIsPhoneticActive] = useState(true);
  const [selectedFontId, setSelectedFontId] = useState('serif');
  const [fontSizePt, setFontSizePt] = useState(13);
  const [paperSize, setPaperSize] = useState('a4'); // 'a4' | 'legal'
  const [stampPaperMode, setStampPaperMode] = useState(true);
  const [stampMarginMm, setStampMarginMm] = useState(85);
  
  // Voice state
  const [voiceLang, setVoiceLang] = useState('gu-IN'); // 'gu-IN' | 'en-IN' | 'hi-IN'
  const [isListening, setIsListening] = useState(false);
  const [interimVoiceText, setInterimVoiceText] = useState('');
  
  // Interaction state
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  // Multi-page state
  const [pageList, setPageList] = useState([
    { id: 'page-1', initialHtml: DEFAULT_WRITER_HTML }
  ]);
  const [activePageIndex, setActivePageIndex] = useState(0);

  const editorRefs = useRef({});
  const speechRecognizerRef = useRef(null);
  const lastSelectionRangeRef = useRef(null);

  const activeFont = LEGAL_FONTS.find(f => f.id === selectedFontId) || LEGAL_FONTS[0];

  // Helper to obtain the active contentEditable DOM element
  const getActiveEditor = () => {
    const activeEl = document.activeElement;
    if (activeEl && activeEl.classList.contains('open-writer-editable')) {
      return activeEl;
    }
    const activePage = pageList[activePageIndex] || pageList[0];
    if (activePage && editorRefs.current[activePage.id]) {
      return editorRefs.current[activePage.id];
    }
    return document.querySelector('.open-writer-editable');
  };

  // Add new physical sheet (Page Break)
  const handleAddNewPage = () => {
    const newPageId = 'page-' + Date.now();
    setPageList(prev => [...prev, { id: newPageId, initialHtml: '<p><br></p>' }]);
    const nextIdx = pageList.length;
    setActivePageIndex(nextIdx);

    setTimeout(() => {
      const newEditor = editorRefs.current[newPageId];
      if (newEditor) {
        newEditor.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(newEditor);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        updateSelectionRange();
        newEditor.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      updateWordCount();
    }, 60);
  };

  // Delete page
  const handleDeletePage = (pageIndex, e) => {
    e?.stopPropagation?.();
    if (pageList.length <= 1) return;
    if (window.confirm(`શું તમે ખરેખર પેજ નં. ${pageIndex + 1} કાઢી નાખવા માંગો છો?`)) {
      setPageList(prev => prev.filter((_, idx) => idx !== pageIndex));
      const nextActive = Math.max(0, pageIndex - 1);
      setActivePageIndex(nextActive);
      setTimeout(updateWordCount, 60);
    }
  };

  // Track cursor position inside active editor
  const updateSelectionRange = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const activeEd = getActiveEditor();
      if (activeEd && activeEd.contains(sel.anchorNode)) {
        lastSelectionRangeRef.current = sel.getRangeAt(0).cloneRange();
      }
    }
  };

  // Update word and character counter across all active pages
  const updateWordCount = () => {
    const allEditors = document.querySelectorAll('.open-writer-editable');
    let words = 0;
    allEditors.forEach(ed => {
      const text = ed.innerText || '';
      if (text.trim()) {
        words += text.trim().split(/\s+/).length;
      }
    });
    setWordCount(words);
  };

  useEffect(() => {
    updateWordCount();
  }, []);

  // Keyboard shortcut Ctrl+G for phonetic typing and Ctrl+Enter for New Page
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        setIsPhoneticActive(prev => !prev);
      }
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleAddNewPage();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [pageList.length]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
        speechRecognizerRef.current = null;
      }
    };
  }, []);

  // Format document commands (Bold, Italic, Align, etc.)
  const executeCommand = (command, value = null) => {
    const activeEd = getActiveEditor();
    if (activeEd) {
      activeEd.focus();
      document.execCommand(command, false, value);
      updateSelectionRange();
      updateWordCount();
    }
  };

  // Instant high-performance voice text insertion
  const insertVoiceText = (text) => {
    const activeEd = getActiveEditor();
    if (!text || !activeEd) return;
    activeEd.focus();

    const sel = window.getSelection();
    if (lastSelectionRangeRef.current) {
      try {
        sel.removeAllRanges();
        sel.addRange(lastSelectionRangeRef.current);
      } catch (e) {}
    }

    const cleanText = text.trim() + ' ';
    let success = false;
    try {
      success = document.execCommand('insertText', false, cleanText);
    } catch (e) {
      success = false;
    }

    if (!success) {
      const range = sel.rangeCount > 0 ? sel.getRangeAt(0) : document.createRange();
      const node = document.createTextNode(cleanText);
      if (activeEd.contains(range.startContainer)) {
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
        lastSelectionRangeRef.current = range.cloneRange();
      } else {
        activeEd.appendChild(node);
      }
    } else if (sel.rangeCount > 0) {
      lastSelectionRangeRef.current = sel.getRangeAt(0).cloneRange();
    }

    setInterimVoiceText('');
    updateWordCount();
  };

  // Voice Dictation Toggle with continuous high-speed listening
  const toggleVoiceTyping = () => {
    if (isListening) {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
        speechRecognizerRef.current = null;
      }
      setIsListening(false);
      setInterimVoiceText('');
    } else {
      if (!isSpeechSupported()) {
        alert("તમારા બ્રાઉઝરમાં વોઇસ ટાઇપિંગ સપોર્ટ નથી. કૃપા કરીને Google Chrome વાપરો.");
        return;
      }

      // Capture current cursor or place at end if not focused
      updateSelectionRange();
      const activeEd = getActiveEditor();
      if (!lastSelectionRangeRef.current && activeEd) {
        activeEd.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(activeEd);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        lastSelectionRangeRef.current = range.cloneRange();
      }

      const recognizer = createSpeechRecognizer({
        lang: voiceLang,
        onResult: (finalText) => {
          insertVoiceText(finalText);
        },
        onInterim: (interim) => {
          setInterimVoiceText(interim);
        },
        onError: (err) => {
          console.warn('Voice error:', err);
          if (err.error === 'not-allowed') {
            alert(err.message || 'માઇક્રોફોન પરવાનગી આપો.');
            setIsListening(false);
          }
        },
        onEnd: ({ isExplicitlyStopped }) => {
          if (isExplicitlyStopped) {
            setIsListening(false);
            setInterimVoiceText('');
          }
        }
      });

      speechRecognizerRef.current = recognizer;
      recognizer.start();
      setIsListening(true);
    }
  };

  // Quick Legal Clauses to Insert
  const insertLegalClause = (type) => {
    const activeEd = getActiveEditor();
    if (!activeEd) return;
    activeEd.focus();
    updateSelectionRange();

    let clauseHtml = '';
    const advocateName = userSettings?.advocateName || 'એડવોકેટ';

    switch (type) {
      case 'parties_signatures':
        clauseHtml = `
          <div style="margin-top: 2rem; display: flex; justify-content: space-between; border-top: 1px dashed #cbd5e1; padding-top: 1.5rem;">
            <div style="text-align: center; width: 45%;">
              <p>___________________________</p>
              <p><strong>લખી આપનારની સહી</strong></p>
              <p>(પ્રથમ પક્ષકાર)</p>
            </div>
            <div style="text-align: center; width: 45%;">
              <p>___________________________</p>
              <p><strong>લખી લેનારની સહી</strong></p>
              <p>(બીજા પક્ષકાર)</p>
            </div>
          </div>
        `;
        break;

      case 'witness_block':
        clauseHtml = `
          <div style="margin-top: 2rem; border-top: 1px solid #94a3b8; padding-top: 1rem;">
            <h4 style="margin-bottom: 0.8rem; font-weight: bold;">રૂબરૂ સાક્ષીઓ:</h4>
            <div style="display: flex; justify-content: space-between;">
              <div style="width: 48%;">
                <p><strong>(૧) સાક્ષી નં. ૧ :</strong></p>
                <p>સહી : _________________________</p>
                <p>નામ : _________________________</p>
                <p>સરનામું : ______________________</p>
                <p>આધાર નં. : ____________________</p>
              </div>
              <div style="width: 48%;">
                <p><strong>(૨) સાક્ષી નં. ૨ :</strong></p>
                <p>સહી : _________________________</p>
                <p>નામ : _________________________</p>
                <p>સરનામું : ______________________</p>
                <p>આધાર નં. : ____________________</p>
              </div>
            </div>
          </div>
        `;
        break;

      case 'advocate_id':
        clauseHtml = `
          <div style="margin-top: 1.5rem; padding: 0.8rem; border: 1px solid #cbd5e1; border-radius: 6px; background: #f8fafc;">
            <p style="margin: 0;"><strong>મારા સમક્ષ પક્ષકારોને ઓળખ્યા:</strong></p>
            <p style="margin: 0.5rem 0 0 0;">સહી: ___________________________</p>
            <p style="margin: 0.3rem 0 0 0;"><strong>${advocateName}</strong> (એડવોકેટ)</p>
            ${userSettings?.barRegNumber ? `<p style="margin: 0.2rem 0 0 0;">બાર કાઉન્સિલ નં. : ${userSettings.barRegNumber}</p>` : ''}
          </div>
        `;
        break;

      case 'notary_block':
        clauseHtml = `
          <div style="margin-top: 2rem; border: 2px solid #0f172a; padding: 1rem; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 0.8rem;">
              <h4 style="margin: 0; font-weight: 800; text-transform: uppercase;">NOTARIAL ATTESTATION</h4>
              <p style="margin: 0.2rem 0 0 0; font-size: 0.8rem;">રૂબરૂ નોટરી સમક્ષ સોગંદપૂર્વક રજૂઆત</p>
            </div>
            <p style="margin: 0 0 0.8rem 0; text-align: justify; font-size: 0.85rem;">
              Solemnly affirmed and signed before me by the executants who are identified by the advocate on this ______ day of ____________, 202__ at Ahmedabad.
            </p>
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 1.5rem;">
              <div>
                <p style="margin: 0; font-size: 0.8rem;">Notary Reg. No: ____________</p>
                <p style="margin: 0.2rem 0 0 0; font-size: 0.8rem;">Book No: ______ Page: ______</p>
              </div>
              <div style="text-align: center;">
                <p style="margin: 0;">___________________________</p>
                <p style="margin: 0.3rem 0 0 0; font-weight: bold;">NOTARY GOVT. OF GUJARAT</p>
              </div>
            </div>
          </div>
        `;
        break;

      case 'property_boundary':
        clauseHtml = `
          <div style="margin: 1.5rem 0;">
            <p><strong>સદરહુ મિલકતની ચતુર્દિશા સીમાઓ નીચે મુજબ છે:</strong></p>
            <table style="width: 100%; border-collapse: collapse; margin-top: 0.5rem;" border="1">
              <tbody>
                <tr>
                  <td style="padding: 6px 12px; width: 25%; font-weight: bold; background: #f8fafc;">પૂર્વ દિશાએ :</td>
                  <td style="padding: 6px 12px;">___________________________________</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px; font-weight: bold; background: #f8fafc;">પશ્ચિમ દિશાએ :</td>
                  <td style="padding: 6px 12px;">___________________________________</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px; font-weight: bold; background: #f8fafc;">ઉત્તર દિશાએ :</td>
                  <td style="padding: 6px 12px;">___________________________________</td>
                </tr>
                <tr>
                  <td style="padding: 6px 12px; font-weight: bold; background: #f8fafc;">દક્ષિણ દિશાએ :</td>
                  <td style="padding: 6px 12px;">___________________________________</td>
                </tr>
              </tbody>
            </table>
          </div>
        `;
        break;

      case 'date_place':
        clauseHtml = `
          <p style="margin: 1.5rem 0; font-weight: bold;">
            સ્થળ : અમદાવાદ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; તારીખ : ${new Date().toLocaleDateString('gu-IN')}
          </p>
        `;
        break;

      default:
        break;
    }

    if (clauseHtml) {
      document.execCommand('insertHTML', false, clauseHtml);
      updateSelectionRange();
      updateWordCount();
    }
  };

  // Actions
  const handlePrint = (e) => {
    if (!isPremium()) {
      e?.preventDefault?.();
      return;
    }
    window.print();
  };

  const handleDownloadPdf = async (e) => {
    if (!isPremium()) {
      e?.preventDefault?.();
      return;
    }
    setIsGeneratingPdf(true);
    try {
      const pagesContainer = document.querySelector('.open-writer-pages-container') || document.querySelector('.open-writer-sheet');
      if (pagesContainer) {
        const cleanName = docTitle.replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_');
        await exportToPdf(cleanName, pagesContainer, {
          paperSize: paperSize,
          fontFamily: activeFont?.family
        });
      }
    } catch (err) {
      console.error('PDF Error:', err);
      alert('PDF ડાઉનલોડ કરવામાં ભૂલ: ' + err.message);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleExportWord = () => {
    const allEditors = document.querySelectorAll('.open-writer-editable');
    const fullHtml = Array.from(allEditors)
      .map(ed => ed.innerHTML)
      .join('\n\n---PAGE_BREAK---\n\n');
    const cleanName = docTitle.replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_');
    exportToWord(cleanName, docTitle, fullHtml, activeFont?.family);
  };

  const handleCopy = () => {
    const allEditors = document.querySelectorAll('.open-writer-editable');
    const fullText = Array.from(allEditors)
      .map(ed => (ed.innerText || '').trim())
      .filter(Boolean)
      .join('\n\n--- પેજ બ્રેક ---\n\n');
    if (fullText) {
      navigator.clipboard.writeText(fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveRecord = () => {
    const allEditors = document.querySelectorAll('.open-writer-editable');
    const fullHtml = Array.from(allEditors)
      .map(ed => ed.innerHTML)
      .join('\n\n---PAGE_BREAK---\n\n');
    const record = {
      templateId: 'open-writer-doc-' + Date.now(),
      templateTitle: docTitle,
      clientName: docTitle,
      renderedText: fullHtml,
      pageSetup: { paperSize, fontSizePt, stampMarginMm, pagesCount: pageList.length }
    };

    const ok = saveRecordToStorage(record, currentUser?.uid);
    if (ok) {
      setSaveStatus('દસ્તાવેજ સફળતાપૂર્વક સાચવવામાં આવ્યો!');
      if (onRecordSaved) onRecordSaved();
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleResetDocument = () => {
    if (window.confirm("શું તમે આ પેજ સાફ કરીને નવો ખાલી દસ્તાવેજ શરૂ કરવા માંગો છો?")) {
      const resetHtml = `
        <h2 style="text-align: center; margin-bottom: 1.2rem; font-weight: 800;">|| ${docTitle} ||</h2>
        <p><br></p>
      `;
      setPageList([{ id: 'page-' + Date.now(), initialHtml: resetHtml }]);
      setActivePageIndex(0);
      setTimeout(updateWordCount, 60);
    }
  };

  return (
    <div className={`open-writer-page ${isFullscreen ? 'writer-fullscreen' : ''}`}>
      {/* Top Bar Navigation & Main Actions */}
      <header className="writer-top-header">
        <div className="writer-header-left">
          <button
            type="button"
            className="writer-back-btn"
            onClick={onBackToStudio}
            title="પાછા સ્ટુડિયો પર જાઓ"
          >
            <ArrowLeft size={16} />
            <span>સ્ટુડિયો</span>
          </button>

          <div className="writer-title-box">
            <span className="writer-badge-tag">ઓપન રાઇટર</span>
            <input
              type="text"
              value={docTitle}
              onChange={e => setDocTitle(e.target.value)}
              onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setDocTitle(val))}
              className="writer-title-input"
              placeholder="દસ્તાવેજનું શીર્ષક લખો..."
              title="ક્લિક કરીને દસ્તાવેજનું શીર્ષક બદલો"
            />
          </div>
        </div>

        <div className="writer-header-actions">
          {saveStatus && (
            <span className="writer-save-status">
              <CheckCircle size={14} /> {saveStatus}
            </span>
          )}

          <button
            type="button"
            className="btn-secondary"
            onClick={handleCopy}
            title="સમગ્ર લખાણ કોપી કરો"
          >
            {copied ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
            <span>{copied ? 'કોપી થયું!' : 'કોપી'}</span>
          </button>

          <SubscriptionGuard action="Word (.docx) ડાઉનલોડ">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleExportWord}
              title="Microsoft Word ફોર્મેટમાં ડાઉનલોડ કરો"
            >
              <Download size={14} />
              <span>Word (.docx)</span>
            </button>
          </SubscriptionGuard>

          <SubscriptionGuard action="PDF ડાઉનલોડ">
            <button
              type="button"
              className="btn-secondary btn-download-pdf"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              title="સીધું PDF ડાઉનલોડ કરો (.pdf)"
            >
              {isGeneratingPdf ? <RotateCcw size={14} className="spin" /> : <FileDown size={14} />}
              <span>{isGeneratingPdf ? 'પીડીએફ...' : 'Download PDF'}</span>
            </button>
          </SubscriptionGuard>

          <SubscriptionGuard action="પ્રિન્ટ / PDF">
            <button
              type="button"
              className="btn-primary"
              onClick={handlePrint}
              title="કાગળ પર પ્રિન્ટ કાઢો"
            >
              <Printer size={15} />
              <span>પ્રિન્ટ</span>
            </button>
          </SubscriptionGuard>

          <SubscriptionGuard action="અસીલ ફાઇલ સાચવવી">
            <button
              type="button"
              className="btn-gold"
              onClick={handleSaveRecord}
              title="આ દસ્તાવેજ હિસ્ટ્રીમાં સાચવો"
            >
              <Save size={15} />
              <span>સાચવો</span>
            </button>
          </SubscriptionGuard>
        </div>
      </header>

      {/* Formatting & Controls Toolbar */}
      <div className="writer-toolbar">
        {/* Phonetic typing toggle */}
        <div className="writer-tool-group">
          <button
            type="button"
            className={`writer-toggle-btn ${isPhoneticActive ? 'active' : ''}`}
            onClick={() => setIsPhoneticActive(!isPhoneticActive)}
            title="ગુજરાતી ટ્રાન્સલિટરેશન ચાલુ / બંધ (Shortcut: Ctrl + G)"
          >
            <span className="writer-kbd-chip">Ctrl+G</span>
            <span>{isPhoneticActive ? 'ગુજરાતી ON' : 'English'}</span>
          </button>

          {/* Voice Typing Mic button */}
          <button
            type="button"
            className={`writer-mic-btn ${isListening ? 'active' : ''}`}
            onClick={toggleVoiceTyping}
            title={isListening ? "વોઇસ ટાઇપિંગ બંધ કરો" : "બોલીને લખાણ લખો (Speech to text)"}
          >
            {isListening ? <MicOff size={14} /> : <Mic size={14} />}
            <span>{isListening ? 'સાંભળે છે...' : 'માઇક'}</span>
          </button>

          {/* Voice Language Switcher */}
          <select
            className="writer-select writer-voice-lang-select"
            value={voiceLang}
            onChange={e => {
              const newL = e.target.value;
              setVoiceLang(newL);
              if (speechRecognizerRef.current) {
                speechRecognizerRef.current.setLang(newL);
              }
            }}
            title="વોઇસ ટાઇપિંગ ભાષા પસંદ કરો"
          >
            <option value="gu-IN">🎙️ ગુજરાતી (gu-IN)</option>
            <option value="en-IN">🎙️ English (en-IN)</option>
            <option value="hi-IN">🎙️ हिन्दी (hi-IN)</option>
          </select>
        </div>

        <div className="toolbar-v-divider" />

        {/* Legal Font family */}
        <div className="writer-tool-group">
          <Type size={14} style={{ color: '#64748b' }} />
          <select
            className="writer-select"
            value={selectedFontId}
            onChange={e => setSelectedFontId(e.target.value)}
            title="ગુજરાતી યુનિકોડ ફોન્ટ પસંદ કરો (૧૧ ફોન્ટ ઉપલબ્ધ)"
          >
            <optgroup label="📝 ટેક્સ્ટ ફોન્ટ (લખાણ માટે)">
              {LEGAL_FONTS.filter(f => f.category === 'text').map(f => (
                <option key={f.id} value={f.id}>
                  {f.label || f.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="🎨 ડિસ્પ્લે ફોન્ટ (ટાઈટલ માટે)">
              {LEGAL_FONTS.filter(f => f.category === 'display').map(f => (
                <option key={f.id} value={f.id}>
                  {f.label || f.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Font size +/- */}
        <div className="writer-tool-group font-size-stepper-box">
          <button
            type="button"
            className="font-size-btn"
            onClick={() => setFontSizePt(Math.max(9, fontSizePt - 1))}
            title="ફોન્ટ સાઇઝ નાની કરો (A-)"
          >
            <Minus size={12} strokeWidth={2.5} />
            <span>A-</span>
          </button>
          <span className="font-size-display-text">{fontSizePt}pt</span>
          <button
            type="button"
            className="font-size-btn"
            onClick={() => setFontSizePt(Math.min(24, fontSizePt + 1))}
            title="ફોન્ટ સાઇઝ મોટી કરો (A+)"
          >
            <span>A+</span>
          </button>
        </div>

        <div className="toolbar-v-divider" />

        {/* Text styling */}
        <div className="writer-tool-group">
          <button
            type="button"
            className="writer-format-btn"
            onClick={() => executeCommand('bold')}
            title="ઘાટા અક્ષરો (Bold - Ctrl+B)"
          >
            <Bold size={14} />
          </button>
          <button
            type="button"
            className="writer-format-btn"
            onClick={() => executeCommand('italic')}
            title="ત્રાંસા અક્ષરો (Italic - Ctrl+I)"
          >
            <Italic size={14} />
          </button>
          <button
            type="button"
            className="writer-format-btn"
            onClick={() => executeCommand('underline')}
            title="નીચે લીટી (Underline - Ctrl+U)"
          >
            <Underline size={14} />
          </button>
        </div>

        <div className="toolbar-v-divider" />

        {/* Alignment */}
        <div className="writer-tool-group">
          <button
            type="button"
            className="writer-format-btn"
            onClick={() => executeCommand('justifyLeft')}
            title="ડાબી બાજુ ગોઠવો (Align Left)"
          >
            <AlignLeft size={14} />
          </button>
          <button
            type="button"
            className="writer-format-btn"
            onClick={() => executeCommand('justifyCenter')}
            title="વચ્ચે ગોઠવો (Align Center)"
          >
            <AlignCenter size={14} />
          </button>
          <button
            type="button"
            className="writer-format-btn"
            onClick={() => executeCommand('justifyRight')}
            title="જમણી બાજુ ગોઠવો (Align Right)"
          >
            <AlignRight size={14} />
          </button>
          <button
            type="button"
            className="writer-format-btn"
            onClick={() => executeCommand('justifyFull')}
            title="બંને બાજુ સરખું કરો (Justify)"
          >
            <AlignJustify size={14} />
          </button>
        </div>

        <div className="toolbar-v-divider" />

        {/* Stamp Paper Space Setup */}
        <div className="writer-tool-group">
          <label className="writer-stamp-toggle" title="ઇ-સ્ટેમ્પ સર્ટિફિકેટ માટે ઉપર જગ્યા છોડો">
            <input
              type="checkbox"
              checked={stampPaperMode}
              onChange={e => setStampPaperMode(e.target.checked)}
            />
            <span>સ્ટેમ્પ જગ્યા</span>
          </label>

          {stampPaperMode && (
            <div className="writer-stamp-slider-box" title="સ્ટેમ્પ પેપર માટે ઉપરથી માર્જિન">
              <input
                type="range"
                min="30"
                max="140"
                step="5"
                value={stampMarginMm}
                onChange={e => setStampMarginMm(Number(e.target.value))}
                className="writer-slider"
              />
              <span className="writer-slider-val">{stampMarginMm}mm</span>
            </div>
          )}
        </div>

        <div className="toolbar-v-divider" />

        {/* Paper Size selector */}
        <div className="writer-tool-group">
          <select
            className="writer-select"
            value={paperSize}
            onChange={e => setPaperSize(e.target.value)}
            title="કાગળ સાઇઝ પસંદ કરો"
          >
            <option value="a4">A4 (210 × 297mm)</option>
            <option value="legal">Legal (216 × 356mm)</option>
          </select>
        </div>

        {/* Page Break / Add Page Button */}
        <div className="writer-tool-group">
          <button
            type="button"
            className="writer-page-btn"
            onClick={handleAddNewPage}
            title="નવું પેજ ઉમેરો (Shortcut: Ctrl + Enter)"
          >
            <FilePlus size={14} />
            <span>+ નવું પેજ</span>
            <span className="writer-kbd-chip">Ctrl+↵</span>
          </button>
          <span className="writer-page-badge" title="કુલ પેજ">
            પેજ {activePageIndex + 1} / {pageList.length}
          </span>
        </div>

        {/* Quick Clause Inserter Dropdown */}
        <div className="writer-tool-group">
          <select
            className="writer-select writer-clause-select"
            defaultValue=""
            onChange={e => {
              if (e.target.value) {
                insertLegalClause(e.target.value);
                e.target.value = '';
              }
            }}
            title="વારંવાર વપરાતા કાનૂની બ્લોક્સ દાખલ કરો"
          >
            <option value="" disabled>➕ કાનૂની બ્લોક ઉમેરો...</option>
            <option value="parties_signatures">✍️ પક્ષકારોની સહી બ્લોક</option>
            <option value="witness_block">👥 ૨ સાક્ષીઓનું કોષ્ટક</option>
            <option value="advocate_id">🔍 ઓળખનાર એડવોકેટ નોંધ</option>
            <option value="notary_block">🏛️ નોટરી એટેસ્ટેશન</option>
            <option value="property_boundary">📐 મિલકત ચતુર્દિશા કોષ્ટક</option>
            <option value="date_place">📅 તારીખ અને સ્થળ પંક્તિ</option>
          </select>
        </div>

        {/* Fullscreen & Reset */}
        <div className="writer-tool-group writer-tools-right">
          <button
            type="button"
            className="writer-icon-btn"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "પૂર્ણ સ્ક્રીન બંધ કરો" : "પૂર્ણ સ્ક્રીન વ્યૂ (Full Screen)"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>

          <button
            type="button"
            className="writer-icon-btn text-danger"
            onClick={handleResetDocument}
            title="પેજ સાફ કરો / નવો દસ્તાવેજ શરૂ કરો"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Floating Live Real-Time Speech Banner when Mic is Active */}
      {isListening && (
        <div className="voice-live-floating-banner">
          <div className="voice-pulse-indicator" />
          <div className="voice-text-stream">
            <span className="voice-status-text">
              <Volume2 size={13} />
              {voiceLang === 'gu-IN' ? 'ગુજરાતી સાંભળે છે (Listening)...' : voiceLang === 'hi-IN' ? 'हिंदी सुन रहा है...' : 'Listening in English...'}
            </span>
            <span className="voice-live-interim">
              {interimVoiceText ? `"${interimVoiceText}"` : 'સ્પષ્ટ રીતે બોલો, લખાણ સીધું પેજ પર ટાઇપ થશે...'}
            </span>
          </div>
          <button
            type="button"
            className="voice-stop-pill-btn"
            onClick={toggleVoiceTyping}
            title="વોઇસ ટાઇપિંગ પૂર્ણ કરો"
          >
            <MicOff size={13} />
            <span>પૂર્ણ (Stop)</span>
          </button>
        </div>
      )}

      {/* Main Canvas Viewport with Multi-Page Support */}
      <main className="open-writer-viewport">
        <div className="open-writer-pages-container">
          {pageList.map((page, index) => {
            const isFirstPage = index === 0;
            const effectiveTopPaddingMm = (isFirstPage && stampPaperMode) ? stampMarginMm : 25;

            return (
              <React.Fragment key={page.id}>
                <div
                  className={`open-writer-sheet legal-sheet ${isFirstPage && stampPaperMode ? 'stamp-paper-mode' : ''} ${activePageIndex === index ? 'page-active' : ''}`}
                  onClick={() => setActivePageIndex(index)}
                  style={{
                    width: paperSize === 'legal' ? '215.9mm' : '210mm',
                    minHeight: paperSize === 'legal' ? '355.6mm' : '297mm',
                    paddingTop: `${effectiveTopPaddingMm}mm`,
                    paddingBottom: '25mm',
                    paddingLeft: '28mm',
                    paddingRight: '22mm',
                    fontSize: `${fontSizePt}pt`,
                    fontFamily: activeFont?.family || "'Noto Serif Gujarati', serif"
                  }}
                >
                  {/* First Page Visual Stamp Placeholder */}
                  {isFirstPage && stampPaperMode && (
                    <div
                      className="stamp-paper-placeholder-zone no-print"
                      style={{ height: `${stampMarginMm}mm` }}
                    >
                      <div className="stamp-zone-content">
                        <div style={{ fontSize: '0.88rem', color: '#b45309', fontWeight: 800 }}>
                          🏛️ ગુજરાત સરકારી ઇ-સ્ટેમ્પ પેપર ઝોન ({stampMarginMm}mm)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#78350f', marginTop: '2px' }}>
                          આ ભાગમાં પ્રિન્ટ થશે નહીં. ₹ ૫૦ / ₹ ૧૦૦ / ₹ ૩૦૦ નું ઇ-સ્ટેમ્પ સર્ટિફિકેટ પ્રિન્ટરમાં મૂકો.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multi-page Header for Page 2+ */}
                  {!isFirstPage && (
                    <div className="open-writer-page-header no-print">
                      <div className="page-header-badge">
                        <span>📄 પેજ નં. {index + 1}</span>
                      </div>
                      {pageList.length > 1 && (
                        <button
                          type="button"
                          className="btn-delete-page"
                          onClick={(e) => handleDeletePage(index, e)}
                          title="આ પેજ કાઢી નાખો"
                        >
                          <Trash2 size={13} />
                          <span>પેજ કાઢી નાખો</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Direct Free-Hand ContentEditable Writing Surface */}
                  <div
                    ref={el => {
                      if (el) editorRefs.current[page.id] = el;
                      else delete editorRefs.current[page.id];
                    }}
                    contentEditable
                    suppressContentEditableWarning
                    className="open-writer-editable document-body"
                    data-page-index={index}
                    onFocus={() => {
                      setActivePageIndex(index);
                      updateSelectionRange();
                    }}
                    onKeyDown={(e) => {
                      if (e.ctrlKey && e.key === 'Enter') {
                        e.preventDefault();
                        handleAddNewPage();
                        return;
                      }
                      if (e.ctrlKey && (e.key === 'g' || e.key === 'G')) {
                        e.preventDefault();
                        setIsPhoneticActive(prev => !prev);
                        return;
                      }
                      if (isPhoneticActive) {
                        handlePhoneticKeyDown(e, isPhoneticActive, () => {
                          updateWordCount();
                          updateSelectionRange();
                        });
                      }
                    }}
                    onMouseUp={updateSelectionRange}
                    onKeyUp={updateSelectionRange}
                    onClick={updateSelectionRange}
                    onInput={updateWordCount}
                    spellCheck={false}
                    dangerouslySetInnerHTML={{ __html: page.initialHtml || '<p><br></p>' }}
                  />
                </div>

                {/* Interactive Page Divider & Quick Add Page Button between/after pages */}
                <div className="open-writer-page-divider no-print">
                  <button
                    type="button"
                    className="btn-insert-page-break"
                    onClick={handleAddNewPage}
                    title="આ પેજ પછી નવું પેજ ઉમેરો (Shortcut: Ctrl + Enter)"
                  >
                    <Plus size={13} />
                    <span>+ નવું પેજ ઉમેરો (Page Break)</span>
                    <span className="writer-kbd-chip">Ctrl+↵</span>
                  </button>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </main>

      {/* Bottom Status bar */}
      <footer className="writer-bottom-bar no-print">
        <div className="writer-status-info">
          <span>કુલ શબ્દો: <strong>{wordCount}</strong></span>
          <span>•</span>
          <span>પેજ: <strong>{pageList.length}</strong></span>
          <span>•</span>
          <span>કાગળ: <strong>{paperSize === 'legal' ? 'Legal (લીગલ)' : 'A4'}</strong></span>
          <span>•</span>
          <span>ફોન્ટ: <strong>{activeFont?.label || activeFont?.name} ({fontSizePt}pt)</strong></span>
          {stampPaperMode && (
            <>
              <span>•</span>
              <span className="text-amber">સ્ટેમ્પ જગ્યા: <strong>{stampMarginMm}mm</strong></span>
            </>
          )}
        </div>
        <div className="writer-status-tip">
          💡 ટીપ: નવું પેજ ઉમેરવા માટે <code>Ctrl + Enter</code> દબાવો | ગુજરાતી ટાઇપિંગ માટે <code>Ctrl + G</code>
        </div>
      </footer>
    </div>
  );
}
