import React, { useState, useEffect } from 'react';
import { X, Save, UserCheck, Check } from 'lucide-react';
import { saveUserSettings } from '../utils/documentUtils';

export default function AdvocateSettingsModal({ 
  isOpen, 
  onClose, 
  settings, 
  onSettingsSaved 
}) {
  if (!isOpen) return null;

  const [advocateName, setAdvocateName] = useState(settings?.advocateName || '');
  const [barRegNumber, setBarRegNumber] = useState(settings?.barRegNumber || '');
  const [officeAddress, setOfficeAddress] = useState(settings?.officeAddress || '');
  const [phone, setPhone] = useState(settings?.phone || '');
  const [defaultMargin, setDefaultMargin] = useState(settings?.printMarginTopMm || 110);
  const [stampModeDefault, setStampModeDefault] = useState(settings?.stampPaperMode || false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setAdvocateName(settings.advocateName || '');
      setBarRegNumber(settings.barRegNumber || '');
      setOfficeAddress(settings.officeAddress || '');
      setPhone(settings.phone || '');
      setDefaultMargin(settings.printMarginTopMm || 110);
      setStampModeDefault(settings.stampPaperMode || false);
    }
  }, [settings]);

  const handleSave = (e) => {
    e.preventDefault();
    const updated = {
      advocateName: advocateName.trim(),
      barRegNumber: barRegNumber.trim(),
      officeAddress: officeAddress.trim(),
      phone: phone.trim(),
      printMarginTopMm: Number(defaultMargin),
      stampPaperMode: stampModeDefault,
      defaultLanguage: "ગુજરાતી"
    };

    saveUserSettings(updated);
    if (onSettingsSaved) onSettingsSaved(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <UserCheck size={20} style={{ color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              એડવોકેટ / એજન્ટ પ્રોફાઇલ સેટિંગ્સ
            </h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              અહીં તમારી વિગતો સાચવી લો જેથી તમામ સોગંદનામા, કાનૂની નોટિસ અને કરારોમાં તમારું નામ અને સનદ નંબર આપોઆપ આવી જશે.
            </p>

            <div>
              <label className="field-label">એડવોકેટ / નોટરી / એજન્ટનું નામ</label>
              <input 
                type="text" 
                className="input-control" 
                placeholder="દા.ત. એડવોકેટ રાજેશ કે. મહેતા" 
                value={advocateName}
                onChange={e => setAdvocateName(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">બાર કાઉન્સિલ સનદ / નોટરી રજીસ્ટ્રેશન નંબર</label>
              <input 
                type="text" 
                className="input-control" 
                placeholder="દા.ત. G/1452/2014 અથવા NOTARY/GUJ/589" 
                value={barRegNumber}
                onChange={e => setBarRegNumber(e.target.value)}
              />
            </div>

            <div>
              <label className="field-label">ઓફિસ / ચેમ્બર્સનું સરનામું</label>
              <textarea 
                className="input-control" 
                rows={2}
                placeholder="દા.ત. ૨૦૪, લો ચેમ્બર્સ, કોર્ટ રોડ..." 
                value={officeAddress}
                onChange={e => setOfficeAddress(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="field-label">મોબાઇલ / સંપર્ક</label>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="દા.ત. ૯૮૨૫૦ XXXXX" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="field-label">ડિફોલ્ટ સ્ટેમ્પ માર્જિન (mm)</label>
                <input 
                  type="number" 
                  className="input-control" 
                  min="50" 
                  max="160"
                  value={defaultMargin}
                  onChange={e => setDefaultMargin(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
              <input 
                type="checkbox" 
                id="defaultStampToggle"
                checked={stampModeDefault}
                onChange={e => setStampModeDefault(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#4f46e5' }}
              />
              <label htmlFor="defaultStampToggle" style={{ fontSize: '0.85rem', color: '#cbd5e1', cursor: 'pointer' }}>
                હંમેશા સ્ટેમ્પ પેપર માર્જિન મોડ શરૂ રાખવો
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              રદ કરો
            </button>
            <button type="submit" className="btn-primary">
              {savedSuccess ? (
                <>
                  <Check size={16} />
                  <span>સાચવી લીધું!</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>સેટિંગ્સ સાચવો</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
