import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Keyboard,
  Type,
  Calculator,
  Printer, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Save, 
  Sparkles, 
  Layers, 
  Sliders, 
  Eye, 
  FileText,
  FolderOpen,
  Settings,
  Edit3,
  SplitSquareVertical,
  Scissors
} from 'lucide-react';
import { 
  extractVariables, 
  renderDocument, 
  cleanDocumentForExport, 
  exportToWord, 
  saveRecordToStorage,
  loadPageSetup,
  savePageSetup,
  splitContentIntoPages,
  LEGAL_FONTS,
  numberToGujaratiWords
} from '../utils/documentUtils';
import { handlePhoneticKeyDown, transliterateWord } from '../utils/gujaratiTransliterate';
import PageSetupModal, { PAPER_SIZES } from './PageSetupModal';

export default function DocumentStudio({ 
  currentTemplate, 
  templates, 
  onSelectTemplate, 
  onOpenTemplateLibrary, 
  userSettings,
  onRecordSaved
}) {
  if (!currentTemplate) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>કોઈ ટેમ્પલેટ પસંદ કરેલ નથી</h2>
        <button className="btn-primary" onClick={onOpenTemplateLibrary} style={{ marginTop: '1rem' }}>
          ટેમ્પલેટ પસંદ કરો
        </button>
      </div>
    );
  }

  // Extract variables dynamically from template content
  const detectedVariables = useMemo(() => {
    return extractVariables(currentTemplate.content);
  }, [currentTemplate.content]);

  // Form values state
  const [formValues, setFormValues] = useState(() => {
    const initial = { ...(currentTemplate.defaultValues || {}) };
    if (userSettings?.advocateName) {
      if (!initial['નોટરી_એડવોકેટ_નામ']) initial['નોટરી_એડવોકેટ_નામ'] = userSettings.advocateName;
      if (!initial['એડવોકેટ_નામ']) initial['એડવોકેટ_નામ'] = userSettings.advocateName;
    }
    if (userSettings?.barRegNumber && !initial['બાર_કાઉન્સિલ_નંબર']) {
      initial['બાર_કાઉન્સિલ_નંબર'] = userSettings.barRegNumber;
    }
    if (userSettings?.officeAddress && !initial['એડવોકેટ_ઓફિસ_સરનામું']) {
      initial['એડવોકેટ_ઓફિસ_સરનામું'] = userSettings.officeAddress;
    }
    return initial;
  });

  // Stamp paper mode and margin offset
  const [stampPaperMode, setStampPaperMode] = useState(userSettings?.stampPaperMode || false);
  const [stampMarginMm, setStampMarginMm] = useState(userSettings?.printMarginTopMm || 110);
  const [fontSizePt, setFontSizePt] = useState(13);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [highlightEmpty, setHighlightEmpty] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Phonetic keyboard & font selection state
  const [isPhoneticActive, setIsPhoneticActive] = useState(true);
  const [selectedFontId, setSelectedFontId] = useState('serif');
  const [quickCalcAmount, setQuickCalcAmount] = useState('');
  const [quickCalcWords, setQuickCalcWords] = useState('');

  // Global Ctrl+G listener for toggling phonetic typing
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        setIsPhoneticActive(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Page Setup state
  const [pageSetup, setPageSetup] = useState(() => loadPageSetup());
  const [isPageSetupOpen, setIsPageSetupOpen] = useState(false);

  // Direct editing on paper state
  const [isDirectEditMode, setIsDirectEditMode] = useState(false);
  const [customDirectHtml, setCustomDirectHtml] = useState(null);

  // Reset direct edit when template changes
  useEffect(() => {
    setCustomDirectHtml(null);
    setFormValues(prev => {
      const merged = { ...(currentTemplate.defaultValues || {}) };
      for (const k of detectedVariables) {
        if (prev[k] !== undefined && prev[k] !== '') {
          merged[k] = prev[k];
        }
      }
      if (userSettings?.advocateName) {
        if (!merged['નોટરી_એડવોકેટ_નામ']) merged['નોટરી_એડવોકેટ_નામ'] = userSettings.advocateName;
        if (!merged['એડવોકેટ_નામ']) merged['એડવોકેટ_નામ'] = userSettings.advocateName;
      }
      if (userSettings?.barRegNumber && !merged['બાર_કાઉન્સિલ_નંબર']) {
        merged['બાર_કાઉન્સિલ_નંબર'] = userSettings.barRegNumber;
      }
      if (userSettings?.officeAddress && !merged['એડવોકેટ_ઓફિસ_સરનામું']) {
        merged['એડવોકેટ_ઓફિસ_સરનામું'] = userSettings.officeAddress;
      }
      return merged;
    });
  }, [currentTemplate.id]);

  const handleInputChange = (key, value) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value
    }));
    // If user changes form inputs, sync direct HTML
    setCustomDirectHtml(null);
  };

  // Group variables into logical sections
  const groupedVariables = useMemo(() => {
    const groups = {
      "મૂળભૂત વિગતો (Basic Details)": [],
      "પક્ષકાર / અરજદાર વિગત (Party Info)": [],
      "મિલકત, નાણાકીય અને શરતો (Terms & Property)": [],
      "સાક્ષી અને નોટરી ખરાઈ (Verification)": []
    };

    detectedVariables.forEach(vKey => {
      const lower = vKey.toLowerCase();
      if (lower.includes("તારીખ") || lower.includes("સ્થળ") || lower.includes("કચેરી") || lower.includes("વિષય")) {
        groups["મૂળભૂત વિગતો (Basic Details)"].push(vKey);
      } else if (
        lower.includes("નામ") || 
        lower.includes("સરનામું") || 
        lower.includes("ઉંમર") || 
        lower.includes("ધંધો") || 
        lower.includes("આધાર") || 
        lower.includes("મોબાઇલ") || 
        lower.includes("માલિક") || 
        lower.includes("ભાડુઆત") || 
        lower.includes("અસીલ") || 
        lower.includes("સામાવાળા") || 
        lower.includes("અરજદાર")
      ) {
        groups["પક્ષકાર / અરજદાર વિગત (Party Info)"].push(vKey);
      } else if (
        lower.includes("નોટરી") || 
        lower.includes("એડવોકેટ") || 
        lower.includes("સાક્ષી") || 
        lower.includes("બાર_કાઉન્સિલ")
      ) {
        groups["સાક્ષી અને નોટરી ખરાઈ (Verification)"].push(vKey);
      } else {
        groups["મિલકત, નાણાકીય અને શરતો (Terms & Property)"].push(vKey);
      }
    });

    return groups;
  }, [detectedVariables]);

  // Count empty unfilled fields
  const unfilledCount = useMemo(() => {
    return detectedVariables.filter(k => !formValues[k] || String(formValues[k]).trim() === '').length;
  }, [detectedVariables, formValues]);

  // Live rendered document HTML from form
  const rawRenderedContent = useMemo(() => {
    return renderDocument(currentTemplate.content, formValues, highlightEmpty);
  }, [currentTemplate.content, formValues, highlightEmpty]);

  // Effective HTML content (custom direct edits take precedence if active)
  const effectiveHtml = customDirectHtml !== null ? customDirectHtml : rawRenderedContent;

  // Split into distinct pages for multi-page print view
  const documentPages = useMemo(() => {
    if (pageSetup.viewMode === 'continuous') {
      return [effectiveHtml];
    }
    return splitContentIntoPages(effectiveHtml);
  }, [effectiveHtml, pageSetup.viewMode]);

  // Clean text for copy/export
  const cleanExportText = useMemo(() => {
    return cleanDocumentForExport(renderDocument(currentTemplate.content, formValues, false));
  }, [currentTemplate.content, formValues]);

  // Handlers
  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    const filename = `${currentTemplate.title.replace(/[\/\s]/g, '_')}_${formValues['અરજદારનું_નામ'] || formValues['અરજદારનું_પૂરું_નામ'] || 'Dastavej'}`;
    const formattedHtml = cleanExportText
      .split('\n\n')
      .map(para => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
      .join('');
    exportToWord(filename, currentTemplate.title, formattedHtml);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(cleanExportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleClearForm = () => {
    if (window.confirm("શું તમે આ ફોર્મની તમામ વિગતો ખાલી કરવા માંગો છો?")) {
      const cleared = {};
      detectedVariables.forEach(v => cleared[v] = '');
      setFormValues(cleared);
      setCustomDirectHtml(null);
    }
  };

  const handleFillDemo = () => {
    setFormValues(currentTemplate.defaultValues || {});
    setCustomDirectHtml(null);
  };

  const handleSaveClientRecord = () => {
    const clientName = formValues['અરજદારનું_નામ'] || 
                       formValues['અરજદારનું_પૂરું_નામ'] || 
                       formValues['ભાડુઆતનું_નામ'] || 
                       formValues['આપનારનું_નામ'] || 
                       formValues['અસીલનું_નામ'] || 
                       'અનામી અસીલ (Client)';

    const record = {
      templateId: currentTemplate.id,
      templateTitle: currentTemplate.title,
      clientName: clientName,
      place: formValues['સ્થળ'] || '',
      date: formValues['તારીખ'] || formValues['નોટિસ_તારીખ'] || new Date().toLocaleDateString('en-GB'),
      formValues: { ...formValues },
      renderedText: cleanExportText,
      pageSetup: { ...pageSetup }
    };

    const ok = saveRecordToStorage(record);
    if (ok) {
      setSaveStatus('અસીલ ફાઇલ સફળતાપૂર્વક સાચવવામાં આવી!');
      if (onRecordSaved) onRecordSaved();
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleSavePageSetup = (newSetup) => {
    setPageSetup(newSetup);
    savePageSetup(newSetup);
  };

  const handleDirectEditBlur = (e) => {
    setCustomDirectHtml(e.currentTarget.innerHTML);
  };

  const handleInsertPageBreak = () => {
    setCustomDirectHtml(prev => {
      const base = prev !== null ? prev : rawRenderedContent;
      return base + "\n\n---PAGE_BREAK---\n\n";
    });
  };

  const handleResetDirectEdit = () => {
    if (window.confirm("શું તમે ડાયરેક્ટ એડિટ કરેલ ફેરફારો રદ કરીને મૂળ ફોર્મ મુજબ કરવું માંગો છો?")) {
      setCustomDirectHtml(null);
    }
  };

  return (
    <div className="studio-container">
      {/* Dynamic @page CSS injected for exact print paper size */}
      <style>{`
        @media print {
          @page {
            size: ${pageSetup.paperSize === 'LEGAL' ? 'legal' : 'A4'} portrait !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* ================= LEFT PANEL: DYNAMIC FORM ================= */}
      <aside className="studio-form-panel">
        <div className="form-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span className="template-badge">
              <Layers size={13} />
              {currentTemplate.category}
            </span>
            <button 
              className="btn-secondary" 
              onClick={onOpenTemplateLibrary}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              <FolderOpen size={13} />
              ફોર્મેટ બદલો
            </button>
          </div>
          <h2 className="form-panel-title">{currentTemplate.title}</h2>
          <p className="form-panel-subtitle">
            કુલ <strong>{detectedVariables.length}</strong> પેરામીટર્સ 
            {unfilledCount > 0 ? (
              <span style={{ color: 'var(--accent-gold-dark)', marginLeft: '0.4rem' }}>
                ({unfilledCount} ભરવાના બાકી)
              </span>
            ) : (
              <span style={{ color: '#34d399', marginLeft: '0.4rem' }}>
                (તમામ ભરેલા છે ✓)
              </span>
            )}
          </p>
        </div>

        {/* Action bar for quick helper actions */}
        <div style={{ 
          padding: '0.65rem 1.5rem', 
          background: '#f8fafc', 
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <button 
            className="tool-toggle-btn"
            onClick={handleFillDemo}
            title="નમૂના માટે સેમ્પલ ડેટા ભરો"
            style={{ fontSize: '0.75rem' }}
          >
            <Sparkles size={13} style={{ color: 'var(--accent-gold-dark)' }} />
            <span>સેમ્પલ વિગતો ભરો</span>
          </button>

          <button 
            className="tool-toggle-btn"
            onClick={handleClearForm}
            title="તમામ ફિલ્ડ ખાલી કરો"
            style={{ fontSize: '0.75rem' }}
          >
            <RotateCcw size={13} />
            <span>સાફ કરો</span>
          </button>
        </div>

        {/* Quick Currency Words Helper Tool */}
        <div style={{ padding: '0.65rem 1.5rem 0.2rem 1.5rem' }}>
          <div className="currency-calc-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calculator size={13} style={{ color: 'var(--accent-gold-dark)' }} />
                <span>₹ રકમ અંકે શબ્દોમાં કન્વર્ટર:</span>
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>દા.ત. 500000</span>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input 
                type="text" 
                className="input-control" 
                placeholder="રકમ દાખલ કરો (દા.ત. 550000)..." 
                value={quickCalcAmount}
                onChange={e => {
                  setQuickCalcAmount(e.target.value);
                  setQuickCalcWords(numberToGujaratiWords(e.target.value));
                }}
                style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
              />
            </div>
            {quickCalcWords && (
              <div className="result-text">
                <span>{quickCalcWords}</span>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', background: '#ffffff' }}
                  onClick={() => {
                    navigator.clipboard.writeText(quickCalcWords);
                    alert('કોપી થઈ ગયું: ' + quickCalcWords);
                  }}
                  title="ક્લિપબોર્ડમાં કોપી કરો"
                >
                  કોપી
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="form-scrollable-body">
          {Object.entries(groupedVariables).map(([groupTitle, vars]) => {
            if (vars.length === 0) return null;
            return (
              <div key={groupTitle} className="form-category-group">
                <div className="category-title">
                  <span>{groupTitle}</span>
                  <span className="category-counter">{vars.length} ફિલ્ડ્સ</span>
                </div>

                {vars.map(varKey => {
                  const val = formValues[varKey] || '';
                  const isTextarea = varKey.includes("સરનામું") || 
                                     varKey.includes("વિગત") || 
                                     varKey.includes("યાદી") || 
                                     varKey.includes("હેતુ") ||
                                     varKey.includes("શરતો") ||
                                     varKey.includes("ક્ષેત્ર");

                  return (
                    <div key={varKey} className="field-group">
                      <label className="field-label">
                        <span>{varKey.replace(/_/g, " ")}</span>
                        <span className="field-tag-key">&#123;&#123;{varKey}&#125;&#125;</span>
                      </label>
                      {isTextarea ? (
                        <textarea
                          className="input-control"
                          value={val}
                          placeholder={`અહીં ${varKey.replace(/_/g, " ")} દાખલ કરો... (અંગ્રેજીમાં ટાઇપ કરશો તો આપોઆપ ગુજરાતી થશે)`}
                          rows={2}
                          onChange={e => handleInputChange(varKey, e.target.value)}
                          onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, newVal => handleInputChange(varKey, newVal))}
                        />
                      ) : (
                        <input
                          type="text"
                          className="input-control"
                          value={val}
                          placeholder={`અહીં ${varKey.replace(/_/g, " ")} દાખલ કરો...`}
                          onChange={e => handleInputChange(varKey, e.target.value)}
                          onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, newVal => handleInputChange(varKey, newVal))}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="form-panel-footer">
          <div style={{ flex: 1 }}>
            {saveStatus && (
              <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
                ✓ {saveStatus}
              </span>
            )}
          </div>
          <button 
            className="btn-gold"
            onClick={handleSaveClientRecord}
            title="આ અસીલનો દસ્તાવેજ રેકોર્ડમાં સાચવો"
          >
            <Save size={16} />
            <span>અસીલ ફાઇલ સાચવો</span>
          </button>
        </div>
      </aside>

      {/* ================= RIGHT PANEL: LIVE DOCUMENT CANVAS ================= */}
      <main className="studio-preview-panel">
        {/* Preview Toolbar */}
        <div className="preview-toolbar">
          <div className="toolbar-controls">
            {/* Phonetic Keyboard Toggle */}
            <button 
              type="button"
              className={`phonetic-toggle-btn ${isPhoneticActive ? 'active' : ''}`}
              onClick={() => setIsPhoneticActive(!isPhoneticActive)}
              title="અંગ્રેજીમાં ટાઇપ કરતા આપોઆપ ગુજરાતી થશે (દા.ત. rajesh -> રાજેશ). શોર્ટકટ: Ctrl+G"
            >
              <Keyboard size={14} />
              <span>ગુજરાતી ટાઇપિંગ: {isPhoneticActive ? 'ચાલુ (ON)' : 'બંધ'}</span>
            </button>

            {/* Legal Font Selector */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <Type size={14} style={{ color: 'var(--primary)' }} />
              <select 
                className="font-select-control"
                value={selectedFontId}
                onChange={e => setSelectedFontId(e.target.value)}
                title="દસ્તાવેજ માટે પ્રમાણિત લીગલ ગુજરાતી ફોન્ટ પસંદ કરો"
              >
                {LEGAL_FONTS.map(f => (
                  <option key={f.id} value={f.id}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Page Setup Button */}
            <button 
              className="tool-toggle-btn active"
              onClick={() => setIsPageSetupOpen(true)}
              title="પેપર સાઇઝ (A4 / Legal), માર્જિન્સ અને સ્પેસિંગ સેટઅપ"
              style={{ background: '#eff6ff', borderColor: 'var(--primary)' }}
            >
              <Settings size={15} style={{ color: 'var(--primary)' }} />
              <span>પેજ સેટઅપ: {PAPER_SIZES[pageSetup.paperSize]?.name.split(' ')[0]}</span>
            </button>

            {/* View Mode Toggle: Multi-Page vs Continuous */}
            <button 
              className="tool-toggle-btn"
              onClick={() => handleSavePageSetup({
                ...pageSetup,
                viewMode: pageSetup.viewMode === 'pages' ? 'continuous' : 'pages'
              })}
              title="પેજ વ્યુ બદલો: મલ્ટિ-પેજ A4 શીટ્સ અથવા સળંગ પેપર"
            >
              <SplitSquareVertical size={14} />
              <span>વ્યુ: {pageSetup.viewMode === 'pages' ? `પેજ શીટ્સ (${documentPages.length})` : 'સળંગ'}</span>
            </button>

            {/* Direct Edit Toggle */}
            <button 
              className={`tool-toggle-btn ${isDirectEditMode ? 'active' : ''}`}
              onClick={() => setIsDirectEditMode(!isDirectEditMode)}
              title="પેજ પર સીધું ક્લિક કરીને લખાણ, સ્પેસ કે Enter બદલવાની છૂટ"
              style={isDirectEditMode ? { background: '#ecfdf5', borderColor: '#10b981', color: '#047857' } : {}}
            >
              <Edit3 size={14} />
              <span>ડાયરેક્ટ એડિટ: {isDirectEditMode ? 'ચાલુ (ON)' : 'બંધ (OFF)'}</span>
            </button>

            {/* Stamp Paper Mode Button */}
            <button 
              className={`tool-toggle-btn ${stampPaperMode ? 'active' : ''}`}
              onClick={() => setStampPaperMode(!stampPaperMode)}
              title="ગુજરાત ઇ-સ્ટેમ્પ પેપર પર પ્રિન્ટ કાઢવા માટે પ્રથમ પેજ પર ઉપરથી ખાલી જગ્યા છોડો"
            >
              <Sliders size={14} />
              <span>ઇ-સ્ટેમ્પ મોડ: {stampPaperMode ? `${stampMarginMm}mm` : 'બંધ'}</span>
            </button>

            {stampPaperMode && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', border: '1px solid var(--border-subtle)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: '#fbbf24' }}>ઓફસેટ:</span>
                <input 
                  type="range" 
                  min="60" 
                  max="150" 
                  value={stampMarginMm} 
                  onChange={e => setStampMarginMm(Number(e.target.value))}
                  style={{ width: '70px', accentColor: '#d97706' }} 
                />
                <span style={{ fontSize: '0.72rem', color: 'var(--text-main)', fontWeight: 600, fontFamily: 'monospace' }}>{stampMarginMm}mm</span>
              </div>
            )}

            {/* Font size control */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ફોન્ટ:</span>
              <button 
                className="tool-toggle-btn" 
                style={{ padding: '0.2rem 0.45rem' }} 
                onClick={() => setFontSizePt(Math.max(10, fontSizePt - 1))}
              >
                -
              </button>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: 600, minWidth: '28px', textAlign: 'center' }}>
                {fontSizePt}pt
              </span>
              <button 
                className="tool-toggle-btn" 
                style={{ padding: '0.2rem 0.45rem' }} 
                onClick={() => setFontSizePt(Math.min(18, fontSizePt + 1))}
              >
                +
              </button>
            </div>

            {/* Zoom Controls */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', marginLeft: '0.3rem' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ઝૂમ:</span>
              <button 
                className="tool-toggle-btn" 
                style={{ padding: '0.2rem 0.45rem' }} 
                onClick={() => setZoomLevel(Math.max(60, zoomLevel - 10))}
              >
                -
              </button>
              <button
                className="tool-toggle-btn"
                style={{ padding: '0.2rem 0.45rem', fontSize: '0.75rem', fontFamily: 'monospace' }}
                onClick={() => setZoomLevel(zoomLevel === 100 ? 80 : 100)}
              >
                {zoomLevel}%
              </button>
              <button 
                className="tool-toggle-btn" 
                style={{ padding: '0.2rem 0.45rem' }} 
                onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
              >
                +
              </button>
            </div>

            {/* Highlight empty toggle */}
            <button 
              className={`tool-toggle-btn ${highlightEmpty ? 'active' : ''}`}
              onClick={() => setHighlightEmpty(!highlightEmpty)}
              title="બાકી રહેલ ફિલ્ડ્સ હાઇલાઇટ કરો"
            >
              <Eye size={13} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className="btn-secondary" 
              onClick={handleCopyText}
              title="લખાણ કોપી કરો"
            >
              {copied ? <Check size={16} style={{ color: '#34d399' }} /> : <Copy size={16} />}
              <span>{copied ? 'કોપી થઈ ગયું!' : 'કોપી કરો'}</span>
            </button>

            <button 
              className="btn-secondary" 
              onClick={handleExportWord}
              title="Microsoft Word (.doc) ફાઇલમાં ડાઉનલોડ કરો"
            >
              <Download size={16} />
              <span>Word (.doc)</span>
            </button>

            <button 
              className="btn-primary" 
              onClick={handlePrint}
              title="પ્રિન્ટ કાઢો અથવા PDF તરીકે સેવ કરો"
            >
              <Printer size={16} />
              <span>પ્રિન્ટ / PDF કાઢો</span>
            </button>
          </div>
        </div>

        {/* Direct Edit Active Notification Banner */}
        {isDirectEditMode && (
          <div className="direct-edit-banner no-print">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Edit3 size={16} style={{ color: '#4f46e5' }} />
              <span>
                <strong>ડાયરેક્ટ એડિટિંગ મોડ ચાલુ છે:</strong> હવે તમે પેપર પર ગમે ત્યાં ક્લિક કરીને સીધું લખાણ ટાઇપ કરી શકો છો, Enter આપી લાઇન સ્પેસ વધારી શકો છો.
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className="btn-secondary" 
                style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', background: '#ffffff', color: '#1e293b' }}
                onClick={handleInsertPageBreak}
                title="અહીંથી નવું પેજ શરૂ કરો"
              >
                <Scissors size={13} />
                <span>પેજ બ્રેક ઉમેરો (+ Page Break)</span>
              </button>

              {customDirectHtml !== null && (
                <button 
                  className="btn-secondary" 
                  style={{ fontSize: '0.74rem', padding: '0.25rem 0.6rem', color: '#dc2626' }}
                  onClick={handleResetDirectEdit}
                >
                  <RotateCcw size={13} />
                  <span>ફોર્મ ડેટા મુજબ રીસેટ</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stamp banner if mode active */}
        {stampPaperMode && (
          <div className="stamp-notice-banner no-print">
            <span>
              ⚡ <strong>ઇ-સ્ટેમ્પ મોડ સક્રિય ({stampMarginMm}mm):</strong> પ્રથમ પેજ પર ઉપરથી જગ્યા છૂટશે જેથી ગુજરાત સ્ટેમ્પ પેપર પર સીધું પ્રિન્ટ કરી શકાય. પેજ ૨ પર સામાન્ય માર્જિન લાગુ રહેશે.
            </span>
            <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>
              પેપર સાઇઝ: <strong>{PAPER_SIZES[pageSetup.paperSize]?.name}</strong>
            </span>
          </div>
        )}

        {/* Paper Viewport */}
        <div className="paper-viewport">
          <div 
            className="document-pages-container"
            style={{ zoom: zoomLevel !== 100 ? zoomLevel / 100 : 1 }}
          >
            {documentPages.map((pageHtml, pageIndex) => {
              const isFirstPage = pageIndex === 0;
              const topPad = (isFirstPage && stampPaperMode) 
                ? `${stampMarginMm}mm` 
                : `${pageSetup.marginTop}mm`;

              return (
                <div 
                  key={pageIndex}
                  className={`legal-sheet ${isFirstPage && stampPaperMode ? 'stamp-paper-mode' : ''}`}
                  style={{
                    width: `${pageSetup.paperWidthMm}mm`,
                    minHeight: `${pageSetup.paperHeightMm}mm`,
                    paddingTop: topPad,
                    paddingBottom: `${pageSetup.marginBottom}mm`,
                    paddingLeft: `${pageSetup.marginLeft}mm`,
                    paddingRight: `${pageSetup.marginRight}mm`,
                    fontFamily: LEGAL_FONTS.find(f => f.id === selectedFontId)?.family || 'var(--font-doc)',
                    fontSize: `${fontSizePt}pt`,
                    lineHeight: pageSetup.lineHeight,
                  }}
                >
                  {/* Page indicator tag */}
                  <div className="sheet-page-header-tag no-print">
                    <FileText size={12} />
                    <span>
                      પેજ {pageIndex + 1} / {documentPages.length} ({PAPER_SIZES[pageSetup.paperSize]?.name.split(' ')[0]})
                    </span>
                  </div>

                  {/* Visual simulation of e-Stamp zone when stamp mode is on */}
                  {isFirstPage && stampPaperMode && (
                    <div 
                      className="stamp-paper-placeholder-zone no-print" 
                      style={{ height: `${stampMarginMm}mm` }}
                    >
                      <div className="stamp-zone-content">
                        <div style={{ fontSize: '0.88rem', color: '#b45309', fontWeight: 800 }}>
                          🏛️ સરકારી ઇ-સ્ટેમ્પ પ્રમાણપત્ર / STAMP PAPER ZONE ({stampMarginMm}mm)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#78350f', marginTop: '2px' }}>
                          આ ભાગમાં પ્રિન્ટ થશે નહીં. સ્ટેમ્પ પેપર સીધું પ્રિન્ટરમાં નાખો.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Body */}
                  <div 
                    className={`doc-body-text ${isDirectEditMode ? 'direct-editing-active' : ''}`}
                    contentEditable={isDirectEditMode}
                    suppressContentEditableWarning={true}
                    onBlur={handleDirectEditBlur}
                    style={{ marginBottom: `${pageSetup.paragraphSpacing}px` }}
                    dangerouslySetInnerHTML={{ __html: pageHtml }}
                  />

                  {/* Page Number in Footer */}
                  {pageSetup.showPageNumbers && (
                    <div className="sheet-footer-page-num">
                      પેજ {pageIndex + 1} / {documentPages.length}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Page Setup Modal */}
      <PageSetupModal 
        isOpen={isPageSetupOpen}
        onClose={() => setIsPageSetupOpen(false)}
        pageSetup={pageSetup}
        onSavePageSetup={handleSavePageSetup}
      />
    </div>
  );
}
