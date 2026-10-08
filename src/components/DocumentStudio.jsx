import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Keyboard,
  Type,
  Calculator,
  Printer, 
  Download, 
  Copy, 
  Check, 
  RotateCcw, 
  Save, 
  Sparkles, 
  Layers, 
  Sliders, 
  Eye, 
  FileText,
  FolderOpen,
  Settings,
  Edit3,
  SplitSquareVertical,
  Scissors,
  Users,
  Plus,
  Trash2,
  GitBranch,
  ShieldCheck,
  Building,
  Bold,
  Italic,
  Underline,
  FileCheck,
  Undo2,
  Redo2
} from 'lucide-react';
import { 
  extractVariables, 
  renderDocument, 
  cleanDocumentForExport, 
  exportToWord, 
  saveRecordToStorage,
  loadPageSetup,
  savePageSetup,
  splitContentIntoPages,
  LEGAL_FONTS,
  numberToGujaratiWords
} from '../utils/documentUtils';
import { handlePhoneticKeyDown, transliterateWord } from '../utils/gujaratiTransliterate';
import PageSetupModal, { PAPER_SIZES } from './PageSetupModal';

/**
 * Generates the authentic Varsaai Pedhinamu HTML with Visual Family Tree and Table
 */
function generatePedhinamuDocHtml({
  deceasedName,
  deathDate,
  deathPlace,
  village,
  taluka,
  district,
  khataSurveyNo,
  applicantName,
  applicantAge,
  applicantRelation,
  applicantAadhar,
  applicantAddress,
  spouseName,
  spouseAge,
  spouseStatus,
  sons,
  daughters,
  panch1,
  panch2,
  showTreeMap,
  showTable
}) {
  const dName = deceasedName || 'સ્વ. ........................................';
  const dDate = deathDate || '.../.../......';
  const dPlace = deathPlace || '....................';
  const dVillage = village || '....................';
  const dTaluka = taluka || '....................';
  const dDistrict = district || '....................';
  const dKhata = khataSurveyNo || '....................';

  const aName = applicantName || '........................................';
  const aAge = applicantAge || '......';
  const aAadhar = applicantAadhar || 'XXXX XXXX ............';
  const aAddress = applicantAddress || '....................................................................';

  // 1. Header & Samaksh Block
  let html = `<div class="doc-header-box" style="text-align: center; margin-bottom: 12pt; padding-bottom: 8pt; border-bottom: 2px solid #1e293b;">` +
    `<div style="font-size: 12pt; font-weight: 700;">॥ શ્રી ગણેશાય નમઃ ॥</div>` +
    `<div style="font-size: 14pt; font-weight: 800; margin-top: 3pt; color: #0f172a;">વારસાઈ આંબો / પેઢીનામું સોગંદનામું</div>` +
    `<div style="font-size: 9.5pt; color: #475569; margin-top: 2pt;">(ગામ નમૂના નં. ૬ માં વારસાઈ નોંધ / સત્તાવાર પેઢીનામા અર્થે - રૂ. ૫૦/૧૦૦ ના સ્ટેમ્પ પેપર ઉપર)</div>` +
  `</div>` +

  `<p class="doc-para"><strong>સમક્ષ:</strong> બહુમાનનીય તલાટી કમ મંત્રીશ્રી / મામલતદારશ્રીની કચેરી, મોજે ગામ: <strong>${dVillage}</strong>, તાલુકો: <strong>${dTaluka}</strong>, જિલ્લો: <strong>${dDistrict}</strong>.</p>` +

  `<p class="doc-para">હું નીચે સહી કરનાર: <strong>${aName}</strong>, ઉંમર આશરે: <strong>${aAge}</strong> વર્ષ, ધંધો: ખેતી/વેપાર, રહેવાસી: <strong>${aAddress}</strong>, આધાર નં.: <strong>${aAadhar}</strong>.</p>` +

  `<p class="doc-para">આથી પવિત્રતાપૂર્વક પ્રતિજ્ઞા ઉપર નીચે મુજબનું વારસાઈ પેઢીનામું સોગંદનામું જાહેર કરું છું કે:</p>` +

  `<p class="doc-para">૧. અમારા કુટુંબના મૂળ પુરુષ મારા પિતાશ્રી <strong>${dName}</strong> નું અવસાન તારીખ: <strong>${dDate}</strong> ના રોજ <strong>${dPlace}</strong> મુકામે થયેલ છે.</p>` +
  `<p class="doc-para">૨. સ્વર્ગસ્થના નામે મોજે ગામ: <strong>${dVillage}</strong>, તાલુકો: <strong>${dTaluka}</strong> ખાતે આવેલ <strong>${dKhata}</strong> વાળી મિલકત / જમીન આવેલ છે.</p>` +
  `<p class="doc-para">૩. સ્વર્ગસ્થના અવસાન વખતે તેમના નીચે દર્શાવેલ સીધા અને કાયદેસરના વારસદારો હયાત છે, જે સિવાય અન્ય કોઈ વારસદાર હયાત નથી:</p>`;

  // 2. Visual Family Tree Map (આંબો ચાર્ટ)
  if (showTreeMap) {
    const totalBranches = (sons?.length || 0) + (daughters?.length || 0);
    const barWidthPercent = Math.min(92, Math.max(30, totalBranches * 22));

    let treeHtml = `<div class="pedhinamu-tree-wrapper" style="margin: 8pt 0 12pt 0; padding: 8pt 10pt; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; text-align: center;">` +
      `<div style="font-weight: 800; font-size: 10pt; margin-bottom: 6pt; color: #1e293b; letter-spacing: 0.02em;">` +
        `🌳 વારસાઈ આંબો (VISUAL FAMILY TREE MAP)` +
      `</div>` +

      `<div class="tree-root-box" style="display: inline-block; background: #ffffff; border: 2px solid #1e3a8a; padding: 4pt 12pt; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.06); margin-bottom: 4pt;">` +
        `<div style="font-weight: 800; font-size: 10.5pt; color: #0f172a;">${dName}</div>` +
        `<div style="font-size: 8pt; color: #64748b; margin-top: 1pt;">(સ્વર્ગસ્થ મૂળ પુરુષ - મરણ: ${dDate})</div>` +
        (spouseName ? `<div style="font-size: 8.5pt; color: #2563eb; font-weight: 700; margin-top: 2pt; border-top: 1px dashed #cbd5e1; padding-top: 2pt;">પત્ની: ${spouseName} (${spouseStatus})</div>` : '') +
      `</div>` +

      `<div class="tree-connector-line" style="width: 2px; height: 10pt; background: #475569; margin: 0 auto;"></div>` +
      (totalBranches > 0 ? `<div class="tree-horizontal-bar" style="width: ${barWidthPercent}%; height: 2px; background: #475569; margin: 0 auto 6pt auto;"></div>` : '') +

      `<div class="tree-heirs-grid" style="display: flex; justify-content: center; gap: 6pt; flex-wrap: wrap;">`;

    // Sons in tree
    (sons || []).forEach((son, i) => {
      const isDead = son.status === 'મરણ ગયેલ' || son.status === 'સ્વર્ગસ્થ';
      treeHtml += `<div class="tree-heir-node son-node ${isDead ? 'deceased-node' : ''}" style="background: #ffffff; border: 1px solid ${isDead ? '#fca5a5' : '#93c5fd'}; border-top: 3px solid ${isDead ? '#dc2626' : '#2563eb'}; border-radius: 4px; padding: 4pt 6pt; min-width: 110px; max-width: 140px; font-size: 9pt; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">` +
        `<div style="font-weight: 700; color: ${isDead ? '#991b1b' : '#0f172a'};">${son.name || `પુત્ર #${i + 1}`}</div>` +
        `<div style="font-size: 7.8pt; color: #475569;">દીકરો ${son.age ? `(ઉં. ${son.age})` : ''}</div>` +
        `<div style="font-size: 7.5pt; font-weight: 700; color: ${isDead ? '#dc2626' : '#059669'}; margin-top: 1pt;">[${son.status}]</div>` +
        (isDead && son.subHeirs ? `<div class="tree-sub-branch-box" style="margin-top: 3pt; padding: 2pt 4pt; background: #fffbeb; border: 1px dashed #f59e0b; border-radius: 3px; font-size: 7.5pt; color: #78350f; text-align: left;"><span style="font-weight:700;">↳ શાખા:</span> ${son.subHeirs}</div>` : '') +
      `</div>`;
    });

    // Daughters in tree
    (daughters || []).forEach((daughter, i) => {
      treeHtml += `<div class="tree-heir-node daughter-node" style="background: #ffffff; border: 1px solid #fde68a; border-top: 3px solid #d97706; border-radius: 4px; padding: 4pt 6pt; min-width: 110px; max-width: 140px; font-size: 9pt; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">` +
        `<div style="font-weight: 700; color: #0f172a;">${daughter.name || `દીકરી #${i + 1}`}</div>` +
        `<div style="font-size: 7.8pt; color: #475569;">દીકરી ${daughter.age ? `(ઉં. ${daughter.age})` : ''}</div>` +
        `<div style="font-size: 7.5pt; font-weight: 700; color: #b45309; margin-top: 1pt;">[${daughter.maritalStatus || 'પરિણીત'}]</div>` +
      `</div>`;
    });

    treeHtml += `</div></div>`;
    html += treeHtml;
  }

  // 3. Heirs Table (કોષ્ટક)
  if (showTable) {
    let tableRows = '';
    let counter = 1;

    if (spouseName) {
      tableRows += `<tr>` +
        `<td style="border: 1px solid #334155; padding: 4pt 4pt; text-align: center; font-weight: 600;">${counter++}</td>` +
        `<td style="border: 1px solid #334155; padding: 4pt 6pt; font-weight: 700;">${spouseName}</td>` +
        `<td style="border: 1px solid #334155; padding: 4pt 6pt; text-align: center;">વિધવા પત્ની</td>` +
        `<td style="border: 1px solid #334155; padding: 4pt 4pt; text-align: center;">${spouseAge} વર્ષ</td>` +
        `<td style="border: 1px solid #334155; padding: 4pt 6pt; text-align: center; font-weight: 600; color: #059669;">${spouseStatus}</td>` +
      `</tr>`;
    }

    (sons || []).forEach((son, i) => {
      const isDead = son.status === 'મરણ ગયેલ' || son.status === 'સ્વર્ગસ્થ';
      tableRows += `<tr>` +
        `<td style="border: 1px solid #334155; padding: 4pt 4pt; text-align: center; font-weight: 600;">${counter++}</td>` +
        `<td style="border: 1px solid #334155; padding: 4pt 6pt;">` +
          `<span style="font-weight: 700;">${son.name || `પુત્ર #${i + 1}`}</span>` +
          (son.subHeirs ? `<div style="font-size: 8.5pt; color: #475569; margin-top: 1pt;">↳ શાખા વારસદારો: ${son.subHeirs}</div>` : '') +
        `</td>` +
        `<td style="border: 1px solid #334155; padding: 4pt 6pt; text-align: center;">દીકરો</td>` +
        `<td style="border: 1px solid #334155; padding: 4pt 4pt; text-align: center;">${son.age ? `${son.age} વર્ષ` : '-'}</td>` +
        `<td style="border: 1px solid #334155; padding: 4pt 6pt; text-align: center; color: ${isDead ? '#dc2626' : '#059669'}; font-weight: 700;">${son.status}</td>` +
      `</tr>`;
    });

    (daughters || []).forEach((daughter, i) => {
      tableRows += `<tr>` +
        `<td style="border: 1px solid #334155; padding: 4pt 4pt; text-align: center; font-weight: 600;">${counter++}</td>` +
        `<td style="border: 1px solid #334155; padding: 4pt 6pt; font-weight: 700;">${daughter.name || `દીકરી #${i + 1}`}</td>` +
        `<td style="border: 1px solid #334155; padding: 4pt 6pt; text-align: center;">દીકરી</td>` +
        `<td style="border: 1px solid #334155; padding: 4pt 4pt; text-align: center;">${daughter.age ? `${daughter.age} વર્ષ` : '-'}</td>` +
        `<td style="border: 1px solid #334155; padding: 4pt 6pt; text-align: center; color: #b45309; font-weight: 600;">${daughter.maritalStatus || 'પરિણીત'}</td>` +
      `</tr>`;
    });

    html += `<div style="margin: 8pt 0 12pt 0;">` +
      `<div style="font-weight: 700; font-size: 10pt; margin-bottom: 3pt; text-align: center; color: #1e293b;">` +
        `કાયદેસરના વારસદારોની વિગત દર્શાવતી તાલિકા:` +
      `</div>` +
      `<table style="width: 100%; border-collapse: collapse; font-size: 9.5pt; border: 1.5px solid #1e293b;">` +
        `<thead>` +
          `<tr style="background: #f1f5f9; border-bottom: 1.5px solid #1e293b;">` +
            `<th style="border: 1px solid #334155; padding: 5pt 4pt; width: 35px; text-align: center;">ક્રમ</th>` +
            `<th style="border: 1px solid #334155; padding: 5pt 6pt; text-align: left;">વારસદારનું પૂરું નામ</th>` +
            `<th style="border: 1px solid #334155; padding: 5pt 6pt; width: 110px; text-align: center;">સંબંધ</th>` +
            `<th style="border: 1px solid #334155; padding: 5pt 4pt; width: 60px; text-align: center;">ઉંમર</th>` +
            `<th style="border: 1px solid #334155; padding: 5pt 6pt; width: 95px; text-align: center;">સ્થિતિ</th>` +
          `</tr>` +
        `</thead>` +
        `<tbody>${tableRows}</tbody>` +
      `</table>` +
    `</div>`;
  }

  // 4. Declarations & Signatures
  html += `<p style="margin: 0 0 6pt 0; line-height: 1.75; text-align: justify;">૪. આ સિવાય સ્વર્ગસ્થને અન્ય કોઈ પુત્ર, પુત્રી, પત્ની કે દત્તક લીધેલ સંતાન નથી કે કોઈ વારસદારનું નામ છુપાવેલ નથી.</p>` +
  `<p style="margin: 0 0 10pt 0; line-height: 1.75; text-align: justify;">૫. જો ભવિષ્યમાં કોઈ અન્ય વારસદારનો હક્ક નીકળશે અથવા આ પેઢીનામું ખોટું સાબિત થશે, તો તેની તમામ દીવાની તથા ફોજદારી કાયદેસરની જવાબદારી મારી અંગત રહેશે.</p>` +

  `<div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 14pt; margin-bottom: 12pt;">` +
    `<div>` +
      `<div>સ્થળ: <strong>${dDistrict}</strong></div>` +
      `<div>તારીખ: <strong>${new Date().toLocaleDateString('en-GB')}</strong></div>` +
    `</div>` +
    `<div style="text-align: center;">` +
      `<div style="margin-bottom: 25pt;">____________________________________</div>` +
      `<div style="font-weight: 700;">(${aName})</div>` +
      `<div style="font-size: 8.5pt; color: #475569;">સોગંદ આપનાર / અરજદારની સહી</div>` +
    `</div>` +
  `</div>` +

  `<div class="doc-verification-box" style="border-top: 1.5px dashed #475569; padding-top: 8pt; margin-top: 10pt;">` +
    `<div style="font-weight: 800; font-size: 10.5pt; margin-bottom: 4pt; text-align: center; color: #0f172a;">` +
      `રૂબરૂ પંચોનું પંચનામું (LOCAL WITNESS PANCHNAMA)` +
    `</div>` +
    `<p style="font-size: 9.5pt; line-height: 1.6; color: #334155; margin-bottom: 8pt; text-align: justify;">` +
      `અમો નીચે સહી કરનાર પંચો આથી ખાતરીપૂર્વક જણાવીએ છીએ કે સ્વર્ગસ્થ <strong>${dName}</strong> ના કુટુંબને અમો વર્ષોથી ઓળખીએ છીએ. ઉપરોક્ત પેઢીનામામાં દર્શાવેલ વારસદારોની વિગત તદ્દન સાચી અને ખરી છે, જેની ખાતરી બદલ અમો પંચોએ રૂબરૂ સહી કરેલ છે.` +
    `</p>` +

    `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 8pt;">` +
      `<div style="border: 1px solid #cbd5e1; padding: 6pt; border-radius: 4px; background: #ffffff;">` +
        `<div style="font-weight: 700; font-size: 9.5pt;">પંચ નં. ૧ ની વિગત & સહી:</div>` +
        `<div style="font-size: 9pt; color: #475569; margin-top: 2pt;">${panch1 || '૧. ....................................................................'}</div>` +
        `<div style="margin-top: 18pt; border-top: 1px dotted #94a3b8; padding-top: 2pt; font-size: 8.5pt; text-align: center;">પંચ નં. ૧ ની સહી</div>` +
      `</div>` +

      `<div style="border: 1px solid #cbd5e1; padding: 6pt; border-radius: 4px; background: #ffffff;">` +
        `<div style="font-weight: 700; font-size: 9.5pt;">પંચ નં. ૨ ની વિગત & સહી:</div>` +
        `<div style="font-size: 9pt; color: #475569; margin-top: 2pt;">${panch2 || '૨. ....................................................................'}</div>` +
        `<div style="margin-top: 18pt; border-top: 1px dotted #94a3b8; padding-top: 2pt; font-size: 8.5pt; text-align: center;">પંચ નં. ૨ ની સહી</div>` +
      `</div>` +
    `</div>` +
  `</div>`;

  return html;
}

export default function DocumentStudio({ 
  currentTemplate, 
  templates, 
  onSelectTemplate, 
  onOpenTemplateLibrary, 
  userSettings,
  onRecordSaved
}) {
  if (!currentTemplate) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h2>કોઈ ટેમ્પલેટ પસંદ કરેલ નથી</h2>
        <button className="btn-primary" onClick={onOpenTemplateLibrary} style={{ marginTop: '1rem' }}>
          ટેમ્પલેટ પસંદ કરો
        </button>
      </div>
    );
  }

  // Check if current template is Pedhinamu
  const isPedhinamu = currentTemplate?.id === 'pedigree-heir-affidavit' || 
                      currentTemplate?.isPedhinamu === true || 
                      (currentTemplate?.title && currentTemplate.title.includes('પેઢીનામું'));

  // Extract variables dynamically from template content
  const detectedVariables = useMemo(() => {
    return extractVariables(currentTemplate.content);
  }, [currentTemplate.content]);

  // Form values state for standard templates
  const [formValues, setFormValues] = useState(() => {
    const initial = { ...(currentTemplate.defaultValues || {}) };
    if (userSettings?.advocateName) {
      if (!initial['નોટરી_એડવોકેટ_નામ']) initial['નોટરી_એડવોકેટ_નામ'] = userSettings.advocateName;
      if (!initial['એડવોકેટ_નામ']) initial['એડવોકેટ_નામ'] = userSettings.advocateName;
    }
    if (userSettings?.barRegNumber && !initial['બાર_કાઉન્સિલ_નંબર']) {
      initial['બાર_કાઉન્સિલ_નંબર'] = userSettings.barRegNumber;
    }
    if (userSettings?.officeAddress && !initial['એડવોકેટ_ઓફિસ_સરનામું']) {
      initial['એડવોકેટ_ઓફિસ_સરનામું'] = userSettings.officeAddress;
    }
    return initial;
  });

  // Stamp paper mode and margin offset
  const [stampPaperMode, setStampPaperMode] = useState(userSettings?.stampPaperMode || false);
  const [stampMarginMm, setStampMarginMm] = useState(userSettings?.printMarginTopMm || 110);
  const [fontSizePt, setFontSizePt] = useState(13);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [highlightEmpty, setHighlightEmpty] = useState(true);
  const [copied, setCopied] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Phonetic keyboard & font selection state
  const [isPhoneticActive, setIsPhoneticActive] = useState(true);
  const [selectedFontId, setSelectedFontId] = useState('serif');
  const [quickCalcAmount, setQuickCalcAmount] = useState('');
  const [quickCalcWords, setQuickCalcWords] = useState('');

  // Pedhinamu specific tree & table toggles
  const [showTreeMap, setShowTreeMap] = useState(true);
  const [showTable, setShowTable] = useState(true);

  // Pedhinamu specific fields
  const [deceasedName, setDeceasedName] = useState('સ્વ. ગોવિંદભાઈ મોહનભાઈ પટેલ');
  const [deathDate, setDeathDate] = useState('૧૫/૧૦/૨૦૨૪');
  const [deathPlace, setDeathPlace] = useState('અમદાવાદ');
  const [village, setVillage] = useState('ચાંદલોડિયા');
  const [taluka, setTaluka] = useState('ઘાટલોડિયા');
  const [district, setDistrict] = useState('અમદાવાદ');
  const [khataSurveyNo, setKhataSurveyNo] = useState('ખાતા નં. ૧૨૪, રેવન્યુ સર્વે નં. ૫૪/૧');

  const [applicantName, setApplicantName] = useState('રમેશભાઈ ગોવિંદભાઈ પટેલ');
  const [applicantAge, setApplicantAge] = useState('૪૫');
  const [applicantRelation, setApplicantRelation] = useState('મોટો દીકરો');
  const [applicantAadhar, setApplicantAadhar] = useState('XXXX XXXX ૫૪૧૨');
  const [applicantAddress, setApplicantAddress] = useState('૧૫, ઉમિયા સોસાયટી, ચાંદલોડિયા, અમદાવાદ');

  const [spouseName, setSpouseName] = useState('શાંતાબેન ગોવિંદભાઈ પટેલ');
  const [spouseAge, setSpouseAge] = useState('૬૮');
  const [spouseStatus, setSpouseStatus] = useState('હયાત (વિધવા પત્ની)');

  const [sons, setSons] = useState([
    { id: 1, name: 'રમેશભાઈ ગોવિંદભાઈ પટેલ', age: '૪૫', status: 'હયાત', subHeirs: '' },
    { id: 2, name: 'સ્વ. કાનજીભાઈ ગોવિંદભાઈ પટેલ', age: 'અવસાન', status: 'મરણ ગયેલ', subHeirs: 'પત્ની: મીનાબેન, પુત્ર: દર્શન (ઉંમર: ૧૮)' }
  ]);

  const [daughters, setDaughters] = useState([
    { id: 1, name: 'ગીતાબેન ગોવિંદભાઈ પટેલ (હાલ ગીતાબેન મહેશભાઈ)', age: '૩૯', status: 'હયાત', maritalStatus: 'પરિણીત' }
  ]);

  const [panch1, setPanch1] = useState('પટેલ કનુભાઈ અંબાલાલ (ઉંમર: ૫૮ વર્ષ, ધંધો: વેપાર/ખેતી, રહે.: ચાંદલોડિયા)');
  const [panch2, setPanch2] = useState('શાહ હસમુખભાઈ કાંતિલાલ (ઉંમર: ૬૨ વર્ષ, ધંધો: નિવૃત્ત, રહે.: ચાંદલોડિયા)');

  // Pedhinamu handlers
  const handleAddSon = () => {
    setSons(prev => [
      ...prev,
      { id: Date.now(), name: 'પુત્રનું નામ', age: '૨૫', status: 'હયાત', subHeirs: '' }
    ]);
    setCustomDirectHtml(null);
  };

  const handleUpdateSon = (id, field, value) => {
    setSons(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    setCustomDirectHtml(null);
  };

  const handleRemoveSon = (id) => {
    setSons(prev => prev.filter(s => s.id !== id));
    setCustomDirectHtml(null);
  };

  const handleAddDaughter = () => {
    setDaughters(prev => [
      ...prev,
      { id: Date.now(), name: 'દીકરીનું નામ', age: '૨૨', status: 'હયાત', maritalStatus: 'પરિણીત' }
    ]);
    setCustomDirectHtml(null);
  };

  const handleUpdateDaughter = (id, field, value) => {
    setDaughters(prev => prev.map(d => d.id === id ? { ...d, [field]: value } : d));
    setCustomDirectHtml(null);
  };

  const handleRemoveDaughter = (id) => {
    setDaughters(prev => prev.filter(d => d.id !== id));
    setCustomDirectHtml(null);
  };

  const handleResetPedhinamuDemo = () => {
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
    setPanch1('પટેલ કનુભાઈ અંબાલાલ (ઉંમર: ૫૮ વર્ષ, ધંધો: વેપાર/ખેતી, રહે.: ચાંદલોડિયા)');
    setPanch2('શાહ હસમુખભાઈ કાંતિલાલ (ઉંમર: ૬૨ વર્ષ, ધંધો: નિવૃત્ત, રહે.: ચાંદલોડિયા)');
    setCustomDirectHtml(null);
  };

  // Page Setup state
  const [pageSetup, setPageSetup] = useState(() => loadPageSetup());
  const [isPageSetupOpen, setIsPageSetupOpen] = useState(false);

  // Direct editing on paper state
  const [isDirectEditMode, setIsDirectEditMode] = useState(false);
  const [customDirectHtml, setCustomDirectHtml] = useState(null);

  // History stack for undo / redo
  const [historyStack, setHistoryStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  // Push current state to undo history
  const pushToHistory = (customHtml = customDirectHtml, fVals = formValues) => {
    setHistoryStack(prev => [...prev.slice(-30), { customDirectHtml: customHtml, formValues: { ...fVals } }]);
    setRedoStack([]);
  };

  const handleUndo = () => {
    // If in direct edit mode and user is actively typing in contentEditable, try native undo first
    if (isDirectEditMode && document.activeElement && document.activeElement.classList.contains('document-body')) {
      document.execCommand('undo', false, null);
    }

    if (historyStack.length === 0) return;
    const lastState = historyStack[historyStack.length - 1];
    setRedoStack(prev => [...prev, { customDirectHtml, formValues: { ...formValues } }]);
    setHistoryStack(prev => prev.slice(0, prev.length - 1));
    setCustomDirectHtml(lastState.customDirectHtml);
    setFormValues(lastState.formValues);
  };

  const handleRedo = () => {
    if (isDirectEditMode && document.activeElement && document.activeElement.classList.contains('document-body')) {
      document.execCommand('redo', false, null);
    }

    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setHistoryStack(prev => [...prev, { customDirectHtml, formValues: { ...formValues } }]);
    setRedoStack(prev => prev.slice(0, prev.length - 1));
    setCustomDirectHtml(nextState.customDirectHtml);
    setFormValues(nextState.formValues);
  };

  // Global Ctrl+G listener for toggling phonetic typing and Ctrl+Z / Ctrl+Y for Undo / Redo
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey && (e.key === 'g' || e.key === 'G')) {
        e.preventDefault();
        setIsPhoneticActive(prev => !prev);
      } else if (e.ctrlKey && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          handleUndo();
        }
      } else if (e.ctrlKey && (e.key === 'y' || e.key === 'Y' || (e.shiftKey && (e.key === 'z' || e.key === 'Z')))) {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          handleRedo();
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [historyStack, redoStack, customDirectHtml, formValues, isDirectEditMode]);

  // Update default form values when template changes
  useEffect(() => {
    const nextVals = { ...(currentTemplate.defaultValues || {}) };
    if (userSettings?.advocateName) {
      if (!nextVals['નોટરી_એડવોકેટ_નામ']) nextVals['નોટરી_એડવોકેટ_નામ'] = userSettings.advocateName;
      if (!nextVals['એડવોકેટ_નામ']) nextVals['એડવોકેટ_નામ'] = userSettings.advocateName;
    }
    if (userSettings?.barRegNumber && !nextVals['બાર_કાઉન્સિલ_નંબર']) {
      nextVals['બાર_કાઉન્સિલ_નંબર'] = userSettings.barRegNumber;
    }
    if (userSettings?.officeAddress && !nextVals['એડવોકેટ_ઓફિસ_સરનામું']) {
      nextVals['એડવોકેટ_ઓફિસ_સરનામું'] = userSettings.officeAddress;
    }
    setFormValues(nextVals);
    setCustomDirectHtml(null);

    // Auto switch phonetic transliteration: OFF for English templates, ON for Gujarati templates
    if (currentTemplate?.language === 'English') {
      setIsPhoneticActive(false);
    } else {
      setIsPhoneticActive(true);
    }
  }, [currentTemplate, userSettings]);

  // Handle standard input change
  const handleInputChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }));
    setCustomDirectHtml(null);
  };

  // Generate complete rendered HTML
  const rawRenderedContent = useMemo(() => {
    if (customDirectHtml !== null) {
      return customDirectHtml;
    }
    if (isPedhinamu) {
      return generatePedhinamuDocHtml({
        deceasedName,
        deathDate,
        deathPlace,
        village,
        taluka,
        district,
        khataSurveyNo,
        applicantName,
        applicantAge,
        applicantRelation,
        applicantAadhar,
        applicantAddress,
        spouseName,
        spouseAge,
        spouseStatus,
        sons,
        daughters,
        panch1,
        panch2,
        showTreeMap,
        showTable
      });
    }
    return renderDocument(currentTemplate.content, formValues, highlightEmpty);
  }, [
    currentTemplate.content,
    formValues,
    highlightEmpty,
    customDirectHtml,
    isPedhinamu,
    deceasedName,
    deathDate,
    deathPlace,
    village,
    taluka,
    district,
    khataSurveyNo,
    applicantName,
    applicantAge,
    applicantRelation,
    applicantAadhar,
    applicantAddress,
    spouseName,
    spouseAge,
    spouseStatus,
    sons,
    daughters,
    panch1,
    panch2,
    showTreeMap,
    showTable
  ]);

  // Clean export text (for Word or copy)
  const cleanExportText = useMemo(() => {
    if (isPedhinamu) {
      return rawRenderedContent;
    }
    return cleanDocumentForExport(renderDocument(currentTemplate.content, formValues, false));
  }, [currentTemplate.content, formValues, isPedhinamu, rawRenderedContent]);

  // Split into multi-page views based on page setup
  const pages = useMemo(() => {
    return splitContentIntoPages(rawRenderedContent, pageSetup);
  }, [rawRenderedContent, pageSetup]);

  // Selected Font details
  const activeFont = useMemo(() => {
    return LEGAL_FONTS.find(f => f.id === selectedFontId) || LEGAL_FONTS[0];
  }, [selectedFontId]);

  // Calculate filled vs unfilled variables
  const unfilledCount = useMemo(() => {
    if (isPedhinamu) return 0;
    return detectedVariables.filter(k => !formValues[k] || String(formValues[k]).trim() === '').length;
  }, [detectedVariables, formValues, isPedhinamu]);

  const isEnglish = currentTemplate?.language === 'English';

  // Group variables for structured form rendering
  const groupedVariables = useMemo(() => {
    const groups = isEnglish ? {
      'Party & Personal Details': [],
      'Property & Subject Details': [],
      'Financial & Commercial Terms': [],
      'Dates, Place & General Terms': []
    } : {
      'પક્ષકારોની વિગત': [],
      'મિલકત / વિષયવસ્તુ': [],
      'નાણાકીય / અવેજ વિગત': [],
      'તારીખ, સ્થળ & અન્ય': []
    };

    detectedVariables.forEach(v => {
      const vLower = v.toLowerCase();
      if (
        v.includes('નામ') || v.includes('ઉંમર') || v.includes('ધંધો') || v.includes('સરનામું') || v.includes('આધાર') || v.includes('પાન') ||
        vLower.includes('name') || vLower.includes('age') || vLower.includes('father') || vLower.includes('address') || vLower.includes('aadhar') || vLower.includes('pan') || vLower.includes('party') || vLower.includes('landlord') || vLower.includes('tenant') || vLower.includes('donor') || vLower.includes('donee') || vLower.includes('executor') || vLower.includes('witness') || vLower.includes('employee') || vLower.includes('employer') || vLower.includes('partner')
      ) {
        if (isEnglish) groups['Party & Personal Details'].push(v);
        else groups['પક્ષકારોની વિગત'].push(v);
      } else if (
        v.includes('મિલકત') || v.includes('ક્ષેત્રફળ') || v.includes('ચતુર્દિશા') || v.includes('સર્વે') || v.includes('ખાતા') ||
        vLower.includes('property') || vLower.includes('premises') || vLower.includes('sq_ft') || vLower.includes('area') || vLower.includes('boundary') || vLower.includes('jurisdiction') || vLower.includes('vehicle') || vLower.includes('court')
      ) {
        if (isEnglish) groups['Property & Subject Details'].push(v);
        else groups['મિલકત / વિષયવસ્તુ'].push(v);
      } else if (
        v.includes('અવેજ') || v.includes('રકમ') || v.includes('રૂપિયા') || v.includes('ચેક') || v.includes('બેંક') || v.includes('ભાડું') ||
        vLower.includes('rent') || vLower.includes('deposit') || vLower.includes('amount') || vLower.includes('salary') || vLower.includes('cheque') || vLower.includes('bank') || vLower.includes('interest') || vLower.includes('capital') || vLower.includes('fee') || vLower.includes('sum')
      ) {
        if (isEnglish) groups['Financial & Commercial Terms'].push(v);
        else groups['નાણાકીય / અવેજ વિગત'].push(v);
      } else {
        if (isEnglish) groups['Dates, Place & General Terms'].push(v);
        else groups['તારીખ, સ્થળ & અન્ય'].push(v);
      }
    });

    return groups;
  }, [detectedVariables, isEnglish]);

  const handleClearForm = () => {
    if (window.confirm("શું તમે ખરેખર તમામ ફિલ્ડ ખાલી કરવા માંગો છો?")) {
      const cleared = {};
      detectedVariables.forEach(k => cleared[k] = "");
      setFormValues(cleared);
      setCustomDirectHtml(null);
    }
  };

  const handleFillDemo = () => {
    if (isPedhinamu) {
      handleResetPedhinamuDemo();
      return;
    }
    setFormValues(currentTemplate.defaultValues || {});
    setCustomDirectHtml(null);
  };

  // Helper to get latest document HTML from DOM or state
  const getLatestDocumentHtml = () => {
    const docBodies = document.querySelectorAll('.document-body');
    if (docBodies.length > 0) {
      if (docBodies.length === 1) {
        return docBodies[0].innerHTML;
      } else {
        return Array.from(docBodies).map(b => b.innerHTML).join('\n\n---PAGE_BREAK---\n\n');
      }
    }
    return customDirectHtml !== null ? customDirectHtml : rawRenderedContent;
  };

  const handlePrint = () => {
    handleDirectEditBlur();
    window.print();
  };

  const handleCopy = () => {
    handleDirectEditBlur();
    const latestHtml = getLatestDocumentHtml();
    const textOnly = (isPedhinamu ? latestHtml : cleanDocumentForExport(renderDocument(latestHtml, formValues, false))).replace(/<[^>]*>/g, '');
    navigator.clipboard.writeText(textOnly);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportWord = () => {
    handleDirectEditBlur();
    const latestHtml = getLatestDocumentHtml();
    const filename = `${currentTemplate.id}_${new Date().toISOString().slice(0, 10)}`;
    exportToWord(filename, currentTemplate.title, latestHtml);
  };

  const handleSaveClientRecord = () => {
    handleDirectEditBlur();
    const latestHtml = getLatestDocumentHtml();
    const clientName = isPedhinamu ? applicantName : (formValues['અરજદારનું_નામ'] || formValues['વેચનારનું_પૂરું_નામ'] || formValues['લખી_આપનાર_નામ'] || 'અજ્ઞાત અસીલ');
    const record = {
      templateId: currentTemplate.id,
      templateTitle: currentTemplate.title,
      clientName: clientName,
      formValues: { ...formValues },
      renderedText: latestHtml,
      pageSetup: { ...pageSetup }
    };

    const ok = saveRecordToStorage(record);
    if (ok) {
      setSaveStatus('અસીલ ફાઇલ સફળતાપૂર્વક સાચવવામાં આવી!');
      if (onRecordSaved) onRecordSaved();
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleSavePageSetup = (newSetup) => {
    setPageSetup(newSetup);
    savePageSetup(newSetup);
  };

  const handleDirectEditBlur = () => {
    const docBodies = document.querySelectorAll('.document-body');
    if (docBodies.length > 0) {
      let fullHtml = "";
      if (docBodies.length === 1) {
        fullHtml = docBodies[0].innerHTML;
      } else {
        fullHtml = Array.from(docBodies).map(b => b.innerHTML).join('\n\n---PAGE_BREAK---\n\n');
      }
      if (fullHtml !== customDirectHtml) {
        pushToHistory(customDirectHtml, formValues);
        setCustomDirectHtml(fullHtml);
      }
    }
  };

  const handleFormatText = (command) => {
    pushToHistory(customDirectHtml, formValues);
    if (!isDirectEditMode) {
      setIsDirectEditMode(true);
    }
    // Execute rich text command on selected text without causing DOM replacement
    document.execCommand(command, false, null);
  };

  const handleInsertPageBreak = () => {
    pushToHistory(customDirectHtml, formValues);

    if (!isDirectEditMode) {
      setIsDirectEditMode(true);
    }

    const sel = window.getSelection();
    let insertedInSelection = false;

    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      let container = range.commonAncestorContainer;
      while (container && container !== document.body) {
        if (container.classList && container.classList.contains('document-body')) {
          break;
        }
        container = container.parentElement;
      }

      if (container && container.classList && container.classList.contains('document-body')) {
        const textNode = document.createTextNode("\n---PAGE_BREAK---\n");
        range.deleteContents();
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        sel.removeAllRanges();
        sel.addRange(range);
        insertedInSelection = true;
      }
    }

    const docBodies = document.querySelectorAll('.document-body');
    if (docBodies.length > 0) {
      let combined = "";
      if (insertedInSelection) {
        combined = Array.from(docBodies).map(b => b.innerHTML).join('\n\n---PAGE_BREAK---\n\n');
      } else {
        const currentHtml = customDirectHtml !== null ? customDirectHtml : rawRenderedContent;
        if (currentHtml.includes('class="doc-verification-box"') && !currentHtml.includes('---PAGE_BREAK---')) {
          combined = currentHtml.replace('<div class="doc-verification-box"', '\n\n---PAGE_BREAK---\n\n<div class="doc-verification-box"');
        } else {
          combined = currentHtml + "\n\n---PAGE_BREAK---\n\n";
        }
      }
      setCustomDirectHtml(combined);
    }
  };

  const handleResetDirectEdit = () => {
    if (window.confirm("શું તમે ડાયરેક્ટ એડિટ કરેલ ફેરફારો રદ કરીને મૂળ ફોર્મ મુજબ કરવું માંગો છો?")) {
      pushToHistory(customDirectHtml, formValues);
      setCustomDirectHtml(null);
    }
  };

  return (
    <div className="studio-container">
      <style>{`
        @media print {
          @page {
            size: ${pageSetup.paperSize === 'LEGAL' ? 'legal' : 'A4'} portrait !important;
            margin: 0 !important;
          }
        }
      `}</style>

      {/* ================= LEFT PANEL: DYNAMIC FORM ================= */}
      <aside className="studio-form-panel">
        <div className="form-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span className="template-badge">
              <Layers size={13} />
              {currentTemplate.category}
            </span>
            <button 
              className="btn-secondary" 
              onClick={onOpenTemplateLibrary}
              style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
            >
              <FolderOpen size={13} />
              ફોર્મેટ બદલો
            </button>
          </div>
          <h2 className="form-panel-title">{currentTemplate.title}</h2>
          <p className="form-panel-subtitle">
            {isPedhinamu ? (
              <span>કુલ <strong>{(spouseName ? 1 : 0) + sons.length + daughters.length}</strong> વારસદારો | ફેમિલી ટ્રી ઓટો-જનરેટર</span>
            ) : (
              <span>
                કુલ <strong>{detectedVariables.length}</strong> પેરામીટર્સ 
                {unfilledCount > 0 ? (
                  <span style={{ color: 'var(--accent-gold-dark)', marginLeft: '0.4rem' }}>
                    ({unfilledCount} ભરવાના બાકી)
                  </span>
                ) : (
                  <span style={{ color: '#34d399', marginLeft: '0.4rem' }}>
                    (તમામ ભરેલા છે ✓)
                  </span>
                )}
              </span>
            )}
          </p>
        </div>

        {/* Action bar for quick helper actions */}
        <div style={{ 
          padding: '0.65rem 1.5rem', 
          background: '#f8fafc', 
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <button 
            className="tool-toggle-btn"
            onClick={handleFillDemo}
            title="નમૂના માટે સેમ્પલ ડેટા ભરો"
            style={{ fontSize: '0.75rem' }}
          >
            <Sparkles size={13} style={{ color: 'var(--accent-gold-dark)' }} />
            <span>સેમ્પલ વિગતો ભરો</span>
          </button>

          <button 
            className="tool-toggle-btn"
            onClick={isPedhinamu ? handleResetPedhinamuDemo : handleClearForm}
            title={isPedhinamu ? "સેમ્પલ રીસેટ કરો" : "તમામ ફિલ્ડ ખાલી કરો"}
            style={{ fontSize: '0.75rem' }}
          >
            <RotateCcw size={13} />
            <span>{isPedhinamu ? 'રીસેટ' : 'સાફ કરો'}</span>
          </button>
        </div>

        {/* Quick Currency Words Helper Tool */}
        {!isPedhinamu && (
          <div style={{ padding: '0.65rem 1.5rem 0.2rem 1.5rem' }}>
            <div className="currency-calc-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calculator size={13} style={{ color: 'var(--accent-gold-dark)' }} />
                  <span>₹ રકમ અંકે શબ્દોમાં કન્વર્ટર:</span>
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>દા.ત. 500000</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <input 
                  type="text" 
                  className="input-control" 
                  placeholder="રકમ દાખલ કરો (દા.ત. 550000)..." 
                  value={quickCalcAmount}
                  onChange={e => {
                    setQuickCalcAmount(e.target.value);
                    setQuickCalcWords(numberToGujaratiWords(e.target.value));
                  }}
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                />
              </div>
              {quickCalcWords && (
                <div className="result-text">
                  <span>{quickCalcWords}</span>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', background: '#ffffff' }}
                    onClick={() => {
                      navigator.clipboard.writeText(quickCalcWords);
                      alert('કોપી થઈ ગયું: ' + quickCalcWords);
                    }}
                    title="ક્લિપબોર્ડમાં કોપી કરો"
                  >
                    કોપી
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Scrollable Form Body */}
        <div className="form-scrollable-body">
          {isPedhinamu ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
                    onChange={e => { setDeceasedName(e.target.value); setCustomDirectHtml(null); }}
                    onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setDeceasedName(val); setCustomDirectHtml(null); })}
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
                      onChange={e => { setDeathDate(e.target.value); setCustomDirectHtml(null); }}
                      placeholder="દા.ત. ૧૫/૧૦/૨૦૨૪"
                    />
                  </div>
                  <div>
                    <label className="field-label">અવસાન સ્થળ</label>
                    <input 
                      type="text"
                      className="input-control"
                      value={deathPlace}
                      onChange={e => { setDeathPlace(e.target.value); setCustomDirectHtml(null); }}
                      onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setDeathPlace(val); setCustomDirectHtml(null); })}
                      placeholder="દા.ત. અમદાવાદ"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <div>
                    <label className="field-label">ગામ</label>
                    <input 
                      type="text"
                      className="input-control"
                      value={village}
                      onChange={e => { setVillage(e.target.value); setCustomDirectHtml(null); }}
                      onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setVillage(val); setCustomDirectHtml(null); })}
                    />
                  </div>
                  <div>
                    <label className="field-label">તાલુકો</label>
                    <input 
                      type="text"
                      className="input-control"
                      value={taluka}
                      onChange={e => { setTaluka(e.target.value); setCustomDirectHtml(null); }}
                      onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setTaluka(val); setCustomDirectHtml(null); })}
                    />
                  </div>
                  <div>
                    <label className="field-label">જીલ્લો</label>
                    <input 
                      type="text"
                      className="input-control"
                      value={district}
                      onChange={e => { setDistrict(e.target.value); setCustomDirectHtml(null); }}
                      onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setDistrict(val); setCustomDirectHtml(null); })}
                    />
                  </div>
                </div>

                <div className="field-group" style={{ marginTop: '0.5rem' }}>
                  <label className="field-label">ખાતા નં. / સર્વે નં. વિગત</label>
                  <input 
                    type="text"
                    className="input-control"
                    value={khataSurveyNo}
                    onChange={e => { setKhataSurveyNo(e.target.value); setCustomDirectHtml(null); }}
                    onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setKhataSurveyNo(val); setCustomDirectHtml(null); })}
                    placeholder="દા.ત. ખાતા નં. ૧૨૪, રેવન્યુ સર્વે નં. ૫૪/૧"
                  />
                </div>
              </div>

              {/* 2. Applicant Info */}
              <div className="form-category-group">
                <div className="category-title">
                  <span>૨. અરજદાર (સોગંદ આપનાર વારસદાર)</span>
                </div>

                <div className="field-group">
                  <label className="field-label">અરજદારનું પૂરું નામ</label>
                  <input 
                    type="text"
                    className="input-control"
                    value={applicantName}
                    onChange={e => { setApplicantName(e.target.value); setCustomDirectHtml(null); }}
                    onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setApplicantName(val); setCustomDirectHtml(null); })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="field-label">ઉંમર (વર્ષ)</label>
                    <input 
                      type="text"
                      className="input-control"
                      value={applicantAge}
                      onChange={e => { setApplicantAge(e.target.value); setCustomDirectHtml(null); }}
                    />
                  </div>
                  <div>
                    <label className="field-label">સંબંધ</label>
                    <input 
                      type="text"
                      className="input-control"
                      value={applicantRelation}
                      onChange={e => { setApplicantRelation(e.target.value); setCustomDirectHtml(null); }}
                      onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setApplicantRelation(val); setCustomDirectHtml(null); })}
                      placeholder="દા.ત. મોટો દીકરો"
                    />
                  </div>
                </div>

                <div className="field-group" style={{ marginTop: '0.5rem' }}>
                  <label className="field-label">આધાર કાર્ડ નંબર</label>
                  <input 
                    type="text"
                    className="input-control"
                    value={applicantAadhar}
                    onChange={e => { setApplicantAadhar(e.target.value); setCustomDirectHtml(null); }}
                    placeholder="દા.ત. XXXX XXXX ૫૪૧૨"
                  />
                </div>

                <div className="field-group" style={{ marginTop: '0.5rem' }}>
                  <label className="field-label">અરજદારનું સરનામું</label>
                  <textarea 
                    className="input-control"
                    rows={2}
                    value={applicantAddress}
                    onChange={e => { setApplicantAddress(e.target.value); setCustomDirectHtml(null); }}
                    onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setApplicantAddress(val); setCustomDirectHtml(null); })}
                  />
                </div>
              </div>

              {/* 3. Spouse Info */}
              <div className="form-category-group">
                <div className="category-title">
                  <span>૩. પત્નીની વિગત</span>
                </div>

                <div className="field-group">
                  <label className="field-label">પત્નીનું નામ</label>
                  <input 
                    type="text"
                    className="input-control"
                    value={spouseName}
                    onChange={e => { setSpouseName(e.target.value); setCustomDirectHtml(null); }}
                    onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setSpouseName(val); setCustomDirectHtml(null); })}
                    placeholder="દા.ત. શાંતાબેન ગોવિંદભાઈ પટેલ"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label className="field-label">ઉંમર (વર્ષ)</label>
                    <input 
                      type="text"
                      className="input-control"
                      value={spouseAge}
                      onChange={e => { setSpouseAge(e.target.value); setCustomDirectHtml(null); }}
                    />
                  </div>
                  <div>
                    <label className="field-label">સ્થિતિ</label>
                    <input 
                      type="text"
                      className="input-control"
                      value={spouseStatus}
                      onChange={e => { setSpouseStatus(e.target.value); setCustomDirectHtml(null); }}
                      onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setSpouseStatus(val); setCustomDirectHtml(null); })}
                      placeholder="દા.ત. હયાત (વિધવા પત્ની)"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Sons List */}
              <div className="form-category-group">
                <div className="category-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>૪. પુત્રોની યાદી ({sons.length} દીકરા)</span>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} 
                    onClick={handleAddSon}
                  >
                    <Plus size={12} /> + દીકરો ઉમેરો
                  </button>
                </div>

                {sons.map((son, idx) => (
                  <div key={son.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.75rem', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#1e3a8a' }}>દીકરો #{idx + 1}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveSon(son.id)} 
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        title="દીકરો દૂર કરો"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="field-group" style={{ marginBottom: '0.4rem' }}>
                      <input 
                        type="text"
                        className="input-control"
                        placeholder="દીકરાનું પૂરું નામ"
                        value={son.name}
                        onChange={e => handleUpdateSon(son.id, 'name', e.target.value)}
                        onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => handleUpdateSon(son.id, 'name', val))}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <input 
                        type="text"
                        className="input-control"
                        placeholder="ઉંમર"
                        value={son.age}
                        onChange={e => handleUpdateSon(son.id, 'age', e.target.value)}
                      />
                      <select 
                        className="input-control"
                        value={son.status}
                        onChange={e => handleUpdateSon(son.id, 'status', e.target.value)}
                      >
                        <option value="હયાત">હયાત</option>
                        <option value="મરણ ગયેલ">મરણ ગયેલ (સ્વર્ગસ્થ)</option>
                      </select>
                    </div>

                    {son.status === 'મરણ ગયેલ' && (
                      <div className="field-group" style={{ marginTop: '0.4rem' }}>
                        <label className="field-label" style={{ color: '#b91c1c' }}>શાખા વારસદારો (પત્ની/સંતાનો):</label>
                        <input 
                          type="text"
                          className="input-control"
                          placeholder="દા.ત. પત્ની: મીનાબેન, પુત્ર: દર્શન (ઉં. ૧૮)"
                          value={son.subHeirs}
                          onChange={e => handleUpdateSon(son.id, 'subHeirs', e.target.value)}
                          onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => handleUpdateSon(son.id, 'subHeirs', val))}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* 5. Daughters List */}
              <div className="form-category-group">
                <div className="category-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>૫. પુત્રીઓની યાદી ({daughters.length} દીકરીઓ)</span>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }} 
                    onClick={handleAddDaughter}
                  >
                    <Plus size={12} /> + દીકરી ઉમેરો
                  </button>
                </div>

                {daughters.map((daughter, idx) => (
                  <div key={daughter.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '0.75rem', marginBottom: '0.75rem', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#b45309' }}>દીકરી #{idx + 1}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveDaughter(daughter.id)} 
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                        title="દીકરી દૂર કરો"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="field-group" style={{ marginBottom: '0.4rem' }}>
                      <input 
                        type="text"
                        className="input-control"
                        placeholder="દીકરીનું પૂરું નામ"
                        value={daughter.name}
                        onChange={e => handleUpdateDaughter(daughter.id, 'name', e.target.value)}
                        onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => handleUpdateDaughter(daughter.id, 'name', val))}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <input 
                        type="text"
                        className="input-control"
                        placeholder="ઉંમર"
                        value={daughter.age}
                        onChange={e => handleUpdateDaughter(daughter.id, 'age', e.target.value)}
                      />
                      <select 
                        className="input-control"
                        value={daughter.maritalStatus}
                        onChange={e => handleUpdateDaughter(daughter.id, 'maritalStatus', e.target.value)}
                      >
                        <option value="પરિણીત">પરિણીત</option>
                        <option value="અપરિણીત">અપરિણીત</option>
                        <option value="વિધવા">વિધવા</option>
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
                    onChange={e => { setPanch1(e.target.value); setCustomDirectHtml(null); }}
                    onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setPanch1(val); setCustomDirectHtml(null); })}
                  />
                </div>
                <div className="field-group" style={{ marginTop: '0.5rem' }}>
                  <label className="field-label">પંચ નં. ૨ (નામ, ઉંમર, સરનામું)</label>
                  <input 
                    type="text"
                    className="input-control"
                    value={panch2}
                    onChange={e => { setPanch2(e.target.value); setCustomDirectHtml(null); }}
                    onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, val => { setPanch2(val); setCustomDirectHtml(null); })}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              {Object.entries(groupedVariables).map(([groupTitle, vars]) => {
                if (vars.length === 0) return null;
                return (
                  <div key={groupTitle} className="form-category-group">
                    <div className="category-title">
                      <span>{groupTitle}</span>
                      <span className="category-counter">{vars.length} ફિલ્ડ્સ</span>
                    </div>

                    {vars.map(varKey => {
                      const val = formValues[varKey] || '';
                      const vLower = varKey.toLowerCase();
                      const isTextarea = varKey.includes("સરનામું") || 
                                         varKey.includes("વિગત") || 
                                         varKey.includes("યાદી") || 
                                         varKey.includes("હેતુ") ||
                                         varKey.includes("શરતો") ||
                                         varKey.includes("ક્ષેત્ર") ||
                                         vLower.includes("address") ||
                                         vLower.includes("details") ||
                                         vLower.includes("terms") ||
                                         vLower.includes("schedule") ||
                                         vLower.includes("description") ||
                                         vLower.includes("boundaries");

                      return (
                        <div key={varKey} className="field-group">
                          <label className="field-label">
                            <span>{varKey.replace(/_/g, " ")}</span>
                            <span className="field-tag-key">&#123;&#123;{varKey}&#125;&#125;</span>
                          </label>
                          {isTextarea ? (
                            <textarea
                              className="input-control"
                              value={val}
                              placeholder={isEnglish 
                                ? `Enter ${varKey.replace(/_/g, " ")} here...` 
                                : `અહીં ${varKey.replace(/_/g, " ")} દાખલ કરો... (અંગ્રેજીમાં ટાઇપ કરશો તો આપોઆપ ગુજરાતી થશે)`
                              }
                              rows={2}
                              onChange={e => handleInputChange(varKey, e.target.value)}
                              onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, newVal => handleInputChange(varKey, newVal))}
                            />
                          ) : (
                            <input
                              type="text"
                              className="input-control"
                              value={val}
                              placeholder={isEnglish 
                                ? `Enter ${varKey.replace(/_/g, " ")}...` 
                                : `અહીં ${varKey.replace(/_/g, " ")} દાખલ કરો...`
                              }
                              onChange={e => handleInputChange(varKey, e.target.value)}
                              onKeyDown={e => handlePhoneticKeyDown(e, isPhoneticActive, newVal => handleInputChange(varKey, newVal))}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="form-panel-footer">
          <div style={{ flex: 1 }}>
            {saveStatus && (
              <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600 }}>
                ✓ {saveStatus}
              </span>
            )}
          </div>
          <button 
            className="btn-gold"
            onClick={handleSaveClientRecord}
            title="આ અસીલનો દસ્તાવેજ રેકોર્ડમાં સાચવો"
          >
            <Save size={16} />
            <span>અસીલ ફાઇલ સાચવો</span>
          </button>
        </div>
      </aside>

      {/* ================= RIGHT PANEL: LIVE DOCUMENT CANVAS ================= */}
      <main className="studio-preview-panel">
        {/* Preview Toolbar (Two-Tier Structured Layout to Prevent Overlap) */}
        <div className="preview-toolbar">
          
          {/* Row 1: Typing Mode, Font Selector, Text Formatting Tools (Bold, Italic, Underline), and Action Buttons */}
          <div className="toolbar-row primary-toolbar-row">
            <div className="toolbar-group">
              {/* Phonetic Keyboard Toggle */}
              <button 
                type="button"
                className={`phonetic-toggle-btn ${isPhoneticActive ? 'active' : ''}`}
                onClick={() => setIsPhoneticActive(!isPhoneticActive)}
                title="અંગ્રેજીમાં ટાઇપ કરતા આપોઆપ ગુજરાતી થશે (દા.ત. rajesh -> રાજેશ). શોર્ટકટ: Ctrl+G"
              >
                <Keyboard size={14} />
                <span>{isPhoneticActive ? 'ગુજરાતી ટાઇપિંગ: ચાલુ (ON)' : 'English Typing (OFF)'}</span>
              </button>

              {/* Legal Font Selector */}
              <div className="toolbar-font-box">
                <Type size={14} style={{ color: 'var(--primary)' }} />
                <select 
                  className="font-select-control"
                  value={selectedFontId}
                  onChange={e => setSelectedFontId(e.target.value)}
                  title="દસ્તાવેજ માટે પ્રમાણિત લીગલ ફોન્ટ પસંદ કરો"
                >
                  {LEGAL_FONTS.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.label || f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Formatter Option: Bold, Italic, Underline (Icon Only) */}
              <div className="formatting-btn-group" title="ટેક્સ્ટ ફોર્મેટિંગ (લખાણ સિલેક્ટ કરીને બોલ્ડ / ઇટાલિક / અંડરલાઇન કરો)">
                <button
                  type="button"
                  className="format-icon-btn"
                  onClick={() => handleFormatText('bold')}
                  title="Bold (ઘાટા અક્ષરો) - Ctrl+B"
                  aria-label="Bold"
                >
                  <Bold size={15} strokeWidth={2.8} />
                </button>
                <button
                  type="button"
                  className="format-icon-btn"
                  onClick={() => handleFormatText('italic')}
                  title="Italic (ત્રાંસા અક્ષરો) - Ctrl+I"
                  aria-label="Italic"
                >
                  <Italic size={15} strokeWidth={2.5} />
                </button>
                <button
                  type="button"
                  className="format-icon-btn"
                  onClick={() => handleFormatText('underline')}
                  title="Underline (નીચે લીટી) - Ctrl+U"
                  aria-label="Underline"
                >
                  <Underline size={15} strokeWidth={2.5} />
                </button>
              </div>

              {/* Undo / Redo Tools (Icon Only) */}
              <div className="formatting-btn-group" title="ફેરફારો પૂર્વવત (Undo / Redo)">
                <button
                  type="button"
                  className="format-icon-btn"
                  onClick={handleUndo}
                  title="Undo (છેલ્લો ફેરફાર પાછો ખેંચો) - Ctrl+Z"
                  aria-label="Undo"
                >
                  <Undo2 size={15} strokeWidth={2.2} />
                </button>
                <button
                  type="button"
                  className="format-icon-btn"
                  onClick={handleRedo}
                  title="Redo (પાછો ખેંચેલ ફેરફાર ફરી કરો) - Ctrl+Y"
                  aria-label="Redo"
                >
                  <Redo2 size={15} strokeWidth={2.2} />
                </button>
              </div>
            </div>

            {/* Action Export Buttons */}
            <div className="toolbar-actions">
              <button 
                className="btn-secondary" 
                onClick={handleCopy}
                title="તમામ લખાણ કોપી કરો"
              >
                {copied ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
                <span>{copied ? 'કોપી થયું!' : 'કોપી'}</span>
              </button>

              <button 
                className="btn-secondary" 
                onClick={handleExportWord}
                title="Microsoft Word (.docx) ફોર્મેટમાં ડાઉનલોડ"
              >
                <Download size={14} />
                <span>Word (.docx)</span>
              </button>

              <button 
                className="btn-primary" 
                onClick={handlePrint}
                title="A4 / Legal કાગળ પર પ્રિન્ટ કાઢો અથવા PDF તરીકે સેવ કરો"
              >
                <Printer size={14} />
                <span>પ્રિન્ટ / PDF</span>
              </button>
            </div>
          </div>

          {/* Row 2: Page Setup, Stamp Paper Margins, Direct Edit, and Zoom Controls */}
          <div className="toolbar-row secondary-toolbar-row">
            <div className="toolbar-group flex-wrap-group">
              {/* Page Setup Button */}
              <button 
                className="tool-toggle-btn"
                onClick={() => setIsPageSetupOpen(true)}
                title="પેજ સાઇઝ (A4 / Legal), માર્જિન અને પ્રિન્ટ સ્પેસિંગ ગોઠવો"
              >
                <Sliders size={13} />
                <span>પેજ સેટઅપ ({pageSetup.paperSize})</span>
              </button>

              {/* Stamp Paper Mode Toggle */}
              <button 
                className={`tool-toggle-btn ${stampPaperMode ? 'active' : ''}`}
                onClick={() => setStampPaperMode(!stampPaperMode)}
                title="સરકારી ₹ ૫૦ / ₹ ૧૦૦ / ₹ ૩૦૦ ના સ્ટેમ્પ પેપર પર પ્રિન્ટ માટે ઉપરથી માર્જિન છોડો"
              >
                <FileCheck size={13} />
                <span>સ્ટેમ્પ પેપર માર્જિન: {stampPaperMode ? `${stampMarginMm}mm` : 'બંધ'}</span>
              </button>

              {stampPaperMode && (
                <div className="stamp-offset-slider-box">
                  <span className="stamp-offset-label">ઓફસેટ:</span>
                  <input 
                    type="range" 
                    min="60" 
                    max="140" 
                    value={stampMarginMm} 
                    onChange={e => setStampMarginMm(Number(e.target.value))}
                    className="stamp-range-input"
                  />
                  <span className="stamp-offset-val">{stampMarginMm}mm</span>
                </div>
              )}

              {/* On-Paper Live Editing Toggle */}
              <button 
                className={`tool-toggle-btn ${isDirectEditMode ? 'active' : ''}`}
                onClick={() => setIsDirectEditMode(!isDirectEditMode)}
                title="કાગળ પર સીધું ક્લિક કરીને લખાણ સુધારો (On-Paper Editing)"
              >
                <Edit3 size={13} />
                <span>ડાયરેક્ટ એડિટ: {isDirectEditMode ? 'ચાલુ (ON)' : 'બંધ'}</span>
              </button>

              {/* Page Break Inserter */}
              <button 
                className="tool-toggle-btn"
                onClick={handleInsertPageBreak}
                title="નવા પાના માટે પેજ બ્રેક (Page Break) ઉમેરો"
              >
                <SplitSquareVertical size={13} />
                <span>+ નવું પેજ (Break)</span>
              </button>

              {/* Pedhinamu Specific Toggles */}
              {isPedhinamu && (
                <>
                  <button 
                    type="button"
                    className={`tool-toggle-btn ${showTreeMap ? 'active' : ''}`}
                    onClick={() => setShowTreeMap(!showTreeMap)}
                    title="વિઝ્યુઅલ વારસાઈ આંબો (Tree Chart) ચાલુ / બંધ"
                  >
                    <GitBranch size={13} />
                    <span>આંબો (Tree): {showTreeMap ? 'ચાલુ' : 'બંધ'}</span>
                  </button>

                  <button 
                    type="button"
                    className={`tool-toggle-btn ${showTable ? 'active' : ''}`}
                    onClick={() => setShowTable(!showTable)}
                    title="વારસદાર વિગત કોષ્ટક (Table) ચાલુ / બંધ"
                  >
                    <FileText size={13} />
                    <span>ટેબલ: {showTable ? 'ચાલુ' : 'બંધ'}</span>
                  </button>
                </>
              )}

              {customDirectHtml !== null && (
                <button 
                  className="tool-toggle-btn btn-reset-custom"
                  onClick={handleResetDirectEdit}
                  title="ડાયરેક્ટ કરેલા સુધારા રદ કરી મૂળ ફોર્મ મુજબ કરવું"
                  style={{ color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}
                >
                  <RotateCcw size={13} />
                  <span>મૂળ લખાણ લાવો</span>
                </button>
              )}
            </div>

            {/* Zoom Segmented Control */}
            <div className="zoom-segmented-control">
              <button 
                className="zoom-btn" 
                onClick={() => setZoomLevel(Math.max(60, zoomLevel - 10))}
                title="Zoom Out"
              >
                -
              </button>
              <span className="zoom-text">
                {zoomLevel}%
              </span>
              <button 
                className="zoom-btn" 
                onClick={() => setZoomLevel(Math.min(140, zoomLevel + 10))}
                title="Zoom In"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Paper Canvas Viewport */}
        <div className="paper-viewport" style={{ zoom: `${zoomLevel}%` }}>
          <div className="document-pages-container">
            {pages.map((pageHtml, index) => {
              const paperStyle = PAPER_SIZES[pageSetup.paperSize] || PAPER_SIZES.A4;
              const sheetWidth = `${paperStyle.widthMm || 210}mm`;
              const sheetMinHeight = `${paperStyle.heightMm || 297}mm`;
              const isFirstPage = index === 0;
              const effectiveTopMarginMm = (isFirstPage && stampPaperMode) 
                ? stampMarginMm 
                : (pageSetup.marginTopMm ?? pageSetup.marginTop ?? 25);
              const bottomMarginMm = pageSetup.marginBottomMm ?? pageSetup.marginBottom ?? 25;
              const leftMarginMm = pageSetup.marginLeftMm ?? pageSetup.marginLeft ?? 28;
              const rightMarginMm = pageSetup.marginRightMm ?? pageSetup.marginRight ?? 20;
              const fontSize = pageSetup.fontSizePt || 13;
              const lineHeight = pageSetup.lineHeight || 1.8;
              const paraSpacing = pageSetup.paragraphSpacing || 14;
              const fontFamily = activeFont?.family || activeFont?.fontFamily || "'Noto Serif Gujarati', 'Times New Roman', serif";

              return (
                <div 
                  key={index} 
                  className={`legal-sheet ${isFirstPage && stampPaperMode ? 'stamp-paper-mode' : ''}`}
                  style={{
                    width: sheetWidth,
                    minHeight: sheetMinHeight,
                    paddingTop: `${effectiveTopMarginMm}mm`,
                    paddingBottom: `${bottomMarginMm}mm`,
                    paddingLeft: `${leftMarginMm}mm`,
                    paddingRight: `${rightMarginMm}mm`,
                    fontSize: `${fontSize}pt`,
                    lineHeight: lineHeight,
                    fontFamily: fontFamily,
                    '--doc-para-spacing': `${paraSpacing}px`,
                    '--doc-line-height': lineHeight
                  }}
                >
                  {/* First Page Visual Stamp Placeholder */}
                  {isFirstPage && stampPaperMode && (
                    <div 
                      className="stamp-paper-placeholder-zone no-print" 
                      style={{ height: `${stampMarginMm}mm` }}
                    >
                      <div className="stamp-zone-content">
                        <div style={{ fontSize: '0.88rem', color: '#b45309', fontWeight: 800 }}>
                          🏛️ ગુજરાત સરકારી ઇ-સ્ટેમ્પ પેપર ઝોન ({stampMarginMm}mm)
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#78350f', marginTop: '2px' }}>
                          આ ભાગમાં પ્રિન્ટ થશે નહીં. ₹ ૫૦ / ₹ ૧૦૦ / ₹ ૩૦૦ નું ઇ-સ્ટેમ્પ સર્ટિફિકેટ પ્રિન્ટરમાં મૂકો.
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Multi-page Header for Page 2+ */}
                  {index > 0 && (
                    <div className="multi-page-header-line">
                      <span>{currentTemplate.title} (પાનું નં. {index + 1})</span>
                      <span>અસીલ: {isPedhinamu ? applicantName : (formValues['અરજદારનું_નામ'] || formValues['વેચનારનું_પૂરું_નામ'] || '')}</span>
                    </div>
                  )}

                  {/* Rendered Live Page Body (Supports Direct On-Paper Editing & Formatting) */}
                  <div 
                    className="document-body"
                    contentEditable={isDirectEditMode}
                    suppressContentEditableWarning={true}
                    onBlur={handleDirectEditBlur}
                    onKeyDown={e => {
                      if (isDirectEditMode) {
                        if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) {
                          e.preventDefault();
                          handleFormatText('bold');
                        } else if (e.ctrlKey && (e.key === 'i' || e.key === 'I')) {
                          e.preventDefault();
                          handleFormatText('italic');
                        } else if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
                          e.preventDefault();
                          handleFormatText('underline');
                        }
                      }
                    }}
                    dangerouslySetInnerHTML={{ __html: pageHtml }}
                  />

                  {/* Page Footer */}
                  <div className="page-footer-indicator">
                    <span>પાનું નં. {index + 1} / {pages.length}</span>
                    {pages.length > 1 && index < pages.length - 1 && (
                      <span>(ક્રમશઃ પાના નં. {index + 2} ઉપર...)</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Page Setup Configuration Modal */}
      <PageSetupModal 
        isOpen={isPageSetupOpen}
        onClose={() => setIsPageSetupOpen(false)}
        pageSetup={pageSetup}
        onSave={handleSavePageSetup}
        onSavePageSetup={handleSavePageSetup}
      />
    </div>
  );
}
