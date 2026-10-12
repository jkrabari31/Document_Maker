/**
 * Gujarat Stamp Duty & Jantri Calculator Utility
 * Based on Gujarat Stamp Act, 1958 and Gujarat Registration Rules
 */

export const STAMP_DOC_TYPES = [
  {
    id: 'sale_deed',
    title: 'સ્થાવર મિલકત વેચાણ દસ્તાવેજ (Sale Deed / Conveyance)',
    category: 'મિલકત વેચાણ',
    type: 'percentage',
    maleStampRate: 4.90,
    femaleStampRate: 3.90, // 1% Direct Concession for Women
    jointStampRate: 4.90,
    maleRegRate: 1.00,
    femaleRegRate: 0.00, // Female buyers are 100% exempt from registration fee in Gujarat
    jointRegRate: 1.00,
    fixedStamp: null,
    notes: 'ગુજરાત સ્ટેમ્પ એક્ટ મુજબ મહિલા ખરીદનારને સ્ટેમ્પ ડ્યુટીમાં ૧% ની સીધી છૂટ (૩.૯૦%) અને સબ-રજીસ્ટ્રાર નોંધણી ફી માફી (૦%) મળે છે.'
  },
  {
    id: 'agreement_to_sell_no_possession',
    title: 'બાનાખત - કબજા વગર (Agreement to Sell without Possession)',
    category: 'કરાર / એગ્રીમેન્ટ',
    type: 'fixed',
    fixedStamp: 300,
    regFee: 100,
    notes: 'કબજા વગરના સાદા બાનાખત માટે ₹ ૩૦૦ નો સ્ટેમ્પ પેપર અને ₹ ૧૦૦ નોંધણી ફી લાગુ પડે છે.'
  },
  {
    id: 'agreement_to_sell_with_possession',
    title: 'બાનાખત - કબજા સાથે (Agreement to Sell with Possession)',
    category: 'કરાર / એગ્રીમેન્ટ',
    type: 'percentage',
    maleStampRate: 4.90,
    femaleStampRate: 3.90,
    jointStampRate: 4.90,
    maleRegRate: 1.00,
    femaleRegRate: 0.00,
    jointRegRate: 1.00,
    fixedStamp: null,
    notes: 'જો બાનાખતમાં મિલકતનો પ્રત્યક્ષ કબજો સોંપવામાં આવે, તો વેચાણ દસ્તાવેજ જેટલી જ પૂરી સ્ટેમ્પ ડ્યુટી (૪.૯૦% / ૩.૯૦%) ભરવી પડે છે.'
  },
  {
    id: 'gift_deed_family',
    title: 'બક્ષિસ દસ્તાવેજ - કુટુંબીજન / લોહીના સગામાં (Gift Deed - Family)',
    category: 'બક્ષિસ / દાન',
    type: 'percentage',
    maleStampRate: 4.90,
    femaleStampRate: 3.90,
    jointStampRate: 4.90,
    maleRegRate: 1.00,
    femaleRegRate: 0.00,
    jointRegRate: 1.00,
    fixedStamp: null,
    notes: 'કુટુંબના સભ્યો વચ્ચે બક્ષિસ દસ્તાવેજ માટે જંત્રી અથવા બજાર ભાવ પર સ્ટેમ્પ ડ્યુટી ગણાય છે.'
  },
  {
    id: 'mortgage_without_possession',
    title: 'ગીરો દસ્તાવેજ - કબજા વગર (Mortgage Deed without Possession)',
    category: 'ગીરો / લોન',
    type: 'percentage',
    maleStampRate: 0.50,
    femaleStampRate: 0.50,
    jointStampRate: 0.50,
    maleRegRate: 1.00,
    femaleRegRate: 1.00,
    jointRegRate: 1.00,
    fixedStamp: null,
    notes: 'બેંક લોન અથવા ખાનગી લોન માટે કબજા રહિત ગીરો દસ્તાવેજમાં લોન રકમ પર ૦.૫૦% સ્ટેમ્પ ડ્યુટી લાગે છે.'
  },
  {
    id: 'rent_agreement_11m',
    title: 'ભાડાકરાર - ૧૧ મહિના / ૧ વર્ષ સુધી (Rent Agreement up to 11 Months)',
    category: 'ભાડાકરાર',
    type: 'fixed',
    fixedStamp: 300,
    regFee: 0,
    notes: '૧૧ મહિનાના સામાન્ય રહેણાંક અથવા દુકાન ભાડાકરાર માટે ₹ ૩૦૦ નો સ્ટેમ્પ પેપર પ્રમાણિત છે.'
  },
  {
    id: 'power_of_attorney_general',
    title: 'જનરલ પાવર ઓફ એટર્ની (General Power of Attorney - GPA)',
    category: 'પાવર ઓફ એટર્ની',
    type: 'fixed',
    fixedStamp: 300,
    regFee: 100,
    notes: 'સામાન્ય વહીવટ અથવા કોર્ટ કાર્યવાહી માટે ₹ ૩૦૦ નો સ્ટેમ્પ પેપર જરૂરી છે.'
  },
  {
    id: 'power_of_attorney_sale',
    title: 'પાવર ઓફ એટર્ની - મિલકત વેચાણ અધિકાર સાથે (POA with Sale Consideration)',
    category: 'પાવર ઓફ એટર્ની',
    type: 'percentage',
    maleStampRate: 4.90,
    femaleStampRate: 3.90,
    jointStampRate: 4.90,
    maleRegRate: 1.00,
    femaleRegRate: 0.00,
    jointRegRate: 1.00,
    fixedStamp: null,
    notes: 'જ્યારે પાવર ઓફ એટર્નીમાં મિલકત વેચવાની કે અવેજ લેવાની સત્તા આપવામાં આવે ત્યારે વેચાણ દસ્તાવેજ મુજબ સ્ટેમ્પ ડ્યુટી લાગે છે.'
  },
  {
    id: 'release_deed',
    title: 'હક્ક કમી / રિલીઝ દસ્તાવેજ (Relinquishment / Release Deed)',
    category: 'હક્ક કમી',
    type: 'fixed',
    fixedStamp: 300,
    regFee: 100,
    notes: 'વારસાઈ અથવા સંયુક્ત મિલકતમાં સહ-માલિક પોતાના હિસ્સાનો હક્ક જતો કરે ત્યારે ₹ ૩૦૦ સ્ટેમ્પ પેપર વપરાય છે.'
  },
  {
    id: 'affidavit',
    title: 'સોગંદનામું (Affidavit - General)',
    category: 'સોગંદનામા',
    type: 'fixed',
    fixedStamp: 50,
    regFee: 0,
    notes: 'સામાન્ય સરકારી સોગંદનામા માટે ₹ ૫૦ અથવા નોટરાઇઝ્ડ કામ માટે ₹ ૩૦૦ નો સ્ટેમ્પ પેપર માન્ય છે.'
  }
];

/**
 * Calculates Gujarat Stamp Duty, Jantri Comparison, Registration Fee, and Women Concession
 */
export function calculateGujaratStampDuty({
  docTypeId = 'sale_deed',
  considerationAmount = 0,
  jantriValue = 0,
  buyerType = 'male' // 'male' | 'female' | 'joint'
}) {
  const doc = STAMP_DOC_TYPES.find(d => d.id === docTypeId) || STAMP_DOC_TYPES[0];
  const consideration = Math.max(0, Number(considerationAmount) || 0);
  const jantri = Math.max(0, Number(jantriValue) || 0);
  
  // Under Gujarat law, Stamp Duty is levied on the HIGHER of Consideration or Jantri Value
  const applicableValue = Math.max(consideration, jantri);
  const isJantriHigher = jantri > 0 && jantri > consideration;

  if (doc.type === 'fixed') {
    const stampDuty = doc.fixedStamp || 300;
    const registrationFee = doc.regFee || 0;
    const totalGovtCost = stampDuty + registrationFee;

    return {
      docType: doc,
      applicableValue,
      consideration,
      jantri,
      isJantriHigher: false,
      buyerType,
      stampRate: 0,
      stampDuty,
      regRate: 0,
      registrationFee,
      womenSavings: 0,
      totalGovtCost,
      isFixed: true,
      notes: doc.notes
    };
  }

  // Percentage based calculation
  let stampRate = doc.maleStampRate;
  let regRate = doc.maleRegRate;

  if (buyerType === 'female') {
    stampRate = doc.femaleStampRate;
    regRate = doc.femaleRegRate;
  } else if (buyerType === 'joint') {
    stampRate = doc.jointStampRate;
    regRate = doc.jointRegRate;
  }

  const stampDuty = Math.round((applicableValue * stampRate) / 100);
  const registrationFee = Math.round((applicableValue * regRate) / 100);

  // Calculate savings if buyer is female
  let womenSavings = 0;
  if (buyerType === 'female') {
    const standardStamp = Math.round((applicableValue * doc.maleStampRate) / 100);
    const standardReg = Math.round((applicableValue * doc.maleRegRate) / 100);
    womenSavings = (standardStamp + standardReg) - (stampDuty + registrationFee);
  }

  const totalGovtCost = stampDuty + registrationFee;

  return {
    docType: doc,
    applicableValue,
    consideration,
    jantri,
    isJantriHigher,
    buyerType,
    stampRate,
    stampDuty,
    regRate,
    registrationFee,
    womenSavings,
    totalGovtCost,
    isFixed: false,
    notes: doc.notes
  };
}

/**
 * Formats a currency amount into standard Indian Rupee notation (e.g. ₹ 15,50,000)
 */
export function formatINR(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹ ૦';
  return '₹ ' + Number(val).toLocaleString('en-IN');
}
