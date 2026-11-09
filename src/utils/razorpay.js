// Razorpay Payment Gateway Integration Utility
import { doc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

// Replace with your Razorpay Key ID from: https://dashboard.razorpay.com/#/app/keys
// In development, you can use a test key (e.g., rzp_test_...)
// In production, define VITE_RAZORPAY_KEY_ID in your .env file
export const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';

/**
 * Dynamically load the Razorpay checkout script if not already present
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Plans definition matching SubscriptionGuard
 */
export const SUBSCRIPTION_PLANS = [
  {
    id: '1m',
    name: '૧ મહિનો (Starter)',
    shortName: '૧ મહિનો',
    price: 199,
    days: 30,
    tag: 'સ્ટાર્ટર પ્લાન',
    savings: null
  },
  {
    id: '6m',
    name: '૬ મહિના (Popular)',
    shortName: '૬ મહિના',
    price: 999,
    days: 180,
    tag: 'લોકપ્રિય',
    savings: '₹૨૦૧ બચાવો'
  },
  {
    id: '1y',
    name: '૧ વર્ષ (Best Value)',
    shortName: '૧ વર્ષ',
    price: 1599,
    days: 365,
    tag: 'શ્રેષ્ઠ બચત',
    savings: '₹૮૦૦ બચાવો'
  }
];

/**
 * Activate user license in Firestore and/or LocalStorage
 */
export async function activateUserLicense({ userEmail, plan, paymentId }) {
  if (!userEmail) throw new Error('User email is required to activate license');

  const cleanEmail = userEmail.toLowerCase().trim();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + plan.days * 24 * 60 * 60 * 1000);

  const licensePayload = {
    email: cleanEmail,
    status: 'active',
    plan: plan.name,
    planId: plan.id,
    amount: plan.price,
    paymentMethod: 'razorpay',
    paymentId: paymentId || 'manual_' + Date.now(),
    activatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    issuedBy: 'Razorpay Auto Gateway',
    daysRemaining: plan.days
  };

  // 1. Firebase Firestore sync
  if (isFirebaseConfigured) {
    try {
      const ref = doc(db, 'licenses', cleanEmail);
      await setDoc(ref, licensePayload, { merge: true });
    } catch (err) {
      console.warn('Firestore license write failed, falling back to local:', err);
    }
  }

  // 2. Local mock sync (offline / demo support)
  try {
    const raw = localStorage.getItem('dastavej_mock_licenses');
    const licenses = raw ? JSON.parse(raw) : {};
    licenses[cleanEmail] = licensePayload;
    localStorage.setItem('dastavej_mock_licenses', JSON.stringify(licenses));
  } catch (err) {
    console.warn('Local mock license write failed:', err);
  }

  return licensePayload;
}

/**
 * Initiates Razorpay Checkout
 */
export async function initiateRazorpayPayment({
  plan,
  currentUser,
  onSuccess,
  onFailure
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    alert('ઈન્ટરનેટ કનેક્શન ચેક કરો અથવા પેમેન્ટ ગેટવે લોડ થઈ શક્યો નથી. કૃપા કરીને થોડીવાર પછી પ્રયાસ કરો.');
    return;
  }

  const options = {
    key: RAZORPAY_KEY_ID,
    amount: plan.price * 100, // Amount in paise
    currency: 'INR',
    name: 'દસ્તાવેજ માસ્ટર | Dastavej Pro',
    description: `${plan.name} પ્રીમિયમ સબ્સ્ક્રિપ્શન`,
    image: '/pwa-icon.svg',
    prefill: {
      name: currentUser?.displayName || '',
      email: currentUser?.email || '',
      contact: ''
    },
    theme: {
      color: '#1e3a8a' // Royal Navy Blue
    },
    modal: {
      ondismiss: () => {
        if (onFailure) onFailure('પેમેન્ટ રદ કરવામાં આવ્યું');
      }
    },
    handler: async (response) => {
      try {
        const license = await activateUserLicense({
          userEmail: currentUser?.email,
          plan,
          paymentId: response.razorpay_payment_id
        });
        if (onSuccess) onSuccess(license, response);
      } catch (err) {
        console.error('License activation error:', err);
        alert('પેમેન્ટ સફળ થયું પરંતુ લાયસન્સ અપડેટમાં ભૂલ આવી: ' + err.message);
      }
    }
  };

  try {
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (response) => {
      console.error('Payment failed:', response.error);
      if (onFailure) onFailure(response.error.description || 'ચુકવણી નિષ્ફળ ગઈ');
    });
    rzp.open();
  } catch (err) {
    console.error('Error opening Razorpay checkout:', err);
    alert('પેમેન્ટ ગેટવે ખોલવામાં ભૂલ આવી: ' + err.message);
  }
}

