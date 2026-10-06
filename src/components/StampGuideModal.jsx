import React from 'react';
import { X, Sliders, CheckCircle, AlertTriangle, Printer } from 'lucide-react';

export default function StampGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sliders size={20} style={{ color: 'var(--accent-gold-dark)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              ગુજરાત ઇ-સ્ટેમ્પ પેપર પ્રિન્ટિંગ માર્ગદર્શિકા (Stamp Paper Guide)
            </h3>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <h4 style={{ color: '#b45309', fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              💡 સ્ટેમ્પ પેપર પર સીધું પ્રિન્ટ કેવી રીતે કાઢવું?
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#92400e', lineHeight: '1.5' }}>
              ગુજરાતમાં તમામ સોગંદનામા અને કરારો ₹ ૫૦, ₹ ૧૦૦, ₹ ૩૦૦ કે ₹ ૫૦૦ ના ઇ-સ્ટેમ્પ સર્ટિફિકેટ ઉપર કરવામાં આવે છે. ઇ-સ્ટેમ્પ સર્ટિફિકેટના ઉપરના ભાગમાં સરકારી હોલોગ્રામ અને વિગતો છાપેલી હોય છે.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.86rem' }}>
            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem' }}>
                ૧. સ્ટેમ્પ પેપર માર્જિન મોડ (Stamp Margin Mode) ચાલુ કરો:
              </strong>
              <p style={{ color: 'var(--text-muted)' }}>
                Document Studio ની ટોપ ટૂલબારમાં રહેલું <strong>'સ્ટેમ્પ પેપર માર્જિન મોડ'</strong> બટન દબાવો. આનાથી લખાણ પેજની ટોચ પરથી નીચે ખસી જશે.
              </p>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem' }}>
                ૨. સાચો ટોપ માર્જિન ઓફસેટ (Top Margin Offset) પસંદ કરો:
              </strong>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.6', marginTop: '0.35rem' }}>
                <li><strong>સામાન્ય ₹ ૫૦ / ₹ ૧૦૦ ઇ-સ્ટેમ્પ:</strong> ૧૦૦mm થી ૧૧૫mm રાખો.</li>
                <li><strong>મોટો ઇ-સ્ટેમ્પ સર્ટિફિકેટ (SHCIL):</strong> ૧૨૦mm થી ૧૩૫mm રાખો.</li>
                <li><strong>એડવોકેટ લેટરહેડ:</strong> ૬૫mm થી ૮૦mm રાખો.</li>
              </ul>
            </div>

            <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <strong style={{ color: 'var(--primary)', display: 'block', marginBottom: '0.4rem' }}>
                ૩. પ્રિન્ટર સેટિંગ્સ (Browser Print Settings):
              </strong>
              <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-muted)', lineHeight: '1.6', marginTop: '0.35rem' }}>
                <li>પેપર સાઇઝ: <strong>A4</strong> અથવા <strong>Legal</strong> (તમારા સ્ટેમ્પ પેપર મુજબ) પસંદ કરો.</li>
                <li>માર્જિન્સ (Margins): <strong>Default</strong> અથવા <strong>None</strong> પસંદ કરો.</li>
                <li>'Headers and footers' (હેડર અને ફૂટર) અનચેક (બંધ) કરો જેથી બ્રાઉઝરની URL ન છપાય.</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-primary" onClick={onClose}>
            સમજાઈ ગયું (Got It)
          </button>
        </div>
      </div>
    </div>
  );
}
