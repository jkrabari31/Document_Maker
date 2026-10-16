import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Lock, X, Clock, CreditCard, Phone, Mail, CheckCircle, AlertTriangle, Copy, Check } from 'lucide-react';

export default function SubscriptionGuard({ children, action = 'આ ફીચર' }) {
  const { isPremium, license, currentUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // If user has premium, render children directly
  if (isPremium()) {
    return <>{children}</>;
  }

  // Otherwise wrap the children's onClick with our guard
  const handleBlockedAction = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setShowModal(true);
  };

  const modalContent = showModal && (
    <div className="sub-modal-overlay" onClick={() => setShowModal(false)}>
      <div className="sub-modal" onClick={e => e.stopPropagation()}>
        <button className="sub-modal-close" onClick={() => setShowModal(false)} title="બંધ કરો">
          <X size={22} />
        </button>

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

        {/* License status */}
        {license && !license.isActive && (
          <div className="sub-expired-notice">
            <AlertTriangle size={16} />
            <span>તમારું સબ્સ્ક્રિપ્શન <strong>{license.expiresAt?.toLocaleDateString?.('gu-IN') || 'expired'}</strong> ના રોજ સમાપ્ત થયું. રિન્યુઅલ માટે સંપર્ક કરો.</span>
          </div>
        )}

        {/* 3 Price Catalog */}
        <div className="sub-pricing-row">
          <div className="sub-plan">
            <div className="sub-plan-name">૧ મહિનો</div>
            <div className="sub-plan-price">₹499<span>/મો</span></div>
            <div className="sub-plan-features-tag">સ્ટાર્ટર પ્લાન</div>
          </div>
          <div className="sub-plan sub-plan-popular">
            <div className="sub-plan-badge">લોકપ્રિય</div>
            <div className="sub-plan-name">૬ મહિના</div>
            <div className="sub-plan-price">₹2,499<span>/૬ મો</span></div>
            <div className="sub-plan-savings">₹495 બચાવો</div>
          </div>
          <div className="sub-plan sub-plan-best">
            <div className="sub-plan-badge sub-plan-badge-gold">શ્રેષ્ઠ બચત</div>
            <div className="sub-plan-name">૧ વર્ષ</div>
            <div className="sub-plan-price">₹4,999<span>/વર્ષ</span></div>
            <div className="sub-plan-savings">₹989 બચાવો</div>
          </div>
        </div>

        {/* Features included */}
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

        {/* Payment Section with Google Pay QR Code */}
        <div className="sub-payment-section">
          <h4><CreditCard size={17} /> ચુકવણી પદ્ધતિ (Scan & Pay)</h4>

          <div className="sub-payment-grid">
            <div className="sub-qr-card">
              <div className="sub-qr-frame">
                <img src="/gpay-qr.jpg" alt="Google Pay QR Code" className="sub-qr-image" />
              </div>
              <div className="sub-upi-details">
                <span className="sub-upi-label">Google Pay / PhonePe UPI ID:</span>
                <div className="sub-upi-copy-row">
                  <code className="sub-upi-id">komaljrabari2212@okhdfcbank</code>
                  <button
                    type="button"
                    className="sub-copy-upi-btn"
                    onClick={() => {
                      navigator.clipboard?.writeText('komaljrabari2212@okhdfcbank');
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
                  QR કોડ સ્કેન કરી પ્લાન મુજબ રકમ ચૂકવો: <strong>₹499 (1 મહિનો)</strong>, <strong>₹2,499 (6 મહિના)</strong> અથવા <strong>₹4,999 (1 વર્ષ)</strong>
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
                  {' '}WhatsApp (<strong>9574782643</strong>) પર મોકલો
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
              window.open(`https://wa.me/919574782643?text=${encodeURIComponent(`Hello, I have made the payment for Document Master Premium Subscription${emailMsg}. Please find the screenshot attached.`)}`, '_blank');
            }}
          >
            <Phone size={18} />
            WhatsApp પર પેમેન્ટ સ્ક્રીનશોટ મોકલો (9574782643)
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
            title: `🔒 ${action} માટે પ્રીમિયમ સબ્સ્ક્રિપ્શન જરૂરી છે`
          });
        }
        return child;
      })}

      {/* Render modal directly in document.body via Portal to prevent any stacking context or header overlap */}
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
