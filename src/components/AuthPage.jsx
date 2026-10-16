import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  LogIn, UserPlus, Eye, EyeOff, Mail, Lock, User, FileText, ArrowRight,
  Shield, Zap, Crown, KeyRound, CheckCircle, ArrowLeft
} from 'lucide-react';

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, signup, resetPassword, isFirebaseConfigured } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'forgot') {
        if (!email.trim()) {
          setError('કૃપા કરીને તમારો ઇમેઇલ દાખલ કરો');
          setLoading(false);
          return;
        }
        await resetPassword(email);
        setSuccessMsg('પાસવર્ડ રીસેટ કરવાની લિંક તમારા ઇમેઇલ પર સફળતાપૂર્વક મોકલી દેવાઈ છે. કૃપા કરીને તમારું Inbox અથવા Spam ફોલ્ડર ચેક કરો.');
      } else if (mode === 'login') {
        await login(email, password);
      } else {
        if (!displayName.trim()) {
          setError('કૃપા કરીને તમારું નામ દાખલ કરો');
          setLoading(false);
          return;
        }
        if (password.length < 6) {
          setError('પાસવર્ડ ઓછામાં ઓછા ૬ અક્ષરનો હોવો જોઈએ');
          setLoading(false);
          return;
        }
        await signup(email, password, displayName);
      }
    } catch (err) {
      console.error(err);
      switch (err.code) {
        case 'auth/user-not-found':
          setError('આ ઇમેઇલ સાથે કોઈ એકાઉન્ટ નથી');
          break;
        case 'auth/wrong-password':
          setError('ખોટો પાસવર્ડ');
          break;
        case 'auth/email-already-in-use':
          setError('આ ઇમેઇલ પહેલેથી રજિસ્ટર્ડ છે');
          break;
        case 'auth/invalid-email':
          setError('અમાન્ય ઇમેઇલ');
          break;
        case 'auth/too-many-requests':
          setError('ઘણા બધા પ્રયાસો. થોડીવાર પછી ફરી પ્રયાસ કરો');
          break;
        default:
          setError(err.message || 'કંઈક ખોટું થયું');
      }
    }
    setLoading(false);
  };

  const features = [
    { icon: <FileText size={20} />, title: 'કાનૂની દસ્તાવેજો', desc: 'પ્રોફેશનલ ટેમ્પલેટ્સ' },
    { icon: <Zap size={20} />, title: 'ઝડપી ટાઇપિંગ', desc: 'ગુજરાતી ટ્રાન્સલિટરેશન' },
    { icon: <Shield size={20} />, title: 'સુરક્ષિત ડેટા', desc: 'ક્લાઉડ બેકઅપ' },
    { icon: <Crown size={20} />, title: 'પ્રીમિયમ ફીચર્સ', desc: 'પ્રિન્ટ, PDF, સેવ' }
  ];

  return (
    <div className="auth-page">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="auth-bg-orb auth-bg-orb-3" />
      </div>

      <div className="auth-container">
        {/* Left panel — branding & features */}
        <div className="auth-branding">
          <div className="auth-brand-header">
            <div className="auth-brand-icon">
              <FileText size={32} />
            </div>
            <h1 className="auth-brand-title">દસ્તાવેજ માસ્ટર</h1>
            <p className="auth-brand-subtitle">ગુજરાતી કાનૂની દસ્તાવેજ નિર્માણ પ્લેટફોર્મ</p>
          </div>

          <div className="auth-features-grid">
            {features.map((f, i) => (
              <div key={i} className="auth-feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="auth-feature-icon">{f.icon}</div>
                <div>
                  <div className="auth-feature-title">{f.title}</div>
                  <div className="auth-feature-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-form-panel">
          <div className="auth-form-wrapper">
            <div className="auth-form-header">
              <h2>
                {mode === 'forgot'
                  ? 'પાસવર્ડ ભૂલી ગયા?'
                  : mode === 'login'
                    ? 'Login'
                    : 'Register'}
              </h2>
              <p>
                {mode === 'forgot'
                  ? 'તમારો રજિસ્ટર્ડ ઇમેઇલ દાખલ કરો, અમે રીસેટ લિંક મોકલીશું'
                  : mode === 'login'
                    ? 'તમારા એકાઉન્ટમાં લૉગિન કરો'
                    : 'ફ્રી એકાઉન્ટ બનાવો'}
              </p>
            </div>

            {error && (
              <div className="auth-error">
                <span>⚠️</span> {error}
              </div>
            )}

            {successMsg && (
              <div className="auth-success-alert">
                <CheckCircle size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              {mode === 'register' && (
                <div className="auth-input-group">
                  <label><User size={14} /> નામ</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="તમારું પૂરું નામ"
                    required
                    autoComplete="name"
                  />
                </div>
              )}

              <div className="auth-input-group">
                <label><Mail size={14} /> Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  required
                  autoComplete="email"
                />
              </div>

              {mode !== 'forgot' && (
                <div className="auth-input-group">
                  <div className="auth-label-row">
                    <label><Lock size={14} /> Password</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        className="auth-forgot-btn"
                        onClick={() => {
                          setMode('forgot');
                          setError('');
                          setSuccessMsg('');
                        }}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="auth-password-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder={mode === 'login' ? 'તમારો પાસવર્ડ' : 'ઓછામાં ઓછા ૬ અક્ષર'}
                      required
                      minLength={6}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      className="auth-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? (
                  <span className="auth-spinner" />
                ) : mode === 'forgot' ? (
                  <>
                    <KeyRound size={18} />
                    રીસેટ લિંક મોકલો
                    <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                    {mode === 'login' ? 'Login' : 'Register'}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-switch">
              {mode === 'forgot' ? (
                <p>
                  પાસવર્ડ યાદ આવી ગયો?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccessMsg('');
                    }}
                  >
                    ← પાછા Login પર જાઓ
                  </button>
                </p>
              ) : mode === 'login' ? (
                <p>
                  એકાઉન્ટ નથી?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                      setSuccessMsg('');
                    }}
                  >
                    Register
                  </button>
                </p>
              ) : (
                <p>
                  પહેલેથી એકાઉન્ટ છે?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError('');
                      setSuccessMsg('');
                    }}
                  >
                    Login
                  </button>
                </p>
              )}
            </div>

            <div className="auth-footer-note">
              <Shield size={12} />
              <span>તમારો ડેટા સંપૂર્ણ સુરક્ષિત છે</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
