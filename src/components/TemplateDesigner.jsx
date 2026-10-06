import React, { useState, useRef, useMemo } from 'react';
import { 
  Save, 
  Plus, 
  Sparkles, 
  HelpCircle, 
  Eye, 
  Check, 
  FileText, 
  Tag, 
  Bookmark,
  Layers,
  ArrowRight
} from 'lucide-react';
import { extractVariables } from '../utils/documentUtils';
import { quickVariableSnippets, gujaratiLegalPhrases } from '../data/initialTemplates';

export default function TemplateDesigner({ 
  initialTemplate, 
  onSaveTemplate, 
  onCancel 
}) {
  const [title, setTitle] = useState(initialTemplate?.title || '');
  const [category, setCategory] = useState(initialTemplate?.category || 'સોગંદનામું (Affidavit)');
  const [language, setLanguage] = useState(initialTemplate?.language || 'ગુજરાતી');
  const [description, setDescription] = useState(initialTemplate?.description || '');
  const [stampPaperRecommended, setStampPaperRecommended] = useState(initialTemplate?.stampPaperRecommended || '₹ ૧૦૦ નો સ્ટેમ્પ પેપર');
  const [content, setContent] = useState(initialTemplate?.content || `::HEADER_START::
॥ શ્રી ગણેશાય નમઃ ॥
{{દસ્તાવેજ_શીર્ષક}}
::HEADER_END::

સમક્ષ,
માનનીય {{કચેરીનું_નામ}},
મુકામ: {{સ્થળ}}

હું નીચે સહી કરનાર શ્રી {{અરજદારનું_નામ}}, ઉંમર: {{ઉંમર}} વર્ષ, ધંધો: {{ધંધો}},
રહેવાસી: {{સરનામું}}, આધાર કાર્ડ નં.: {{આધાર_કાર્ડ_નં}}.

આથી પવિત્ર પ્રતિજ્ઞા ઉપર સોગંદપૂર્વક જાહેર કરું છું કે:

૧. હું ઉપર જણાવેલ સરનામે રહું છું અને ભારતીય નાગરિક છું.

૨. {{મુખ્ય_હકીકત}}

૩. આથી હું ખાતરીપૂર્વક જણાવું છું કે સદરહુ તમામ વિગતો મારી અંગત માહિતી અને માન્યતા મુજબ સાચી અને ખરી છે.

સ્થળ: {{સ્થળ}}
તારીખ: {{તારીખ}}

------------------------------------
(અરજદારની સહી)
{{અરજદારનું_નામ}}`);

  const [customTagInput, setCustomTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [isPhoneticActive, setIsPhoneticActive] = useState(true);
  const textareaRef = useRef(null);

  // Discovered variables from current text
  const detectedVariables = useMemo(() => {
    return extractVariables(content);
  }, [content]);

  // Insert text/variable tag at cursor position in textarea
  const insertAtCursor = (textToInsert) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setContent(prev => prev + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const textBefore = content.substring(0, start);
    const textAfter = content.substring(end, content.length);

    const newContent = textBefore + textToInsert + textAfter;
    setContent(newContent);

    // Reposition cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  const handleInsertVariable = (varKey) => {
    insertAtCursor(`{{${varKey}}}`);
  };

  const handleAddCustomTag = (e) => {
    e.preventDefault();
    if (!customTagInput.trim()) return;
    const cleanKey = customTagInput.trim().replace(/\s+/g, '_').replace(/[{}\[\]]/g, '');
    insertAtCursor(`{{${cleanKey}}}`);
    setCustomTagInput('');
  };

  const handleInsertPhrase = (phraseText) => {
    insertAtCursor(`\n\n${phraseText}\n\n`);
  };

  const handleSave = () => {
    if (!title.trim()) {
      alert("મહેરબાની કરીને ટેમ્પલેટનું નામ (Title) દાખલ કરો.");
      return;
    }
    if (!content.trim()) {
      alert("મહેરબાની કરીને ટેમ્પલેટનું લખાણ (Content) દાખલ કરો.");
      return;
    }

    const newTemplate = {
      id: initialTemplate?.id || `custom-${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      language: language,
      description: description.trim(),
      stampPaperRecommended: stampPaperRecommended.trim(),
      content: content,
      isCustom: true,
      updatedAt: new Date().toISOString()
    };

    onSaveTemplate(newTemplate);
  };

  return (
    <div className="editor-layout">
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            {initialTemplate ? 'ફોર્મેટમાં સુધારો કરો (Edit Template)' : 'નવું ફોર્મેટ બનાવો (Template Designer)'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            તમારું મનપસંદ સરકારી કે કાનૂની લખાણ તૈયાર કરો. જે વિગત બદલવાની હોય ત્યાં <code style={{ color: 'var(--primary)' }}>&#123;&#123;પેરામીટર&#125;&#125;</code> ટેગ મૂકો.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn-secondary" onClick={onCancel}>
            રદ કરો
          </button>
          <button className="btn-gold" onClick={handleSave}>
            <Save size={16} />
            <span>ટેમ્પલેટ સાચવો અને વાપરો</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      <div className="editor-grid">
        {/* Main Editor Card */}
        <div className="editor-main-card">
          {/* Metadata Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="field-label">ટેમ્પલેટનું વિશિષ્ટ નામ (Unique Title) *</label>
              <input 
                type="text" 
                className="input-control" 
                placeholder="દા.ત. મકાન વેચાણ બાનાખત, વારસાઈ આંબો..." 
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">કેટેગરી (Category)</label>
              <select 
                className="input-control"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option value="સોગંદનામું (Affidavit)">સોગંદનામું (Affidavit)</option>
                <option value="કરાર (Agreement)">કરાર (Agreement)</option>
                <option value="મુખત્યારનામું (Power of Attorney)">મુખત્યારનામું (Power of Attorney)</option>
                <option value="મહેસૂલી (Revenue/Panchayat)">મહેસૂલી (Revenue/Panchayat)</option>
                <option value="નોટિસ (Legal Notice)">નોટિસ (Legal Notice)</option>
                <option value="બાનાખત / દસ્તાવેજ">બાનાખત / દસ્તાવેજ</option>
                <option value="અરજી (Application)">અરજી (Application)</option>
                <option value="અન્ય">અન્ય</option>
              </select>
            </div>

            <div>
              <label className="field-label">સ્ટેમ્પ પેપર ભલામણ</label>
              <input 
                type="text" 
                className="input-control" 
                placeholder="દા.ત. ₹ ૧૦૦ / ₹ ૩૦૦ નો સ્ટેમ્પ" 
                value={stampPaperRecommended}
                onChange={e => setStampPaperRecommended(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="field-label">ટૂંકી સમજૂતી (Description)</label>
            <input 
              type="text" 
              className="input-control" 
              placeholder="આ દસ્તાવેજ કઈ કચેરી કે કામ માટે ઉપયોગી છે તેની વિગત..." 
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          {/* Editor Header Bar with Tab toggles */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)' }}>દસ્તાવેજ કન્ટેન્ટ એડિટર</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                (કુલ {detectedVariables.length} બદલી શકાય તેવા પેરામીટર્સ મળ્યા)
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button 
                type="button"
                className={`phonetic-toggle-btn ${isPhoneticActive ? 'active' : ''}`}
                onClick={() => setIsPhoneticActive(!isPhoneticActive)}
                title="અંગ્રેજીમાં ટાઇપ કરતા આપોઆપ ગુજરાતી થશે. શોર્ટકટ: Ctrl+G"
                style={{ marginRight: '0.4rem' }}
              >
                <Keyboard size={13} />
                <span>ગુજરાતી: {isPhoneticActive ? 'ON' : 'OFF'}</span>
              </button>
              <button 
                className={`tool-toggle-btn ${!previewMode ? 'active' : ''}`}
                onClick={() => setPreviewMode(false)}
              >
                કોડ / ટેક્સ્ટ એડિટર
              </button>
              <button 
                className={`tool-toggle-btn ${previewMode ? 'active' : ''}`}
                onClick={() => setPreviewMode(true)}
              >
                <Eye size={14} />
                લાઈવ પ્રિવ્યૂ
              </button>
            </div>
          </div>

          {/* The Textarea or Preview */}
          {!previewMode ? (
            <div>
              <textarea 
                ref={textareaRef}
                className="input-control" 
                style={{ 
                  minHeight: '450px', 
                  fontSize: '1.05rem', 
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-doc)',
                  padding: '1.25rem'
                }}
                value={content}
                onChange={e => setContent(e.target.value)}
                onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setContent(val))}
                placeholder="અહીં તમારું કાનૂની લખાણ લખો અથવા પેસ્ટ કરો. જે શબ્દ બદલવાનો હોય તેને {{પેરામીટર}} સ્વરૂપમાં લખો..."
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                <span>💡 ટિપ: જમણી બાજુના બટન પર ક્લિક કરીને સીધા જ પેરામીટર ટેગ ઉમેરી શકો છો.</span>
                <span>અક્ષરો: {content.length} | લીટીઓ: {content.split('\n').length}</span>
              </div>
            </div>
          ) : (
            <div style={{ 
              background: '#ffffff', 
              color: '#1a1a1a', 
              padding: '2.5rem', 
              borderRadius: 'var(--radius-md)', 
              minHeight: '450px',
              fontFamily: 'var(--font-doc)',
              fontSize: '13pt',
              lineHeight: '1.7',
              whiteSpace: 'pre-wrap'
            }}>
              {content}
            </div>
          )}
        </div>

        {/* Sidebar: Variable Inserter & Legal Phrase Inserter */}
        <aside className="editor-sidebar-card">
          {/* Custom Tag Creator */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-gold-dark)' }}>
              <Tag size={16} />
              <span>નવો પેરામીટર ટેગ બનાવો</span>
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              તમને જોઈતો નવો ટેગ લખીને એડિટરમાં સીધો ઉમેરો:
            </p>
            <form onSubmit={handleAddCustomTag} style={{ display: 'flex', gap: '0.4rem' }}>
              <input 
                type="text" 
                className="input-control" 
                placeholder="દા.ત. વાહન_નંબર, ચેક_નંબર" 
                value={customTagInput}
                onChange={e => setCustomTagInput(e.target.value)}
                style={{ fontSize: '0.85rem', padding: '0.5rem 0.65rem' }}
              />
              <button type="submit" className="btn-gold" style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }}>
                <Plus size={14} />
              </button>
            </form>
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)' }} />

          {/* Quick Legal Tag Palette */}
          <div>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--primary)' }}>
              સામાન્ય કાનૂની ટેગ્સ (૧-ક્લિક ઇન્સર્ટ)
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              નીચેના બટન પર ક્લિક કરવાથી એડિટરમાં તે ટેગ ઉમેરાઈ જશે:
            </p>
            <div className="variable-chips-cloud">
              {quickVariableSnippets.map(v => (
                <button
                  key={v.key}
                  type="button"
                  className="var-chip-btn"
                  onClick={() => handleInsertVariable(v.key)}
                  title={`ઉમેરો: {{${v.key}}}`}
                >
                  <Plus size={11} />
                  <span>{v.label}</span>
                </button>
              ))}
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)' }} />

          {/* Detected variables in this template */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.4rem', color: '#059669' }}>
              આ ટેમ્પલેટમાં રહેલા ટેગ્સ ({detectedVariables.length})
            </h3>
            {detectedVariables.length === 0 ? (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                હજી સુધી કોઈ ટેગ મળ્યા નથી. ટેગ ઉમેરવા માટે &#123;&#123;નામ&#125;&#125; વાપરો.
              </p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', maxHeight: '140px', overflowY: 'auto' }}>
                {detectedVariables.map(v => (
                  <span key={v} style={{ 
                    fontSize: '0.72rem', 
                    fontFamily: 'monospace', 
                    background: '#eff6ff', border: '1px solid #dbeafe', 
                    padding: '0.2rem 0.5rem', 
                    borderRadius: '4px',
                    color: 'var(--primary-dark)'
                  }}>
                    &#123;&#123;{v}&#125;&#125;
                  </span>
                ))}
              </div>
            )}
          </div>

          <hr style={{ borderColor: 'var(--border-subtle)' }} />

          {/* Gujarati Legal Clauses Library */}
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#7c3aed' }}>
              કાનૂની પ્રમાણિત ફકરાઓ (Clauses)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {gujaratiLegalPhrases.map((phrase, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    background: '#f8fafc', 
                    border: '1px solid var(--border-subtle)', 
                    padding: '0.6rem', 
                    borderRadius: '6px' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <strong style={{ fontSize: '0.76rem', color: 'var(--text-main)' }}>{phrase.title}</strong>
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}
                      onClick={() => handleInsertPhrase(phrase.phrase)}
                    >
                      + ઉમેરો
                    </button>
                  </div>
                  <p style={{ fontSize: '0.71rem', color: 'var(--text-subtle)', lineHeight: '1.4' }}>
                    {phrase.phrase.substring(0, 55)}...
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
