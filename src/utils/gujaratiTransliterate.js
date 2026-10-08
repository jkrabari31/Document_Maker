/**
 * Gujarati Phonetic Transliteration Engine (ગુજરાતી ફોનેટિક ટાઇપિંગ એન્જિન)
 * Converts Roman/English input (e.g., "rajeshbhai", "sogandhnamu", "ahmedabad") 
 * directly into authentic Gujarati Unicode text.
 */

// Common Gujarati Legal, Place, and Name dictionary for 100% accurate conversion
const COMMON_DICTIONARY = {
  "advocate": "એડવોકેટ",
  "vakil": "વકીલ",
  "notary": "નોટરી",
  "dastavej": "દસ્તાવેજ",
  "sogandhnamu": "સોગંદનામું",
  "sogandh": "સોગંદ",
  "halafnamu": "હલફનામું",
  "banakhat": "બાનાખત",
  "satakhat": "સાટાખત",
  "vechan": "વેચાણ",
  "hak": "હક",
  "hakkami": "હકકમી",
  "vasiyatnamu": "વસિયતનામું",
  "pedhinamu": "પેઢીનામું",
  "varsai": "વારસાઈ",
  "bhadakarar": "ભાડાકરાર",
  "karar": "કરાર",
  "kabulaat": "કબુલાત",
  "samati": "સંમતિ",
  "samatinama": "સંમતિનામું",
  "mukhtyarnama": "મુખત્યારનામું",
  "power": "પાવર",
  "notice": "નોટિસ",
  "sharat": "શરત",
  "sharto": "શરતો",
  "aavak": "આવક",
  "jaati": "જાતિ",
  "jati": "જાતિ",
  "dakhlo": "દાખલો",
  "vidhava": "વિધવા",
  "sahay": "સહાય",
  "rationcard": "રેશનકાર્ડ",
  "aadhaar": "આધાર",
  "aadhar": "આધાર",
  "pan": "પાન",
  "court": "કોર્ટ",
  "talati": "તલાટી",
  "mantri": "મંત્રી",
  "mamlatdar": "મામલતદાર",
  "collector": "કલેક્ટર",
  "subregistrar": "સબ-રજિસ્ટ્રાર",
  "prant": "પ્રાંત",
  "taluka": "તાલુકો",
  "jilla": "જિલ્લો",
  "gam": "ગામ",
  "sarpanch": "સરપંચ",
  "gujarat": "ગુજરાત",
  "ahmedabad": "અમદાવાદ",
  "amdavad": "અમદાવાદ",
  "surat": "સુરત",
  "rajkot": "રાજકોટ",
  "vadodara": "વડોદરા",
  "baroda": "વડોદરા",
  "bhavnagar": "ભાવનગર",
  "jamnagar": "જામનગર",
  "junagadh": "જૂનાગઢ",
  "gandhinagar": "ગાંધીનગર",
  "mehsana": "મહેસાણા",
  "palanpur": "પાલનપુર",
  "anand": "આણંદ",
  "nadiad": "નડિયાદ",
  "bharuch": "ભરૂચ",
  "valsad": "વલસાડ",
  "navsari": "નવસારી",
  "morbi": "મોરબી",
  "surendranagar": "સુરેન્દ્રનગર",
  "amreli": "અમરેલી",
  "godhra": "ગોધરા",
  "patel": "પટેલ",
  "shah": "શાહ",
  "desai": "દેસાઈ",
  "sharma": "શર્મા",
  "joshi": "જોષી",
  "parmar": "પરમાર",
  "solanki": "સોલંકી",
  "rathod": "રાઠોડ",
  "chaudhary": "ચૌધરી",
  "chaudhari": "ચૌધરી",
  "bhatt": "ભટ્ટ",
  "trivedi": "ત્રિવેદી",
  "pandya": "પંડ્યા",
  "dave": "દવે",
  "modi": "મોદી",
  "rabari": "રબારી",
  "bharwad": "ભરવાડ",
  "thakor": "ઠાકોર",
  "vaghela": "વાઘેલા",
  "chavda": "ચાવડા",
  "gohil": "ગોહિલ",
  "jadeja": "જાડેજા",
  "jha": "ઝા",
  "shree": "શ્રી",
  "shrimati": "શ્રીમતી",
  "kumar": "કુમાર",
  "bhai": "ભાઈ",
  "ben": "બેન",
  "lal": "લાલ",
  "rupiya": "રૂપિયા",
  "rupees": "રૂપિયા",
  "inke": "અંકે",
  "anke": "અંકે",
  "pura": "પુરા",
  "lakh": "લાખ",
  "hajar": "હજાર",
  "karod": "કરોડ",
  "so": "સો",
  "tarikh": "તારીખ",
  "roj": "રોજ",
  "var": "વાર",
  "somvar": "સોમવાર",
  "mangalvar": "મંગળવાર",
  "budhvar": "બુધવાર",
  "guruvar": "ગુરુવાર",
  "shukravar": "શુક્રવાર",
  "shanivar": "શનિવાર",
  "ravivar": "રવિવાર"
};

// Vowels mapping (Independent and Matras)
const VOWELS = [
  { eng: "aum", guj: "ૐ", matra: "ૐ" },
  { eng: "om", guj: "ૐ", matra: "ૐ" },
  { eng: "ai", guj: "ઐ", matra: "ૈ" },
  { eng: "au", guj: "ઔ", matra: "ૌ" },
  { eng: "ou", guj: "ઔ", matra: "ૌ" },
  { eng: "aa", guj: "આ", matra: "ા" },
  { eng: "ee", guj: "ઈ", matra: "ી" },
  { eng: "ii", guj: "ઈ", matra: "ી" },
  { eng: "oo", guj: "ઊ", matra: "ૂ" },
  { eng: "uu", guj: "ઊ", matra: "ૂ" },
  { eng: "ru", guj: "ઋ", matra: "ૃ" },
  { eng: "a", guj: "અ", matra: "" },
  { eng: "i", guj: "ઇ", matra: "િ" },
  { eng: "u", guj: "ઉ", matra: "ુ" },
  { eng: "e", guj: "એ", matra: "ે" },
  { eng: "o", guj: "ઓ", matra: "ો" },
];

// Consonants mapping
const CONSONANTS = [
  { eng: "shhh", guj: "ષ્" },
  { eng: "shh", guj: "ષ" },
  { eng: "chh", guj: "છ" },
  { eng: "ch", guj: "ચ" },
  { eng: "kh", guj: "ખ" },
  { eng: "gh", guj: "ઘ" },
  { eng: "jh", guj: "ઝ" },
  { eng: "thh", guj: "ઠ" },
  { eng: "th", guj: "થ" },
  { eng: "dhh", guj: "ઢ" },
  { eng: "dh", guj: "ધ" },
  { eng: "ph", guj: "ફ" },
  { eng: "bh", guj: "ભ" },
  { eng: "sh", guj: "શ" },
  { eng: "gn", guj: "જ્ઞ" },
  { eng: "gy", guj: "જ્ઞ" },
  { eng: "tr", guj: "ત્ર" },
  { eng: "ksh", guj: "ક્ષ" },
  { eng: "x", guj: "ક્ષ" },
  { eng: "shr", guj: "શ્ર" },
  { eng: "k", guj: "ક" },
  { eng: "g", guj: "ગ" },
  { eng: "j", guj: "જ" },
  { eng: "z", guj: "ઝ" },
  { eng: "t", guj: "ત" },
  { eng: "T", guj: "ટ" },
  { eng: "d", guj: "દ" },
  { eng: "D", guj: "ડ" },
  { eng: "n", guj: "ન" },
  { eng: "N", guj: "ણ" },
  { eng: "p", guj: "પ" },
  { eng: "f", guj: "ફ" },
  { eng: "b", guj: "બ" },
  { eng: "m", guj: "મ" },
  { eng: "y", guj: "ય" },
  { eng: "r", guj: "ર" },
  { eng: "l", guj: "લ" },
  { eng: "L", guj: "ળ" },
  { eng: "v", guj: "વ" },
  { eng: "w", guj: "વ" },
  { eng: "s", guj: "સ" },
  { eng: "S", guj: "ષ" },
  { eng: "h", guj: "હ" }
];

/**
 * Transliterates a single English word into Gujarati
 */
export function transliterateWord(word) {
  if (!word || typeof word !== 'string') return word;
  
  const clean = word.toLowerCase().trim();
  if (COMMON_DICTIONARY[clean]) {
    return COMMON_DICTIONARY[clean];
  }

  // If already contains Gujarati or non-latin chars, return as is
  if (/[\u0A80-\u0AFF]/.test(word)) return word;

  let result = '';
  let i = 0;
  const len = word.length;
  let isPrevConsonant = false;

  while (i < len) {
    // 1. Check for Anusvara at end or before consonant (M or n with specific patterns)
    if (word[i] === 'M' || (word[i] === 'n' && (i === len - 1 || word[i + 1] === 'g' || word[i + 1] === 'd' || word[i + 1] === 't' || word[i + 1] === 's'))) {
      if (word.substring(i, i + 2).toLowerCase() === 'ng') {
        result += 'ંગ';
        i += 2;
        isPrevConsonant = true;
        continue;
      }
    }

    // 2. Check for Consonants
    let matchedConsonant = null;
    for (const c of CONSONANTS) {
      if (word.startsWith(c.eng, i)) {
        matchedConsonant = c;
        break;
      }
    }

    if (matchedConsonant) {
      if (isPrevConsonant) {
        // Add virama for conjuncts (જોડાક્ષર)
        result += '્';
      }
      result += matchedConsonant.guj;
      i += matchedConsonant.eng.length;
      isPrevConsonant = true;
      continue;
    }

    // 3. Check for Vowels
    let matchedVowel = null;
    for (const v of VOWELS) {
      if (word.toLowerCase().startsWith(v.eng, i)) {
        matchedVowel = v;
        break;
      }
    }

    if (matchedVowel) {
      if (isPrevConsonant) {
        // Apply matra to previous consonant
        result += matchedVowel.matra;
      } else {
        // Standalone independent vowel
        result += matchedVowel.guj;
      }
      i += matchedVowel.eng.length;
      isPrevConsonant = false;
      continue;
    }

    // 4. Special Characters, Numbers, Punctuation
    const char = word[i];
    if (char === '.') {
      result += '.';
    } else if (char === 'q' || char === 'Q') {
      result += isPrevConsonant ? '્ક' : 'ક';
    } else {
      result += char;
    }
    isPrevConsonant = false;
    i++;
  }

  return result;
}

/**
 * Transliterates an entire string sentence from English to Gujarati
 */
export function transliterateSentence(text) {
  if (!text) return '';
  
  // Split by words preserving spaces and punctuation
  return text.replace(/([a-zA-Z]+)/g, (match) => {
    return transliterateWord(match);
  });
}

/**
/**
 * Input KeyDown / Input Handler for React input/textarea
 * Automatically transliterates the last word when pressing Space, Enter or Tab
 */
export function handlePhoneticKeyDown(e, isEnabled, onTextChange) {
  if (!isEnabled) return;

  // Toggle on Ctrl+G
  if (e.ctrlKey && (e.key === 'g' || e.key === 'G')) {
    e.preventDefault();
    return { togglePhonetic: true };
  }

  const input = e.target;
  // If not a standard input or textarea (e.g., contentEditable div), don't interfere with keydown
  if (!input || typeof input.selectionStart !== 'number') {
    return;
  }

  if (e.key === ' ' || e.key === 'Enter' || e.key === ',' || e.key === '.') {
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const val = input.value || '';

    if (start === end && start > 0) {
      // Find the word preceding the cursor
      const textBeforeCursor = val.substring(0, start);
      const match = textBeforeCursor.match(/([a-zA-Z]+)$/);
      
      if (match) {
        const englishWord = match[1];
        const gujaratiWord = transliterateWord(englishWord);

        if (gujaratiWord !== englishWord) {
          e.preventDefault();
          const wordStart = start - englishWord.length;
          const charToAdd = e.key === 'Enter' ? '\n' : e.key;
          const newVal = val.substring(0, wordStart) + gujaratiWord + charToAdd + val.substring(end);
          const newCursorPos = wordStart + gujaratiWord.length + charToAdd.length;
          
          if (onTextChange) {
            onTextChange(newVal);
          } else {
            input.value = newVal;
          }

          // Restore cursor position reliably across renders
          const applySelection = () => {
            if (input && typeof input.setSelectionRange === 'function') {
              input.setSelectionRange(newCursorPos, newCursorPos);
            }
          };
          applySelection();
          requestAnimationFrame(applySelection);
          setTimeout(applySelection, 10);
          return;
        }
      }
    }
  }
}

