import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      backgroundColor: 'var(--color-surface-1)',
      borderTop: '1px solid var(--color-border)',
      padding: '1.5rem',
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          justifyContent: 'space-between'
        }} className="footer-top">
          <div style={{ maxWidth: '600px' }}>
            <p className="text-body-sm" style={{ fontWeight: 500, color: 'var(--color-text)' }}>
              Official Command Portal of the National Infrastructure Monitoring Program.
              <br />
              Supervised by the Cabinet Secretariat & Prime Minister's Office.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="#" className="text-body-sm" style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>Security Directives</a>
            <a href="#" className="text-body-sm" style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>Inter-Ministerial Helpdesk</a>
            <a href="#" className="text-body-sm" style={{ color: 'var(--color-secondary)', fontWeight: 500 }}>Audit Log</a>
          </div>
        </div>
        
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
          <p className="text-body-sm text-text-muted" style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
            Last synchronized: Today, 08:30 IST | NIC-CERT Compliant | Encrypted Node IND-DEL-04
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .footer-top {
            flex-direction: row !important;
            align-items: flex-end;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
