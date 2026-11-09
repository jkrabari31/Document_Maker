import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePricing } from '../contexts/PricingContext';
import { DEFAULT_PRICING } from '../utils/pricingConfig';
import { Crown, Lock, X, Clock, CreditCard, Phone, Mail, CheckCircle, AlertTriangle, Copy, Check } from 'lucide-react';

export default function SubscriptionGuard({ children, action = 'આ ફીચર' }) {
  const { isPremium, license, currentUser, openAuthModal } = useAuth();
  // Gracefully fall back if PricingContext is not yet mounted
  let pricingCtx;
  try { pricingCtx = usePricing(); } catch (_) { pricingCtx = { pricing: DEFAULT_PRICING }; }
  const { pricing } = pricingCtx;

  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // ─── Plans from dynamic pricing ───────────────────────────────────────────
  const plans = pricing?.plans || DEFAULT_PRICING.plans;
  const upiId = pricing?.upiId || DEFAULT_PRICING.upiId;
  const whatsappNumber = pricing?.whatsappNumber || DEFAULT_PRICING.whatsappNumber;
  const offerBanner = pricing?.offerBanner || '';

  // If user has premium, render children directly
  if (isPremium()) {
    return <>{children}</>;
  }

  // Otherwise wrap the child's onClick with our guard
  const handleBlockedAction = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();

    // 1. If not logged in: compulsory login/register modal
    if (!currentUser) {
      if (openAuthModal) {
        openAuthModal({
          mode: 'register',
          message: `દસ્તાવેજ ${action} કરવા માટે કૃપા કરીને પહેલાં રજિસ્ટ્રેશન અથવા લૉગિન કરો.`
        });
      }
      return;
    }

    // 2. Logged in but not premium: show subscription modal
    setShowModal(true);
  };

  // Helper: build payment step text from plans
  const planStepsText = plans
    .map(p => `₹${p.price} (${p.name})`)
    .join(', ');

  const modalContent = showModal && (
    <div className="sub-modal-overlay" onClick={() => setShowModal(false)}>
      <div className="sub-modal" onClick={e => e.stopPropagation()}>
        <button className="sub-modal-close" onClick={() => setShowModal(false)} title="બંધ કરો">
          <X size={22} />
        </button>

        {/* Optional offer banner */}
        {offerBanner && (
          <div className="sub-offer-banner">
            🎉 {offerBanner}
          </div>
        )}

        <div className="sub-modal-header">
          <div className="sub-modal-icon">
            <Crown size={34} />
          </div>
          <h2>પ્રીમિયમ સબ્સ્ક્રિપ્શન</h2>
          <p>
            <Lock size={15} style={{ verticalAlign: 'middle' }} />
            {' '}<strong>{action}</strong> વાપરવા માટે પ્રીમિયમ પ્લાન એક્ટિવેટ કરો
          </p>
        </div>

        {/* License status (expired) */}
        {license && !license.isActive && (
          <div className="sub-expired-notice">
            <AlertTriangle size={16} />
            <span>
              તમારું સબ્સ્ક્રિપ્શન <strong>
                {license.expiresAt?.toLocaleDateString?.('gu-IN') || 'expired'}
              </strong> ના રોજ સમાપ્ત થયું. રિન્યુઅલ માટે સંપર્ક કરો.
            </span>
          </div>
        )}

        {/* ─── Dynamic Plan Cards ─────────────────────────────────────────── */}
        <div className="sub-pricing-row">
          {plans.map((plan, idx) => {
            const isPopular = plan.popular || plan.badge === 'લોકપ્રિય';
            const isBest = plan.badge === 'શ્રેષ્ઠ બચત' || plan.id === 'yearly';
            return (
              <div
                key={plan.id}
                className={`sub-plan${isPopular ? ' sub-plan-popular' : ''}${isBest && !isPopular ? ' sub-plan-best' : ''}`}
              >
                {plan.badge && (
                  <div className={`sub-plan-badge${isBest && !isPopular ? ' sub-plan-badge-gold' : ''}`}>
                    {plan.badge}
                  </div>
                )}
                <div className="sub-plan-name">{plan.name}</div>
                <div className="sub-plan-price">
                  ₹{plan.price}
                  <span>{plan.suffix || ''}</span>
                </div>
                {plan.savings && (
                  <div className="sub-plan-savings">{plan.savings}</div>
                )}
                {!plan.savings && plan.label && (
                  <div className="sub-plan-features-tag">{plan.label}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Features list */}
        <div className="sub-features-list">
          <h4>પ્રીમિયમમાં શું મળે?</h4>
          <ul>
            <li><CheckCircle size={15} /> અમર્યાદિત પ્રિન્ટ અને PDF</li>
            <li><CheckCircle size={15} /> Word (.docx) ડાઉનલોડ</li>
            <li><CheckCircle size={15} /> ટેમ્પલેટ સેવ અને ક્લાઉડ બેકઅપ</li>
            <li><CheckCircle size={15} /> QR કોડ વેરિફિકેશન</li>
            <li><CheckCircle size={15} /> વોટરમાર્ક કસ્ટમાઇઝેશન</li>
            <li><CheckCircle size={15} /> ફૂટર કસ્ટમાઇઝેશન</li>
          </ul>
        </div>

        {/* Payment Section — dynamic UPI ID */}
        <div className="sub-payment-section">
          <h4><CreditCard size={17} /> ચુકવણી પદ્ધતિ (Scan &amp; Pay)</h4>

          <div className="sub-payment-grid">
            <div className="sub-qr-card">
              <div className="sub-qr-frame">
                <img src="/gpay-qr.jpg" alt="Google Pay QR Code" className="sub-qr-image" />
              </div>
              <div className="sub-upi-details">
                <span className="sub-upi-label">Google Pay / PhonePe UPI ID:</span>
                <div className="sub-upi-copy-row">
                  <code className="sub-upi-id">{upiId}</code>
                  <button
                    type="button"
                    className="sub-copy-upi-btn"
                    onClick={() => {
                      navigator.clipboard?.writeText(upiId);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    title="UPI ID કોપી કરો"
                  >
                    {copied ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                    <span>{copied ? 'કોપી થયું!' : 'કોપી'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="sub-payment-steps">
              <div className="sub-step">
                <div className="sub-step-num">1</div>
                <div>
                  QR કોડ સ્કેન કરી પ્લાન મુજબ રકમ ચૂકવો:{' '}
                  {plans.map((p, i) => (
                    <span key={p.id}>
                      <strong>₹{p.price} ({p.name})</strong>
                      {i < plans.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
              <div className="sub-step">
                <div className="sub-step-num">2</div>
                <div>
                  ચુકવણીનો સ્ક્રીનશોટ અને તમારો રજિસ્ટર્ડ ઈમેઈલ
                  {currentUser?.email && (
                    <span className="sub-user-email">
                      <Mail size={12} /> {currentUser.email}
                    </span>
                  )}
                  {' '}WhatsApp (<strong>{whatsappNumber}</strong>) પર મોકલો
                </div>
              </div>
              <div className="sub-step">
                <div className="sub-step-num">3</div>
                <div>
                  <Clock size={15} style={{ verticalAlign: 'middle' }} /> પેમેન્ટ મળતાં જ તમારું એકાઉન્ટ તરત એક્ટિવેટ કરી દેવામાં આવશે
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="sub-modal-footer">
          <button
            className="sub-contact-btn"
            onClick={() => {
              const emailMsg = currentUser?.email ? ` for account: ${currentUser.email}` : '';
              window.open(
                `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(
                  `Hello, I have made the payment for Document Master Premium Subscription${emailMsg}. Please find the screenshot attached.`
                )}`,
                '_blank'
              );
            }}
          >
            <Phone size={18} />
            WhatsApp પર પેમેન્ટ સ્ક્રીનશોટ મોકલો ({whatsappNumber})
          </button>
          <button className="sub-close-btn" onClick={() => setShowModal(false)}>
            પછી કરીશ
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Clone the child element and override its onClick */}
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            onClick: handleBlockedAction,
            className: `${child.props.className || ''} subscription-locked`.trim(),
            title: !currentUser
              ? `🔒 ${action} માટે લૉગિન / રજિસ્ટ્રેશન ફરજિયાત છે`
              : `🔒 ${action} માટે પ્રીમિયમ સબ્સ્ક્રિપ્શન જરૂરી છે`
          });
        }
        return child;
      })}

      {/* Render modal in document.body via Portal */}
      {showModal && typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}

// Simple wrapper for direct use — shows a lock icon overlay
export function PremiumBadge() {
  return (
    <span className="premium-badge-inline">
      <Crown size={12} /> PRO
    </span>
  );
}
