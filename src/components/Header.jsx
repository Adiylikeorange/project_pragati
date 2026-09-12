import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Sectors', path: '/sectors' },
    { name: 'Risk Monitoring', path: '/risk' },
    { name: 'Early Warnings', path: '/warnings' },
    { name: 'AI Intelligence', path: '/intelligence' },
    { name: 'Reports', path: '/reports' },
    { name: '⚡ AI Test Lab', path: '/test' },
  ];

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'CS';

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      backgroundColor: 'var(--color-primary)',
      color: 'white',
      padding: '0 1.5rem',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: 'var(--shadow-md)'
    }}>
      {/* Brand & Mobile Hamburger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={() => setMobileMenuOpen(prev => !prev)}
          className="lg:hidden"
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            display: 'flex',
            cursor: 'pointer',
            padding: '4px'
          }}
          aria-label="Toggle navigation menu"
        >
          <span className="material-symbols-outlined text-2xl">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>

        <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', flexDirection: 'column' }}>
          <span style={{ 
            fontFamily: 'var(--font-heading)', 
            fontWeight: 700, 
            fontSize: '1.25rem',
            letterSpacing: '0.05em'
          }}>
            PRAGATI
          </span>
          <span style={{ 
            fontSize: '0.65rem', 
            textTransform: 'uppercase', 
            color: 'var(--color-surface-2)',
            letterSpacing: '0.05em'
          }}>
            Infrastructure Project Monitoring
          </span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <nav style={{ display: 'none', gap: '0.25rem' }} className="desktop-nav">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              style={{
                padding: '0.5rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-surface-2)',
                textDecoration: 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link
          to="/warnings"
          style={{ position: 'relative', cursor: 'pointer', padding: '0.25rem', color: 'white', display: 'flex' }}
          title="Active Risk Warnings"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'var(--color-critical)',
            color: 'white',
            fontSize: '0.6rem',
            fontWeight: 'bold',
            borderRadius: '999px',
            width: '14px',
            height: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translate(25%, -25%)'
          }}>3</span>
        </Link>

        {/* User profile / auth actions */}
        {isAuthenticated ? (
          <div style={{ position: 'relative' }}>
            <div 
              onClick={() => setUserDropdownOpen(prev => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderLeft: '1px solid rgba(255,255,255,0.2)',
                paddingLeft: '1rem',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', display: 'none' }} className="desktop-user">
                <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{user?.full_name || 'Authorized Official'}</span>
                <span style={{ 
                  fontSize: '0.65rem', 
                  color: 'var(--color-surface-2)', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  padding: '0.125rem 0.375rem', 
                  borderRadius: '4px', 
                  marginTop: '0.125rem' 
                }}>
                  {user?.role || user?.organization || 'PRAGATI User'}
                </span>
              </div>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                boxShadow: '0 0 0 2px rgba(255,255,255,0.2)'
              }}>
                {initials}
              </div>
            </div>

            {/* Dropdown Menu */}
            {userDropdownOpen && (
              <div 
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '210px',
                  backgroundColor: 'white',
                  color: 'var(--color-text)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid var(--color-border)',
                  padding: '0.5rem 0',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)' }}>{user?.full_name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                </div>
                <Link
                  to="/account"
                  onClick={() => setUserDropdownOpen(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-text)',
                    textDecoration: 'none'
                  }}
                  className="hover:bg-slate-50"
                >
                  <span className="material-symbols-outlined text-base">manage_accounts</span>
                  My Account & Settings
                </Link>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-critical)',
                    background: 'none',
                    border: 'none',
                    borderTop: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    marginTop: '0.25rem'
                  }}
                  className="hover:bg-red-50"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Link
              to="/login"
              style={{
                fontSize: '0.85rem',
                color: 'white',
                padding: '0.35rem 0.75rem',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              style={{
                fontSize: '0.85rem',
                backgroundColor: 'white',
                color: 'var(--color-primary)',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 700
              }}
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden"
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(10, 37, 64, 0.98)',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            zIndex: 99
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: '0.75rem 1rem',
                    fontSize: '1rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    color: 'white',
                    textDecoration: 'none'
                  }}
                >
                  {link.name}
                </Link>
              );
            })}
          </div>

          {isAuthenticated ? (
            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.2)' }}>
              <Link
                to="/account"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600
                }}
              >
                <span className="material-symbols-outlined">manage_accounts</span>
                My Account
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1rem',
                  color: '#f87171',
                  background: 'none',
                  border: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span className="material-symbols-outlined">logout</span>
                Sign Out
              </button>
            </div>
          ) : (
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid white',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 600
                }}
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  textAlign: 'center',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  color: 'var(--color-primary)',
                  textDecoration: 'none',
                  fontWeight: 700
                }}
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .desktop-nav { display: flex !important; }
        }
        @media (min-width: 768px) {
          .desktop-user { display: flex !important; }
        }
      `}</style>
    </header>
  );
};

export default Header;
