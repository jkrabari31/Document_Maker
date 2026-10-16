import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Crown, Shield, Clock, ChevronDown, Settings } from 'lucide-react';

export default function UserProfileMenu({ onOpenAdmin }) {
  const { currentUser, license, isPremium, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!currentUser) return null;

  const initials = (currentUser.displayName || currentUser.email || '?')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <div className="user-profile-menu" ref={menuRef}>
      <button 
        type="button"
        className="user-profile-trigger" 
        onClick={() => setOpen(!open)}
        title={`${currentUser.displayName || currentUser.email} — પ્રોફાઇલ અને લૉગઆઉટ મેનુ`}
      >
        <div className={`user-avatar-sm ${isPremium() ? 'avatar-premium' : ''}`}>
          {initials}
          {isPremium() && <Crown size={10} className="avatar-crown" />}
        </div>
        <div className="header-user-info-chip">
          <span className="header-user-name">
            {currentUser.displayName || currentUser.email?.split('@')[0]}
          </span>
          <span className={`header-plan-badge ${isPremium?.() ? 'plan-badge-pro' : 'plan-badge-free'}`}>
            {isPremium?.() ? (
              <>
                <Crown size={10} /> PRO {license?.daysRemaining ? `(${license.daysRemaining}d)` : ''}
              </>
            ) : (
              'FREE'
            )}
          </span>
        </div>
        <ChevronDown size={14} className={`chevron ${open ? 'chevron-open' : ''}`} />
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-header">
            <div className={`user-avatar-lg ${isPremium() ? 'avatar-premium' : ''}`}>
              {initials}
            </div>
            <div>
              <div className="user-dropdown-name">{currentUser.displayName || 'User'}</div>
              <div className="user-dropdown-email">{currentUser.email}</div>
            </div>
          </div>

          {/* License Status */}
          <div className={`user-license-status ${isPremium() ? 'license-active' : 'license-free'}`}>
            {isPremium() ? (
              <>
                <Crown size={14} />
                <span>
                  પ્રીમિયમ • {license?.daysRemaining} દિવસ બાકી
                </span>
              </>
            ) : license && !license.isActive ? (
              <>
                <Clock size={14} />
                <span>સબ્સ્ક્રિપ્શન સમાપ્ત</span>
              </>
            ) : (
              <>
                <User size={14} />
                <span>ફ્રી પ્લાન</span>
              </>
            )}
          </div>

          <div className="user-dropdown-divider" />

          {/* Admin link (only for admin users) */}
          {onOpenAdmin && (
            <button className="user-dropdown-item" onClick={() => { setOpen(false); onOpenAdmin(); }}>
              <Shield size={16} />
              <span>ઍડમિન પોર્ટલ</span>
            </button>
          )}

          <button className="user-dropdown-item user-dropdown-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>લૉગઆઉટ</span>
          </button>
        </div>
      )}
    </div>
  );
}
