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
  Upload
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
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    templates.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return ['ALL', ...Array.from(set)];
  }, [templates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter(t => {
      const matchesCategory = selectedCategory === 'ALL' || t.category === selectedCategory;
      const q = searchQuery.toLowerCase();
      const matchesSearch = !q || 
        t.title.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.category && t.category.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  // Icon selector helper
  const getIcon = (iconName, category) => {
    if (iconName === 'FileCheck' || category?.includes('સોગંદનામું')) return <FileCheck size={24} />;
    if (iconName === 'Home' || category?.includes('કરાર')) return <Home size={24} />;
    if (iconName === 'Award' || category?.includes('મુખત્યારનામું')) return <Award size={24} />;
    if (iconName === 'Scale' || category?.includes('નોટિસ')) return <Scale size={24} />;
    if (iconName === 'Users' || category?.includes('મહેસૂલી')) return <Users size={24} />;
    if (iconName === 'Receipt' || category?.includes('પ્રમાણપત્ર')) return <Receipt size={24} />;
    return <FileText size={24} />;
  };

  return (
    <div className="templates-view">
      {/* Top Banner */}
      <div className="view-header">
        <div className="view-title-block">
          <h2>કાનૂની અને સરકારી ટેમ્પલેટ લાઇબ્રેરી</h2>
          <p>
            એડવોકેટ્સ, નોટરી અને સરકારી એજન્ટો માટે તૈયાર કરેલા પ્રમાણિત ફોર્મેટ્સ. માત્ર વિગતો બદલીને ૧ મિનિટમાં દસ્તાવેજ તૈયાર કરો.
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

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="ટેમ્પલેટ શોધો (દા.ત. સોગંદનામું, ભાડા કરાર, વારસાઈ, નોટિસ)..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-pills">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat === 'ALL' ? 'તમામ ફોર્મેટ્સ' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      {filteredTemplates.length === 0 ? (
        <div style={{ 
          background: 'var(--bg-card)', 
          padding: '3rem', 
          borderRadius: 'var(--radius-lg)', 
          textAlign: 'center',
          border: '1px dashed var(--border-subtle)' 
        }}>
          <FileText size={48} style={{ color: 'var(--text-subtle)', margin: '0 auto 1rem' }} />
          <h3>કોઈ ટેમ્પલેટ મળ્યું નથી</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            તમારી શોધ પ્રમાણે કોઈ દસ્તાવેજ ફોર્મેટ મળ્યું નથી. નવું ફોર્મેટ ઉમેરો અથવા શોધ શબ્દ બદલો.
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

            return (
              <div key={template.id} className="template-card">
                <div>
                  <div className="template-card-top">
                    <div className="card-icon-box">
                      {getIcon(template.icon, template.category)}
                    </div>
                    <span className="card-meta-tag">{template.category || 'સામાન્ય'}</span>
                  </div>

                  <h3>{template.title}</h3>
                  <p>{template.description || 'કોઈપણ કચેરી અથવા કાનૂની કાર્ય માટેનું પ્રમાણિત ફોર્મેટ.'}</p>
                </div>

                <div>
                  <div className="template-card-meta">
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>બદલવાના પેરામીટર્સ:</span>
                      <strong style={{ color: 'var(--primary)' }}>{varList.length} ફિલ્ડ્સ</strong>
                    </div>
                    {template.stampPaperRecommended && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>ભલામણ કરેલ સ્ટેમ્પ:</span>
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
                      <span>દસ્તાવેજ બનાવો</span>
                      <ExternalLink size={15} />
                    </button>

                    <button 
                      className="btn-secondary" 
                      onClick={() => onCloneToDesigner(template)}
                      title="આ ફોર્મેટને કસ્ટમાઇઝ / એડિટ કરો"
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
