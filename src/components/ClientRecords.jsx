import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  ExternalLink, 
  Download, 
  FileDown,
  RotateCcw,
  FileText, 
  Calendar, 
  User, 
  Printer, 
  Clock,
  Sparkles
} from 'lucide-react';
import { exportToWord, exportToPdf, LEGAL_FONTS } from '../utils/documentUtils';
import SubscriptionGuard from './SubscriptionGuard';
import { useAuth } from '../contexts/AuthContext';

export default function ClientRecords({ 
  records, 
  onLoadRecord, 
  onDeleteRecord, 
  onClearAll 
}) {
  const { currentUser, openAuthModal } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [generatingPdfId, setGeneratingPdfId] = useState(null);

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
    const cleanClient = (record.clientName || 'અસીલ').replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_');
    const cleanTitle = (record.templateTitle || 'દસ્તાવેજ').replace(/\s+/g, '_');
    const filename = `${cleanClient}_${cleanTitle}`;
    
    const rawText = record.renderedText || record.content || '';
    const isHtml = /<[a-z][\s\S]*>/i.test(rawText);
    const formattedHtml = isHtml 
      ? rawText.replace(/---PAGE_BREAK---/g, '<div style="page-break-after: always;"><br/></div>')
      : rawText
          .split('\n\n')
          .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`)
          .join('');
    exportToWord(filename, record.templateTitle, formattedHtml);
  };

  const handleExportPdf = async (record) => {
    if (!record) return;
    setGeneratingPdfId(record.id);

    try {
      const cleanClient = (record.clientName || 'અસીલ').trim().replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_');
      const cleanTitle = (record.templateTitle || 'દસ્તાવેજ').trim().replace(/[^a-zA-Z0-9\u0A80-\u0AFF]/g, '_');
      const filename = `${cleanClient}_${cleanTitle}_${new Date().toISOString().slice(0, 10)}`;

      // Page & font options from record if stored
      const pageSetup = record.pageSetup || {};
      const paperSize = pageSetup.paperSize === 'legal' ? 'legal' : 'a4';
      const sheetWidth = paperSize === 'legal' ? '215.9mm' : '210mm';
      const sheetHeight = paperSize === 'legal' ? '355.6mm' : '297mm';
      const fontSizePt = pageSetup.fontSizePt || 13;
      const lineHeight = pageSetup.lineHeight || 1.85;
      const stampPaperMode = !!pageSetup.stampMarginMm || !!pageSetup.stampPaperMode;
      const stampMarginMm = pageSetup.stampMarginMm || 80;

      // Resolve font family if specified
      const activeFont = LEGAL_FONTS?.find?.(f => f.id === pageSetup.fontId) || LEGAL_FONTS?.[0];
      const fontFamily = activeFont?.family || "'Noto Serif Gujarati', 'Shruti', 'Gujarati', serif";

      // Prepare raw or formatted HTML content
      let rawContent = record.renderedText || '';
      if (!rawContent && record.content) {
        rawContent = record.content;
      }

      if (!rawContent || !rawContent.trim()) {
        alert('આ દસ્તાવેજમાં લખાણ સંગ્રહિત નથી.');
        return;
      }

      // Check if content is plain text or HTML
      const isHtml = /<[a-z][\s\S]*>/i.test(rawContent);
      let contentPages = [];

      if (rawContent.includes('---PAGE_BREAK---')) {
        contentPages = rawContent.split(/\s*---PAGE_BREAK---\s*/);
      } else {
        contentPages = [rawContent];
      }

      // Create isolated offscreen container for PDF rendering
      const staging = document.createElement('div');
      staging.className = 'history-pdf-staging';
      staging.style.position = 'fixed';
      staging.style.left = '-99999px';
      staging.style.top = '0';
      staging.style.background = '#ffffff';
      staging.style.color = '#000000';
      staging.style.zIndex = '-1000';

      contentPages.forEach((pageHtml, index) => {
        const isFirst = index === 0;
        const topPadding = (isFirst && stampPaperMode) ? `${stampMarginMm}mm` : '25mm';

        const pageEl = document.createElement('div');
        pageEl.className = 'legal-sheet history-export-sheet';
        pageEl.style.width = sheetWidth;
        pageEl.style.minHeight = sheetHeight;
        pageEl.style.boxSizing = 'border-box';
        pageEl.style.background = '#ffffff';
        pageEl.style.color = '#000000';
        pageEl.style.boxShadow = 'none';
        pageEl.style.border = 'none';
        pageEl.style.paddingTop = topPadding;
        pageEl.style.paddingBottom = '25mm';
        pageEl.style.paddingLeft = '28mm';
        pageEl.style.paddingRight = '22mm';
        pageEl.style.fontFamily = fontFamily;
        pageEl.style.fontSize = `${fontSizePt}pt`;
        pageEl.style.lineHeight = `${lineHeight}`;
        pageEl.style.textAlign = 'justify';
        pageEl.style.pageBreakAfter = index < contentPages.length - 1 ? 'always' : 'auto';
        pageEl.style.breakAfter = index < contentPages.length - 1 ? 'page' : 'auto';

        // Body content
        const bodyEl = document.createElement('div');
        bodyEl.className = 'document-body';
        bodyEl.style.textAlign = 'justify';
        bodyEl.style.lineHeight = `${lineHeight}`;

        if (isHtml) {
          bodyEl.innerHTML = pageHtml;
        } else {
          bodyEl.innerHTML = pageHtml
            .split('\n\n')
            .map(p => `<p style="margin-bottom: 1rem; line-height: ${lineHeight}; text-align: justify;">${p.replace(/\n/g, '<br/>')}</p>`)
            .join('');
        }

        pageEl.appendChild(bodyEl);
        staging.appendChild(pageEl);

        // Page break separator for html2pdf
        if (index < contentPages.length - 1) {
          const pb = document.createElement('div');
          pb.className = 'html2pdf__page-break';
          pb.style.pageBreakAfter = 'always';
          pb.style.breakAfter = 'page';
          staging.appendChild(pb);
        }
      });

      document.body.appendChild(staging);

      await exportToPdf(filename, staging, {
        paperSize: paperSize,
        fontFamily: fontFamily,
        margin: [0, 0, 0, 0]
      });
    } catch (err) {
      console.error('PDF Export Error:', err);
      alert('PDF ડાઉનલોડ કરવામાં ભૂલ આવી: ' + (err.message || err));
    } finally {
      const existingStaging = document.querySelector('.history-pdf-staging');
      if (existingStaging && document.body.contains(existingStaging)) {
        document.body.removeChild(existingStaging);
      }
      setGeneratingPdfId(null);
    }
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
          {!currentUser ? (
            <>
              <p style={{ color: 'var(--text-muted)', maxWidth: '520px', margin: '0.5rem auto 1.25rem', lineHeight: 1.6 }}>
                તમારા અસીલ દસ્તાવેજો અને હિસ્ટ્રી ક્લાઉડમાં સુરક્ષિત સાચવવા માટે કૃપા કરીને એકાઉન્ટમાં લૉગિન કરો અથવા નવું એકાઉન્ટ બનાવો.
              </p>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => openAuthModal?.({ mode: 'login' })}
                style={{ margin: '0 auto' }}
              >
                લૉગિન / રજિસ્ટર કરો
              </button>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              તમે જ્યારે પણ Document Studio માં કોઈ દસ્તાવેજ બનાવીને 'અસીલ ફાઇલ સાચવો' બટન દબાવશો, ત્યારે તેની વિગત અહીં આપોઆપ આવી જશે.
            </p>
          )}
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
                <th style={{ textAlign: 'right', minWidth: '270px' }}>કાર્યવાહી (Actions)</th>
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.45rem', alignItems: 'center' }}>
                      <button 
                        className="btn-primary" 
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', gap: '0.3rem' }}
                        onClick={() => onLoadRecord(record)}
                        title="આ દસ્તાવેજ Studio માં ખોલો"
                      >
                        <ExternalLink size={13} />
                        <span>ખોલો</span>
                      </button>

                      <SubscriptionGuard action="PDF ડાઉનલોડ">
                        <button 
                          className="btn-secondary btn-download-pdf" 
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem', gap: '0.3rem' }}
                          onClick={() => handleExportPdf(record)}
                          title="આ દસ્તાવેજ સીધો PDF ફોર્મેટમાં ડાઉનલોડ કરો (.pdf)"
                          disabled={generatingPdfId === record.id}
                        >
                          {generatingPdfId === record.id ? (
                            <RotateCcw size={13} className="spin" />
                          ) : (
                            <FileDown size={13} />
                          )}
                          <span>{generatingPdfId === record.id ? 'PDF...' : 'PDF'}</span>
                        </button>
                      </SubscriptionGuard>

                      <SubscriptionGuard action="Word (.docx) ડાઉનલોડ">
                        <button 
                          className="btn-secondary" 
                          style={{ fontSize: '0.78rem', padding: '0.35rem 0.7rem', gap: '0.3rem' }}
                          onClick={() => handleExportDocx(record)}
                          title="Word (.doc) ફાઇલ ડાઉનલોડ"
                        >
                          <Download size={13} />
                          <span>Word</span>
                        </button>
                      </SubscriptionGuard>

                      <button 
                        className="btn-danger" 
                        style={{ fontSize: '0.78rem', padding: '0.35rem 0.6rem' }}
                        onClick={() => onDeleteRecord(record.id)}
                        title="રેકોર્ડ કાઢી નાખો"
                      >
                        <Trash2 size={13} />
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
