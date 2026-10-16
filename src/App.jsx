import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import DocumentStudio from './components/DocumentStudio';
import TemplateLibrary from './components/TemplateLibrary';
import TemplateDesigner from './components/TemplateDesigner';
import ClientRecords from './components/ClientRecords';
import StampGuideModal from './components/StampGuideModal';
import AdvocateSettingsModal from './components/AdvocateSettingsModal';
import StampDutyCalculatorModal from './components/StampDutyCalculatorModal';
import AuthPage from './components/AuthPage';
import AdminPortal from './components/AdminPortal';
import OpenWriter from './components/OpenWriter';
import { initialTemplates } from './data/initialTemplates';
import { 
  loadSavedTemplates, 
  saveTemplatesToStorage, 
  loadSavedRecords, 
  deleteRecordFromStorage,
  loadUserSettings,
  getRecordsStorageKey 
} from './utils/documentUtils';

// Admin emails — must match AdminPortal.jsx
const ADMIN_EMAILS = ['jaimin3460@gmail.com', 'admin@dastavej.com'];

export default function App() {
  const { currentUser, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('studio');
  const [templates, setTemplates] = useState(() => loadSavedTemplates(initialTemplates, currentUser?.uid));
  const [currentTemplate, setCurrentTemplate] = useState(() => {
    const list = loadSavedTemplates(initialTemplates, currentUser?.uid);
    return list[0] || initialTemplates[0];
  });
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [records, setRecords] = useState(() => loadSavedRecords(currentUser?.uid));
  const [userSettings, setUserSettings] = useState(() => loadUserSettings());

  const [isStampGuideOpen, setIsStampGuideOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStampCalcOpen, setIsStampCalcOpen] = useState(false);

  const isAdmin = currentUser?.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase());

  // Reload templates & records when current user changes (user isolation)
  useEffect(() => {
    if (currentUser?.uid) {
      const userTemplates = loadSavedTemplates(initialTemplates, currentUser.uid);
      setTemplates(userTemplates);
      setCurrentTemplate(userTemplates[0] || initialTemplates[0]);
      setRecords(loadSavedRecords(currentUser.uid));
    }
  }, [currentUser?.uid]);

  // Sync templates to storage on change for this specific user
  useEffect(() => {
    saveTemplatesToStorage(templates, currentUser?.uid);
  }, [templates, currentUser?.uid]);

  // Handlers for switching views and managing data
  const handleOpenPedhinamu = () => {
    const pedTpl = templates.find(t => t.id === 'pedigree-heir-affidavit') || initialTemplates.find(t => t.id === 'pedigree-heir-affidavit') || templates[0];
    setCurrentTemplate(pedTpl);
    setActiveTab('studio');
  };

  const handleSelectTemplate = (template) => {
    setCurrentTemplate(template);
    setActiveTab('studio');
  };

  const handleCloneToDesigner = (template) => {
    setEditingTemplate(template);
    setActiveTab('designer');
  };

  const handleCreateNewTemplate = () => {
    setEditingTemplate(null);
    setActiveTab('designer');
  };

  const handleSaveTemplate = (newTemplate) => {
    setTemplates(prev => {
      const idx = prev.findIndex(t => t.id === newTemplate.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newTemplate;
        return copy;
      } else {
        return [newTemplate, ...prev];
      }
    });
    setCurrentTemplate(newTemplate);
    setEditingTemplate(null);
    setActiveTab('studio');
  };

  const handleDeleteTemplate = (templateId) => {
    if (window.confirm("શું તમે આ કસ્ટમ ટેમ્પલેટ ડિલીટ કરવા માંગો છો?")) {
      setTemplates(prev => {
        const filtered = prev.filter(t => t.id !== templateId);
        if (currentTemplate?.id === templateId) {
          setCurrentTemplate(filtered[0] || initialTemplates[0]);
        }
        return filtered;
      });
    }
  };

  const handleRecordSaved = () => {
    setRecords(loadSavedRecords(currentUser?.uid));
  };

  const handleLoadRecord = (record) => {
    let tpl = templates.find(t => t.id === record.templateId);
    if (!tpl) {
      tpl = {
        id: record.templateId || 'legacy-template',
        title: record.templateTitle,
        category: 'સામાન્ય',
        content: record.renderedText || '',
        defaultValues: record.formValues || {}
      };
    } else {
      tpl = {
        ...tpl,
        defaultValues: record.formValues || tpl.defaultValues
      };
    }
    setCurrentTemplate(tpl);
    setActiveTab('studio');
  };

  const handleDeleteRecord = (recordId) => {
    if (window.confirm("શું તમે આ અસીલ રેકોર્ડ ડિલીટ કરવા માંગો છો?")) {
      const updated = deleteRecordFromStorage(recordId, currentUser?.uid);
      setRecords(updated);
    }
  };

  const handleClearAllRecords = () => {
    if (window.confirm("ધ્યાન આપો: તમામ સાચવેલ અસીલ દસ્તાવેજો ડિલીટ થઈ જશે. શું તમે આગળ વધવા માંગો છો?")) {
      localStorage.removeItem(getRecordsStorageKey(currentUser?.uid));
      setRecords([]);
    }
  };


  // Export Templates to JSON
  const handleExportTemplates = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(templates, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `dastavej_templates_backup_${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
  };

  // Import Templates from JSON
  const handleImportTemplates = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (Array.isArray(imported)) {
          // Merge imported templates
          const merged = [...imported];
          // Ensure defaults exist
          initialTemplates.forEach(it => {
            if (!merged.some(m => m.id === it.id)) {
              merged.push(it);
            }
          });
          setTemplates(merged);
          alert(`સફળતાપૂર્વક ${imported.length} ટેમ્પલેટ્સ ઇમ્પોર્ટ કરવામાં આવ્યા!`);
        } else {
          alert("અમાન્ય ફોર્મેટ. માન્ય JSON ટેમ્પલેટ ફાઇલ પસંદ કરો.");
        }
      } catch (err) {
        alert("ફાઇલ વાંચવામાં ભૂલ આવી: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Backup All Data
  const handleBackupAllData = () => {
    const backupData = {
      templates,
      records,
      userSettings,
      exportedAt: new Date().toISOString(),
      appVersion: "1.0.0"
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `dastavej_master_full_backup_${new Date().toISOString().slice(0, 10)}.json`);
    dl.click();
  };

  // Auth loading screen
  if (authLoading) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-loading-spinner" />
        <p>લોડ થઈ રહ્યું છે...</p>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!currentUser) {
    return <AuthPage />;
  }

  // Admin portal view
  if (activeTab === 'admin') {
    return (
      <>
        <div className="bg-ambient" />
        <AdminPortal onBack={() => setActiveTab('studio')} />
      </>
    );
  }

  return (
    <>
      <div className="bg-ambient" />
      <Navbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recordsCount={records.length}
        templatesCount={templates.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenStampGuide={() => setIsStampGuideOpen(true)}
        onOpenStampCalculator={() => setIsStampCalcOpen(true)}
        onBackupData={handleBackupAllData}
        isAdmin={isAdmin}
        onOpenAdmin={() => setActiveTab('admin')}
      />

      <main className="main-content">
        {activeTab === 'studio' && (
          <DocumentStudio 
            currentTemplate={currentTemplate}
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onOpenTemplateLibrary={() => setActiveTab('templates')}
            userSettings={userSettings}
            onRecordSaved={handleRecordSaved}
          />
        )}

        {activeTab === 'writer' && (
          <OpenWriter 
            userSettings={userSettings}
            onRecordSaved={handleRecordSaved}
            onBackToStudio={() => setActiveTab('studio')}
          />
        )}

        {activeTab === 'templates' && (
          <TemplateLibrary 
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onCloneToDesigner={handleCloneToDesigner}
            onCreateNew={handleCreateNewTemplate}
            onDeleteTemplate={handleDeleteTemplate}
            onExportTemplates={handleExportTemplates}
            onImportTemplates={handleImportTemplates}
          />
        )}

        {activeTab === 'designer' && (
          <TemplateDesigner 
            initialTemplate={editingTemplate}
            onSaveTemplate={handleSaveTemplate}
            onCancel={() => setActiveTab(templates.length > 0 ? 'templates' : 'studio')}
          />
        )}

        {activeTab === 'records' && (
          <ClientRecords 
            records={records}
            onLoadRecord={handleLoadRecord}
            onDeleteRecord={handleDeleteRecord}
            onClearAll={handleClearAllRecords}
          />
        )}
      </main>

      {/* Modals */}
      <StampGuideModal 
        isOpen={isStampGuideOpen}
        onClose={() => setIsStampGuideOpen(false)}
      />

      <StampDutyCalculatorModal 
        isOpen={isStampCalcOpen}
        onClose={() => setIsStampCalcOpen(false)}
      />

      <AdvocateSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={userSettings}
        onSettingsSaved={(updated) => setUserSettings(updated)}
      />
    </>
  );
}

