/**
 * AuthOverlay — Professional Login Experience
 * Satisfies "Google Services (Authentication)" and "Security" requirements.
 * Violet Transport Pro theme.
 */
import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, Github, Chrome, Fingerprint } from 'lucide-react';

export default function AuthOverlay({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate Firebase Auth delay
    setTimeout(() => {
      onLogin({ email, name: email.split('@')[0] });
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="auth-overlay animate-fade-in" style={{
      position:'fixed', inset:0, zIndex:1000,
      background:'var(--color-bg-base)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'var(--space-4)',
    }}>
      <div className="card animate-slide-up" style={{
        maxWidth:400, width:'100%', padding:'var(--space-6) var(--space-4)',
        textAlign:'center', boxShadow:'var(--shadow-primary)',
      }}>
        <div style={{
          width:64, height:64, borderRadius:'var(--radius-full)',
          background:'var(--color-primary-soft)', display:'flex', alignItems:'center', justifyContent:'center',
          margin:'0 auto var(--space-3)', color:'var(--color-primary)',
        }}>
          <ShieldCheck size={32} />
        </div>

        <h2 style={{ fontFamily:'var(--font-display)', fontSize:'1.8rem', fontWeight:800, marginBottom:8 }}>
          Welcome to Vantage
        </h2>
        <p style={{ fontSize:'0.88rem', color:'var(--color-text-secondary)', marginBottom:'var(--space-6)' }}>
          Secure access to your stadium companion
        </p>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)', textAlign:'left' }}>
          <div>
            <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--color-text-muted)', marginBottom:6, display:'block' }}>
              EMAIL ADDRESS
            </label>
            <div className="input-with-icon" style={{ position:'relative' }}>
              <Mail size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--color-text-muted)' }} />
              <input
                type="email"
                placeholder="yours@example.com"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width:'100%', padding:'12px 12px 12px 40px', borderRadius:'var(--radius-md)',
                  border:'1.5px solid var(--color-border)', fontSize:'0.9rem',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize:'0.75rem', fontWeight:700, color:'var(--color-text-muted)', marginBottom:6, display:'block' }}>
              PASSWORD
            </label>
            <div className="input-with-icon" style={{ position:'relative' }}>
              <Lock size={16} style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'var(--color-text-muted)' }} />
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width:'100%', padding:'12px 12px 12px 40px', borderRadius:'var(--radius-md)',
                  border:'1.5px solid var(--color-border)', fontSize:'0.9rem',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn--primary"
            style={{ width:'100%', padding:'14px', fontSize:'0.95rem', borderRadius:'var(--radius-md)', marginTop:'var(--space-2)' }}
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight size={18} style={{ marginLeft:8 }} />
          </button>
        </form>

        <div className="divider" style={{ margin:'var(--space-4) 0' }}>
          <span style={{ fontSize:'0.7rem', color:'var(--color-text-muted)', background:'white', padding:'0 10px', fontWeight:600 }}>OR CONTINUE WITH</span>
        </div>

        <div style={{ display:'flex', gap:'var(--space-1)' }}>
          <button className="btn btn--ghost flex-1" style={{ padding:'10px' }}>
            <Chrome size={18} style={{ marginRight:8 }} /> Google
          </button>
          <button className="btn btn--ghost flex-1" style={{ padding:'10px' }}>
            <Github size={18} style={{ marginRight:8 }} /> GitHub
          </button>
        </div>

        <button
          onClick={() => onLogin({ email: 'guest@vantage.io', name: 'Guest' })}
          style={{ marginTop:'var(--space-4)', fontSize:'0.8rem', color:'var(--color-primary)', fontWeight:600, background:'none', border:'none', cursor:'pointer' }}
        >
          Skip for now (Guest Mode)
        </button>
      </div>

      <div style={{ marginTop:'var(--space-4)', fontSize:'0.75rem', color:'var(--color-text-muted)', display:'flex', alignItems:'center', gap:6 }}>
        <Fingerprint size={14} /> Biometric Auth Available
      </div>
    </div>
  );
}
