import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePricing } from '../contexts/PricingContext';
import { DEFAULT_PRICING } from '../utils/pricingConfig';
import {
  collection, getDocs, doc, setDoc, updateDoc, deleteDoc, query, orderBy, serverTimestamp, Timestamp
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import {
  Shield, Users, Crown, Search, Plus, Edit3, Trash2, RefreshCw, CheckCircle,
  XCircle, Clock, Mail, Calendar, ArrowLeft, AlertTriangle, UserCheck, UserX,
  Activity, TrendingUp, Filter, Download, IndianRupee, Settings, Tag, Save, Percent
} from 'lucide-react';

// Admin emails that can access the portal
const ADMIN_EMAILS = ['jaimin3460@gmail.com', 'admin@dastavej.com'];

export default function AdminPortal({ onBack }) {
  const { currentUser } = useAuth();
  const { pricing, updatePricing } = usePricing();
  const [licenses, setLicenses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingLicense, setEditingLicense] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, revenue: 0 });
  const [activeSection, setActiveSection] = useState('licenses'); // 'licenses' | 'pricing'

  // Check if current user is admin
  const isAdmin = currentUser?.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase());

  // Fetch all licenses
  const fetchLicenses = useCallback(async () => {
    setLoading(true);
    try {
      let licenseList = [];
      const now = new Date();
      let activeCount = 0;
      let expiredCount = 0;

      if (isFirebaseConfigured) {
        const licensesSnap = await getDocs(query(collection(db, 'licenses'), orderBy('createdAt', 'desc')));
        licensesSnap.forEach((docSnap) => {
          const data = docSnap.data();
          const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
          const isActive = data.status === 'active' && expiresAt > now;
          if (isActive) activeCount++;
          else expiredCount++;

          licenseList.push({
            id: docSnap.id,
            ...data,
            expiresAt,
            isActive,
            daysRemaining: Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)))
          });
        });
      } else {
        // Local demo mode
        const raw = localStorage.getItem('dastavej_mock_licenses');
        const mockLicenses = raw ? JSON.parse(raw) : {};
        Object.entries(mockLicenses).forEach(([email, data]) => {
          const expiresAt = new Date(data.expiresAt);
          const isActive = data.status === 'active' && expiresAt > now;
          if (isActive) activeCount++;
          else expiredCount++;

          licenseList.push({
            id: email,
            ...data,
            expiresAt,
            isActive,
            daysRemaining: Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)))
          });
        });
      }

      setLicenses(licenseList);
      setStats({
        total: licenseList.length,
        active: activeCount,
        expired: expiredCount,
        revenue: licenseList.reduce((acc, l) => acc + (l.amountPaid || 0), 0)
      });
    } catch (err) {
      console.error('Error fetching licenses:', err);
    }

    // Fetch users
    try {
      if (isFirebaseConfigured) {
        const usersSnap = await getDocs(collection(db, 'users'));
        const userList = [];
        usersSnap.forEach((docSnap) => {
          userList.push({ id: docSnap.id, ...docSnap.data() });
        });
        setUsers(userList);
      } else {
        const raw = localStorage.getItem('dastavej_mock_users');
        const userList = raw ? JSON.parse(raw) : [];
        setUsers(userList);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      fetchLicenses();
    }
  }, [isAdmin, fetchLicenses]);

  // Filtered licenses
  const filteredLicenses = licenses.filter(l => {
    const matchSearch = l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filterStatus === 'all' ||
      (filterStatus === 'active' && l.isActive) ||
      (filterStatus === 'expired' && !l.isActive);
    return matchSearch && matchFilter;
  });

  // Delete license
  const handleDeleteLicense = async (email) => {
    if (!window.confirm(`"${email}" નું લાયસન્સ ડિલીટ કરવું છે?`)) return;
    try {
      if (isFirebaseConfigured) {
        await deleteDoc(doc(db, 'licenses', email));
      } else {
        const raw = localStorage.getItem('dastavej_mock_licenses');
        const mockLicenses = raw ? JSON.parse(raw) : {};
        delete mockLicenses[email.toLowerCase()];
        localStorage.setItem('dastavej_mock_licenses', JSON.stringify(mockLicenses));
      }
      await fetchLicenses();
    } catch (err) {
      alert('ડિલીટ કરવામાં ભૂલ: ' + err.message);
    }
  };

  // Export data
  const handleExport = () => {
    const data = JSON.stringify(licenses, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `licenses_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Access denied
  if (!isAdmin) {
    return (
      <div className="admin-access-denied">
        <Shield size={64} />
        <h2>ઍક્સેસ નકારવામાં આવ્યો</h2>
        <p>આ પેજ ફક્ત ઍડમિન માટે ઉપલબ્ધ છે.</p>
        <button onClick={onBack} className="admin-btn-back">
          <ArrowLeft size={16} /> પાછા જાઓ
        </button>
      </div>
    );
  }

  return (
    <div className="admin-portal">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <button onClick={onBack} className="admin-back-btn">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1><Shield size={24} /> ઍડમિન પોર્ટલ</h1>
            <p>લાયસન્સ અને યુઝર મેનેજમેન્ટ</p>
          </div>
        </div>
        <div className="admin-header-actions">
          <button onClick={fetchLicenses} className="admin-btn admin-btn-refresh" disabled={loading}>
            <RefreshCw size={16} className={loading ? 'spin' : ''} /> રિફ્રેશ
          </button>
          <button onClick={handleExport} className="admin-btn admin-btn-export">
            <Download size={16} /> એક્સપોર્ટ
          </button>
          <button onClick={() => { setEditingLicense(null); setShowAddModal(true); }} className="admin-btn admin-btn-primary">
            <Plus size={16} /> નવું લાયસન્સ
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="admin-section-tabs">
        <button
          className={`admin-section-tab ${activeSection === 'licenses' ? 'active' : ''}`}
          onClick={() => setActiveSection('licenses')}
        >
          <Crown size={16} /> લાયસન્સ મેનેજમેન્ટ
        </button>
        <button
          className={`admin-section-tab ${activeSection === 'pricing' ? 'active' : ''}`}
          onClick={() => setActiveSection('pricing')}
        >
          <IndianRupee size={16} /> પ્લાન અને પ્રાઇસિંગ
        </button>
      </div>

      {/* Stats dashboard */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon stat-total"><Users size={20} /></div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{stats.total}</div>
            <div className="admin-stat-label">કુલ લાયસન્સ</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon stat-active"><UserCheck size={20} /></div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{stats.active}</div>
            <div className="admin-stat-label">એક્ટિવ</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon stat-expired"><UserX size={20} /></div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">{stats.expired}</div>
            <div className="admin-stat-label">એક્સપાયર્ડ</div>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon stat-revenue"><TrendingUp size={20} /></div>
          <div className="admin-stat-info">
            <div className="admin-stat-value">₹{stats.revenue.toLocaleString()}</div>
            <div className="admin-stat-label">કુલ આવક</div>
          </div>
        </div>
      </div>

      {/* ─── LICENSES SECTION ─────────────────────────────────────── */}
      {activeSection === 'licenses' && (
        <>
          {/* Search & Filter */}
          <div className="admin-controls">
            <div className="admin-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="ઇમેઇલ અથવા નામ શોધો..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="admin-filters">
              <button
                className={`admin-filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                <Activity size={14} /> બધા
              </button>
              <button
                className={`admin-filter-btn ${filterStatus === 'active' ? 'active' : ''}`}
                onClick={() => setFilterStatus('active')}
              >
                <CheckCircle size={14} /> એક્ટિવ
              </button>
              <button
                className={`admin-filter-btn ${filterStatus === 'expired' ? 'active' : ''}`}
                onClick={() => setFilterStatus('expired')}
              >
                <XCircle size={14} /> એક્સપાયર્ડ
              </button>
            </div>
          </div>

          {/* License Table */}
          <div className="admin-table-wrap">
            {loading ? (
              <div className="admin-loading">
                <RefreshCw size={32} className="spin" />
                <p>લોડ થઈ રહ્યું છે...</p>
              </div>
            ) : filteredLicenses.length === 0 ? (
              <div className="admin-empty">
                <Crown size={48} />
                <p>{searchTerm ? 'કોઈ પરિણામ મળ્યું નથી' : 'હજુ કોઈ લાયસન્સ નથી'}</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>યુઝર</th>
                    <th>પ્લાન</th>
                    <th>સ્ટેટસ</th>
                    <th>શરૂ</th>
                    <th>સમાપ્ત</th>
                    <th>બાકી દિવસો</th>
                    <th>રકમ</th>
                    <th>ક્રિયાઓ</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLicenses.map(lic => (
                    <tr key={lic.id} className={lic.isActive ? '' : 'row-expired'}>
                      <td>
                        <div className="admin-user-cell">
                          <div className="admin-user-avatar">
                            {(lic.userName || lic.email)?.[0]?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="admin-user-name">{lic.userName || '—'}</div>
                            <div className="admin-user-email">{lic.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`admin-plan-tag plan-${lic.plan || 'monthly'}`}>
                          {lic.plan === 'yearly' ? '૧ વર્ષ' : lic.plan === 'six_months' ? '૬ મહિના' : '૧ મહિનો'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-status-tag ${lic.isActive ? 'status-active' : 'status-expired'}`}>
                          {lic.isActive ? (
                            <><CheckCircle size={12} /> એક્ટિવ</>
                          ) : (
                            <><XCircle size={12} /> એક્સપાયર્ડ</>
                          )}
                        </span>
                      </td>
                      <td className="admin-date-cell">
                        {lic.startedAt?.toDate?.()?.toLocaleDateString('gu-IN') ||
                         (lic.startedAt ? new Date(lic.startedAt).toLocaleDateString('gu-IN') : '—')}
                      </td>
                      <td className="admin-date-cell">
                        {lic.expiresAt?.toLocaleDateString?.('gu-IN') || '—'}
                      </td>
                      <td>
                        {lic.isActive ? (
                          <span className={`admin-days ${lic.daysRemaining <= 7 ? 'days-warning' : ''}`}>
                            <Clock size={12} /> {lic.daysRemaining} દિવસ
                          </span>
                        ) : (
                          <span className="admin-days days-expired">સમાપ્ત</span>
                        )}
                      </td>
                      <td className="admin-amount">₹{(lic.amountPaid || 0).toLocaleString()}</td>
                      <td>
                        <div className="admin-actions">
                          <button
                            className="admin-action-btn admin-action-edit"
                            title="એડિટ / રિન્યુ"
                            onClick={() => { setEditingLicense(lic); setShowAddModal(true); }}
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            className="admin-action-btn admin-action-delete"
                            title="ડિલીટ"
                            onClick={() => handleDeleteLicense(lic.email)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Registered Users (without license) */}
          <div className="admin-section">
            <h3><Users size={18} /> રજિસ્ટર્ડ યુઝર્સ (લાયસન્સ વગર)</h3>
            <div className="admin-users-grid">
              {users
                .filter(u => !licenses.some(l => l.email === u.email))
                .map(u => (
                  <div key={u.id} className="admin-user-card">
                    <div className="admin-user-avatar-lg">
                      {(u.displayName || u.email)?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="admin-user-details">
                      <div className="admin-user-name">{u.displayName || 'Unknown'}</div>
                      <div className="admin-user-email">{u.email}</div>
                      <div className="admin-user-joined">
                        <Calendar size={12} /> {u.createdAt?.toDate?.()?.toLocaleDateString('gu-IN') || '—'}
                      </div>
                    </div>
                    <button
                      className="admin-btn admin-btn-activate"
                      onClick={() => {
                        setEditingLicense({ email: u.email, userName: u.displayName });
                        setShowAddModal(true);
                      }}
                    >
                      <Crown size={14} /> એક્ટિવેટ
                    </button>
                  </div>
                ))}
              {users.filter(u => !licenses.some(l => l.email === u.email)).length === 0 && (
                <p className="admin-no-data">બધા યુઝર્સ પાસે લાયસન્સ છે અથવા કોઈ નવો યુઝર નથી.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* ─── PRICING SECTION ───────────────────────────────────────── */}
      {activeSection === 'pricing' && (
        <PricingManagerSection pricing={pricing} updatePricing={updatePricing} />
      )}

      {/* Add/Edit License Modal */}
      {showAddModal && (
        <LicenseFormModal
          license={editingLicense}
          pricing={pricing}
          onClose={() => { setShowAddModal(false); setEditingLicense(null); }}
          onSaved={() => { setShowAddModal(false); setEditingLicense(null); fetchLicenses(); }}
        />
      )}
    </div>
  );
}


// ─── License Form Modal ──────────────────────────────────────
function LicenseFormModal({ license, pricing, onClose, onSaved }) {
  const isEdit = !!license?.id;
  const plans = pricing?.plans || DEFAULT_PRICING.plans;
  const getPriceForPlan = (planId) => {
    const found = plans.find(p => p.id === planId);
    return found ? found.price : (planId === 'yearly' ? 1599 : planId === 'six_months' ? 999 : 199);
  };

  const initialPlan = license?.plan || 'monthly';
  const [form, setForm] = useState({
    email: license?.email || '',
    userName: license?.userName || '',
    plan: initialPlan,
    amountPaid: license?.amountPaid !== undefined ? license.amountPaid : getPriceForPlan(initialPlan),
    notes: license?.notes || '',
    status: 'active'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.email.trim()) {
      setError('ઇમેઇલ જરૂરી છે');
      return;
    }
    setSaving(true);
    setError('');

    try {
      const email = form.email.toLowerCase().trim();
      const now = new Date();
      let durationDays = 30;
      if (form.plan === 'six_months') durationDays = 180;
      else if (form.plan === 'yearly') durationDays = 365;
      const durationMs = durationDays * 24 * 60 * 60 * 1000;

      // If renewing an existing active license, extend from current expiry
      let startDate = now;
      if (isEdit && license?.isActive && license?.expiresAt) {
        startDate = license.expiresAt > now ? license.expiresAt : now;
      }

      const expiresAt = new Date(startDate.getTime() + durationMs);

      const licenseData = {
        email,
        userName: form.userName.trim(),
        plan: form.plan,
        status: form.status,
        amountPaid: Number(form.amountPaid) || 0,
        notes: form.notes,
        startedAt: isFirebaseConfigured ? Timestamp.fromDate(isEdit ? (license?.startedAt?.toDate?.() || now) : now) : (isEdit ? (license?.startedAt || now.toISOString()) : now.toISOString()),
        expiresAt: isFirebaseConfigured ? Timestamp.fromDate(expiresAt) : expiresAt.toISOString(),
        updatedAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString(),
        ...(isEdit ? {} : { createdAt: isFirebaseConfigured ? serverTimestamp() : new Date().toISOString() })
      };

      if (isFirebaseConfigured) {
        await setDoc(doc(db, 'licenses', email), licenseData, { merge: true });
      } else {
        const raw = localStorage.getItem('dastavej_mock_licenses');
        const mockLicenses = raw ? JSON.parse(raw) : {};
        mockLicenses[email] = {
          ...licenseData,
          expiresAt: expiresAt.toISOString()
        };
        localStorage.setItem('dastavej_mock_licenses', JSON.stringify(mockLicenses));
      }
      onSaved();
    } catch (err) {
      setError('સેવ કરવામાં ભૂલ: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <div className="sub-modal-overlay" onClick={onClose}>
      <div className="sub-modal admin-license-modal" onClick={e => e.stopPropagation()}>
        <button className="sub-modal-close" onClick={onClose}><XCircle size={20} /></button>

        <div className="sub-modal-header">
          <h2>{isEdit ? '🔄 લાયસન્સ રિન્યુ / એડિટ' : '➕ નવું લાયસન્સ'}</h2>
        </div>

        {error && <div className="auth-error"><AlertTriangle size={14} /> {error}</div>}

        <div className="admin-form">
          <div className="admin-form-group">
            <label><Mail size={14} /> ઇમેઇલ</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="user@example.com"
              disabled={isEdit}
            />
          </div>

          <div className="admin-form-group">
            <label><Users size={14} /> નામ</label>
            <input
              type="text"
              value={form.userName}
              onChange={e => setForm(f => ({ ...f, userName: e.target.value }))}
              placeholder="યુઝરનું નામ"
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label><Crown size={14} /> પ્લાન</label>
              <select value={form.plan} onChange={e => {
                const selectedPlan = e.target.value;
                const price = getPriceForPlan(selectedPlan);
                setForm(f => ({ ...f, plan: selectedPlan, amountPaid: price }));
              }}>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (₹{p.price})
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label>₹ રકમ</label>
              <input
                type="number"
                value={form.amountPaid}
                onChange={e => setForm(f => ({ ...f, amountPaid: e.target.value }))}
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label>📝 નોંધ</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="ચુકવણી રેફરન્સ, GPay ટ્રાન્ઝેક્શન ID..."
              rows={2}
            />
          </div>

          {isEdit && license?.isActive && (
            <div className="admin-renew-notice">
              <CheckCircle size={14} />
              <span>
                હાલનું લાયસન્સ {license.expiresAt?.toLocaleDateString?.('gu-IN')} સુધી એક્ટિવ છે.
                રિન્યુઅલ {form.plan === 'yearly' ? '365' : form.plan === 'six_months' ? '180' : '30'} દિવસ ઉમેરશે.
              </span>
            </div>
          )}
        </div>

        <div className="admin-form-actions">
          <button onClick={onClose} className="sub-close-btn">રદ કરો</button>
          <button onClick={handleSave} className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? <RefreshCw size={16} className="spin" /> : <CheckCircle size={16} />}
            {isEdit ? 'રિન્યુ / અપડેટ' : 'એક્ટિવેટ કરો'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pricing Manager Section ──────────────────────────────────
function PricingManagerSection({ pricing, updatePricing }) {
  const [plans, setPlans] = useState(() => (pricing?.plans ? JSON.parse(JSON.stringify(pricing.plans)) : DEFAULT_PRICING.plans));
  const [upiId, setUpiId] = useState(pricing?.upiId || DEFAULT_PRICING.upiId);
  const [whatsappNumber, setWhatsappNumber] = useState(pricing?.whatsappNumber || DEFAULT_PRICING.whatsappNumber);
  const [offerBanner, setOfferBanner] = useState(pricing?.offerBanner || '');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Synchronize when pricing prop changes
  useEffect(() => {
    if (pricing?.plans) setPlans(JSON.parse(JSON.stringify(pricing.plans)));
    if (pricing?.upiId) setUpiId(pricing.upiId);
    if (pricing?.whatsappNumber) setWhatsappNumber(pricing.whatsappNumber);
    if (pricing?.offerBanner !== undefined) setOfferBanner(pricing.offerBanner);
  }, [pricing]);

  const handlePlanChange = (index, field, value) => {
    setPlans(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: field === 'price' || field === 'days' ? Number(value) || 0 : value
      };
      return updated;
    });
  };

  const handleResetDefaults = () => {
    if (window.confirm('શું તમે ખરેખર ડિફોલ્ટ કિંમતો રીસેટ કરવા માંગો છો?')) {
      setPlans(JSON.parse(JSON.stringify(DEFAULT_PRICING.plans)));
      setUpiId(DEFAULT_PRICING.upiId);
      setWhatsappNumber(DEFAULT_PRICING.whatsappNumber);
      setOfferBanner(DEFAULT_PRICING.offerBanner);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const updatedConfig = {
        plans,
        upiId: upiId.trim(),
        whatsappNumber: whatsappNumber.trim(),
        offerBanner: offerBanner.trim(),
        updatedAt: new Date().toISOString()
      };

      await updatePricing(updatedConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving pricing:', err);
      setError('સેવ કરવામાં ભૂલ: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-pricing-manager">
      <div className="admin-pricing-header">
        <div>
          <h2><IndianRupee size={22} /> પ્લાન અને કિંમત સેટિંગ્સ</h2>
          <p>અહીંથી તમે તમામ પ્રીમિયમ પ્લાનની કિંમતો, ઑફર્સ, UPI ID અને WhatsApp નંબર ડાયનેમિકલી બદલી શકો છો.</p>
        </div>
        <div className="admin-pricing-header-actions">
          <button type="button" onClick={handleResetDefaults} className="admin-btn admin-btn-secondary">
            ડિફોલ્ટ રીસેટ
          </button>
          <button type="button" onClick={handleSave} className="admin-btn admin-btn-primary" disabled={saving}>
            {saving ? <RefreshCw size={16} className="spin" /> : <Save size={16} />}
            {saving ? 'સેવિંગ...' : 'કિંમતો સાચવો'}
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="admin-alert-success">
          <CheckCircle size={18} /> પ્લાન કિંમતો અને સેટિંગ્સ સફળતાપૂર્વક સાચવવામાં આવ્યા! યુઝર્સને હવે નવી કિંમતો જ દેખાશે.
        </div>
      )}

      {error && (
        <div className="auth-error">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Plan Cards Configuration */}
      <div className="admin-pricing-grid">
        {plans.map((plan, idx) => (
          <div key={plan.id} className="admin-plan-card">
            <div className="admin-plan-card-header">
              <span className="admin-plan-badge-preview">
                <Tag size={14} /> {plan.name} ({plan.days} દિવસ)
              </span>
              <span className="admin-plan-id">ID: {plan.id}</span>
            </div>

            <div className="admin-plan-card-body">
              <div className="admin-form-group">
                <label>પ્લાનનું નામ</label>
                <input
                  type="text"
                  value={plan.name}
                  onChange={e => handlePlanChange(idx, 'name', e.target.value)}
                  placeholder="૧ મહિનો"
                />
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>કિંમત (₹)</label>
                  <div className="admin-input-with-icon">
                    <IndianRupee size={15} />
                    <input
                      type="number"
                      value={plan.price}
                      onChange={e => handlePlanChange(idx, 'price', e.target.value)}
                      placeholder="199"
                      min="0"
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>દિવસો (Duration)</label>
                  <input
                    type="number"
                    value={plan.days}
                    onChange={e => handlePlanChange(idx, 'days', e.target.value)}
                    placeholder="30"
                    min="1"
                  />
                </div>
              </div>

              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label>બેજ ટેક્સ્ટ (Badge)</label>
                  <input
                    type="text"
                    value={plan.badge || ''}
                    onChange={e => handlePlanChange(idx, 'badge', e.target.value)}
                    placeholder="દા.ત. લોકપ્રિય / શ્રેષ્ઠ બચત"
                  />
                </div>

                <div className="admin-form-group">
                  <label>બચત મેસેજ (Savings)</label>
                  <input
                    type="text"
                    value={plan.savings || ''}
                    onChange={e => handlePlanChange(idx, 'savings', e.target.value)}
                    placeholder="દા.ત. ₹૨૦૧ બચાવો"
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label>સફિક્સ ટેક્સ્ટ (Suffix)</label>
                <input
                  type="text"
                  value={plan.suffix || ''}
                  onChange={e => handlePlanChange(idx, 'suffix', e.target.value)}
                  placeholder="દા.ત. /મો અથવા /વર્ષ"
                />
              </div>

              <div className="admin-plan-preview-box">
                <div className="admin-plan-preview-label">મોડલમાં આવું દેખાશે:</div>
                <div className="admin-plan-preview-content">
                  <span className="admin-preview-title">{plan.name}</span>
                  <span className="admin-preview-price">₹{plan.price}<span>{plan.suffix || ''}</span></span>
                  {plan.badge && <span className="admin-preview-badge">{plan.badge}</span>}
                  {plan.savings && <span className="admin-preview-savings">{plan.savings}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Payment Details Configuration */}
      <div className="admin-section admin-payment-config-section">
        <h3><Settings size={18} /> UPI અને સંપર્ક વિગતો</h3>
        <p className="admin-section-sub">આ વિગતો પેમેન્ટ સ્કેન અને વોટ્સએપ બટનમાં સીધી ઉપયોગ થશે.</p>

        <div className="admin-payment-config-grid">
          <div className="admin-form-group">
            <label>Google Pay / PhonePe UPI ID</label>
            <input
              type="text"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              placeholder="example@okhdfcbank"
            />
            <small>યુઝર્સ આ UPI ID પર પેમેન્ટ કરી શકશે</small>
          </div>

          <div className="admin-form-group">
            <label>WhatsApp નંબર (સ્ક્રીનશોટ મેળવવા માટે)</label>
            <input
              type="text"
              value={whatsappNumber}
              onChange={e => setWhatsappNumber(e.target.value)}
              placeholder="9574782643"
            />
            <small>દેશ કોડ (+91) વગર 10 આંકડાનો નંબર દાખલ કરો</small>
          </div>

          <div className="admin-form-group" style={{ gridColumn: '1 / -1' }}>
            <label><Percent size={14} /> સ્પેશિયલ ઑફર બેનર (ઓપ્શનલ)</label>
            <input
              type="text"
              value={offerBanner}
              onChange={e => setOfferBanner(e.target.value)}
              placeholder="દા.ત. 💥 દિવાળી સ્પેશિયલ ઑફર: વાર્ષિક પ્લાન પર વધારાની ૨૦% છૂટ!"
            />
            <small>જો આ ભરેલું હશે તો પ્રીમિયમ મોડલની ટોચ પર રંગીન બેનર દેખાશે. ખાલી રાખવાથી બેનર છૂપાઈ જશે.</small>
          </div>
        </div>
      </div>
    </div>
  );
}
