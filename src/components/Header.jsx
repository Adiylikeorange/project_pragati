import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Projects', path: '/projects' },
    { name: 'Sectors', path: '/sectors' },
    { name: 'Risk Monitoring', path: '/risk' },
    { name: 'Early Warnings', path: '/warnings' },
    { name: 'Reports', path: '/reports' }
  ];

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
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
        </div>
      </div>

      <nav style={{ display: 'none', gap: '0.25rem' }} className="desktop-nav">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                color: isActive ? 'white' : 'var(--color-surface-2)'
              }}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 1024px) {
          .desktop-nav { display: flex !important; }
        }
      `}</style>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <input 
          type="search" 
          placeholder="Search projects, IDs..." 
          className="input"
          style={{ 
            width: '200px', 
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.375rem 0.75rem'
          }} 
        />
        
        <div style={{ position: 'relative', cursor: 'pointer', padding: '0.25rem' }}>
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
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', display: 'none' }} className="desktop-user">
            <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Cabinet Secretariat / PMO</span>
            <span style={{ fontSize: '0.65rem', color: 'var(--color-surface-2)', backgroundColor: 'rgba(255,255,255,0.1)', padding: '0.125rem 0.375rem', borderRadius: '4px', marginTop: '0.125rem' }}>Administrator</span>
          </div>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.875rem',
            fontWeight: 'bold'
          }}>
            CS
          </div>
        </div>
        <style>{`
          @media (min-width: 768px) {
            .desktop-user { display: flex !important; }
          }
        `}</style>
      </div>
    </header>
  );
};

export default Header;
