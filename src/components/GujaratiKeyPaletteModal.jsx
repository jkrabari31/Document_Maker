import React, { useState, useMemo } from 'react';
import { 
  X, 
  Keyboard, 
  Search, 
  Copy, 
  Check, 
  Sparkles, 
  Minimize2, 
  Maximize2,
  Info,
  Layers,
  FileText
} from 'lucide-react';

export const GUJARATI_KEY_DATA = {
  special: [
    { char: 'ક્ષ', code: 'ksha / xa', example: 'દા.ત. ક્ષત્રિય' },
    { char: 'જ્ઞ', code: 'gna / gya', example: 'દા.ત. જ્ઞાન' },
    { char: 'ત્ર', code: 'tra', example: 'દા.ત. ત્રણ' },
    { char: 'શ્ર', code: 'shra', example: 'દા.ત. શ્રી / શ્રવણ' },
    { char: 'ઋ', code: 'Ru', example: 'દા.ત. ઋષિ (કેપિટલ R)' },
    { char: 'ણ', code: 'Na', example: 'દા.ત. ફેણ (કેપિટલ N)' },
    { char: 'ળ', code: 'La', example: 'દા.ત. નળ (કેપિટલ L)' },
    { char: 'ષ', code: 'Sha', example: 'દા.ત. ષટ્કોણ (કેપિટલ S)' },
    { char: 'શ', code: 'sha', example: 'દા.ત. શરણાઈ (સ્મોલ s)' },
    { char: 'દ્વ', code: 'dva', example: 'દા.ત. દ્વિતીય' },
    { char: 'દ્ય', code: 'dya', example: 'દા.ત. વિદ્યા' },
    { char: 'હ્ર', code: 'hra', example: 'દા.ત. હ્રસ્વ' },
    { char: 'શ્ચ', code: 'shcha', example: 'દા.ત. આશ્ચર્ય' },
    { char: 'ષ્ટ', code: 'ShTa', example: 'દા.ત. સ્પષ્ટ' },
    { char: 'ષ્ઠ', code: 'ShTha', example: 'દા.ત. શ્રેષ્ઠ' },
    { char: 'દ્ધ', code: 'ddha', example: 'દા.ત. શુદ્ધ' },
    { char: 'દ્દ', code: 'dda', example: 'દા.ત. મુદ્દો' },
    { char: 'ક્ત', code: 'kta', example: 'દા.ત. ભક્ત' }
  ],
  matras: [
    { char: 'ૃ', code: 'ru', example: 'ઋત્વ (દા.ત. kru -> કૃ)' },
    { char: 'ૄ', code: 'Ru', example: 'દીર્ઘ ઋત્વ' },
    { char: 'ૅ', code: 'E', example: 'ચંદ્ર માત્રા (દા.ત. bEk -> બૅંક)' },
    { char: 'ૉ', code: 'O', example: 'ચંદ્ર માત્રા (દા.ત. kOl -> કૉલ)' },
    { char: 'ં', code: 'M / ~m', example: 'અનુસ્વાર (દા.ત. ram -> રં)' },
    { char: 'ઃ', code: 'H', example: 'વિસર્ગ (દા.ત. namaH -> નમઃ)' },
    { char: '્', code: '~', example: 'હલંત / અડધો અક્ષર' },
    { char: 'ા', code: 'aa / A', example: 'કાનો (દા.ત. ka -> કા)' },
    { char: 'િ', code: 'i', example: 'હ્રસ્વ ઇ (દા.ત. ki -> કિ)' },
    { char: 'ી', code: 'ee / I', example: 'દીર્ઘ ઈ (દા.ત. kee -> કી)' },
    { char: 'ુ', code: 'u', example: 'હ્રસ્વ ઉ (દા.ત. ku -> કુ)' },
    { char: 'ૂ', code: 'oo / U', example: 'દીર્ઘ ઊ (દા.ત. koo -> કૂ)' },
    { char: 'ે', code: 'e', example: 'એક માત્રા (દા.ત. ke -> કે)' },
    { char: 'ૈ', code: 'ai', example: 'બે માત્રા (દા.ત. kai -> કૈ)' },
    { char: 'ો', code: 'o', example: 'કાનો-માત્રા (દા.ત. ko -> કો)' },
    { char: 'ૌ', code: 'au', example: 'કાનો-બે માત્રા (દા.ત. kau -> કૌ)' },
    { char: 'અ', code: 'a', example: 'સ્વર અ' },
    { char: 'આ', code: 'aa', example: 'સ્વર આ' },
    { char: 'ઇ', code: 'i', example: 'સ્વર ઇ' },
    { char: 'ઈ', code: 'ee', example: 'સ્વર ઈ' },
    { char: 'ઉ', code: 'u', example: 'સ્વર ઉ' },
    { char: 'ઊ', code: 'oo', example: 'સ્વર ઊ' },
    { char: 'એ', code: 'e', example: 'સ્વર એ' },
    { char: 'ઐ', code: 'ai', example: 'સ્વર ઐ' },
    { char: 'ઓ', code: 'o', example: 'સ્વર ઓ' },
    { char: 'ઔ', code: 'au', example: 'સ્વર ઔ' }
  ],
  numbers: [
    { char: '૧', code: '1', example: 'એક' },
    { char: '૨', code: '2', example: 'બે' },
    { char: '૩', code: '3', example: 'ત્રણ' },
    { char: '૪', code: '4', example: 'ચાર' },
    { char: '૫', code: '5', example: 'પાંચ' },
    { char: '૬', code: '6', example: 'છ' },
    { char: '૭', code: '7', example: 'સાત' },
    { char: '૮', code: '8', example: 'આઠ' },
    { char: '૯', code: '9', example: 'નવ' },
    { char: '૦', code: '0', example: 'શૂન્ય' },
    { char: '₹', code: 'rs', example: 'રૂપિયા પ્રતીક' },
    { char: '⚖️', code: 'court', example: 'કાનૂની પ્રતીક' },
    { char: 'નં.', code: 'no', example: 'નંબર' },
    { char: 'તા.', code: 'date', example: 'તારીખ' },
    { char: 'મુ.', code: 'place', example: 'મુકામ' },
    { char: 'રહે.', code: 'res', example: 'રહેવાસી' },
    { char: 'ઉં.', code: 'age', example: 'ઉંમર' },
    { char: 'પ્રતિ,', code: 'to', example: 'સંબોધન' },
    { char: 'સાક્ષી:', code: 'wit', example: 'સાક્ષી' },
    { char: 'સહી:', code: 'sign', example: 'સહી' }
  ],
  rules: [
    { rule: 'ક્ષ (ksha / xa)', desc: 'ksha અથવા xa લખીને સ્પેસ આપવાથી "ક્ષ" બને છે. દા.ત. kshatriya -> ક્ષત્રિય' },
    { rule: 'જ્ઞ (gna / gya)', desc: 'gna અથવા gya લખવાથી "જ્ઞ" બને છે. દા.ત. gnan -> જ્ઞાન, yagna -> યજ્ઞ' },
    { rule: 'ત્ર (tra)', desc: 'tra લખવાથી "ત્ર" બને છે. દા.ત. tran -> ત્રણ, patra -> પત્ર' },
    { rule: 'શ્ર (shra)', desc: 'shra લખવાથી "શ્ર" બને છે. દા.ત. shree -> શ્રી, shramik -> શ્રમિક' },
    { rule: 'ઋ / ૃ (Ru / ru)', desc: 'કેપિટલ Ru થી "ઋ" બને છે (દા.ત. Rushi -> ઋષિ). અને વ્યંજન સાથે ru લખવાથી ઋત્વ માત્રા બને છે (દા.ત. kru -> કૃ, pruchha -> પૃચ્છા).' },
    { rule: 'ષ vs શ vs સ', desc: 'કેપિટલ Sha થી "ષ" બને છે (દા.ત. kaShTa -> કષ્ટ). સ્મોલ sha થી "શ" (દા.ત. shanti -> શાંતિ). સ્મોલ sa થી "સ" (દા.ત. satya -> સત્ય).' },
    { rule: 'ણ (Na) vs ળ (La)', desc: 'કેપિટલ Na થી "ણ" બને છે (દા.ત. baaN -> બાણ). કેપિટલ La થી "ળ" બને છે (દા.ત. faL -> ફળ).' },
    { rule: 'અડધો અક્ષર (જોડાક્ષર)', desc: 'બે વ્યંજન વચ્ચે સ્વર વગર લખવાથી જોડાક્ષર બને છે. દા.ત. satya -> સત્ય, mukhy -> મુખ્ય, dhyan -> ધ્યાન, vyakti -> વ્યક્તિ.' },
    { rule: 'અનુસ્વાર (ં)', desc: 'અક્ષર પાછળ m અથવા M લખવાથી અનુસ્વાર બને છે. દા.ત. pandit -> પંડિત, sankalp -> સંકલ્પ.' }
  ]
};

export default function GujaratiKeyPaletteModal({ 
  isOpen, 
  onClose,
  onInsertChar 
}) {
  const [activeTab, setActiveTab] = useState('special'); // 'special' | 'matras' | 'numbers' | 'rules'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedChar, setCopiedChar] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) return null;

  const handleCharClick = (char) => {
    // 1. Copy to clipboard
    try {
      navigator.clipboard.writeText(char);
    } catch (e) {}

    // 2. Call parent insert callback
    if (onInsertChar && typeof onInsertChar === 'function') {
      onInsertChar(char);
    }

    // 3. Show feedback
    setCopiedChar(char);
    setTimeout(() => {
      setCopiedChar('');
    }, 1500);
  };

  return (
    <div 
      className="gujarati-palette-floating-window"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        width: isMinimized ? '280px' : '440px',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: isMinimized ? '54px' : '560px',
        background: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 12px 36px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(148, 163, 184, 0.3)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: 'var(--font-main)'
      }}
    >
      {/* Header Bar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.65rem 0.95rem',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
          color: '#ffffff',
          userSelect: 'none',
          borderBottom: isMinimized ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Keyboard size={16} style={{ color: '#fbbf24' }} />
          <strong style={{ fontSize: '0.86rem', letterSpacing: '0.2px' }}>
            ગુજરાતી અક્ષર પેલેટ
          </strong>
          {copiedChar && (
            <span style={{ 
              background: '#059669', 
              color: '#ffffff', 
              fontSize: '0.7rem', 
              padding: '2px 8px', 
              borderRadius: '12px',
              fontWeight: 600,
              animation: 'fadeIn 0.15s ease'
            }}>
              "{copiedChar}" ઉમેરાયું!
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "વિસ્તૃત કરો (Expand)" : "સંકેલો (Minimize)"}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px'
            }}
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button
            type="button"
            onClick={onClose}
            title="બંધ કરો (Close)"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '4px'
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Navigation Tabs */}
          <div 
            style={{
              display: 'flex',
              borderBottom: '1px solid #e2e8f0',
              background: '#f8fafc',
              padding: '0.25rem 0.5rem',
              gap: '0.25rem'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('special')}
              style={{
                flex: 1,
                padding: '0.45rem 0.4rem',
                border: 'none',
                background: activeTab === 'special' ? '#ffffff' : 'transparent',
                color: activeTab === 'special' ? 'var(--primary)' : '#64748b',
                fontWeight: activeTab === 'special' ? 700 : 500,
                fontSize: '0.76rem',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'special' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              🌟 ખાસ / જોડાક્ષર
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matras')}
              style={{
                flex: 1,
                padding: '0.45rem 0.4rem',
                border: 'none',
                background: activeTab === 'matras' ? '#ffffff' : 'transparent',
                color: activeTab === 'matras' ? 'var(--primary)' : '#64748b',
                fontWeight: activeTab === 'matras' ? 700 : 500,
                fontSize: '0.76rem',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'matras' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              🔤 માત્રાઓ & સ્વર
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('numbers')}
              style={{
                flex: 1,
                padding: '0.45rem 0.4rem',
                border: 'none',
                background: activeTab === 'numbers' ? '#ffffff' : 'transparent',
                color: activeTab === 'numbers' ? 'var(--primary)' : '#64748b',
                fontWeight: activeTab === 'numbers' ? 700 : 500,
                fontSize: '0.76rem',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'numbers' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              🔢 અંકો & સંજ્ઞા
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              style={{
                flex: 1,
                padding: '0.45rem 0.4rem',
                border: 'none',
                background: activeTab === 'rules' ? '#ffffff' : 'transparent',
                color: activeTab === 'rules' ? 'var(--primary)' : '#64748b',
                fontWeight: activeTab === 'rules' ? 700 : 500,
                fontSize: '0.76rem',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: activeTab === 'rules' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
            >
              📖 કી-રૂલ્સ
            </button>
          </div>

          {/* Quick Notice Tip */}
          <div style={{ 
            padding: '0.4rem 0.85rem', 
            background: '#f1f5f9', 
            fontSize: '0.72rem', 
            color: '#475569',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span>💡 <strong>ટિપ:</strong> કોઈપણ અક્ષર પર ક્લિક કરતાં કર્સર પાસે ઉમેરાશે & કોપી થશે.</span>
            <span style={{ color: '#0284c7', fontWeight: 600, fontSize: '0.68rem' }}>Ctrl+G: ચાલુ/બંધ</span>
          </div>

          {/* Tab Content Body */}
          <div style={{ padding: '0.75rem', overflowY: 'auto', maxHeight: '420px' }}>
            {activeTab !== 'rules' ? (
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: activeTab === 'numbers' ? 'repeat(auto-fill, minmax(78px, 1fr))' : 'repeat(auto-fill, minmax(68px, 1fr))',
                  gap: '0.5rem'
                }}
              >
                {GUJARATI_KEY_DATA[activeTab].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleCharClick(item.char)}
                    title={`ક્લિક કરો: ${item.char} (ટાઇપિંગ કોડ: ${item.code} | ${item.example})`}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '0.45rem 0.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.2rem',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.background = '#eff6ff';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#cbd5e1';
                      e.currentTarget.style.background = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <span style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: 700, 
                      color: '#0f172a',
                      fontFamily: "'Noto Serif Gujarati', serif",
                      lineHeight: 1.1
                    }}>
                      {item.char}
                    </span>
                    <span style={{ 
                      fontSize: '0.66rem', 
                      color: '#64748b', 
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      background: '#f8fafc',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      width: '90%',
                      textAlign: 'center',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.code}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {GUJARATI_KEY_DATA.rules.map((r, idx) => (
                  <div 
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '0.6rem 0.75rem'
                    }}
                  >
                    <strong style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'block', marginBottom: '0.2rem' }}>
                      {r.rule}
                    </strong>
                    <p style={{ margin: 0, fontSize: '0.74rem', color: '#334155', lineHeight: 1.45 }}>
                      {r.desc}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
