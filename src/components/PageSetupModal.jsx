import React from 'react';
import { X, Sliders, Check, FileText, MoveHorizontal, MoveVertical, AlignLeft, Layers } from 'lucide-react';

export const PAPER_SIZES = {
  A4: {
    name: "A4 (સ્ટાન્ડર્ડ)",
    widthMm: 210,
    heightMm: 297,
    desc: "સામાન્ય સોગંદનામા, અરજીઓ અને પ્રમાણપત્રો માટે"
  },
  LEGAL: {
    name: "Legal / લીગલ (કોર્ટ સાઈઝ)",
    widthMm: 216,
    heightMm: 356,
    desc: "હાઈકોર્ટ, સિવિલ કોર્ટ, દસ્તાવેજ રજીસ્ટ્રેશન અને બાનાખત માટે"
  },
  LETTER: {
    name: "Letter (લેટર)",
    widthMm: 216,
    heightMm: 279,
    desc: "લેટરહેડ અને ટૂંકી કાનૂની નોટિસ માટે"
  }
};

export default function PageSetupModal({ 
  isOpen, 
  onClose, 
  pageSetup = {}, 
  onSave,
  onSavePageSetup 
}) {
  if (!isOpen) return null;

  const [paperSize, setPaperSize] = React.useState(pageSetup.paperSize || 'A4');
  const [lineHeight, setLineHeight] = React.useState(pageSetup.lineHeight || 1.8);
  const [fontSizePt, setFontSizePt] = React.useState(pageSetup.fontSizePt || 13);
  const [paragraphSpacing, setParagraphSpacing] = React.useState(pageSetup.paragraphSpacing || 14);
  const [marginTop, setMarginTop] = React.useState(pageSetup.marginTopMm ?? pageSetup.marginTop ?? 25);
  const [marginBottom, setMarginBottom] = React.useState(pageSetup.marginBottomMm ?? pageSetup.marginBottom ?? 25);
  const [marginLeft, setMarginLeft] = React.useState(pageSetup.marginLeftMm ?? pageSetup.marginLeft ?? 28);
  const [marginRight, setMarginRight] = React.useState(pageSetup.marginRightMm ?? pageSetup.marginRight ?? 20);
  const [showPageNumbers, setShowPageNumbers] = React.useState(pageSetup.showPageNumbers ?? true);
  const [showVerificationQR, setShowVerificationQR] = React.useState(pageSetup.showVerificationQR ?? true);
  const [showWatermark, setShowWatermark] = React.useState(pageSetup.showWatermark ?? false);
  const [watermarkText, setWatermarkText] = React.useState(pageSetup.watermarkText || 'કાચો મુસદ્દો / DRAFT');
  const [viewMode, setViewMode] = React.useState(pageSetup.viewMode || 'pages');

  React.useEffect(() => {
    if (isOpen) {
      setPaperSize(pageSetup.paperSize || 'A4');
      setLineHeight(pageSetup.lineHeight || 1.8);
      setFontSizePt(pageSetup.fontSizePt || 13);
      setParagraphSpacing(pageSetup.paragraphSpacing || 14);
      setMarginTop(pageSetup.marginTopMm ?? pageSetup.marginTop ?? 25);
      setMarginBottom(pageSetup.marginBottomMm ?? pageSetup.marginBottom ?? 25);
      setMarginLeft(pageSetup.marginLeftMm ?? pageSetup.marginLeft ?? 28);
      setMarginRight(pageSetup.marginRightMm ?? pageSetup.marginRight ?? 20);
      setShowPageNumbers(pageSetup.showPageNumbers ?? true);
      setShowVerificationQR(pageSetup.showVerificationQR ?? true);
      setShowWatermark(pageSetup.showWatermark ?? false);
      setWatermarkText(pageSetup.watermarkText || 'કાચો મુસદ્દો / DRAFT');
      setViewMode(pageSetup.viewMode || 'pages');
    }
  }, [isOpen, pageSetup]);

  const handleApply = () => {
    const paper = PAPER_SIZES[paperSize] || PAPER_SIZES.A4;
    const updated = {
      paperSize,
      paperWidthMm: paper.widthMm || 210,
      paperHeightMm: paper.heightMm || 297,
      lineHeight: Number(lineHeight) || 1.8,
      fontSizePt: Number(fontSizePt) || 13,
      paragraphSpacing: Number(paragraphSpacing) || 14,
      marginTopMm: Number(marginTop) || 25,
      marginBottomMm: Number(marginBottom) || 25,
      marginLeftMm: Number(marginLeft) || 28,
      marginRightMm: Number(marginRight) || 20,
      marginTop: Number(marginTop) || 25,
      marginBottom: Number(marginBottom) || 25,
      marginLeft: Number(marginLeft) || 28,
      marginRight: Number(marginRight) || 20,
      showPageNumbers,
      showVerificationQR,
      showWatermark,
      watermarkText: watermarkText.trim() || 'કાચો મુસદ્દો / DRAFT',
      viewMode
    };
    if (typeof onSavePageSetup === 'function') {
      onSavePageSetup(updated);
    } else if (typeof onSave === 'function') {
      onSave(updated);
    }
    onClose();
  };

  const handleResetDefaults = () => {
    setPaperSize('A4');
    setLineHeight(1.8);
    setFontSizePt(13);
    setParagraphSpacing(14);
    setMarginTop(25);
    setMarginBottom(25);
    setMarginLeft(28);
    setMarginRight(20);
    setShowPageNumbers(true);
    setShowVerificationQR(true);
    setShowWatermark(false);
    setWatermarkText('કાચો મુસદ્દો / DRAFT');
    setViewMode('pages');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sliders size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              દસ્તાવેજ પેજ સેટઅપ (Page & Print Setup)
            </h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Paper Size Selector */}
          <div>
            <label className="field-label" style={{ marginBottom: '0.6rem' }}>
              <span>૧. પેપર સાઈઝ પસંદ કરો (Paper Size)</span>
              <span style={{ color: 'var(--accent-gold-dark)', fontWeight: 700 }}>{PAPER_SIZES[paperSize].widthMm} x {PAPER_SIZES[paperSize].heightMm} mm</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
              {Object.entries(PAPER_SIZES).map(([key, info]) => (
                <div 
                  key={key}
                  onClick={() => setPaperSize(key)}
                  style={{
                    background: paperSize === key ? '#eff6ff' : '#ffffff',
                    border: paperSize === key ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                    padding: '0.85rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.88rem', color: paperSize === key ? 'var(--primary)' : 'var(--text-main)' }}>{info.name}</strong>
                    {paperSize === key && <Check size={16} style={{ color: 'var(--primary)' }} />}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {info.widthMm} x {info.heightMm} mm
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
                    {info.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* View Mode: Multi-page vs Continuous */}
          <div style={{ background: 'var(--bg-surface)', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <label className="field-label" style={{ marginBottom: '0.5rem' }}>
              <span>૨. પ્રિવ્યૂ ડિસ્પ્લે મોડ (Preview Display Mode)</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button 
                type="button"
                className={`tool-toggle-btn ${viewMode === 'pages' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '0.6rem' }}
                onClick={() => setViewMode('pages')}
              >
                <Layers size={16} />
                <span>મલ્ટિ-પેજ શીટ્સ (Page 1, 2, 3...)</span>
              </button>
              <button 
                type="button"
                className={`tool-toggle-btn ${viewMode === 'continuous' ? 'active' : ''}`}
                style={{ justifyContent: 'center', padding: '0.6rem' }}
                onClick={() => setViewMode('continuous')}
              >
                <FileText size={16} />
                <span>સળંગ પેપર મોડ (Continuous)</span>
              </button>
            </div>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.4rem' }}>
              * મલ્ટિ-પેજ મોડમાં પેજ ૧, પેજ ૨ અલગ અલગ A4/Legal શીટ તરીકે દેખાશે જેથી પ્રિન્ટિંગમાં કેટલા પેજ થશે તે અગાઉથી ખબર પડે.
            </p>
          </div>

          {/* Line Height & Paragraph Spacing */}
          <div>
            <label className="field-label" style={{ marginBottom: '0.5rem' }}>
              <span>૩. લાઇન અને પેરેગ્રાફ સ્પેસિંગ (Spacing & Line Height)</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  <span>લાઇન સ્પેસિંગ (Line Height):</span>
                  <strong style={{ color: 'var(--primary)' }}>{lineHeight}</strong>
                </div>
                <input 
                  type="range" 
                  min="1.2" 
                  max="2.2" 
                  step="0.1"
                  value={lineHeight}
                  onChange={e => setLineHeight(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                  <span>૧.૨ (કોમ્પેક્ટ)</span>
                  <span>૧.૭ (સ્ટાન્ડર્ડ)</span>
                  <span>૨.૦ (કોર્ટ ડબલ)</span>
                </div>
              </div>

              <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                  <span>ફકરા વચ્ચે જગ્યા (Para Spacing):</span>
                  <strong style={{ color: 'var(--accent-gold-dark)' }}>{paragraphSpacing}px</strong>
                </div>
                <input 
                  type="range" 
                  min="8" 
                  max="32" 
                  step="2"
                  value={paragraphSpacing}
                  onChange={e => setParagraphSpacing(e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--accent-gold)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-subtle)' }}>
                  <span>૮px (સાંકડું)</span>
                  <span>૧૬px (સામાન્ય)</span>
                  <span>૩૨px (વિશાળ)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Margins */}
          <div>
            <label className="field-label" style={{ marginBottom: '0.5rem' }}>
              <span>૪. પ્રિન્ટ માર્જિન્સ (Page Margins in mm)</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ડાબી બાજુ (Left/Binding)</span>
                <input 
                  type="number" 
                  min="10" 
                  max="60"
                  className="input-control" 
                  style={{ padding: '0.45rem', fontSize: '0.85rem' }}
                  value={marginLeft}
                  onChange={e => setMarginLeft(e.target.value)}
                />
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>જમણી બાજુ (Right)</span>
                <input 
                  type="number" 
                  min="10" 
                  max="50"
                  className="input-control" 
                  style={{ padding: '0.45rem', fontSize: '0.85rem' }}
                  value={marginRight}
                  onChange={e => setMarginRight(e.target.value)}
                />
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ટોચ (Top)</span>
                <input 
                  type="number" 
                  min="10" 
                  max="80"
                  className="input-control" 
                  style={{ padding: '0.45rem', fontSize: '0.85rem' }}
                  value={marginTop}
                  onChange={e => setMarginTop(e.target.value)}
                />
              </div>

              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>તળિયે (Bottom)</span>
                <input 
                  type="number" 
                  min="10" 
                  max="80"
                  className="input-control" 
                  style={{ padding: '0.45rem', fontSize: '0.85rem' }}
                  value={marginBottom}
                  onChange={e => setMarginBottom(e.target.value)}
                />
              </div>
            </div>
            <p style={{ fontSize: '0.71rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
              * નોંધ: કોર્ટ ફાઇલિંગ માટે ડાબી બાજુ ૨૫mm થી ૩૫mm રાખવાની ભલામણ છે જેથી ફાઇલમાં પંચ કરતી વખતે લખાણ દબાય નહીં.
            </p>
          </div>

          {/* Show Page Numbers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <input 
              type="checkbox"
              id="showPageNumCheck"
              checked={showPageNumbers}
              onChange={e => setShowPageNumbers(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="showPageNumCheck" style={{ fontSize: '0.84rem', color: 'var(--text-main)', cursor: 'pointer' }}>
              દરેક પેજના નીચે પેજ નંબર દર્શાવો (દા.ત. "પેજ ૧ / ૨", "પેજ ૨ / ૨")
            </label>
          </div>

          {/* Show Verification QR Code */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <input 
              type="checkbox"
              id="showVerificationQRCheck"
              checked={showVerificationQR}
              onChange={e => setShowVerificationQR(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
            />
            <label htmlFor="showVerificationQRCheck" style={{ fontSize: '0.84rem', color: 'var(--text-main)', cursor: 'pointer' }}>
              દસ્તાવેજના અંતે સત્યતા અને ખરાઈ માટે QR કોડ દર્શાવો (Digital Verification QR Code)
            </label>
          </div>

          {/* Watermark Section */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: showWatermark ? '0.65rem' : '0' }}>
              <input 
                type="checkbox"
                id="showWatermarkCheck"
                checked={showWatermark}
                onChange={e => setShowWatermark(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="showWatermarkCheck" style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)', cursor: 'pointer' }}>
                કાગળ પર વોટરમાર્ક દર્શાવો (Diagonal Watermark Overlay)
              </label>
            </div>

            {showWatermark && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem', paddingLeft: '1.6rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {[
                    'કાચો મુસદ્દો / DRAFT',
                    'ઓફિસ કોપી / OFFICE COPY',
                    'ખાનગી / CONFIDENTIAL'
                  ].map(txt => (
                    <button
                      key={txt}
                      type="button"
                      onClick={() => setWatermarkText(txt)}
                      style={{
                        fontSize: '0.72rem',
                        padding: '0.2rem 0.55rem',
                        borderRadius: '12px',
                        border: watermarkText === txt ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                        background: watermarkText === txt ? '#eff6ff' : '#ffffff',
                        color: watermarkText === txt ? '#1d4ed8' : '#475569',
                        cursor: 'pointer',
                        fontWeight: watermarkText === txt ? 700 : 500
                      }}
                    >
                      {txt}
                    </button>
                  ))}
                </div>
                <input 
                  type="text"
                  className="input-control"
                  style={{ fontSize: '0.84rem', padding: '0.4rem 0.65rem' }}
                  placeholder="કસ્ટમ વોટરમાર્ક લખાણ દાખલ કરો (દા.ત. ADVOCATE DRAFT)..."
                  value={watermarkText}
                  onChange={e => setWatermarkText(e.target.value)}
                />
                <span style={{ fontSize: '0.70rem', color: '#64748b' }}>
                  * અસીલને ડ્રાફ્ટ વાંચવા આપવા માટે કાગળની વચ્ચે આછો ત્રાંસો વોટરમાર્ક પ્રિન્ટ થશે.
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="btn-secondary" onClick={handleResetDefaults}>
            ડિફોલ્ટ સેટિંગ્સ
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              રદ કરો
            </button>
            <button type="button" className="btn-primary" onClick={handleApply}>
              <Check size={16} />
              <span>સેટિંગ્સ લાગુ કરો</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
