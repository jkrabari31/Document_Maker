import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  FileText, 
  Copy, 
  Trash2, 
  Edit3, 
  ExternalLink, 
  Layers, 
  Award, 
  Home, 
  Scale, 
  Users, 
  Receipt,
  FileCheck,
  CheckCircle2,
  Download,
  Upload,
  Globe,
  Briefcase,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { extractVariables } from '../utils/documentUtils';

export default function TemplateLibrary({ 
  templates, 
  onSelectTemplate, 
  onCloneToDesigner, 
  onCreateNew, 
  onDeleteTemplate,
  onExportTemplates,
  onImportTemplates
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('ALL'); // 'ALL' | 'ગુજરાતી' | 'English'
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Count templates by language
  const languageCounts = useMemo(() => {
    let gujCount = 0;
    let engCount = 0;
    templates.forEach(t => {
      if (t.language === 'English') {
        engCount++;
      } else {
        gujCount++;
      }
    });
    return {
      all: templates.length,
      gujarati: gujCount,
      english: engCount
    };
  }, [templates]);

  // Extract unique categories based on selected language
  const categories = useMemo(() => {
    const set = new Set();
    templates.forEach(t => {
      const lang = t.language || 'ગુજરાતી';
      if (selectedLanguage === 'ALL' || lang === selectedLanguage) {
        if (t.category) set.add(t.category);
      }
    });
    return ['ALL', ...Array.from(set)];
  }, [templates, selectedLanguage]);

  // Reset category if not in available categories when language changes
  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    setSelectedCategory('ALL');
  };

  // Filter templates by language, category, and search query
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const lang = t.language || 'ગુજરાતી';
      const matchesLanguage = selectedLanguage === 'ALL' || lang === selectedLanguage;
      const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q)) ||
        (t.language && t.language.toLowerCase().includes(q));
      return matchesLanguage && matchesCategory && matchesSearch;
    });
  }, [templates, selectedLanguage, selectedCategory, searchQuery]);

  // Icon selector helper
  const getIcon = (iconName, category, language) => {
    if (iconName === 'FileCheck' || category?.includes('સોગંદનામું') || category?.includes('Affidavit')) return <FileCheck size={22} />;
    if (iconName === 'Home' || category?.includes('કરાર') || category?.includes('Agreement') || category?.includes('Lease')) return <Home size={22} />;
    if (iconName === 'Award' || category?.includes('મુખત્યારનામું') || category?.includes('Power of Attorney')) return <Award size={22} />;
    if (iconName === 'Scale' || category?.includes('નોટિસ') || category?.includes('Notice')) return <Scale size={22} />;
    if (iconName === 'Briefcase' || category?.includes('Commercial') || category?.includes('Corporate') || category?.includes('Banking')) return <Briefcase size={22} />;
    if (iconName === 'Users' || category?.includes('મહેસૂલી') || category?.includes('Employment')) return <Users size={22} />;
    if (iconName === 'Receipt' || category?.includes('પ્રમાણપત્ર') || category?.includes('Financial')) return <Receipt size={22} />;
    return <FileText size={22} />;
  };

  return (
    <div className="templates-view">
      {/* Top Banner */}
      <div className="view-header">
        <div className="view-title-block">
          <h2>કાનૂની અને સરકારી ટેમ્પલેટ લાઇબ્રેરી / Legal Templates</h2>
          <p>
            એડવોકેટ્સ, નોટરી અને દસ્તાવેજ લેખકો માટે તૈયાર કરેલા પ્રમાણિત ગુજરાતી અને English કાનૂની ફોર્મેટ્સ.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            className="btn-secondary" 
            onClick={onExportTemplates}
            title="ટેમ્પલેટ્સ ડાઉનલોડ કરો"
          >
            <Download size={15} />
            <span>ટેમ્પલેટ્સ એક્સપોર્ટ</span>
          </button>

          <label className="btn-secondary" style={{ cursor: 'pointer' }} title="JSON ફાઇલમાંથી ટેમ્પલેટ્સ ઇમ્પોર્ટ કરો">
            <Upload size={15} />
            <span>ઇમ્પોર્ટ કરો</span>
            <input 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={onImportTemplates} 
            />
          </label>

          <button className="btn-gold" onClick={onCreateNew}>
            <Plus size={16} />
            <span>નવું ફોર્મેટ બનાવો</span>
          </button>
        </div>
      </div>

      {/* Language Filter & Search Bar */}
      <div className="filter-bar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'stretch' }}>
        
        {/* Top Filter Controls: Language Switcher & Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Language Switcher Tabs */}
          <div className="language-segmented-control" style={{
            display: 'inline-flex',
            background: '#e2e8f0',
            padding: '4px',
            borderRadius: '10px',
            gap: '4px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)'
          }}>
            <button
              className={`lang-tab-btn ${selectedLanguage === 'ALL' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('ALL')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                background: selectedLanguage === 'ALL' ? '#ffffff' : 'transparent',
                color: selectedLanguage === 'ALL' ? '#1e293b' : '#64748b',
                boxShadow: selectedLanguage === 'ALL' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Globe size={15} style={{ color: selectedLanguage === 'ALL' ? '#2563eb' : '#64748b' }} />
              <span>તમામ / All</span>
              <span style={{ 
                fontSize: '0.72rem', 
                padding: '1px 6px', 
                borderRadius: '999px', 
                background: selectedLanguage === 'ALL' ? '#eff6ff' : '#cbd5e1',
                color: selectedLanguage === 'ALL' ? '#2563eb' : '#475569'
              }}>
                {languageCounts.all}
              </span>
            </button>

            <button
              className={`lang-tab-btn ${selectedLanguage === 'ગુજરાતી' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('ગુજરાતી')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                background: selectedLanguage === 'ગુજરાતી' ? '#ffffff' : 'transparent',
                color: selectedLanguage === 'ગુજરાતી' ? '#b45309' : '#64748b',
                boxShadow: selectedLanguage === 'ગુજરાતી' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <span>🇮🇳 ગુજરાતી</span>
              <span style={{ 
                fontSize: '0.72rem', 
                padding: '1px 6px', 
                borderRadius: '999px', 
                background: selectedLanguage === 'ગુજરાતી' ? '#fef3c7' : '#cbd5e1',
                color: selectedLanguage === 'ગુજરાતી' ? '#b45309' : '#475569'
              }}>
                {languageCounts.gujarati}
              </span>
            </button>

            <button
              className={`lang-tab-btn ${selectedLanguage === 'English' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('English')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
                transition: 'all 0.2s ease',
                background: selectedLanguage === 'English' ? '#ffffff' : 'transparent',
                color: selectedLanguage === 'English' ? '#2563eb' : '#64748b',
                boxShadow: selectedLanguage === 'English' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <span>🇬🇧 English</span>
              <span style={{ 
                fontSize: '0.72rem', 
                padding: '1px 6px', 
                borderRadius: '999px', 
                background: selectedLanguage === 'English' ? '#eff6ff' : '#cbd5e1',
                color: selectedLanguage === 'English' ? '#2563eb' : '#475569'
              }}>
                {languageCounts.english}
              </span>
            </button>
          </div>

          {/* Search Box */}
          <div className="search-box" style={{ flex: 1, minWidth: '260px', maxWidth: '420px' }}>
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder={selectedLanguage === 'English' ? "Search English templates (Rent, GPA, Notice, NDA)..." : "ટેમ્પલેટ શોધો (સોગંદનામું, ભાડા કરાર, Rent, Notice)..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Pills Row */}
        <div className="category-pills" style={{ marginTop: '0.25rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'ALL' ? (selectedLanguage === 'English' ? 'All Categories' : 'તમામ કેટેગરી') : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      {filteredTemplates.length === 0 ? (
        <div style={{ 
          background: 'var(--bg-card)', 
          padding: '3.5rem 2rem', 
          borderRadius: 'var(--radius-lg)', 
          textAlign: 'center',
          border: '1.5px dashed var(--border-subtle)',
          margin: '1.5rem 0'
        }}>
          <FileText size={48} style={{ color: 'var(--text-subtle)', margin: '0 auto 1rem' }} />
          <h3>કોઈ ટેમ્પલેટ મળ્યું નથી / No templates found</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            તમારી શોધ પ્રમાણે કોઈ દસ્તાવેજ ફોર્મેટ મળ્યું નથી. ફિલ્ટર બદલો અથવા નવું ફોર્મેટ બનાવો.
          </p>
          <button className="btn-primary" onClick={onCreateNew} style={{ marginTop: '1.25rem' }}>
            <Plus size={16} /> નવું ફોર્મેટ બનાવો
          </button>
        </div>
      ) : (
        <div className="templates-grid">
          {filteredTemplates.map(template => {
            const varList = extractVariables(template.content);
            const isCustom = template.isCustom || template.id.startsWith('custom-');
            const isEnglish = template.language === 'English';

            return (
              <div key={template.id} className="template-card">
                <div>
                  <div className="template-card-top">
                    <div className="card-icon-box" style={{
                      background: isEnglish ? '#eff6ff' : '#fef3c7',
                      borderColor: isEnglish ? '#bfdbfe' : '#fde68a',
                      color: isEnglish ? '#2563eb' : '#b45309'
                    }}>
                      {getIcon(template.icon, template.category, template.language)}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.55rem',
                        borderRadius: '999px',
                        background: isEnglish ? '#e0e7ff' : '#fef3c7',
                        color: isEnglish ? '#3730a3' : '#92400e',
                        border: `1px solid ${isEnglish ? '#c7d2fe' : '#fde68a'}`
                      }}>
                        {isEnglish ? '🇬🇧 English' : '🇮🇳 ગુજરાતી'}
                      </span>
                      <span className="card-meta-tag">{template.category || 'સામાન્ય'}</span>
                    </div>
                  </div>

                  <h3 style={{ fontFamily: isEnglish ? 'Inter, system-ui, sans-serif' : 'var(--font-doc)' }}>
                    {template.title}
                  </h3>
                  <p>{template.description || (isEnglish ? 'Standard legally binding deed format.' : 'કોઈપણ કચેરી અથવા કાનૂની કાર્ય માટેનું પ્રમાણિત ફોર્મેટ.')}</p>
                </div>

                <div>
                  <div className="template-card-meta">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{isEnglish ? 'Variables / Parameters:' : 'બદલવાના પેરામીટર્સ:'}</span>
                      <strong style={{ color: isEnglish ? 'var(--primary)' : 'var(--accent-gold-dark)' }}>
                        {varList.length} {isEnglish ? 'Fields' : 'ફિલ્ડ્સ'}
                      </strong>
                    </div>
                    {template.stampPaperRecommended && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{isEnglish ? 'Stamp Paper Rec.:' : 'ભલામણ કરેલ સ્ટેમ્પ:'}</span>
                        <strong className="stamp-rec">{template.stampPaperRecommended}</strong>
                      </div>
                    )}
                  </div>

                  <div className="card-actions">
                    <button 
                      className="btn-primary" 
                      style={{ flex: 1 }}
                      onClick={() => onSelectTemplate(template)}
                    >
                      <span>{isEnglish ? 'Create Document' : 'દસ્તાવેજ બનાવો'}</span>
                      <ExternalLink size={15} />
                    </button>

                    <button 
                      className="btn-secondary" 
                      onClick={() => onCloneToDesigner(template)}
                      title={isEnglish ? "Edit or customize this template" : "આ ફોર્મેટને કસ્ટમાઇઝ / એડિટ કરો"}
                    >
                      <Edit3 size={15} />
                    </button>

                    {isCustom && (
                      <button 
                        className="btn-danger" 
                        onClick={() => onDeleteTemplate(template.id)}
                        title="આ ટેમ્પલેટ ડિલીટ કરો"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

