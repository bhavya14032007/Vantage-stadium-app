/**
 * PulseMap — Violet-themed SVG Stadium Floor Plan
 * Heat zones + A* pathfinding on light background.
 */
import { useState, useMemo } from 'react';
import { Navigation2, X, Zap, Layers } from 'lucide-react';
import { SECTIONS, AMENITIES, EXITS, aStarPath, densityLevel, densityLabel } from '../hooks/useStadiumData';

const DENSITY_COLORS = {
  green: { fill: 'rgba(5,150,105,0.12)',  stroke: '#059669', text: '#059669', label: 'Clear'     },
  amber: { fill: 'rgba(217,119,6,0.12)',  stroke: '#D97706', text: '#D97706', label: 'Busy'      },
  red:   { fill: 'rgba(220,38,38,0.15)',  stroke: '#DC2626', text: '#DC2626', label: 'Congested' },
};

const SECTION_CELLS = {
  A1: { x: 5, y: 3 }, A2: { x: 9, y: 3 },  A3: { x: 13, y: 3 },
  B1: { x: 5, y: 11 }, B2: { x: 9, y: 11 }, B3: { x: 13, y: 11 },
  C1: { x: 5, y: 18 }, C2: { x: 9, y: 18 }, C3: { x: 13, y: 18 },
};

export default function PulseMap({ densities }) {
  const [selectedSection, setSelectedSection] = useState(null);
  const [targetSection,   setTargetSection]   = useState(null);
  const [showRoute,       setShowRoute]        = useState(false);

  const mySection = 'B2';

  const route = useMemo(() => {
    if (!targetSection || !showRoute) return [];
    const start = SECTION_CELLS[mySection];
    const goal  = SECTION_CELLS[targetSection];
    if (!start || !goal) return [];
    return aStarPath(densities, start, goal);
  }, [targetSection, showRoute, densities]);

  const routePolyline = useMemo(() =>
    route.length ? route.map(c => `${c.x * 20 + 10},${c.y * 20 + 10}`).join(' ') : '',
  [route]);

  const handleClick = (secId) => {
    if (secId === mySection) return;
    if (selectedSection === secId) {
      setTargetSection(secId); setShowRoute(true);
    } else {
      setSelectedSection(secId); setShowRoute(false); setTargetSection(null);
    }
  };

  const clearRoute = () => {
    setSelectedSection(null); setTargetSection(null); setShowRoute(false);
  };

  return (
    <section aria-label="Stadium Pulse Map">
      {/* Header */}
      <div className="section-header">
        <span className="section-title">Pulse Map</span>
        <span className="live-indicator">
          <span className="live-indicator__dot" aria-hidden="true" />
          Live
        </span>
      </div>

      {/* Density legend */}
      <div style={{ display:'flex', gap:'var(--space-1)', marginBottom:'var(--space-2)', flexWrap:'wrap' }}>
        {Object.entries(DENSITY_COLORS).map(([lvl, cfg]) => (
          <span key={lvl} className={`badge badge--${lvl === 'green' ? 'green' : lvl === 'amber' ? 'amber' : 'red'}`}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:cfg.stroke, display:'inline-block' }} />
            {cfg.label}
          </span>
        ))}
        <span className="badge badge--violet" style={{ marginLeft:'auto' }}>
          <Navigation2 size={10} /> You: {mySection}
        </span>
      </div>

      {/* Route hint / active route banner */}
      {!showRoute && !selectedSection && (
        <div className="card" style={{ padding:'var(--space-1) var(--space-2)', marginBottom:'var(--space-2)', background:'rgba(109,40,217,0.04)', borderColor:'var(--color-border)' }}>
          <p style={{ fontSize:'0.75rem', color:'var(--color-text-secondary)' }}>
            💡 Tap a section to select it, then tap again to find the fastest route there.
          </p>
        </div>
      )}

      {selectedSection && !showRoute && (
        <div className="card animate-slide-up" style={{ padding:'var(--space-1) var(--space-2)', marginBottom:'var(--space-2)', borderColor:'var(--color-border-active)', background:'var(--color-primary-soft)' }}>
          <p style={{ fontSize:'0.78rem', color:'var(--color-primary)', fontWeight:600 }}>
            <Layers size={12} style={{ display:'inline', marginRight:5 }} />
            Section <strong>{selectedSection}</strong> selected — tap again on the map to route there.
          </p>
        </div>
      )}

      {showRoute && targetSection && (
        <div className="card animate-slide-up" style={{ padding:'var(--space-1) var(--space-2)', marginBottom:'var(--space-2)', borderColor:'rgba(5,150,105,0.4)', background:'rgba(5,150,105,0.06)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Zap size={14} color="var(--color-green)" />
              <span style={{ fontSize:'0.8rem', color:'var(--color-green)', fontWeight:700 }}>
                Smart route → {targetSection}
              </span>
              <span style={{ fontSize:'0.7rem', color:'var(--color-text-secondary)' }}>(avoids crowds)</span>
            </div>
            <button onClick={clearRoute} aria-label="Clear route" style={{ color:'var(--color-text-muted)' }}>
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* SVG Map */}
      <div className="card" style={{ padding:0, overflow:'hidden', background:'#F8F7FF' }}>
        <svg
          viewBox="0 0 440 500"
          style={{ width:'100%', height:'auto', display:'block' }}
          role="img"
          aria-label="Stadium floor plan with heat zones"
        >
          {/* Background */}
          <rect width="440" height="500" fill="#F8F7FF" />

          {/* Outer stadium ring */}
          <rect x="20" y="20" width="400" height="460" rx="26"
            fill="none" stroke="rgba(109,40,217,0.12)" strokeWidth="2" strokeDasharray="6 4" />

          {/* Field */}
          <rect x="140" y="120" width="160" height="265" rx="14"
            fill="rgba(109,40,217,0.05)" stroke="rgba(109,40,217,0.18)" strokeWidth="1.5" />
          <ellipse cx="220" cy="252" rx="50" ry="50"
            fill="none" stroke="rgba(109,40,217,0.1)" strokeWidth="1" />
          <line x1="140" y1="252" x2="300" y2="252"
            stroke="rgba(109,40,217,0.08)" strokeWidth="1" />
          <text x="220" y="257" textAnchor="middle" fontSize="9" fill="rgba(109,40,217,0.3)"
            fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800">PITCH</text>

          {/* A* Route */}
          {showRoute && routePolyline && (
            <>
              <polyline points={routePolyline} fill="none"
                stroke="rgba(109,40,217,0.15)" strokeWidth="6"
                strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={routePolyline} fill="none"
                stroke="#6D28D9" strokeWidth="2.5" strokeDasharray="9 5"
                strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
            </>
          )}

          {/* Sections */}
          {SECTIONS.map(sec => {
            const d     = densities[sec.id] || 0;
            const level = densityLevel(d);
            const cols  = DENSITY_COLORS[level];
            const isMe  = sec.id === mySection;
            const isSel = sec.id === selectedSection;
            const isTgt = sec.id === targetSection;

            return (
              <g key={sec.id}
                onClick={() => handleClick(sec.id)}
                style={{ cursor: isMe ? 'default' : 'pointer' }}
                role="button"
                aria-label={`${sec.label}: ${densityLabel(d)}, ${d}%`}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleClick(sec.id)}
              >
                {/* Shadow */}
                <rect x={sec.x+2} y={sec.y+3} width={sec.w} height={sec.h} rx="10"
                  fill="rgba(0,0,0,0.06)" />

                <rect x={sec.x} y={sec.y} width={sec.w} height={sec.h} rx="10"
                  fill={isMe ? 'rgba(109,40,217,0.12)' : cols.fill}
                  stroke={isMe ? '#6D28D9' : isTgt ? '#059669' : isSel ? '#6D28D9' : cols.stroke}
                  strokeWidth={isMe || isTgt || isSel ? 2 : 1.2}
                />

                <text x={sec.x + sec.w/2} y={sec.y + 17} textAnchor="middle"
                  fontSize="8.5" fontWeight="800"
                  fill={isMe ? '#6D28D9' : cols.text}
                  fontFamily="Plus Jakarta Sans, sans-serif">
                  {sec.label}
                </text>
                <text x={sec.x + sec.w/2} y={sec.y + 30} textAnchor="middle"
                  fontSize="11" fill={isMe ? '#6D28D9' : cols.text} fontWeight="700">
                  {d}%
                </text>
                {isMe && (
                  <text x={sec.x + sec.w/2} y={sec.y + 44} textAnchor="middle"
                    fontSize="8" fill="#6D28D9" fontWeight="600">📍 You</text>
                )}
                {isTgt && !isMe && (
                  <text x={sec.x + sec.w/2} y={sec.y + 44} textAnchor="middle"
                    fontSize="11">🎯</text>
                )}
              </g>
            );
          })}

          {/* Amenity icons */}
          {AMENITIES.map(a => (
            <g key={a.id} aria-label={a.label}>
              <circle cx={a.x} cy={a.y} r="14"
                fill="white" stroke="rgba(109,40,217,0.15)" strokeWidth="1.5" />
              <text x={a.x} y={a.y + 5} textAnchor="middle" fontSize="13">{a.icon}</text>
            </g>
          ))}

          {/* Exit markers */}
          {EXITS.map(ex => {
            const col = ex.clearLevel === 'clear' ? '#059669'
                      : ex.clearLevel === 'busy'  ? '#D97706'
                      : '#DC2626';
            const bg  = ex.clearLevel === 'clear' ? 'rgba(5,150,105,0.1)'
                      : ex.clearLevel === 'busy'  ? 'rgba(217,119,6,0.1)'
                      : 'rgba(220,38,38,0.1)';
            return (
              <g key={ex.id} aria-label={`${ex.label}: ${ex.clearLevel}`}>
                <circle cx={ex.x} cy={ex.y} r="13" fill={bg} stroke={col} strokeWidth="1.5" />
                <text x={ex.x} y={ex.y + 4} textAnchor="middle"
                  fontSize="8" fill={col} fontWeight="800" fontFamily="Plus Jakarta Sans, sans-serif">
                  EXIT
                </text>
              </g>
            );
          })}

          {/* User position */}
          <circle cx={195} cy={215} r="9" fill="#6D28D9" opacity="0.95" />
          <circle cx={195} cy={215} r="16" fill="none"
            stroke="#6D28D9" strokeWidth="2" opacity="0.25" className="animate-pulse" />
        </svg>
      </div>

      {/* Section detail */}
      {selectedSection && !showRoute && (
        <div className="card animate-slide-up" style={{ marginTop:'var(--space-2)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontWeight:700, fontSize:'1rem' }}>Section {selectedSection}</p>
              <p style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)', marginTop:2 }}>
                Density: {densities[selectedSection]}% · {densityLabel(densities[selectedSection])}
              </p>
            </div>
            <span className={`badge badge--${densityLevel(densities[selectedSection]) === 'green' ? 'green' : densityLevel(densities[selectedSection]) === 'amber' ? 'amber' : 'red'}`}>
              {densityLabel(densities[selectedSection])}
            </span>
          </div>
          <button
            className="btn btn--primary w-full"
            style={{ marginTop:'var(--space-2)' }}
            onClick={() => { setTargetSection(selectedSection); setShowRoute(true); }}
          >
            <Navigation2 size={14} /> Find Fastest Route
          </button>
        </div>
      )}
    </section>
  );
}
