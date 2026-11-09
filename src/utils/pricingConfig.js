// ─── Pricing Config Utility ───────────────────────────────────────────────────
// Firebase Firestore path: settings/pricing
// LocalStorage fallback key: dastavej_pricing_config
// ─────────────────────────────────────────────────────────────────────────────

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

export const PRICING_STORAGE_KEY = 'dastavej_pricing_config';
export const PRICING_FIRESTORE_DOC = 'settings/pricing'; // collection: settings, doc: pricing

// ─── Default fallback pricing (used if Firestore is not reachable) ───────────
export const DEFAULT_PRICING = {
  plans: [
    {
      id: 'monthly',
      name: '૧ મહિનો',
      days: 30,
      price: 199,
      label: 'સ્ટાર્ટર',
      badge: '',
      suffix: '/મો',
      savings: '',
      popular: false,
    },
    {
      id: 'six_months',
      name: '૬ મહિના',
      days: 180,
      price: 999,
      label: 'લોકપ્રિય',
      badge: 'લોકપ્રિય',
      suffix: '/૬ મો',
      savings: '₹201 બચાવો',
      popular: true,
    },
    {
      id: 'yearly',
      name: '૧ વર્ષ',
      days: 365,
      price: 1599,
      label: 'શ્રેષ્ઠ',
      badge: 'શ્રેષ્ઠ બચત',
      suffix: '/વર્ષ',
      savings: '₹800 બચાવો',
      popular: false,
    },
  ],
  upiId: 'komaljrabari2212@okhdfcbank',
  whatsappNumber: '9574782643',
  offerBanner: '', // e.g. "દિવાળી ઑફર: ૫૦% છૂટ!" — empty = no banner
};

// ─── Load pricing: Firestore → localStorage → DEFAULT ───────────────────────
export async function fetchPricingConfig() {
  // 1. Try Firestore
  if (isFirebaseConfigured) {
    try {
      const snap = await getDoc(doc(db, 'settings', 'pricing'));
      if (snap.exists()) {
        const data = snap.data();
        // Persist to localStorage as cache
        localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn('[Pricing] Firestore fetch failed, falling back to localStorage:', err.message);
    }
  }

  // 2. Try localStorage cache
  try {
    const raw = localStorage.getItem(PRICING_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}

  // 3. Return default
  return DEFAULT_PRICING;
}

// ─── Save pricing: Firestore + localStorage ──────────────────────────────────
export async function savePricingConfig(config) {
  // Always save to localStorage (works offline / demo mode)
  localStorage.setItem(PRICING_STORAGE_KEY, JSON.stringify(config));

  // Also save to Firestore if configured
  if (isFirebaseConfigured) {
    await setDoc(doc(db, 'settings', 'pricing'), config, { merge: true });
  }
}

