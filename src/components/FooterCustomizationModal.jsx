import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Sparkles, Layout, Type, Tag, HelpCircle, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { DEFAULT_FOOTER_SETUP } from '../utils/documentUtils';

export default function FooterCustomizationModal({
  isOpen,
  onClose,
  footerSetup,
  onSaveFooterSetup,
  documentTitle = 'દસ્તાવેજ',
  clientName = 'અસીલ',
  advocateName = ''
}) {
  if (!isOpen) return null;

  const initial = footerSetup || DEFAULT_FOOTER_SETUP;

  const [enabled, setEnabled] = useState(initial.enabled ?? true);
  const [leftText, setLeftText] = useState(initial.leftText || '');
  const [centerText, setCenterText] = useState(initial.centerText ?? 'પાનું નં. {page} / {total}');
  const [rightText, setRightText] = useState(initial.rightText || '');
  const [showContinuation, setShowContinuation] = useState(initial.showContinuation ?? true);
  const [borderStyle, setBorderStyle] = useState(initial.borderStyle || 'dashed');
  const [fontSize, setFontSize] = useState(initial.fontSize || 'small');
  const [activeInput, setActiveInput] = useState('center'); // 'left' | 'center' | 'right'

  useEffect(() => {
    if (isOpen) {
      const fs = footerSetup || DEFAULT_FOOTER_SETUP;
      setEnabled(fs.enabled ?? true);
      setLeftText(fs.leftText || '');
      setCenterText(fs.centerText ?? 'પાનું નં. {page} / {total}');
      setRightText(fs.rightText || '');
      setShowContinuation(fs.showContinuation ?? true);
      setBorderStyle(fs.borderStyle || 'dashed');
      setFontSize(fs.fontSize || 'small');
    }
  }, [isOpen, footerSetup]);

  // Tag replacements helper
  const availableTags = [
    { tag: '{page}', label: 'પાનું નં.' },
    { tag: '{total}', label: 'કુલ પાના' },
    { tag: '{next}', label: 'આગળનું પાનું' },
    { tag: '{title}', label: 'દસ્તાવેજ શીર્ષક' },
    { tag: '{client}', label: 'અસીલનું નામ' },
    { tag: '{date}', label: 'તારીખ' },
    { tag: '{advocate}', label: 'એડવોકેટ નામ' }
  ];

  const handleInsertTag = (tag) => {
    if (activeInput === 'left') {
      setLeftText(prev => prev + ' ' + tag);
    } else if (activeInput === 'right') {
      setRightText(prev => prev + ' ' + tag);
    } else {
      setCenterText(prev => prev + ' ' + tag);
    }
  };

  // Presets
  const applyPreset = (presetType) => {
    if (presetType === 'standard') {
      setLeftText('');
      setCenterText('પાનું નં. {page} / {total}');
      setRightText('');
      setShowContinuation(true);
      setBorderStyle('dashed');
    } else if (presetType === 'advocate_sign') {
      setLeftText(advocateName ? `એડવોકેટ: ${advocateName}` : '{title}');
      setCenterText('પાનું નં. {page} / {total}');
      setRightText('અસીલની સહી: ________________');
      setShowContinuation(false);
      setBorderStyle('solid');
    } else if (presetType === 'title_date') {
      setLeftText('{title}');
      setCenterText('{page} / {total}');
      setRightText('તારીખ: {date}');
      setShowContinuation(false);
      setBorderStyle('dashed');
    } else if (presetType === 'simple_number') {
      setLeftText('');
      setCenterText('પાનું {page}');
      setRightText('');
      setShowContinuation(false);
      setBorderStyle('none');
    }
  };

  // Live preview formatting
  const previewLeft = leftText
    .replace(/\{page\}/g, '૧')
    .replace(/\{total\}/g, '૩')
    .replace(/\{next\}/g, '૨')
    .replace(/\{title\}/g, documentTitle || 'વેચાણ દસ્તાવેજ')
    .replace(/\{client\}/g, clientName || 'પટેલ રમેશભાઈ')
    .replace(/\{date\}/g, new Date().toLocaleDateString('gu-IN'))
    .replace(/\{advocate\}/g, advocateName || 'એડવોકેટ શ્રી');

  const previewCenter = centerText
    .replace(/\{page\}/g, '૧')
    .replace(/\{total\}/g, '૩')
    .replace(/\{next\}/g, '૨')
    .replace(/\{title\}/g, documentTitle || 'વેચાણ દસ્તાવેજ')
    .replace(/\{client\}/g, clientName || 'પટેલ રમેશભાઈ')
    .replace(/\{date\}/g, new Date().toLocaleDateString('gu-IN'))
    .replace(/\{advocate\}/g, advocateName || 'એડવોકેટ શ્રી');

  let previewRight = rightText
    .replace(/\{page\}/g, '૧')
    .replace(/\{total\}/g, '૩')
    .replace(/\{next\}/g, '૨')
    .replace(/\{title\}/g, documentTitle || 'વેચાણ દસ્તાવેજ')
    .replace(/\{client\}/g, clientName || 'પટેલ રમેશભાઈ')
    .replace(/\{date\}/g, new Date().toLocaleDateString('gu-IN'))
    .replace(/\{advocate\}/g, advocateName || 'એડવોકેટ શ્રી');

  if (!previewRight && showContinuation) {
    previewRight = '(ક્રમશઃ પાના નં. ૨ ઉપર...)';
  }

  const handleApply = () => {
    const updated = {
      enabled,
      leftText: leftText.trim(),
      centerText: centerText.trim() || 'પાનું નં. {page} / {total}',
      rightText: rightText.trim(),
      showPageNumbers: true,
      showContinuation,
      borderStyle,
      fontSize
    };
    onSaveFooterSetup(updated);
    onClose();
  };

  const handleReset = () => {
    setEnabled(true);
    setLeftText('');
    setCenterText('પાનું નં. {page} / {total}');
    setRightText('');
    setShowContinuation(true);
    setBorderStyle('dashed');
    setFontSize('small');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-dialog"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '680px', width: '95%' }}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
            }}>
              <Layout size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                દસ્તાવેજ ફૂટર કસ્ટમાઇઝેશન મેનૂ
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0, marginTop: '2px' }}>
                પેજ નંબર્સ, ઓફિસ વિગત, અસીલ સહી સ્પેસ અને બોર્ડર તમારી મરજી મુજબ ગોઠવો
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '1.25rem' }}>

          {/* 1. Real-time Live Preview Card */}
          <div>
            <label className="field-label" style={{ marginBottom: '0.4rem', fontWeight: 700 }}>
              <span>લાઇવ પ્રિવ્યૂ (કાગળના છેડે કેવું દેખાશે)</span>
            </label>
            <div style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '8px',
              padding: '1.1rem 1.25rem',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.04)'
            }}>
              <div style={{ fontSize: '0.70rem', color: '#94a3b8', textAlign: 'center', marginBottom: '0.6rem' }}>
                --- દસ્તાવેજનું મુખ્ય લખાણ ઉપર રહેશે ---
              </div>

              {enabled ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: borderStyle === 'none' ? 'none' : borderStyle === 'solid' ? '1px solid #94a3b8' : '1px dashed #cbd5e1',
                  paddingTop: '6pt',
                  fontSize: fontSize === 'large' ? '10.5pt' : fontSize === 'medium' ? '9.5pt' : '8.5pt',
                  color: '#475569',
                  fontFamily: 'inherit'
                }}>
                  <div style={{ flex: 1, textAlign: 'left', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {previewLeft || <span style={{ color: '#cbd5e1' }}>(ડાબી બાજુ ખાલી)</span>}
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', fontWeight: 600 }}>
                    {previewCenter || <span style={{ color: '#cbd5e1' }}>(મધ્ય ભાગ ખાલી)</span>}
                  </div>
                  <div style={{ flex: 1, textAlign: 'right', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {previewRight || <span style={{ color: '#cbd5e1' }}>(જમણી બાજુ ખાલી)</span>}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '0.5rem', color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>
                  ❌ ફૂટર બંધ રાખેલ છે (દસ્તાવેજના અંતે કશું જ પ્રિન્ટ થશે નહીં)
                </div>
              )}
            </div>
          </div>

          {/* 2. Enable / Disable Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <input
              type="checkbox"
              id="footerEnabledCheck"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              style={{ width: '18px', height: '18px', accentColor: '#2563eb', cursor: 'pointer' }}
            />
            <label htmlFor="footerEnabledCheck" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', cursor: 'pointer' }}>
              દસ્તાવેજના તમામ પાના પર ફૂટર દર્શાવો (Enable Footer)
            </label>
          </div>

          {enabled && (
            <>
              {/* 3. Quick Presets */}
              <div>
                <label className="field-label" style={{ marginBottom: '0.45rem', fontWeight: 700 }}>
                  <span>ઝડપી ટેમ્પલેટ પ્રીસેટ્સ (Quick Presets)</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => applyPreset('standard')}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    🏛️ <strong>લીગલ સ્ટાન્ડર્ડ:</strong> પાનું નં. {`{page}`} / {`{total}`}
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('advocate_sign')}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    ✍️ <strong>અસીલ સહી શૈલી:</strong> પેજ નંબર + સહી લાઈન
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('title_date')}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    📅 <strong>શીર્ષક & તારીખ:</strong> શીર્ષક + પેજ + તારીખ
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('simple_number')}
                    style={{
                      padding: '0.55rem 0.75rem',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      background: '#f8fafc',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#1e293b',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    🔢 <strong>સાદા પેજ નંબર:</strong> માત્ર પાનું નં. (કોઈ લાઈન નહિ)
                  </button>
                </div>
              </div>

              {/* 4. Three Column Text Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <label className="field-label" style={{ marginBottom: '-0.2rem', fontWeight: 700 }}>
                  <span>ફૂટર લખાણ કસ્ટમાઇઝેશન (ડાબે, મધ્યે અને જમણે)</span>
                </label>

                {/* Left Text */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlignLeft size={13} />
                      <span>ડાબી બાજુનું લખાણ (Left)</span>
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>દા.ત. શીર્ષક / કેસ નંબર / ઓફિસ</span>
                  </div>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="દા.ત. {title} અથવા ઓફિસ નામ..."
                    value={leftText}
                    onFocus={() => setActiveInput('left')}
                    onChange={e => setLeftText(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>

                {/* Center Text */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlignCenter size={13} />
                      <span>મધ્યનું લખાણ (Center)</span>
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>દા.ત. પાનું નં. {'{page}'} / {'{total}'}</span>
                  </div>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="દા.ત. પાનું નં. {page} / {total}"
                    value={centerText}
                    onFocus={() => setActiveInput('center')}
                    onChange={e => setCenterText(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>

                {/* Right Text */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <AlignRight size={13} />
                      <span>જમણી બાજુનું લખાણ (Right)</span>
                    </span>
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>ખાલી રાખશો તો આપોઆપ ક્રમશઃ શેરો દર્શાવશે</span>
                  </div>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="દા.ત. અસીલની સહી: ________________ અથવા {date}"
                    value={rightText}
                    onFocus={() => setActiveInput('right')}
                    onChange={e => setRightText(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  />
                </div>
              </div>

              {/* 5. Dynamic Insertion Tags Chips */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.4rem' }}>
                  <Tag size={13} style={{ color: '#2563eb' }} />
                  <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#1e3a8a' }}>
                    ડાયનેમિક ટૅગ્સ (ક્લિક કરતા જ સિલેક્ટ થયેલ ઇનપુટમાં ઉમેરાશે):
                  </span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {availableTags.map(item => (
                    <button
                      key={item.tag}
                      type="button"
                      onClick={() => handleInsertTag(item.tag)}
                      title={`${item.label} (${item.tag})`}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #93c5fd',
                        borderRadius: '14px',
                        padding: '0.2rem 0.55rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        color: '#1d4ed8',
                        cursor: 'pointer'
                      }}
                    >
                      + {item.label} <code style={{ fontSize: '0.68rem', color: '#64748b' }}>{item.tag}</code>
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Style & Format Options */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
                {/* Border Style */}
                <div>
                  <label className="field-label" style={{ marginBottom: '0.3rem', fontWeight: 600 }}>
                    <span>ડિવાઈડર લાઈન (Divider Line)</span>
                  </label>
                  <select
                    className="input-control"
                    value={borderStyle}
                    onChange={e => setBorderStyle(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  >
                    <option value="dashed">ટપકાંવાળી લાઈન (Dashed Line)</option>
                    <option value="solid">સળંગ પાતળી લાઈન (Solid Line)</option>
                    <option value="none">કોઈ લાઈન નહિ (None)</option>
                  </select>
                </div>

                {/* Font Size */}
                <div>
                  <label className="field-label" style={{ marginBottom: '0.3rem', fontWeight: 600 }}>
                    <span>ફૂટર ફોન્ટ સાઈઝ (Font Size)</span>
                  </label>
                  <select
                    className="input-control"
                    value={fontSize}
                    onChange={e => setFontSize(e.target.value)}
                    style={{ fontSize: '0.82rem' }}
                  >
                    <option value="small">નાની - 8.5 pt (લીગલ સ્ટાન્ડર્ડ)</option>
                    <option value="medium">મધ્યમ - 9.5 pt</option>
                    <option value="large">સામાન્ય - 10.5 pt</option>
                  </select>
                </div>
              </div>

              {/* 7. Show Continuation Toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <input
                  type="checkbox"
                  id="continuationCheck"
                  checked={showContinuation}
                  onChange={e => setShowContinuation(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: '#2563eb', cursor: 'pointer' }}
                />
                <label htmlFor="continuationCheck" style={{ fontSize: '0.82rem', color: '#334155', cursor: 'pointer' }}>
                  મલ્ટી-પેજ દસ્તાવેજમાં ક્રમશઃ આગળના પેજનો શેરો દર્શાવો (દા.ત. "(ક્રમશઃ પાના નં. ૨ ઉપર...)")
                </label>
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleReset}
            style={{ fontSize: '0.82rem' }}
          >
            <RotateCcw size={13} />
            <span>Default</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ fontSize: '0.82rem' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={handleApply}
              style={{ fontSize: '0.82rem', fontWeight: 700 }}
            >
              <Check size={15} />
              <span>Save</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
