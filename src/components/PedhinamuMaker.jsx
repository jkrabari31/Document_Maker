import React, { useState, useMemo, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  RotateCcw, 
  FileText,
  Sliders,
  Keyboard,
  GitBranch,
  ShieldCheck,
  Building
} from 'lucide-react';
import { exportToWord } from '../utils/documentUtils';
import { handlePhoneticKeyDown, transliterateWord } from '../utils/gujaratiTransliterate';

export default function PedhinamuMaker({ userSettings }) {
  const [isPhoneticActive, setIsPhoneticActive] = useState(true);
  const [stampPaperMode, setStampPaperMode] = useState(false);
  const [stampMarginMm, setStampMarginMm] = useState(100);
  const [copied, setCopied] = useState(false);

  // Deceased / Root Person Info
  const [deceasedName, setDeceasedName] = useState('સ્વ. ગોવિંદભાઈ મોહનભાઈ પટેલ');
  const [deathDate, setDeathDate] = useState('૧૫/૧૦/૨૦૨૪');
  const [deathPlace, setDeathPlace] = useState('અમદાવાદ');
  const [village, setVillage] = useState('ચાંદલોડિયા');
  const [taluka, setTaluka] = useState('ઘાટલોડિયા');
  const [district, setDistrict] = useState('અમદાવાદ');
  const [khataSurveyNo, setKhataSurveyNo] = useState('ખાતા નં. ૧૨૪, રેવન્યુ સર્વે નં. ૫૪/૧');
  
  // Applicant Info
  const [applicantName, setApplicantName] = useState('રમેશભાઈ ગોવિંદભાઈ પટેલ');
  const [applicantAge, setApplicantAge] = useState('૪૫');
  const [applicantRelation, setApplicantRelation] = useState('મોટો દીકરો');
  const [applicantAadhar, setApplicantAadhar] = useState('XXXX XXXX ૫૪૧૨');
  const [applicantAddress, setApplicantAddress] = useState('૧૫, ઉમિયા સોસાયટી, ચાંદલોડિયા, અમદાવાદ');

  // Spouse Info
  const [spouseName, setSpouseName] = useState('શાંતાબેન ગોવિંદભાઈ પટેલ');
  const [spouseAge, setSpouseAge] = useState('૬૮');
  const [spouseStatus, setSpouseStatus] = useState('હયાત (વિધવા પત્ની)');

  // Sons List
  const [sons, setSons] = useState([
    { id: 1, name: 'રમેશભાઈ ગોવિંદભાઈ પટેલ', age: '૪૫', status: 'હયાત', subHeirs: '' },
    { id: 2, name: 'ભાવેશભાઈ ગોવિંદભાઈ પટેલ', age: '૪૨', status: 'હયાત', subHeirs: '' }
  ]);

  // Daughters List
  const [daughters, setDaughters] = useState([
    { id: 1, name: 'ગીતાબેન ગોવિંદભાઈ પટેલ (હાલ ગીતાબેન મહેશભાઈ)', age: '૩૯', status: 'હયાત', maritalStatus: 'પરિણીત' }
  ]);

  // Witnesses / Panches
  const [panch1, setPanch1] = useState('પટેલ કનુભાઈ અંબાલાલ (ઉંમર: ૫૮ વર્ષ, ધંધો: વેપાર/ખેતી, રહે.: ચાંદલોડિયા)');
  const [panch2, setPanch2] = useState('શાહ હસમુખભાઈ કાંતિલાલ (ઉંમર: ૬૨ વર્ષ, ધંધો: નિવૃત્ત, રહે.: ચાંદલોડિયા)');

  // Handlers for dynamic heir lists
  const handleAddSon = () => {
    setSons(prev => [
      ...prev,
      { id: Date.now(), name: '', age: '', status: 'હયાત', subHeirs: '' }
    ]);
  };

  const handleUpdateSon = (id, field, value) => {
    setSons(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleRemoveSon = (id) => {
    setSons(prev => prev.filter(s => s.id !== id));
  };

  const handleAddDaughter = () => {
    setDaughters(prev => [
      ...prev,
      { id: Date.now(), name: '', age: '', status: 'હયાત', maritalStatus: 'પરિણીત' }
    ]);
  };

  const handleUpdateDaughter = (id, field, value) => {
    setDaughters(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const handleRemoveDaughter = (id) => {
    setDaughters(prev => prev.filter(d => d.id !== id));
  };

  const handleResetDemo = () => {
    setDeceasedName('સ્વ. ગોવિંદભાઈ મોહનભાઈ પટેલ');
    setDeathDate('૧૫/૧૦/૨૦૨૪');
    setDeathPlace('અમદાવાદ');
    setVillage('ચાંદલોડિયા');
    setTaluka('ઘાટલોડિયા');
    setDistrict('અમદાવાદ');
    setKhataSurveyNo('ખાતા નં. ૧૨૪, રેવન્યુ સર્વે નં. ૫૪/૧');
    setApplicantName('રમેશભાઈ ગોવિંદભાઈ પટેલ');
    setApplicantAge('૪૫');
    setApplicantRelation('મોટો દીકરો');
    setApplicantAddress('૧૫, ઉમિયા સોસાયટી, ચાંદલોડિયા, અમદાવાદ');
    setApplicantAadhar('XXXX XXXX ૫૪૧૨');
    setSpouseName('શાંતાબેન ગોવિંદભાઈ પટેલ');
    setSpouseAge('૬૮');
    setSpouseStatus('હયાત (વિધવા પત્ની)');
    setSons([
      { id: 1, name: 'રમેશભાઈ ગોવિંદભાઈ પટેલ', age: '૪૫', status: 'હયાત', subHeirs: '' },
      { id: 2, name: 'સ્વ. કાનજીભાઈ ગોવિંદભાઈ પટેલ', age: 'અવસાન', status: 'મરણ ગયેલ', subHeirs: 'પત્ની: મીનાબેન, પુત્ર: દર્શન (ઉંમર: ૧૮)' }
    ]);
    setDaughters([
      { id: 1, name: 'ગીતાબેન ગોવિંદભાઈ પટેલ (હાલ ગીતાબેન મહેશભાઈ)', age: '૩૯', status: 'હયાત', maritalStatus: 'પરિણીત' }
    ]);
  };

  // Compile total heir count
  const allHeirsCount = (spouseName ? 1 : 0) + sons.length + daughters.length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    const filename = `Pedhinamu_${deceasedName.replace(/[\s.]+/g, '_')}`;
    const printableElement = document.getElementById('pedhinamu-print-sheet');
    if (printableElement) {
      exportToWord(filename, `વારસાઈ પેઢીનામું - ${deceasedName}`, printableElement.innerHTML);
    }
  };

  const handleCopyText = () => {
    const printableElement = document.getElementById('pedhinamu-print-sheet');
    if (printableElement) {
      navigator.clipboard.writeText(printableElement.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="studio-layout">
      {/* ================= LEFT CONTROLS PANEL ================= */}
      <aside className="studio-form-panel">
        <div className="form-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="card-icon-box" style={{ width: '38px', height: '38px', background: 'var(--primary-light)' }}>
              <GitBranch size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                વારસાઈ પેઢીનામું જનરેટર
              </h2>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Pedigree & Heir Tree Maker
              </p>
            </div>
          </div>
        </div>

        {/* Action helper bar */}
        <div style={{ 
          padding: '0.65rem 1.5rem', 
          background: '#f8fafc', 
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem'
        }}>
          <button 
            className="tool-toggle-btn"
            onClick={handleResetDemo}
            title="નમૂના માટે સેમ્પલ પેઢીનામું ડેટા ભરો"
            style={{ fontSize: '0.75rem' }}
          >
            <Sparkles size={13} style={{ color: 'var(--accent-gold-dark)' }} />
            <span>સેમ્પલ પેઢીનામું ભરો</span>
          </button>

          <button 
            type="button"
            className={`phonetic-toggle-btn ${isPhoneticActive ? 'active' : ''}`}
            onClick={() => setIsPhoneticActive(!isPhoneticActive)}
            title="અંગ્રેજીમાં લખશો તો આપોઆપ ગુજરાતી થશે. શોર્ટકટ: Ctrl+G"
          >
            <Keyboard size={13} />
            <span>ગુજરાતી: {isPhoneticActive ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="form-scrollable-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* 1. Deceased Person */}
          <div className="form-category-group">
            <div className="category-title">
              <span>૧. મૂળ પુરુષ / સ્વર્ગસ્થ વ્યક્તિની વિગત</span>
            </div>

            <div className="field-group">
              <label className="field-label">સ્વર્ગસ્થ વ્યક્તિનું પૂરું નામ</label>
              <input 
                type="text"
                className="input-control"
                value={deceasedName}
                onChange={e => setDeceasedName(e.target.value)}
                onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setDeceasedName(val))}
                placeholder="દા.ત. સ્વ. ગોવિંદભાઈ મોહનભાઈ પટેલ"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="field-label">અવસાન તારીખ</label>
                <input 
                  type="text"
                  className="input-control"
                  value={deathDate}
                  onChange={e => setDeathDate(e.target.value)}
                  placeholder="દા.ત. ૧૫/૧૦/૨૦૨૪"
                />
              </div>
              <div>
                <label className="field-label">અવસાન સ્થળ</label>
                <input 
                  type="text"
                  className="input-control"
                  value={deathPlace}
                  onChange={e => setDeathPlace(e.target.value)}
                  onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setDeathPlace(val))}
                  placeholder="દા.ત. અમદાવાદ"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <div>
                <label className="field-label">ગામ/શહેર</label>
                <input 
                  type="text"
                  className="input-control"
                  value={village}
                  onChange={e => setVillage(e.target.value)}
                  onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setVillage(val))}
                />
              </div>
              <div>
                <label className="field-label">તાલુકો</label>
                <input 
                  type="text"
                  className="input-control"
                  value={taluka}
                  onChange={e => setTaluka(e.target.value)}
                  onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setTaluka(val))}
                />
              </div>
              <div>
                <label className="field-label">જિલ્લો</label>
                <input 
                  type="text"
                  className="input-control"
                  value={district}
                  onChange={e => setDistrict(e.target.value)}
                  onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setDistrict(val))}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">મિલકત / સર્વે નં. / ખાતા નંબર</label>
              <input 
                type="text"
                className="input-control"
                value={khataSurveyNo}
                onChange={e => setKhataSurveyNo(e.target.value)}
                onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setKhataSurveyNo(val))}
                placeholder="દા.ત. ખાતા નં. ૧૨૪, સર્વે નં. ૫૪/૧"
              />
            </div>
          </div>

          {/* 2. Applicant Info */}
          <div className="form-category-group">
            <div className="category-title">
              <span>૨. અરજદાર (સોગંદ આપનાર વારસદાર)</span>
            </div>

            <div className="field-group">
              <label className="field-label">અરજદારનું નામ</label>
              <input 
                type="text"
                className="input-control"
                value={applicantName}
                onChange={e => setApplicantName(e.target.value)}
                onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setApplicantName(val))}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="field-label">ઉંમર (વર્ષ)</label>
                <input 
                  type="text"
                  className="input-control"
                  value={applicantAge}
                  onChange={e => setApplicantAge(e.target.value)}
                />
              </div>
              <div>
                <label className="field-label">સંબંધ (સ્વર્ગસ્થ સાથે)</label>
                <input 
                  type="text"
                  className="input-control"
                  value={applicantRelation}
                  onChange={e => setApplicantRelation(e.target.value)}
                  onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setApplicantRelation(val))}
                  placeholder="દા.ત. દીકરો / પત્ની"
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">પૂરું સરનામું</label>
              <textarea 
                className="input-control"
                rows={2}
                value={applicantAddress}
                onChange={e => setApplicantAddress(e.target.value)}
                onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setApplicantAddress(val))}
              />
            </div>
          </div>

          {/* 3. Spouse Info */}
          <div className="form-category-group">
            <div className="category-title">
              <span>૩. ધર્મપત્ની / પતિની વિગત</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '0.75rem' }}>
              <div>
                <label className="field-label">પત્નીનું નામ</label>
                <input 
                  type="text"
                  className="input-control"
                  value={spouseName}
                  onChange={e => setSpouseName(e.target.value)}
                  onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setSpouseName(val))}
                />
              </div>
              <div>
                <label className="field-label">સ્થિતિ / ઉંમર</label>
                <input 
                  type="text"
                  className="input-control"
                  value={spouseStatus}
                  onChange={e => setSpouseStatus(e.target.value)}
                  onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setSpouseStatus(val))}
                  placeholder="હયાત / મરણ"
                />
              </div>
            </div>
          </div>

          {/* 4. Sons List */}
          <div className="form-category-group">
            <div className="category-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>૪. દીકરાઓની યાદી (Sons) ({sons.length})</span>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
                onClick={handleAddSon}
              >
                <Plus size={13} /> + દીકરો ઉમેરો
              </button>
            </div>

            {sons.map((son, idx) => (
              <div key={son.id} style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary)' }}>દીકરો #{idx + 1}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveSon(son.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 1fr', gap: '0.4rem' }}>
                  <input 
                    type="text"
                    className="input-control"
                    placeholder="દીકરાનું પૂરું નામ..."
                    value={son.name}
                    onChange={e => handleUpdateSon(son.id, 'name', e.target.value)}
                    onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => handleUpdateSon(son.id, 'name', val))}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                  />
                  <input 
                    type="text"
                    className="input-control"
                    placeholder="ઉંમર (વર્ષ)"
                    value={son.age}
                    onChange={e => handleUpdateSon(son.id, 'age', e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                  />
                  <select
                    className="input-control"
                    value={son.status}
                    onChange={e => handleUpdateSon(son.id, 'status', e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.4rem' }}
                  >
                    <option value="હયાત">હયાત</option>
                    <option value="મરણ ગયેલ">મરણ ગયેલ</option>
                  </select>
                </div>

                {son.status === 'મરણ ગયેલ' && (
                  <div style={{ marginTop: '0.4rem' }}>
                    <input 
                      type="text"
                      className="input-control"
                      placeholder="અવસાન પામેલ દીકરાના વારસદારો (પત્ની અને સંતાનો)..."
                      value={son.subHeirs}
                      onChange={e => handleUpdateSon(son.id, 'subHeirs', e.target.value)}
                      onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => handleUpdateSon(son.id, 'subHeirs', val))}
                      style={{ fontSize: '0.76rem', background: '#fffbeb', borderColor: '#fde68a' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 5. Daughters List */}
          <div className="form-category-group">
            <div className="category-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>૫. દીકરીઓની યાદી (Daughters) ({daughters.length})</span>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem' }}
                onClick={handleAddDaughter}
              >
                <Plus size={13} /> + દીકરી ઉમેરો
              </button>
            </div>

            {daughters.map((daughter, idx) => (
              <div key={daughter.id} style={{ background: '#ffffff', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-gold-dark)' }}>દીકરી #{idx + 1}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveDaughter(daughter.id)}
                    style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 1fr', gap: '0.4rem' }}>
                  <input 
                    type="text"
                    className="input-control"
                    placeholder="દીકરીનું પૂરું નામ..."
                    value={daughter.name}
                    onChange={e => handleUpdateDaughter(daughter.id, 'name', e.target.value)}
                    onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => handleUpdateDaughter(daughter.id, 'name', val))}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                  />
                  <input 
                    type="text"
                    className="input-control"
                    placeholder="ઉંમર"
                    value={daughter.age}
                    onChange={e => handleUpdateDaughter(daughter.id, 'age', e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
                  />
                  <select
                    className="input-control"
                    value={daughter.maritalStatus}
                    onChange={e => handleUpdateDaughter(daughter.id, 'maritalStatus', e.target.value)}
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.4rem' }}
                  >
                    <option value="પરિણીત">પરિણીત</option>
                    <option value="અપરિણીત">અપરિણીત</option>
                    <option value="મરણ ગયેલ">મરણ ગયેલ</option>
                  </select>
                </div>
              </div>
            ))}
          </div>

          {/* 6. Witnesses / Panches */}
          <div className="form-category-group">
            <div className="category-title">
              <span>૬. પંચો / સાક્ષીઓની વિગત (૨ પંચો)</span>
            </div>
            <div className="field-group">
              <label className="field-label">પંચ નં. ૧ (નામ, ઉંમર, સરનામું)</label>
              <input 
                type="text"
                className="input-control"
                value={panch1}
                onChange={e => setPanch1(e.target.value)}
                onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setPanch1(val))}
              />
            </div>
            <div className="field-group">
              <label className="field-label">પંચ નં. ૨ (નામ, ઉંમર, સરનામું)</label>
              <input 
                type="text"
                className="input-control"
                value={panch2}
                onChange={e => setPanch2(e.target.value)}
                onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => setPanch2(val))}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* ================= RIGHT PREVIEW PANEL ================= */}
      <main className="studio-preview-panel">
        {/* Preview Toolbar */}
        <div className="preview-toolbar">
          <div className="toolbar-controls">
            <button 
              className={`tool-toggle-btn ${stampPaperMode ? 'active' : ''}`}
              onClick={() => setStampPaperMode(!stampPaperMode)}
              title="₹ ૫૦/૧૦૦ ના ઇ-સ્ટેમ્પ પેપર પર પ્રિન્ટ કરવા ઉપરથી જગ્યા છોડો"
            >
              <Sliders size={14} />
              <span>ઇ-સ્ટેમ્પ મોડ: {stampPaperMode ? `${stampMarginMm}mm` : 'બંધ'}</span>
            </button>

            {stampPaperMode && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', border: '1px solid var(--border-subtle)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--accent-gold-dark)', fontWeight: 600 }}>ઓફસેટ:</span>
                <input 
                  type="range" 
                  min="60" 
                  max="140" 
                  value={stampMarginMm} 
                  onChange={e => setStampMarginMm(Number(e.target.value))}
                  style={{ width: '70px', accentColor: 'var(--accent-gold)' }}
                />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, fontFamily: 'monospace' }}>{stampMarginMm}mm</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button className="btn-secondary" onClick={handleCopyText} title="લખાણ કોપી કરો">
              {copied ? <Check size={16} style={{ color: '#059669' }} /> : <Copy size={16} />}
              <span>{copied ? 'કોપી થયું!' : 'કોપી'}</span>
            </button>

            <button className="btn-secondary" onClick={handleExportWord} title="Microsoft Word ફાઇલમાં ડાઉનલોડ">
              <Download size={16} />
              <span>Word (.doc)</span>
            </button>

            <button className="btn-primary" onClick={handlePrint} title="પ્રિન્ટ / PDF કાઢો">
              <Printer size={16} />
              <span>પ્રિન્ટ / PDF કાઢો</span>
            </button>
          </div>
        </div>

        {/* Paper Viewport */}
        <div className="paper-viewport">
          <div className="document-pages-container">
            <div 
              id="pedhinamu-print-sheet"
              className={`legal-sheet ${stampPaperMode ? 'stamp-paper-mode' : ''}`}
              style={{
                width: '210mm',
                minHeight: '297mm',
                paddingTop: stampPaperMode ? `${stampMarginMm}mm` : '25mm',
                paddingBottom: '25mm',
                paddingLeft: '28mm',
                paddingRight: '20mm',
                fontFamily: "'Noto Serif Gujarati', 'Noto Sans Gujarati', serif",
                fontSize: '12pt',
                lineHeight: '1.6'
              }}
            >
              {/* Visual Stamp Simulation */}
              {stampPaperMode && (
                <div 
                  className="stamp-paper-placeholder-zone no-print" 
                  style={{ height: `${stampMarginMm}mm` }}
                >
                  <div className="stamp-zone-content">
                    <div style={{ fontSize: '0.88rem', color: '#b45309', fontWeight: 800 }}>
                      🏛️ ગુજરાત સરકારી ઇ-સ્ટેમ્પ પેપર ઝોન ({stampMarginMm}mm)
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#78350f', marginTop: '2px' }}>
                      આ ભાગમાં પ્રિન્ટ થશે નહીં. ₹ ૫૦ / ₹ ૧૦૦ નું ઇ-સ્ટેમ્પ સર્ટિફિકેટ પ્રિન્ટરમાં મૂકો.
                    </div>
                  </div>
                </div>
              )}

              {/* Document Header */}
              <div className="doc-header-box" style={{ textAlign: 'center', marginBottom: '14pt' }}>
                <div style={{ fontSize: '13pt', fontWeight: 700 }}>॥ શ્રી ગણેશાય નમઃ ॥</div>
                <div style={{ fontSize: '15pt', fontWeight: 800, marginTop: '4pt', color: '#0f172a' }}>
                  વારસાઈ આંબો / પેઢીનામું સોગંદનામું
                </div>
                <div style={{ fontSize: '10pt', color: '#475569', marginTop: '2pt' }}>
                  (ગામ નમૂના નં. ૬ માં વારસાઈ નોંધ / સત્તાવાર પેઢીનામા અર્થે)
                </div>
              </div>

              {/* Authority & Applicant Statement */}
              <div style={{ marginBottom: '12pt' }}>
                <p>
                  <strong>સમક્ષ:</strong> બહુમાનનીય તલાટી કમ મંત્રીશ્રી / મામલતદારશ્રીની કચેરી, મોજે ગામ: <strong>{village}</strong>, તાલુકો: <strong>{taluka}</strong>, જિલ્લો: <strong>{district}</strong>.
                </p>
              </div>

              <div style={{ marginBottom: '14pt' }}>
                <p>
                  હું નીચે સહી કરનાર: <strong>{applicantName}</strong>, ઉંમર આશરે: <strong>{applicantAge}</strong> વર્ષ, ધંધો: વેપાર/ખેતી, 
                  રહેવાસી: <strong>{applicantAddress}</strong>, આધાર નં.: <strong>{applicantAadhar}</strong>.
                </p>
                <p style={{ marginTop: '8pt' }}>
                  આથી પવિત્રતાપૂર્વક પ્રતિજ્ઞા ઉપર નીચે મુજબનું વારસાઈ પેઢીનામું સોગંદનામું જાહેર કરું છું કે:
                </p>
              </div>

              <div style={{ marginBottom: '12pt' }}>
                <p>
                  ૧. અમારા કુટુંબના મૂળ પુરુષ મારા પિતાશ્રી <strong>{deceasedName}</strong> નું અવસાન તારીખ: <strong>{deathDate}</strong> ના રોજ <strong>{deathPlace}</strong> મુકામે થયેલ છે.
                </p>
                <p style={{ marginTop: '6pt' }}>
                  ૨. સ્વર્ગસ્થના નામે મોજે ગામ: <strong>{village}</strong>, તાલુકો: <strong>{taluka}</strong> ખાતે આવેલ <strong>{khataSurveyNo}</strong> વાળી મિલકત / જમીન આવેલ છે.
                </p>
                <p style={{ marginTop: '6pt' }}>
                  ૩. સ્વર્ગસ્થના અવસાન વખતે તેમના નીચે દર્શાવેલ સીધા અને કાયદેસરના વારસદારો હયાત છે, જે સિવાય અન્ય કોઈ વારસદાર હયાત નથી:
                </p>
              </div>

              {/* ================= HEIRS TABLE ================= */}
              <div style={{ margin: '14pt 0' }}>
                <div style={{ fontWeight: 700, fontSize: '11pt', marginBottom: '4pt', textAlign: 'center', color: '#1e293b' }}>
                  કાયદેસરના વારસદારોની વિગત દર્શાવતી તાલિકા (વારસાઈ આંબો):
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '10.5pt', border: '1px solid #334155' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #334155' }}>
                      <th style={{ border: '1px solid #334155', padding: '6pt 4pt', width: '35px', textAlign: 'center' }}>ક્રમ</th>
                      <th style={{ border: '1px solid #334155', padding: '6pt 6pt', textAlign: 'left' }}>વારસદારનું પૂરું નામ</th>
                      <th style={{ border: '1px solid #334155', padding: '6pt 6pt', width: '120px', textAlign: 'center' }}>સ્વર્ગસ્થ સાથે સંબંધ</th>
                      <th style={{ border: '1px solid #334155', padding: '6pt 4pt', width: '60px', textAlign: 'center' }}>ઉંમર</th>
                      <th style={{ border: '1px solid #334155', padding: '6pt 6pt', width: '100px', textAlign: 'center' }}>હાલની સ્થિતિ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Spouse */}
                    {spouseName && (
                      <tr>
                        <td style={{ border: '1px solid #334155', padding: '5pt 4pt', textAlign: 'center' }}>૧</td>
                        <td style={{ border: '1px solid #334155', padding: '5pt 6pt', fontWeight: 600 }}>{spouseName}</td>
                        <td style={{ border: '1px solid #334155', padding: '5pt 6pt', textAlign: 'center' }}>વિધવા પત્ની</td>
                        <td style={{ border: '1px solid #334155', padding: '5pt 4pt', textAlign: 'center' }}>{spouseAge} વર્ષ</td>
                        <td style={{ border: '1px solid #334155', padding: '5pt 6pt', textAlign: 'center' }}>{spouseStatus}</td>
                      </tr>
                    )}

                    {/* Sons */}
                    {sons.map((son, i) => (
                      <tr key={son.id}>
                        <td style={{ border: '1px solid #334155', padding: '5pt 4pt', textAlign: 'center' }}>{(spouseName ? 2 : 1) + i}</td>
                        <td style={{ border: '1px solid #334155', padding: '5pt 6pt' }}>
                          <span style={{ fontWeight: 600 }}>{son.name || `પુત્ર #${i + 1}`}</span>
                          {son.subHeirs && (
                            <div style={{ fontSize: '9pt', color: '#475569', marginTop: '2pt' }}>
                              ↳ શાખા વારસદારો: {son.subHeirs}
                            </div>
                          )}
                        </td>
                        <td style={{ border: '1px solid #334155', padding: '5pt 6pt', textAlign: 'center' }}>દીકરો</td>
                        <td style={{ border: '1px solid #334155', padding: '5pt 4pt', textAlign: 'center' }}>{son.age} {son.age ? 'વર્ષ' : '-'}</td>
                        <td style={{ border: '1px solid #334155', padding: '5pt 6pt', textAlign: 'center', color: son.status === 'મરણ ગયેલ' ? '#b91c1c' : '#047857', fontWeight: 600 }}>
                          {son.status}
                        </td>
                      </tr>
                    ))}

                    {/* Daughters */}
                    {daughters.map((daughter, i) => (
                      <tr key={daughter.id}>
                        <td style={{ border: '1px solid #334155', padding: '5pt 4pt', textAlign: 'center' }}>{(spouseName ? 2 : 1) + sons.length + i}</td>
                        <td style={{ border: '1px solid #334155', padding: '5pt 6pt', fontWeight: 600 }}>{daughter.name || `દીકરી #${i + 1}`}</td>
                        <td style={{ border: '1px solid #334155', padding: '5pt 6pt', textAlign: 'center' }}>દીકરી</td>
                        <td style={{ border: '1px solid #334155', padding: '5pt 4pt', textAlign: 'center' }}>{daughter.age} {daughter.age ? 'વર્ષ' : '-'}</td>
                        <td style={{ border: '1px solid #334155', padding: '5pt 6pt', textAlign: 'center' }}>{daughter.maritalStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Declarations */}
              <div style={{ marginBottom: '14pt' }}>
                <p>
                  ૪. આ સિવાય સ્વર્ગસ્થને અન્ય કોઈ પુત્ર, પુત્રી, પત્ની કે દત્તક લીધેલ સંતાન નથી કે કોઈ વારસદારનું નામ છુપાવેલ નથી.
                </p>
                <p style={{ marginTop: '6pt' }}>
                  ૫. જો ભવિષ્યમાં કોઈ અન્ય વારસદારનો હક્ક નીકળશે અથવા આ પેઢીનામું ખોટું સાબિત થશે, તો તેની તમામ દીવાની તથા ફોજદારી કાયદેસરની જવાબદારી મારી અંગત રહેશે.
                </p>
              </div>

              {/* Signature Block */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '20pt', marginBottom: '16pt' }}>
                <div>
                  <div>સ્થળ: <strong>{district}</strong></div>
                  <div>તારીખ: <strong>{new Date().toLocaleDateString('en-GB')}</strong></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '35pt' }}>____________________________________</div>
                  <div style={{ fontWeight: 700 }}>({applicantName})</div>
                  <div style={{ fontSize: '9pt', color: '#475569' }}>સોગંદ આપનાર / અરજદારની સહી</div>
                </div>
              </div>

              {/* ================= PANCHNAMA / WITNESSES BLOCK ================= */}
              <div style={{ borderTop: '1.5px dashed #475569', paddingTop: '12pt', marginTop: '14pt' }}>
                <div style={{ fontWeight: 800, fontSize: '11pt', marginBottom: '6pt', textAlign: 'center', color: '#0f172a' }}>
                  રૂબરૂ પંચોનું પંચનામું (LOCAL WITNESS PANCHNAMA)
                </div>
                <p style={{ fontSize: '10pt', lineHeight: '1.5', color: '#334155' }}>
                  અમો નીચે સહી કરનાર પંચો આથી ખાતરીપૂર્વક જણાવીએ છીએ કે સ્વર્ગસ્થ <strong>{deceasedName}</strong> નાઓને અમો વર્ષોથી ઓળખીએ છીએ. ઉપરોક્ત પેઢીનામામાં દર્શાવેલ વારસદારોની વિગત તદ્દન સાચી અને ખરી છે, જેની ખાતરી બદલ અમો પંચોએ રૂબરૂ સહી કરેલ છે.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '14pt' }}>
                  <div style={{ border: '1px solid #cbd5e1', padding: '8pt', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '10pt' }}>પંચ નં. ૧ ની વિગત & સહી:</div>
                    <div style={{ fontSize: '9.5pt', color: '#475569', marginTop: '3pt' }}>{panch1}</div>
                    <div style={{ marginTop: '25pt', borderTop: '1px dotted #94a3b8', paddingTop: '3pt', fontSize: '9pt', textAlign: 'center' }}>
                      પંચ નં. ૧ ની સહી
                    </div>
                  </div>

                  <div style={{ border: '1px solid #cbd5e1', padding: '8pt', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 700, fontSize: '10pt' }}>પંચ નં. ૨ ની વિગત & સહી:</div>
                    <div style={{ fontSize: '9.5pt', color: '#475569', marginTop: '3pt' }}>{panch2}</div>
                    <div style={{ marginTop: '25pt', borderTop: '1px dotted #94a3b8', paddingTop: '3pt', fontSize: '9pt', textAlign: 'center' }}>
                      પંચ નં. ૨ ની સહી
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
