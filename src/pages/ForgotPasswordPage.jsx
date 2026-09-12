import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Request failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-surface)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '2rem', color: 'var(--color-primary)', letterSpacing: '0.1em' }}>PRAGATI</span>
          </Link>
        </div>

        <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', padding: '2rem', border: '1px solid var(--color-border)' }}>
          {sent ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', background: 'var(--color-on-track-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.75rem', color: 'var(--color-on-track)' }}>mark_email_read</span>
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>Check your email</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                Check your inbox — it may take a minute.
              </p>
              <Link to="/login" style={{ display: 'inline-block', padding: '0.625rem 1.5rem', background: 'var(--color-primary)', color: 'white', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>Reset your password</h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                Enter your account email and we'll send you a reset link.
              </p>

              {error && (
                <div style={{ background: 'var(--color-critical-bg)', border: '1px solid var(--color-critical-border)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-critical)' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.375rem' }}>
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@ministry.gov.in"
                    style={{ width: '100%', padding: '0.625rem 0.75rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '0.75rem', background: loading ? '#94A3B8' : 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
                >
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
              <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.8125rem' }}>
                <Link to="/login" style={{ color: 'var(--color-secondary)' }}>← Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
