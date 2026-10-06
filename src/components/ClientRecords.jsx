import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  ExternalLink, 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Printer, 
  Clock,
  Sparkles
} from 'lucide-react';
import { exportToWord } from '../utils/documentUtils';

export default function ClientRecords({ 
  records, 
  onLoadRecord, 
  onDeleteRecord, 
  onClearAll 
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      const q = searchQuery.toLowerCase();
      return !q || 
        (r.clientName && r.clientName.toLowerCase().includes(q)) ||
        (r.templateTitle && r.templateTitle.toLowerCase().includes(q)) ||
        (r.date && r.date.toLowerCase().includes(q)) ||
        (r.place && r.place.toLowerCase().includes(q));
    });
  }, [records, searchQuery]);

  const handleExportDocx = (record) => {
    const filename = `${record.clientName}_${record.templateTitle.replace(/\s+/g, '_')}`;
    const formattedHtml = (record.renderedText || '')
      .split('\n\n')
      .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
      .join('');
    exportToWord(filename, record.templateTitle, formattedHtml);
  };

  return (
    <div className="templates-view">
      <div className="view-header">
        <div className="view-title-block">
          <h2>સાચવેલ અસીલ દસ્તાવેજો (Client Records & History)</h2>
          <p>
            તમે અગાઉ તૈયાર કરેલા તમામ દસ્તાવેજોની સુરક્ષિત લોકલ હિસ્ટ્રી. કોઈપણ સમયે ફરીથી ખોલીને એડિટ અથવા પ્રિન્ટ કરો.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {records.length > 0 && (
            <button className="btn-danger" onClick={onClearAll}>
              <Trash2 size={15} />
              <span>તમામ રેકોર્ડ ડિલીટ કરો</span>
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="અસીલનું નામ, તારીખ કે ફોર્મેટ શોધો..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          કુલ {filteredRecords.length} રેકોર્ડ્સ
        </span>
      </div>

      {filteredRecords.length === 0 ? (
        <div style={{ 
          background: 'var(--bg-card)', 
          padding: '3rem', 
          borderRadius: 'var(--radius-lg)', 
          textAlign: 'center',
          border: '1px dashed var(--border-subtle)' 
        }}>
          <Clock size={48} style={{ color: 'var(--text-subtle)', margin: '0 auto 1rem' }} />
          <h3>કોઈ રેકોર્ડ મળ્યો નથી</h3>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            તમે જ્યારે પણ Document Studio માં કોઈ દસ્તાવેજ બનાવીને 'અસીલ ફાઇલ સાચવો' બટન દબાવશો, ત્યારે તેની વિગત અહીં આપોઆપ આવી જશે.
          </p>
        </div>
      ) : (
        <div className="records-table-container">
          <table className="records-table">
            <thead>
              <tr>
                <th>અસીલનું નામ (Client)</th>
                <th>દસ્તાવેજ ફોર્મેટ (Document)</th>
                <th>તારીખ / સ્થળ</th>
                <th>છેલ્લે અપડેટ</th>
                <th style={{ textAlign: 'right' }}>કાર્યવાહી (Actions)</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.map(record => (
                <tr key={record.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                      <User size={15} style={{ color: 'var(--accent-gold-dark)' }} />
                      <span style={{ fontFamily: 'var(--font-doc)' }}>{record.clientName || 'અનામી'}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{record.templateTitle}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', fontSize: '0.78rem' }}>
                      <span>📅 {record.date || '-'}</span>
                      {record.place && <span style={{ color: 'var(--text-subtle)' }}>📍 {record.place}</span>}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {new Date(record.updatedAt || record.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        className="btn-primary" 
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem' }}
                        onClick={() => onLoadRecord(record)}
                        title="આ દસ્તાવેજ Studio માં ખોલો"
                      >
                        <ExternalLink size={14} />
                        <span>ખોલો</span>
                      </button>

                      <button 
                        className="btn-secondary" 
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
                        onClick={() => handleExportDocx(record)}
                        title="Word (.doc) ફાઇલ ડાઉનલોડ"
                      >
                        <Download size={14} />
                      </button>

                      <button 
                        className="btn-danger" 
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
                        onClick={() => onDeleteRecord(record.id)}
                        title="રેકોર્ડ કાઢી નાખો"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
