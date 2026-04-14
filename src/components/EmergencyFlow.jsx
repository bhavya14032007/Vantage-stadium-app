/**
 * EmergencyFlow — Emergency exit strategy guide.
 * A toggled overlay showing nearest clear exits,
 * live shuttle wait times, and step-by-step guidance.
 */
import { useState } from 'react';
import { AlertTriangle, ArrowRight, Bus, Navigation2, CheckCircle2, X } from 'lucide-react';
import { EXITS } from '../hooks/useStadiumData';

const MY_POS = { x: 195, y: 215 };

function exitColor(level) {
  if (level === 'clear') return 'var(--color-green)';
  if (level === 'busy')  return 'var(--color-amber)';
  return 'var(--color-red)';
}
function exitBg(level) {
  if (level === 'clear') return 'rgba(0,255,136,0.08)';
  if (level === 'busy')  return 'rgba(255,183,0,0.08)';
  return 'rgba(255,61,90,0.08)';
}
function levelLabel(level) {
  if (level === 'clear') return 'CLEAR';
  if (level === 'busy')  return 'BUSY';
  return 'AVOID';
}

function svgDist(exit) {
  return Math.round(Math.sqrt(Math.pow(exit.x - MY_POS.x, 2) + Math.pow(exit.y - MY_POS.y, 2)) / 20);
}

const STEPS_CLEAR = [
  'Stay calm and follow lit green exit signs.',
  'Move at a steady walk — do not run.',
  'Proceed to Gate East (closest clear exit).',
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

  if (!active) {
    return (
      <section aria-label="Emergency Flow Mode">
        <div className="section-header">
          <span className="section-title">Emergency Flow</span>
        </div>
        <div
          className="card"
          style={{ textAlign:'center', padding:'var(--space-4) var(--space-2)' }}
        >
          <div style={{
            width:56, height:56, borderRadius:'var(--radius-full)',
            background:'var(--color-red-glow)', display:'flex',
            alignItems:'center', justifyContent:'center',
            margin:'0 auto var(--space-2)',
          }}>
            <AlertTriangle size={26} color="var(--color-red)" />
          </div>
          <p style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:8 }}>Emergency Exit Mode</p>
          <p style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)', marginBottom:'var(--space-3)' }}>
            Activate to instantly see the clearest, fastest route out of the venue with live shuttle times.
          </p>
          <button
            className="btn btn--danger w-full"
            onClick={onToggle}
            id="activate-emergency-btn"
            aria-label="Activate emergency flow mode"
          >
            <AlertTriangle size={15} /> Activate Emergency Mode
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="animate-emergency"
      aria-label="Emergency Flow Mode — Active"
      style={{ borderRadius:'var(--radius-lg)', overflow:'hidden' }}
    >
      {/* Alert banner */}
      <div style={{
        background:'var(--color-red)',
        padding:'var(--space-1) var(--space-2)',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        borderRadius:'var(--radius-lg) var(--radius-lg) 0 0',
      }}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} color="white" className="animate-pulse" />
          <span style={{ fontFamily:'var(--font-display)', fontSize:'0.7rem', fontWeight:700, letterSpacing:'0.12em', color:'white' }}>
            EMERGENCY FLOW ACTIVE
          </span>
        </div>
        <button
          onClick={onToggle}
          style={{ color:'rgba(255,255,255,0.8)', background:'rgba(255,255,255,0.15)', borderRadius:'var(--radius-sm)', padding:'4px 8px', fontSize:'0.7rem', fontWeight:600 }}
          aria-label="Deactivate emergency mode"
          id="deactivate-emergency-btn"
        >
          <X size={12} style={{ display:'inline', marginRight:4 }} />
          Deactivate
        </button>
      </div>

      <div style={{ background:'var(--color-bg-card)', borderRadius:'0 0 var(--radius-lg) var(--radius-lg)', padding:'var(--space-2)' }}>

        {/* Recommended exit hero */}
        <div
          className="card"
          style={{ borderColor:'rgba(0,255,136,0.4)', background:'rgba(0,255,136,0.07)', marginBottom:'var(--space-2)', padding:'var(--space-2)' }}
        >
          <div className="flex items-center gap-1" style={{ marginBottom:6 }}>
            <span className="badge badge--green"><CheckCircle2 size={9} /> Recommended Route</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontWeight:900, fontSize:'1.1rem', color:'var(--color-green)' }}>{recommended.label}</p>
              <p style={{ fontSize:'0.75rem', color:'var(--color-text-secondary)', marginTop:2 }}>
                ~{svgDist(recommended)} min walk · Shuttle: {recommended.shuttleWait} min wait
              </p>
            </div>
            <div style={{ textAlign:'right' }}>
              <Navigation2 size={28} color="var(--color-green)" />
            </div>
          </div>
        </div>

        {/* Exit Mini Map */}
        <div
          className="card"
          style={{ padding:0, overflow:'hidden', background:'#090d12', marginBottom:'var(--space-2)' }}
        >
          <svg viewBox="0 0 400 440" style={{ width:'100%', height:'auto', display:'block' }}
            role="img" aria-label="Emergency exit map">
            <rect width="400" height="440" fill="#090d12" />

            {/* Tinted red overlay for emergency */}
            <rect width="400" height="440" fill="rgba(255,61,90,0.04)" />

            {/* Stadium outline */}
            <rect x="18" y="18" width="364" height="404" rx="22"
              fill="none" stroke="rgba(255,61,90,0.2)" strokeWidth="2" strokeDasharray="6 4"/>

            {/* Pitch */}
            <rect x="130" y="120" width="140" height="210" rx="10"
              fill="rgba(255,61,90,0.05)" stroke="rgba(255,61,90,0.1)" strokeWidth="1" />

            {/* Route lines to exits */}
            {sortedExits.map((ex, i) => (
              <line key={`rl-${ex.id}`}
                x1={MY_POS.x} y1={MY_POS.y}
                x2={ex.x} y2={ex.y}
                stroke={exitColor(ex.clearLevel)}
                strokeWidth={ex.id === recommended.id ? 2.5 : 1}
                strokeDasharray={ex.id === recommended.id ? '8 4' : '4 5'}
                opacity={ex.id === recommended.id ? 0.8 : 0.3}
              />
            ))}

            {/* Exit markers */}
            {sortedExits.map(ex => (
              <g key={ex.id}
                role="button"
                onClick={() => setSelectedExit(selectedExit === ex.id ? null : ex.id)}
                style={{ cursor:'pointer' }}
                aria-label={`${ex.label}: ${ex.clearLevel}, shuttle ${ex.shuttleWait} min`}
              >
                <circle cx={ex.x} cy={ex.y} r="18"
                  fill={exitBg(ex.clearLevel)} stroke={exitColor(ex.clearLevel)} strokeWidth="2" />
                <text x={ex.x} y={ex.y+4} textAnchor="middle"
                  fontSize="9" fontWeight="800" fill={exitColor(ex.clearLevel)} fontFamily="Orbitron, sans-serif">
                  EXIT
                </text>
                <text x={ex.x} y={ex.y-22} textAnchor="middle" fontSize="7.5" fill={exitColor(ex.clearLevel)} fontWeight="600">
                  {ex.clearLevel === 'clear' ? '✓' : ex.clearLevel === 'busy' ? '⚠' : '✗'}
                </text>
                {ex.id === recommended.id && (
                  <circle cx={ex.x} cy={ex.y} r="26"
                    fill="none" stroke="var(--color-green)" strokeWidth="1.5"
                    opacity="0.4" className="animate-pulse" />
                )}
              </g>
            ))}

            {/* User Position */}
            <circle cx={MY_POS.x} cy={MY_POS.y} r="9" fill="var(--color-red)" opacity="0.9" />
            <circle cx={MY_POS.x} cy={MY_POS.y} r="17" fill="none"
              stroke="var(--color-red)" strokeWidth="2" opacity="0.35" className="animate-pulse" />
            <text x={MY_POS.x} y={MY_POS.y+4} textAnchor="middle" fontSize="9">📍</text>
          </svg>
        </div>

        {/* Exit List */}
        <div className="flex flex-col gap-2" style={{ marginBottom:'var(--space-2)' }}>
          <p style={{ fontSize:'0.65rem', color:'var(--color-text-muted)', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>
            All Exits — Sorted by Clearance
          </p>
          {sortedExits.map(ex => (
            <article
              key={ex.id}
              className="card"
              style={{ padding:'var(--space-1) var(--space-2)', borderColor: ex.id === recommended.id ? 'rgba(0,255,136,0.3)' : 'var(--color-border)', background: exitBg(ex.clearLevel) }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ fontWeight:700, fontSize:'0.85rem' }}>{ex.label}</span>
                  <span
                    className="badge"
                    style={{ background: exitBg(ex.clearLevel), color: exitColor(ex.clearLevel), fontSize:'0.58rem' }}
                  >
                    {levelLabel(ex.clearLevel)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize:'0.7rem', color:'var(--color-text-secondary)' }}>
                    <Bus size={10} style={{ display:'inline', marginRight:3 }} />{ex.shuttleWait}m
                  </span>
                  <span style={{ fontSize:'0.7rem', color:'var(--color-text-secondary)' }}>
                    ~{svgDist(ex)}m walk
                  </span>
                  {ex.id === recommended.id && (
                    <CheckCircle2 size={14} color="var(--color-green)" />
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Safety Steps */}
        <div className="card" style={{ borderColor:'rgba(255,183,0,0.2)', background:'rgba(255,183,0,0.05)' }}>
          <p style={{ fontSize:'0.7rem', fontWeight:700, color:'var(--color-amber)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'var(--space-1)' }}>
            Safety Steps
          </p>
          <ol style={{ paddingLeft:'var(--space-3)', display:'flex', flexDirection:'column', gap:6 }}>
            {STEPS_CLEAR.map((step, i) => (
              <li key={i} style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)' }}>
                <ArrowRight size={10} color="var(--color-amber)" style={{ display:'inline', marginRight:6, verticalAlign:'middle', flexShrink:0 }} />
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
