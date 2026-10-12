import React, { useState, useMemo } from 'react';
import { 
  X, 
  Calculator, 
  Check, 
  Copy, 
  Printer, 
  Sparkles, 
  AlertCircle, 
  Award, 
  Building, 
  User, 
  Users, 
  FileCheck,
  TrendingDown,
  ArrowRight
} from 'lucide-react';
import { 
  STAMP_DOC_TYPES, 
  calculateGujaratStampDuty, 
  formatINR 
} from '../utils/stampDutyCalculator';
import { numberToGujaratiWords } from '../utils/documentUtils';

export default function StampDutyCalculatorModal({ 
  isOpen, 
  onClose,
  initialAmount = '',
  onApplyToDocument = null
}) {
  if (!isOpen) return null;

  const [docTypeId, setDocTypeId] = useState('sale_deed');
  const [buyerType, setBuyerType] = useState('male'); // 'male' | 'female' | 'joint'
  const [considerationInput, setConsiderationInput] = useState(initialAmount ? String(initialAmount) : '1500000');
  const [jantriInput, setJantriInput] = useState('');
  const [copied, setCopied] = useState(false);

  // Quick preset amounts in INR
  const presetAmounts = [
    { label: '₹ ૫ લાખ', val: 500000 },
    { label: '₹ ૧૦ લાખ', val: 1000000 },
    { label: '₹ ૨૫ લાખ', val: 2500000 },
    { label: '₹ ૫૦ લાખ', val: 5000000 },
    { label: '₹ ૧ કરોડ', val: 10000000 }
  ];

  // Perform Gujarat Stamp Calculation
  const calculation = useMemo(() => {
    return calculateGujaratStampDuty({
      docTypeId,
      considerationAmount: Number(considerationInput) || 0,
      jantriValue: Number(jantriInput) || 0,
      buyerType
    });
  }, [docTypeId, considerationInput, jantriInput, buyerType]);

  const totalWords = useMemo(() => {
    return numberToGujaratiWords(calculation.totalGovtCost);
  }, [calculation.totalGovtCost]);

  // Copy breakdown text for WhatsApp / Client Note
  const handleCopySummary = () => {
    const lines = [
      `🏛️ ગુજરાત સ્ટેમ્પ ડ્યુટી & રજીસ્ટ્રેશન ખર્ચ ગણતરી પત્રક`,
      `----------------------------------------`,
      `📄 દસ્તાવેજ પ્રકાર: ${calculation.docType.title}`,
      `👤 ખરીદનાર વર્ગ: ${buyerType === 'female' ? 'મહિલા (૧% કન્સેશન)' : buyerType === 'male' ? 'પુરુષ' : 'સંયુક્ત (પુરુષ & મહિલા)'}`,
      `💰 અવેજ / વેચાણ રકમ: ${formatINR(calculation.consideration)}`,
      calculation.jantri > 0 ? `🏛️ જંત્રી મૂલ્યાંકન: ${formatINR(calculation.jantri)}` : null,
      `⚖️ ગણતરી પાત્ર બજાર મૂલ્ય: ${formatINR(calculation.applicableValue)}`,
      `----------------------------------------`,
      `🔖 સ્ટેમ્પ ડ્યુટી (${calculation.isFixed ? 'નિયત' : calculation.stampRate + '%'}): ${formatINR(calculation.stampDuty)}`,
      `📜 નોંધણી ફી (${calculation.isFixed ? 'નિયત' : calculation.regRate + '%'}): ${formatINR(calculation.registrationFee)}`,
      calculation.womenSavings > 0 ? `🎉 મહિલા કન્સેશન હેઠળ બચત: ${formatINR(calculation.womenSavings)}` : null,
      `----------------------------------------`,
      `⭐ કુલ સરકારી ખર્ચ: ${formatINR(calculation.totalGovtCost)}`,
      `🔤 અંકે શબ્દોમાં: ${totalWords}`,
      `----------------------------------------`,
      `* ગુજરાત સ્ટેમ્પ એક્ટ મુજબ પ્રમાણિત ગણતરી`
    ].filter(Boolean).join('\n');

    navigator.clipboard.writeText(lines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  // 1-Click apply values directly into the active document form
  const handleApply = () => {
    if (onApplyToDocument) {
      onApplyToDocument({
        consideration: calculation.applicableValue,
        stampDuty: calculation.stampDuty,
        registrationFee: calculation.registrationFee,
        totalGovtCost: calculation.totalGovtCost,
        words: totalWords
      });
      onClose();
    }
  };

  const handlePrintSlip = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '820px', width: '95%' }}
      >
        {/* Modal Header */}
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
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)'
            }}>
              <Calculator size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
                ગુજરાત સ્ટેમ્પ ડ્યુટી & જંત્રી કેલ્ક્યુલેટર
              </h3>
              <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0, marginTop: '2px' }}>
                ગુજરાત સ્ટેમ્પ એક્ટ, ૧૯૫૮ & સબ-રજીસ્ટ્રાર કચેરી નિયમો મુજબ પ્રમાણિત ગણતરી
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#64748b', 
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '78vh', overflowY: 'auto', padding: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: '1.25rem' }}>
            
            {/* LEFT COLUMN: Input Configuration */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Document Type Selector */}
              <div>
                <label className="field-label" style={{ marginBottom: '0.4rem', fontWeight: 700 }}>
                  <span>૧. દસ્તાવેજનો પ્રકાર પસંદ કરો (Document Type)</span>
                </label>
                <select 
                  className="input-control"
                  value={docTypeId}
                  onChange={e => setDocTypeId(e.target.value)}
                  style={{ fontWeight: 600, color: '#1e293b' }}
                >
                  {STAMP_DOC_TYPES.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      {doc.title}
                    </option>
                  ))}
                </select>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.35rem' }}>
                  {calculation.docType.notes}
                </div>
              </div>

              {/* Buyer / Transferee Gender Selection (Critical for Gujarat Concession) */}
              {!calculation.isFixed && (
                <div>
                  <label className="field-label" style={{ marginBottom: '0.45rem', fontWeight: 700 }}>
                    <span>૨. ખરીદનાર / પક્ષકાર વર્ગ (Buyer Category)</span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                    
                    <button
                      type="button"
                      onClick={() => setBuyerType('male')}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: '8px',
                        border: buyerType === 'male' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: buyerType === 'male' ? '#eff6ff' : '#ffffff',
                        color: buyerType === 'male' ? '#1d4ed8' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <User size={16} />
                      <span>પુરુષ ખરીદનાર</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#64748b' }}>૪.૯૦% + ૧%</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBuyerType('female')}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: '8px',
                        border: buyerType === 'female' ? '2px solid #059669' : '1px solid #cbd5e1',
                        background: buyerType === 'female' ? '#ecfdf5' : '#ffffff',
                        color: buyerType === 'female' ? '#047857' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem',
                        position: 'relative'
                      }}
                    >
                      <Award size={16} style={{ color: '#059669' }} />
                      <span>મહિલા ખરીદનાર</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#059669' }}>૩.૯૦% (૧% છૂટ)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBuyerType('joint')}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: '8px',
                        border: buyerType === 'joint' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                        background: buyerType === 'joint' ? '#eff6ff' : '#ffffff',
                        color: buyerType === 'joint' ? '#1d4ed8' : '#475569',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Users size={16} />
                      <span>સંયુક્ત પક્ષકારો</span>
                      <span style={{ fontSize: '0.68rem', fontWeight: 500, color: '#64748b' }}>૪.૯૦% + ૧%</span>
                    </button>

                  </div>

                  {buyerType === 'female' && (
                    <div style={{
                      marginTop: '0.5rem',
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: '6px',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#065f46',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <Sparkles size={14} style={{ color: '#059669', flexShrink: 0 }} />
                      <span>ગુજરાત સરકાર દ્વારા મહિલા ખરીદનારને સ્ટેમ્પ ડ્યુટીમાં ૧% ની સીધી છૂટ & નોંધણી ફી માફી મળે છે.</span>
                    </div>
                  )}
                </div>
              )}

              {/* Consideration (Sale Price) Input */}
              <div>
                <label className="field-label" style={{ marginBottom: '0.35rem', fontWeight: 700 }}>
                  <span>૩. અવેજ / વેચાણ રકમ (Sale Consideration Amount ₹)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontWeight: 700,
                    color: '#64748b'
                  }}>₹</span>
                  <input 
                    type="number"
                    className="input-control"
                    placeholder="દા.ત. 1500000"
                    value={considerationInput}
                    onChange={e => setConsiderationInput(e.target.value)}
                    style={{ paddingLeft: '28px', fontSize: '1rem', fontWeight: 700 }}
                  />
                </div>

                {/* Preset Chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.45rem' }}>
                  {presetAmounts.map(p => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setConsiderationInput(String(p.val))}
                      style={{
                        background: Number(considerationInput) === p.val ? '#dbeafe' : '#f1f5f9',
                        border: '1px solid',
                        borderColor: Number(considerationInput) === p.val ? '#3b82f6' : '#e2e8f0',
                        color: Number(considerationInput) === p.val ? '#1d4ed8' : '#475569',
                        borderRadius: '16px',
                        padding: '0.2rem 0.6rem',
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Government Jantri Valuation Input */}
              {!calculation.isFixed && (
                <div>
                  <label className="field-label" style={{ marginBottom: '0.35rem', fontWeight: 700 }}>
                    <span>૪. સરકારી જંત્રી મૂલ્યાંકન (Govt Jantri Value ₹ - જો હોય તો)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontWeight: 700,
                      color: '#64748b'
                    }}>₹</span>
                    <input 
                      type="number"
                      className="input-control"
                      placeholder="દા.ત. 1800000 (અવેજ કરતાં વધુ હોય ત્યારે)"
                      value={jantriInput}
                      onChange={e => setJantriInput(e.target.value)}
                      style={{ paddingLeft: '28px', fontSize: '0.95rem' }}
                    />
                  </div>
                  
                  {calculation.isJantriHigher && (
                    <div style={{
                      marginTop: '0.45rem',
                      background: '#fffbeb',
                      border: '1px solid #fde68a',
                      borderRadius: '6px',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.75rem',
                      color: '#b45309',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}>
                      <AlertCircle size={14} style={{ color: '#d97706', flexShrink: 0 }} />
                      <span>
                        જંત્રી મૂલ્ય ({formatINR(calculation.jantri)}) અવેજ કરતાં વધુ હોવાથી, નિયમ મુજબ જંત્રી પર સ્ટેમ્પ ડ્યુટી ગણવામાં આવેલ છે.
                      </span>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: Official Cost Breakdown Card */}
            <div style={{
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)'
            }}>
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem',
                  borderBottom: '1.5px dashed #cbd5e1',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Building size={16} style={{ color: '#1e3a8a' }} />
                    <strong style={{ fontSize: '0.92rem', color: '#0f172a' }}>સરકારી ખર્ચ વિગતો</strong>
                  </div>
                  <span style={{
                    fontSize: '0.72rem',
                    background: '#e0e7ff',
                    color: '#3730a3',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '12px',
                    fontWeight: 700
                  }}>
                    ગુજરાત સ્ટેમ્પ એક્ટ
                  </span>
                </div>

                {/* Applicable Value Basis */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <span style={{ fontSize: '0.82rem', color: '#64748b' }}>ગણતરી પાત્ર બજાર મૂલ્ય:</span>
                  <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                    {formatINR(calculation.applicableValue)}
                  </strong>
                </div>

                {/* Stamp Duty Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', color: '#475569' }}>સ્ટેમ્પ ડ્યુટી:</span>
                    {!calculation.isFixed && (
                      <span style={{
                        fontSize: '0.72rem',
                        background: '#f1f5f9',
                        color: '#475569',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        marginLeft: '5px'
                      }}>
                        {calculation.stampRate}%
                      </span>
                    )}
                  </div>
                  <strong style={{ fontSize: '0.95rem', color: '#1e3a8a' }}>
                    {formatINR(calculation.stampDuty)}
                  </strong>
                </div>

                {/* Women Concession Saving Row (Green) */}
                {calculation.womenSavings > 0 && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.65rem',
                    background: '#ecfdf5',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <TrendingDown size={14} style={{ color: '#059669' }} />
                      <span style={{ fontSize: '0.8rem', color: '#065f46', fontWeight: 600 }}>મહિલા છૂટ બચત:</span>
                    </div>
                    <strong style={{ fontSize: '0.9rem', color: '#059669' }}>
                      - {formatINR(calculation.womenSavings)}
                    </strong>
                  </div>
                )}

                {/* Registration Fee Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <div>
                    <span style={{ fontSize: '0.82rem', color: '#475569' }}>સબ-રજીસ્ટ્રાર નોંધણી ફી:</span>
                    {!calculation.isFixed && (
                      <span style={{
                        fontSize: '0.72rem',
                        background: calculation.regRate === 0 ? '#dcfce7' : '#f1f5f9',
                        color: calculation.regRate === 0 ? '#166534' : '#475569',
                        padding: '1px 5px',
                        borderRadius: '4px',
                        marginLeft: '5px',
                        fontWeight: 600
                      }}>
                        {calculation.regRate === 0 ? 'માફ (૦%)' : calculation.regRate + '%'}
                      </span>
                    )}
                  </div>
                  <strong style={{ fontSize: '0.95rem', color: '#1e3a8a' }}>
                    {formatINR(calculation.registrationFee)}
                  </strong>
                </div>

                {/* TOTAL GOVERNMENT COST HIGHLIGHT BOX */}
                <div style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
                  color: '#ffffff',
                  padding: '1rem',
                  borderRadius: '10px',
                  boxShadow: '0 4px 14px rgba(30, 58, 138, 0.25)',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.78rem', color: '#bfdbfe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    કુલ સરકારી મહેસૂલી ખર્ચ (Total Govt Cost)
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '2px', color: '#ffffff' }}>
                    {formatINR(calculation.totalGovtCost)}
                  </div>
                  <div style={{
                    fontSize: '0.76rem',
                    color: '#fef08a',
                    marginTop: '0.4rem',
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    paddingTop: '0.35rem',
                    lineHeight: 1.4
                  }}>
                    🔤 <strong>અંકે શબ્દોમાં:</strong> {totalWords}
                  </div>
                </div>

                {/* e-Stamp Paper Recommendation */}
                <div style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.75rem',
                  color: '#334155'
                }}>
                  💡 <strong>ઇ-સ્ટેમ્પ સર્ટિફિકેટ (SHCIL):</strong> {calculation.isFixed 
                    ? `આ દસ્તાવેજ ₹ ${calculation.stampDuty} ના ઇ-સ્ટેમ્પ પર પ્રિન્ટ થશે.`
                    : `આ દસ્તાવેજ ₹ ${calculation.stampDuty.toLocaleString('en-IN')} ના ઇ-સ્ટેમ્પ સર્ટિફિકેટ ઉપર કરવાનો રહેશે.`
                  }
                </div>
              </div>

              {/* Action Buttons inside Card */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCopySummary}
                  style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
                  title="વોટ્સએપ અથવા અસીલ માટે ગણતરી વિગતો કોપી કરો"
                >
                  {copied ? <Check size={14} style={{ color: '#059669' }} /> : <Copy size={14} />}
                  <span>{copied ? 'કોપી થયું!' : 'વિગતો કોપી'}</span>
                </button>

                {onApplyToDocument && (
                  <button
                    type="button"
                    className="btn-gold"
                    onClick={handleApply}
                    style={{ flex: 1.2, padding: '0.45rem', fontSize: '0.8rem' }}
                    title="આ રકમ સીધી દસ્તાવેજના ફોર્મમાં ભરી દો"
                  >
                    <ArrowRight size={14} />
                    <span>દસ્તાવેજમાં દાખલ કરો</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
            * નોંધ: આ ગણતરી ગુજરાત રાજ્યના સબ-રજીસ્ટ્રાર કચેરીના પ્રવર્તમાન નિયમો મુજબ અંદાજિત કાનૂની માર્ગદર્શન માટે છે.
          </div>
          <button 
            type="button" 
            className="btn-primary" 
            onClick={onClose}
            style={{ padding: '0.45rem 1.2rem', fontSize: '0.85rem' }}
          >
            બંધ કરો
          </button>
        </div>

      </div>
    </div>
  );
}
