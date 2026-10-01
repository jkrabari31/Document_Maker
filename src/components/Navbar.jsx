import React from 'react';
import { 
  FileText, 
  FolderOpen, 
  PlusCircle, 
  History, 
  Printer, 
  HelpCircle, 
  UserCheck, 
  Sparkles,
  Download
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  recordsCount, 
  templatesCount,
  onOpenSettings,
  onOpenStampGuide,
  onBackupData
}) {
  return (
    <header className="app-header">
      <div className="brand-wrapper" onClick={() => setActiveTab('studio')}>
        <div className="brand-logo-badge">
          <FileText size={24} strokeWidth={2.2} />
        </div>
        <div className="brand-text">
          <h1>
            <span className="gujarati-title">દસ્તાવેજ માસ્ટર</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500 }}>| Dastavej Pro</span>
          </h1>
          <p>Advocate & Revenue Document Automation Studio</p>
        </div>
      </div>

      <nav className="header-nav">
        <button 
          className={`nav-tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('studio')}
        >
          <Sparkles size={16} />
          <span>દસ્તાવેજ બનાવો (Studio)</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <FolderOpen size={16} />
          <span>ટેમ્પલેટ લાઇબ્રેરી</span>
          <span className="badge-counter">{templatesCount}</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'designer' ? 'active' : ''}`}
          onClick={() => setActiveTab('designer')}
        >
          <PlusCircle size={16} />
          <span>નવું ફોર્મેટ (Designer)</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          <History size={16} />
          <span>સાચવેલ હિસ્ટ્રી</span>
          <span className="badge-counter">{recordsCount}</span>
        </button>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <button 
          className="tool-toggle-btn"
          onClick={onOpenStampGuide}
          title="સ્ટેમ્પ પેપર માર્ગદર્શિકા (Stamp Paper Margins Guide)"
        >
          <HelpCircle size={16} style={{ color: '#fbbf24' }} />
          <span>સ્ટેમ્પ ગાઇડ</span>
        </button>

        <button 
          className="tool-toggle-btn"
          onClick={onOpenSettings}
          title="એડવોકેટ / એજન્ટ પ્રોફાઇલ વિગતો"
        >
          <UserCheck size={16} style={{ color: '#38bdf8' }} />
          <span>પ્રોફાઇલ સેટિંગ્સ</span>
        </button>

        <button
          className="tool-toggle-btn"
          onClick={onBackupData}
          title="તમામ ડેટા બેકઅપ ડાઉનલોડ કરો"
        >
          <Download size={15} />
          <span>બેકઅપ</span>
        </button>
      </div>
    </header>
  );
}
