/**
 * EmergencyFlow — Violet-themed emergency exit strategy.
 * Toggleable overlay with sorted exits, shuttle times, safety steps.
 */
import { useState } from 'react';
import { AlertTriangle, CheckCircle2, Bus, Navigation2, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { EXITS } from '../hooks/useStadiumData';

const MY_POS = { x: 195, y: 215 };

function exitColor(level) {
  if (level === 'clear') return 'var(--color-green)';
  if (level === 'busy')  return 'var(--color-amber)';
  return 'var(--color-red)';
}
function exitBg(level) {
  if (level === 'clear') return 'rgba(5,150,105,0.08)';
  if (level === 'busy')  return 'rgba(217,119,6,0.08)';
  return 'rgba(220,38,38,0.08)';
}
function exitBorder(level) {
  if (level === 'clear') return 'rgba(5,150,105,0.3)';
  if (level === 'busy')  return 'rgba(217,119,6,0.3)';
  return 'rgba(220,38,38,0.3)';
}
function levelLabel(level) {
  if (level === 'clear') return 'CLEAR';
  if (level === 'busy')  return 'BUSY';
  return 'AVOID';
}
function levelBadge(level) {
  if (level === 'clear') return 'badge--green';
  if (level === 'busy')  return 'badge--amber';
  return 'badge--red';
}

function svgDist(exit) {
  return Math.round(Math.sqrt(Math.pow(exit.x - MY_POS.x, 2) + Math.pow(exit.y - MY_POS.y, 2)) / 20);
}

const STEPS = [
  'Stay calm — follow the lit green exit signs.',
  'Move at a steady walk — do not run.',
  'Proceed to Gate East (nearest clear exit).',
  'Follow steward instructions at all times.',
  'Do not re-enter the venue once outside.',
];

export default function EmergencyFlow({ active, onToggle }) {
  const [selectedExit, setSelectedExit] = useState(null);

  const sortedExits = [...EXITS].sort((a, b) => {
    const order = { clear: 0, busy: 1, avoid: 2 };
    return (order[a.clearLevel] - order[b.clearLevel]) || svgDist(a) - svgDist(b);
  });
  const recommended = sortedExits.find(e => e.clearLevel === 'clear') || sortedExits[0];

  /* ── Inactive state ── */
  if (!active) {
    return (
      <section aria-label="Emergency Flow Mode">
        <div className="section-header">
          <span className="section-title">Emergency Flow</span>
        </div>

        {/* Info card */}
        <div className="card" style={{ textAlign:'center', padding:'var(--space-4) var(--space-3)' }}>
          <div style={{
            width:64, height:64, borderRadius:'var(--radius-full)',
            background:'var(--color-red-soft)', display:'flex',
            alignItems:'center', justifyContent:'center',
            margin:'0 auto var(--space-2)',
          }}>
            <ShieldAlert size={30} color="var(--color-red)" />
          </div>
          <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.1rem', marginBottom:8 }}>
            Emergency Exit Mode
          </p>
          <p style={{ fontSize:'0.82rem', color:'var(--color-text-secondary)', marginBottom:'var(--space-3)', lineHeight:1.7 }}>
            Activate for instant access to the clearest exit routes, live shuttle wait times, and step-by-step safety guidance.
          </p>

          {/* Preview exit list */}
          <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-1)', marginBottom:'var(--space-3)', textAlign:'left' }}>
            {sortedExits.slice(0, 2).map(ex => (
              <div key={ex.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 12px', background:'var(--color-bg-base)', borderRadius:'var(--radius-md)' }}>
                <span style={{ fontSize:'0.8rem', fontWeight:600, color:'var(--color-text-primary)' }}>{ex.label}</span>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span className={`badge ${levelBadge(ex.clearLevel)}`} style={{ fontSize:'0.58rem' }}>{levelLabel(ex.clearLevel)}</span>
                  <span style={{ fontSize:'0.72rem', color:'var(--color-text-muted)' }}>
                    <Bus size={9} style={{ display:'inline', marginRight:3 }} />{ex.shuttleWait}m
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            className="btn btn--danger w-full"
            onClick={onToggle}
            id="activate-emergency-btn"
            style={{ fontSize:'0.9rem', padding:'14px', borderRadius:'var(--radius-md)' }}
          >
            <AlertTriangle size={16} /> Activate Emergency Mode
          </button>
        </div>
      </section>
    );
  }

  /* ── Active state ── */
  return (
    <section aria-label="Emergency Flow Mode — Active" className="animate-emergency">

      {/* Alert banner */}
      <div style={{
        background: 'linear-gradient(135deg, #DC2626, #EF4444)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-2) var(--space-3)',
        marginBottom: 'var(--space-2)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        boxShadow: 'var(--shadow-red)',
      }}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} color="white" className="animate-pulse" />
          <div>
            <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'0.85rem', color:'white', letterSpacing:'0.04em' }}>
              EMERGENCY MODE ACTIVE
            </p>
            <p style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.75)' }}>
              Follow the green route to your nearest clear exit
            </p>
          </div>
        </div>
        <button
          onClick={onToggle}
          style={{ background:'rgba(255,255,255,0.2)', border:'1px solid rgba(255,255,255,0.3)', borderRadius:'var(--radius-sm)', padding:'6px 10px', color:'white', fontSize:'0.72rem', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}
          id="deactivate-emergency-btn"
        >
          <X size={12} /> Dismiss
        </button>
      </div>

      {/* Recommended exit hero */}
      <div className="card" style={{ borderColor:'rgba(5,150,105,0.4)', background:'rgba(5,150,105,0.06)', marginBottom:'var(--space-2)' }}>
        <div className="flex items-center gap-1" style={{ marginBottom:8 }}>
          <span className="badge badge--green"><CheckCircle2 size={9} /> Recommended Route</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.2rem', color:'var(--color-green)' }}>
              {recommended.label}
            </p>
            <p style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)', marginTop:3 }}>
              ~{svgDist(recommended)} min walk ·{' '}
              <Bus size={11} style={{ display:'inline', marginRight:3 }} />
              Shuttle: {recommended.shuttleWait} min
            </p>
          </div>
          <div style={{
            width:52, height:52, borderRadius:'var(--radius-full)',
            background:'var(--color-green-soft)', display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <Navigation2 size={24} color="var(--color-green)" />
          </div>
        </div>
      </div>

      {/* SVG Exit Map */}
      <div className="card" style={{ padding:0, overflow:'hidden', background:'#F8F7FF', marginBottom:'var(--space-2)' }}>
        <svg viewBox="0 0 400 440" style={{ width:'100%', height:'auto', display:'block' }}
          role="img" aria-label="Emergency exit map">
          <rect width="400" height="440" fill="#F8F7FF" />
          {/* Red tint overlay */}
          <rect width="400" height="440" fill="rgba(220,38,38,0.02)" />
          {/* Stadium ring */}
          <rect x="18" y="18" width="364" height="404" rx="22"
            fill="none" stroke="rgba(220,38,38,0.15)" strokeWidth="1.5" strokeDasharray="6 4" />
          {/* Pitch */}
          <rect x="130" y="110" width="140" height="220" rx="12"
            fill="rgba(220,38,38,0.03)" stroke="rgba(220,38,38,0.08)" strokeWidth="1" />

          {/* Route lines */}
          {sortedExits.map(ex => (
            <line key={`rl-${ex.id}`}
              x1={MY_POS.x} y1={MY_POS.y} x2={ex.x} y2={ex.y}
              stroke={exitColor(ex.clearLevel)}
              strokeWidth={ex.id === recommended.id ? 2.5 : 1.2}
              strokeDasharray={ex.id === recommended.id ? '9 5' : '4 5'}
              opacity={ex.id === recommended.id ? 0.9 : 0.35}
            />
          ))}

          {/* Exit markers */}
          {sortedExits.map(ex => (
            <g key={ex.id}
              role="button"
              onClick={() => setSelectedExit(selectedExit === ex.id ? null : ex.id)}
              style={{ cursor:'pointer' }}
              aria-label={`${ex.label}: ${ex.clearLevel}, shuttle wait ${ex.shuttleWait} min`}
            >
              {ex.id === recommended.id && (
                <circle cx={ex.x} cy={ex.y} r="28"
                  fill="none" stroke={exitColor(ex.clearLevel)}
                  strokeWidth="1.5" opacity="0.3" className="animate-pulse" />
              )}
              {/* Shadow */}
              <circle cx={ex.x+1} cy={ex.y+2} r="17" fill="rgba(0,0,0,0.07)" />
              <circle cx={ex.x} cy={ex.y} r="17"
                fill={exitBg(ex.clearLevel)} stroke={exitColor(ex.clearLevel)} strokeWidth="2" />
              <text x={ex.x} y={ex.y + 4} textAnchor="middle"
                fontSize="8.5" fontWeight="900" fill={exitColor(ex.clearLevel)}
                fontFamily="Plus Jakarta Sans, sans-serif">EXIT</text>
              <text x={ex.x} y={ex.y - 22} textAnchor="middle"
                fontSize="9" fill={exitColor(ex.clearLevel)} fontWeight="700">
                {ex.clearLevel === 'clear' ? '✓' : ex.clearLevel === 'busy' ? '⚠' : '✗'}
              </text>
            </g>
          ))}

          {/* User */}
          <circle cx={MY_POS.x+1} cy={MY_POS.y+2} r="11" fill="rgba(0,0,0,0.1)" />
          <circle cx={MY_POS.x} cy={MY_POS.y} r="11" fill="#DC2626" opacity="0.95" />
          <circle cx={MY_POS.x} cy={MY_POS.y} r="19" fill="none"
            stroke="#DC2626" strokeWidth="2" opacity="0.25" className="animate-pulse" />
          <text x={MY_POS.x} y={MY_POS.y+5} textAnchor="middle" fontSize="10">📍</text>
        </svg>
      </div>

      {/* Exit list */}
      <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-1)', marginBottom:'var(--space-2)' }}>
        <p style={{ fontSize:'0.65rem', color:'var(--color-text-muted)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>
          All Exits — Sorted by Clearance
        </p>
        {sortedExits.map(ex => (
          <div key={ex.id} className="card"
            style={{ padding:'10px var(--space-2)', borderColor: exitBorder(ex.clearLevel), background: exitBg(ex.clearLevel), borderLeft:`4px solid ${exitColor(ex.clearLevel)}` }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span style={{ fontWeight:700, fontSize:'0.88rem' }}>{ex.label}</span>
                <span className={`badge ${levelBadge(ex.clearLevel)}`} style={{ fontSize:'0.58rem' }}>
                  {levelLabel(ex.clearLevel)}
                </span>
                {ex.id === recommended.id && (
                  <CheckCircle2 size={13} color="var(--color-green)" />
                )}
              </div>
              <div className="flex items-center gap-3">
                <span style={{ fontSize:'0.72rem', color:'var(--color-text-secondary)' }}>
                  <Bus size={10} style={{ display:'inline', marginRight:3 }} />{ex.shuttleWait}m
                </span>
                <span style={{ fontSize:'0.72rem', color:'var(--color-text-muted)' }}>
                  ~{svgDist(ex)}m walk
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Safety Steps */}
      <div className="card" style={{ borderColor:'rgba(217,119,6,0.25)', background:'rgba(217,119,6,0.04)' }}>
        <div className="flex items-center gap-2" style={{ marginBottom:'var(--space-1)' }}>
          <ShieldAlert size={15} color="var(--color-amber)" />
          <p style={{ fontSize:'0.72rem', fontWeight:800, color:'var(--color-amber)', letterSpacing:'0.06em', textTransform:'uppercase' }}>
            Safety Steps
          </p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          {STEPS.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span style={{
                width:20, height:20, borderRadius:'50%', flexShrink:0,
                background:'rgba(217,119,6,0.12)', color:'var(--color-amber)',
                fontWeight:800, fontSize:'0.7rem',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>{i + 1}</span>
              <p style={{ fontSize:'0.8rem', color:'var(--color-text-secondary)', lineHeight:1.5 }}>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
