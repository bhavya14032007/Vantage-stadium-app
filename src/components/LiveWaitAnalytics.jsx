/**
 * LiveWaitAnalytics — Real-time wait time dashboard
 * with Smart Suggestion logic for nearby lower-wait options.
 */
import { useState } from 'react';
import { Clock, Lightbulb, TrendingDown, MapPin, Droplets, ShoppingBag, ChevronRight } from 'lucide-react';

function WaitBar({ value, max = 20 }) {
  const pct = Math.min(100, (value / max) * 100);
  const lvl = value > 10 ? 'red' : value > 5 ? 'amber' : 'green';
  return (
    <div className="progress-bar" style={{ marginTop: 4 }}>
      <div
        className={`progress-bar__fill progress-bar__fill--${lvl}`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
      />
    </div>
  );
}

const ICONS = { restroom: Droplets, concession: ShoppingBag };
const LABELS = {
  rest_A: 'Restroom — North',
  rest_B: 'Restroom — South',
  con_A:  'Concession Stand 1',
  con_B:  'Concession Kiosk 2',
};
const TYPES = {
  rest_A: 'restroom', rest_B: 'restroom',
  con_A:  'concession', con_B: 'concession',
};

function waitColor(v) {
  if (v > 10) return 'var(--color-red)';
  if (v > 5)  return 'var(--color-amber)';
  return 'var(--color-green)';
}
function waitLabel(v) {
  if (v > 10) return 'Long Wait';
  if (v > 5)  return 'Moderate';
  return 'Walk-in';
}

export default function LiveWaitAnalytics({ waitTimes }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <section aria-label="Live Wait Analytics">
      <div className="section-header">
        <span className="section-title">Live Wait Analytics</span>
        <span className="live-indicator">
          <span className="live-indicator__dot" aria-hidden="true" />
          Real-time
        </span>
      </div>

      {/* Summary row */}
      <div className="grid-2" style={{ marginBottom: 'var(--space-2)' }}>
        {[
          { label: 'Avg Restroom Wait', value: Math.round((waitTimes.rest_A.current + waitTimes.rest_B.current) / 2), unit: 'min' },
          { label: 'Avg Concession Wait', value: Math.round((waitTimes.con_A.current + waitTimes.con_B.current) / 2), unit: 'min' },
        ].map(s => (
          <div className="card" key={s.label} style={{ textAlign: 'center' }}>
            <p className="stat-number" style={{ color: waitColor(s.value), fontSize:'2rem' }}>
              {s.value}
              <span style={{ fontSize:'0.9rem', fontWeight:400, color:'var(--color-text-secondary)' }}>{s.unit}</span>
            </p>
            <p style={{ fontSize:'0.68rem', color:'var(--color-text-muted)', marginTop:4 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {Object.entries(waitTimes).map(([id, data]) => {
          const Icon = ICONS[TYPES[id]] || Clock;
          const isExp = expanded === id;
          const hasSaving = data.current - data.nearby.wait >= 3;

          return (
            <article key={id} className={`card ${data.current > 10 ? 'card--red' : data.current > 5 ? 'card--amber' : 'card--green'}`}>
              {/* Header row */}
              <button
                className="flex items-center justify-between w-full"
                onClick={() => setExpanded(isExp ? null : id)}
                aria-expanded={isExp}
                aria-controls={`wait-detail-${id}`}
                style={{ background: 'none', border: 'none', color: 'inherit', textAlign:'left', padding: 0 }}
              >
                <div className="flex items-center gap-2">
                  <div style={{
                    width:36, height:36, borderRadius:'var(--radius-md)',
                    background:`rgba(${data.current>10?'255,61,90':data.current>5?'255,183,0':'0,255,136'},0.12)`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    color: waitColor(data.current),
                    flexShrink: 0,
                  }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p style={{ fontWeight:600, fontSize:'0.85rem' }}>{LABELS[id]}</p>
                    <div className="flex items-center gap-1" style={{ marginTop:2 }}>
                      <span className="badge" style={{
                        background:`rgba(${data.current>10?'255,61,90':data.current>5?'255,183,0':'0,255,136'},0.12)`,
                        color: waitColor(data.current), padding:'2px 6px',
                      }}>
                        {waitLabel(data.current)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily:'var(--font-display)', fontSize:'1.4rem', fontWeight:900, color: waitColor(data.current) }}>
                    {data.current}<span style={{fontSize:'0.75rem', fontWeight:400, color:'var(--color-text-secondary)'}}>m</span>
                  </span>
                  <ChevronRight size={14} color="var(--color-text-muted)"
                    style={{ transform: isExp ? 'rotate(90deg)' : 'rotate(0)', transition:'transform 0.2s' }} />
                </div>
              </button>

              <WaitBar value={data.current} />

              {/* Smart Suggestion */}
              {hasSaving && (
                <div
                  className="card animate-slide-up"
                  style={{ marginTop:'var(--space-1)', background:'rgba(0,255,136,0.06)', borderColor:'rgba(0,255,136,0.2)', padding:'var(--space-1) var(--space-2)' }}
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb size={14} color="var(--color-green)" />
                    <p style={{ fontSize:'0.75rem', color:'var(--color-text-secondary)', flex:1 }}>
                      <strong style={{ color:'var(--color-green)' }}>Smart Pick:</strong>{' '}
                      <strong style={{ color:'var(--color-text-primary)' }}>{data.nearby.label}</strong>{' '}
                      is{' '}
                      <strong style={{ color:'var(--color-green)' }}>{data.nearby.distance} min away</strong>{' '}
                      with only{' '}
                      <strong style={{ color:'var(--color-green)' }}>{data.nearby.wait} min wait</strong>
                      {' '}(vs {data.current} min here).
                    </p>
                    <TrendingDown size={14} color="var(--color-green)" />
                  </div>
                </div>
              )}

              {/* Expanded detail */}
              {isExp && (
                <div id={`wait-detail-${id}`} className="animate-slide-up" style={{ marginTop:'var(--space-2)' }}>
                  <div className="divider" />
                  <div className="grid-2" style={{ marginTop: 'var(--space-1)' }}>
                    <div style={{ textAlign:'center' }}>
                      <p style={{ fontSize:'0.65rem', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Current Wait</p>
                      <p style={{ fontWeight:700, color: waitColor(data.current), fontSize:'1.1rem' }}>{data.current} min</p>
                    </div>
                    <div style={{ textAlign:'center' }}>
                      <p style={{ fontSize:'0.65rem', color:'var(--color-text-muted)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Nearby Option</p>
                      <p style={{ fontWeight:700, color:'var(--color-green)', fontSize:'1.1rem' }}>{data.nearby.wait} min</p>
                      <p style={{ fontSize:'0.65rem', color:'var(--color-text-secondary)' }}>{data.nearby.label}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1" style={{ marginTop:'var(--space-1)' }}>
                    <MapPin size={12} color="var(--color-text-muted)" />
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
