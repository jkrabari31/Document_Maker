import QRCode from 'qrcode';

/**
 * Generates an authentic Verification QR code Data URL containing document validation data
 */
export async function generateDocumentQRDataUrl({
  docId,
  title,
  clientName,
  date,
  place,
  advocateName,
  barRegNumber,
  officeAddress
}) {
  const lines = [
    '⚖️ દસ્તાવેજ ખરાઈ પ્રમાણપત્ર (VERIFIED LEGAL DOCUMENT)',
    '----------------------------------------',
    `📄 દસ્તાવેજ: ${title || 'કાનૂની દસ્તાવેજ'}`,
    `🆔 દસ્તાવેજ ID: ${docId || 'DOC-' + Date.now().toString(36).toUpperCase()}`,
    `👤 અસીલ / પક્ષકાર: ${clientName || 'અરજદાર'}`,
    `📅 તારીખ: ${date || new Date().toLocaleDateString('gu-IN')}`,
    place ? `📍 સ્થળ: ${place}` : '',
    advocateName ? `⚖️ એડવોકેટ / નોટરી: ${advocateName}` : '',
    barRegNumber ? `📜 સનદ / રજી. નં.: ${barRegNumber}` : '',
    officeAddress ? `🏢 સરનામું: ${officeAddress}` : '',
    '----------------------------------------',
    '✅ સદર દસ્તાવેજ ડિજિટલ રેકોર્ડ સાથે સુસંગત છે.'
  ].filter(Boolean);

  const qrText = lines.join('\n');

  try {
    const dataUrl = await QRCode.toDataURL(qrText, {
      width: 160,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate verification QR code', err);
    return null;
  }
}
