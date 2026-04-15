/**
 * LiveWaitAnalytics — Violet-themed wait time dashboard.
 */
import { useState } from 'react';
import { Clock, Lightbulb, TrendingDown, MapPin, Droplets, ShoppingBag, ChevronRight, Sparkles } from 'lucide-react';

function WaitBar({ value, max = 20 }) {
  const pct = Math.min(100, (value / max) * 100);
  const cls = value > 10 ? 'red' : value > 5 ? 'amber' : 'green';
  return (
    <div className="progress-bar" style={{ marginTop:6 }}>
      <div className={`progress-bar__fill progress-bar__fill--${cls}`} style={{ width:`${pct}%` }}
        role="progressbar" aria-valuenow={value} aria-valuemax={max} />
    </div>
  );
}

const LABELS = {
  rest_A: 'Restroom — North Wing',
  rest_B: 'Restroom — South Wing',
  con_A:  'Concession Stand 1',
  con_B:  'Concession Kiosk 2',
};
const TYPES = { rest_A:'restroom', rest_B:'restroom', con_A:'concession', con_B:'concession' };
const ICONS = { restroom: Droplets, concession: ShoppingBag };

function waitColor(v) {
  if (v > 10) return 'var(--color-red)';
  if (v > 5)  return 'var(--color-amber)';
  return 'var(--color-green)';
}
function waitLabel(v) {
  if (v > 10) return 'Long Wait';
  if (v > 5)  return 'Moderate';
  return 'Walk-in Ready';
}
function waitChipClass(v) {
  if (v > 10) return 'badge--red';
  if (v > 5)  return 'badge--amber';
  return 'badge--green';
}

export default function LiveWaitAnalytics({ waitTimes }) {
  const [expanded, setExpanded] = useState(null);

  const avgRestroom   = Math.round((waitTimes.rest_A.current + waitTimes.rest_B.current) / 2);
  const avgConcession = Math.round((waitTimes.con_A.current  + waitTimes.con_B.current)  / 2);

  return (
    <section aria-label="Live Wait Analytics">
      {/* Header */}
      <div className="section-header">
        <span className="section-title">Live Queues</span>
        <span className="live-indicator">
          <span className="live-indicator__dot" aria-hidden="true" />
          Real-time
        </span>
      </div>

      {/* Summary cards */}
      <div className="grid-2" style={{ marginBottom:'var(--space-3)' }}>
        {[
          { label:'Avg Restroom', value: avgRestroom,   icon:'🚻', chipCls: waitChipClass(avgRestroom)   },
          { label:'Avg Concession', value: avgConcession, icon:'🍟', chipCls: waitChipClass(avgConcession) },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center', padding:'var(--space-2) var(--space-1)' }}>
            <span style={{ fontSize:'1.6rem', lineHeight:1, display:'block', marginBottom:6 }}>{s.icon}</span>
            <p style={{
              fontFamily:'var(--font-display)', fontSize:'2rem', fontWeight:800,
              color: waitColor(s.value), lineHeight:1,
            }}>
              {s.value}<span style={{ fontSize:'1rem', fontWeight:500, color:'var(--color-text-secondary)' }}>m</span>
            </p>
            <span className={`badge ${s.chipCls}`} style={{ marginTop:6, fontSize:'0.6rem' }}>
              {waitLabel(s.value)}
            </span>
            <p style={{ fontSize:'0.68rem', color:'var(--color-text-muted)', marginTop:4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Detailed list */}
      <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)' }}>
        {Object.entries(waitTimes).map(([id, data]) => {
          const Icon      = ICONS[TYPES[id]] || Clock;
          const isExp     = expanded === id;
          const hasSaving = data.current - data.nearby.wait >= 3;
          const chipCls   = waitChipClass(data.current);
          const chipColor = waitColor(data.current);
          const chipBg    = data.current > 10 ? 'rgba(220,38,38,0.08)'
                          : data.current > 5  ? 'rgba(217,119,6,0.08)'
                          : 'rgba(5,150,105,0.08)';

          return (
            <article key={id} className="card" style={{ borderLeft:`3px solid ${chipColor}` }}>
              <button
                className="flex items-center justify-between w-full"
                onClick={() => setExpanded(isExp ? null : id)}
                aria-expanded={isExp}
                aria-controls={`wait-detail-${id}`}
                style={{ background:'none', border:'none', color:'inherit', padding:0, textAlign:'left' }}
              >
                <div className="flex items-center gap-2">
                  <div className="icon-chip" style={{ background: chipBg, color: chipColor }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:'0.88rem', color:'var(--color-text-primary)' }}>{LABELS[id]}</p>
                    <span className={`badge ${chipCls}`} style={{ marginTop:3, fontSize:'0.6rem' }}>
                      {waitLabel(data.current)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'1.6rem', fontWeight:800, color: chipColor }}>
                    {data.current}
                    <span style={{ fontSize:'0.8rem', fontWeight:500, color:'var(--color-text-secondary)' }}>m</span>
                  </span>
                  <ChevronRight size={14} color="var(--color-text-muted)"
                    style={{ transform: isExp ? 'rotate(90deg)' : 'none', transition:'transform 0.2s' }} />
                </div>
              </button>

              <WaitBar value={data.current} />

              {/* Smart Suggestion */}
              {hasSaving && (
                <div
                  className="animate-slide-up"
                  style={{
                    marginTop:'var(--space-1)',
                    background:'rgba(109,40,217,0.05)',
                    border:'1px solid rgba(109,40,217,0.15)',
                    borderRadius:'var(--radius-md)',
                    padding:'var(--space-1) 12px',
                    display:'flex', alignItems:'flex-start', gap:8,
                  }}
                >
                  <Sparkles size={14} color="var(--color-primary)" style={{ flexShrink:0, marginTop:2 }} />
                  <p style={{ fontSize:'0.75rem', color:'var(--color-text-secondary)', flex:1 }}>
                    <strong style={{ color:'var(--color-primary)' }}>Smart Pick: </strong>
                    <strong style={{ color:'var(--color-text-primary)' }}>{data.nearby.label}</strong>
                    {' '}is{' '}
                    <strong style={{ color:'var(--color-green)' }}>{data.nearby.distance} min away</strong>
                    {' '}with{' '}
                    <strong style={{ color:'var(--color-green)' }}>only {data.nearby.wait} min wait</strong>
                    {' '}(vs {data.current} min here).
                  </p>
                </div>
              )}

              {/* Expanded detail */}
              {isExp && (
                <div id={`wait-detail-${id}`} className="animate-slide-up">
                  <div className="divider" />
                  <div className="grid-2" style={{ marginTop:'var(--space-1)' }}>
                    <div style={{ textAlign:'center', padding:'var(--space-1)', background:'var(--color-bg-base)', borderRadius:'var(--radius-md)' }}>
                      <p style={{ fontSize:'0.65rem', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Here Now</p>
                      <p style={{ fontFamily:'var(--font-display)', fontWeight:800, color: chipColor, fontSize:'1.4rem' }}>{data.current}m</p>
                    </div>
                    <div style={{ textAlign:'center', padding:'var(--space-1)', background:'var(--color-green-soft)', borderRadius:'var(--radius-md)' }}>
                      <p style={{ fontSize:'0.65rem', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Nearby</p>
                      <p style={{ fontFamily:'var(--font-display)', fontWeight:800, color:'var(--color-green)', fontSize:'1.4rem' }}>{data.nearby.wait}m</p>
                      <p style={{ fontSize:'0.65rem', color:'var(--color-text-secondary)', lineHeight:1.2 }}>{data.nearby.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" style={{ marginTop:'var(--space-1)' }}>
                    <MapPin size={11} color="var(--color-text-muted)" />
                    <span style={{ fontSize:'0.7rem', color:'var(--color-text-secondary)' }}>
                      {data.nearby.distance} min walk to nearest alternative
                    </span>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
