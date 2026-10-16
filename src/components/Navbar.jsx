import React, { useState } from 'react';
import { 
  FileText, 
  FolderOpen, 
  PlusCircle, 
  History, 
  Printer, 
  HelpCircle, 
  UserCheck, 
  Sparkles, 
  Download,
  Calculator,
  Shield,
  Edit3,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserProfileMenu from './UserProfileMenu';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  recordsCount, 
  templatesCount,
  onOpenSettings,
  onOpenStampGuide,
  onOpenStampCalculator,
  onBackupData,
  isAdmin,
  onOpenAdmin
}) {
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="app-header">
        <div className="brand-wrapper" onClick={() => handleTabClick('studio')}>
          <div className="brand-logo-badge">
            <FileText size={22} strokeWidth={2.2} />
          </div>
          <div className="brand-text">
            <h1>
              <span className="gujarati-title">દસ્તાવેજ માસ્ટર</span>
              <span className="brand-sub-badge" style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>| Dastavej Pro</span>
            </h1>
            <p className="brand-tagline">Advocate & Revenue Automation Studio</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="header-nav desktop-only-nav">
          <button 
            className={`nav-tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
            onClick={() => handleTabClick('studio')}
          >
            <Sparkles size={15} />
            <span>સ્ટુડિયો (Studio)</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'writer' ? 'active' : ''}`}
            onClick={() => handleTabClick('writer')}
            title="પેરામીટર વગર સીધું જ મુક્ત કાનૂની લખાણ લખો (Open Writer)"
          >
            <Edit3 size={15} />
            <span>ઓપન રાઇટર</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'templates' ? 'active' : ''}`}
            onClick={() => handleTabClick('templates')}
          >
            <FolderOpen size={15} />
            <span>ટેમ્પલેટ્સ</span>
            <span className="badge-counter">{templatesCount}</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'designer' ? 'active' : ''}`}
            onClick={() => handleTabClick('designer')}
          >
            <PlusCircle size={15} />
            <span>નવું ફોર્મેટ</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => handleTabClick('records')}
          >
            <History size={15} />
            <span>હિસ્ટ્રી</span>
            <span className="badge-counter">{recordsCount}</span>
          </button>
        </nav>

        <div className="header-right-tools">
          {/* Utilities Group (Desktop) */}
          <div className="header-tools-group desktop-only-tools">
            <button 
              className="tool-toggle-btn tool-btn-calc"
              onClick={onOpenStampCalculator}
              title="ગુજરાત સ્ટેમ્પ ડ્યુટી & જંત્રી કેલ્ક્યુલેટર"
            >
              <Calculator size={14} style={{ color: '#2563eb' }} />
              <span>સ્ટેમ્પ કેલ્સી</span>
            </button>

            <button 
              className="tool-toggle-btn"
              onClick={onOpenStampGuide}
              title="સ્ટેમ્પ પેપર માર્ગદર્શિકા"
            >
              <HelpCircle size={14} style={{ color: 'var(--accent-gold-dark)' }} />
              <span>ગાઇડ</span>
            </button>

            <button 
              className="tool-toggle-btn"
              onClick={onOpenSettings}
              title="એડવોકેટ / એજન્ટ પ્રોફાઇલ વિગતો"
            >
              <UserCheck size={14} style={{ color: 'var(--primary)' }} />
              <span>પ્રોફાઇલ</span>
            </button>

            <button
              className="tool-toggle-btn"
              onClick={onBackupData}
              title="તમામ ડેટા બેકઅપ ડાઉનલોડ કરો"
            >
              <Download size={14} />
              <span>બેકઅપ</span>
            </button>

            {/* Admin Portal Button */}
            {isAdmin && (
              <button
                className="tool-toggle-btn tool-btn-admin"
                onClick={onOpenAdmin}
                title="ઍડમિન પોર્ટલ — લાયસન્સ મેનેજમેન્ટ"
              >
                <Shield size={14} style={{ color: '#dc2626' }} />
                <span>Admin</span>
              </button>
            )}
          </div>

          <div className="header-v-divider desktop-only-divider" />

          {/* User Account Menu */}
          {currentUser && (
            <div className="header-user-cluster">
              <UserProfileMenu onOpenAdmin={isAdmin ? onOpenAdmin : null} />
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button 
            type="button" 
            className="mobile-menu-toggle-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer-backdrop" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-nav-drawer" onClick={e => e.stopPropagation()}>
            <div className="mobile-drawer-header">
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#1e3a8a' }}>મેનુ (Navigation)</span>
              <button 
                type="button" 
                onClick={() => setMobileMenuOpen(false)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="mobile-drawer-links">
              <button 
                className={`mobile-drawer-item ${activeTab === 'studio' ? 'active' : ''}`}
                onClick={() => handleTabClick('studio')}
              >
                <Sparkles size={18} />
                <span>દસ્તાવેજ સ્ટુડિયો (Studio)</span>
              </button>

              <button 
                className={`mobile-drawer-item ${activeTab === 'writer' ? 'active' : ''}`}
                onClick={() => handleTabClick('writer')}
              >
                <Edit3 size={18} />
                <span>ઓપન રાઇટર (Open Writer)</span>
              </button>

              <button 
                className={`mobile-drawer-item ${activeTab === 'templates' ? 'active' : ''}`}
                onClick={() => handleTabClick('templates')}
              >
                <FolderOpen size={18} />
                <span>ટેમ્પલેટ્સ લાયબ્રેરી ({templatesCount})</span>
              </button>

              <button 
                className={`mobile-drawer-item ${activeTab === 'designer' ? 'active' : ''}`}
                onClick={() => handleTabClick('designer')}
              >
                <PlusCircle size={18} />
                <span>નવું ફોર્મેટ ડિઝાઇનર</span>
              </button>

              <button 
                className={`mobile-drawer-item ${activeTab === 'records' ? 'active' : ''}`}
                onClick={() => handleTabClick('records')}
              >
                <History size={18} />
                <span>ક્લાયન્ટ હિસ્ટ્રી ({recordsCount})</span>
              </button>

              <div className="mobile-drawer-divider" />

              <button 
                className="mobile-drawer-item"
                onClick={() => { onOpenStampCalculator(); setMobileMenuOpen(false); }}
              >
                <Calculator size={18} style={{ color: '#2563eb' }} />
                <span>સ્ટેમ્પ ડ્યુટી & જંત્રી કેલ્સી</span>
              </button>

              <button 
                className="mobile-drawer-item"
                onClick={() => { onOpenStampGuide(); setMobileMenuOpen(false); }}
              >
                <HelpCircle size={18} style={{ color: '#d97706' }} />
                <span>સ્ટેમ્પ પેપર ગાઇડ</span>
              </button>

              <button 
                className="mobile-drawer-item"
                onClick={() => { onOpenSettings(); setMobileMenuOpen(false); }}
              >
                <UserCheck size={18} style={{ color: '#2563eb' }} />
                <span>એડવોકેટ પ્રોફાઇલ સેટિંગ્સ</span>
              </button>

              <button 
                className="mobile-drawer-item"
                onClick={() => { onBackupData(); setMobileMenuOpen(false); }}
              >
                <Download size={18} />
                <span>બેકઅપ ડાઉનલોડ કરો</span>
              </button>

              {isAdmin && (
                <button 
                  className="mobile-drawer-item"
                  onClick={() => { onOpenAdmin(); setMobileMenuOpen(false); }}
                  style={{ color: '#dc2626' }}
                >
                  <Shield size={18} />
                  <span>ઍડમિન પોર્ટલ (Admin)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="mobile-bottom-bar" aria-label="Mobile Bottom Navigation">
        <button 
          type="button" 
          className={`mobile-bottom-item ${activeTab === 'studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('studio')}
        >
          <Sparkles size={18} />
          <span>સ્ટુડિયો</span>
        </button>

        <button 
          type="button" 
          className={`mobile-bottom-item ${activeTab === 'writer' ? 'active' : ''}`}
          onClick={() => setActiveTab('writer')}
        >
          <Edit3 size={18} />
          <span>રાઇટર</span>
        </button>

        <button 
          type="button" 
          className={`mobile-bottom-item ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          <FolderOpen size={18} />
          <span>ફોર્મેટ</span>
        </button>

        <button 
          type="button" 
          className={`mobile-bottom-item ${activeTab === 'records' ? 'active' : ''}`}
          onClick={() => setActiveTab('records')}
        >
          <History size={18} />
          <span>હિસ્ટ્રી</span>
        </button>

        <button 
          type="button" 
          className="mobile-bottom-item"
          onClick={onOpenSettings}
        >
          <UserCheck size={18} />
          <span>પ્રોફાઇલ</span>
        </button>
      </nav>
    </>
  );
}


