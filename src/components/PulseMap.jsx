/**
 * PulseMap — Interactive SVG Stadium Floor Plan with
 * heat-zone crowd density and A* pathfinding route display.
 */
import { useState, useMemo } from 'react';
import { Navigation2, MapPin, X, Zap } from 'lucide-react';
import { SECTIONS, AMENITIES, EXITS, aStarPath, densityLevel, densityLabel } from '../hooks/useStadiumData';

const DENSITY_COLORS = {
  green: { fill: 'rgba(0,255,136,0.18)', stroke: '#00ff88', text: '#00ff88' },
  amber: { fill: 'rgba(255,183,0,0.2)',  stroke: '#ffb700', text: '#ffb700' },
  red:   { fill: 'rgba(255,61,90,0.25)', stroke: '#ff3d5a', text: '#ff3d5a' },
};

// Map section id to approx grid cell
const SECTION_CELLS = {
  A1: { x: 5, y: 3 }, A2: { x: 9, y: 3 },  A3: { x: 13, y: 3 },
  B1: { x: 5, y: 11 }, B2: { x: 9, y: 11 }, B3: { x: 13, y: 11 },
  C1: { x: 5, y: 18 }, C2: { x: 9, y: 18 }, C3: { x: 13, y: 18 },
};

// Convert grid cell to SVG coordinate
const cellToSVG = (cell) => ({ x: cell.x * 20, y: cell.y * 20 });

export default function PulseMap({ densities }) {
  const [selectedSection, setSelectedSection] = useState(null);
  const [targetSection, setTargetSection]   = useState(null);
  const [showRoute, setShowRoute]             = useState(false);

  const mySection = 'B2'; // simulated user position

  const route = useMemo(() => {
    if (!targetSection || !showRoute) return [];
    const start = SECTION_CELLS[mySection];
    const goal  = SECTION_CELLS[targetSection];
    if (!start || !goal) return [];
    return aStarPath(densities, start, goal);
  }, [targetSection, showRoute, densities]);

  const routePolyline = useMemo(() => {
    if (!route.length) return '';
    return route.map(c => `${c.x * 20 + 10},${c.y * 20 + 10}`).join(' ');
  }, [route]);

  const handleSectionClick = (secId) => {
    if (secId === mySection) return;
    if (selectedSection === secId) {
      setTargetSection(secId);
      setShowRoute(true);
    } else {
      setSelectedSection(secId);
      setShowRoute(false);
      setTargetSection(null);
    }
  };

  const clearRoute = () => {
    setSelectedSection(null);
    setTargetSection(null);
    setShowRoute(false);
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

      {/* Legend */}
      <div className="flex gap-2" style={{ marginBottom: 'var(--space-2)', flexWrap: 'wrap' }}>
        {[
          { l: 'Clear',     c: 'green' },
          { l: 'Busy',      c: 'amber' },
          { l: 'Congested', c: 'red'   },
        ].map(({ l, c }) => (
          <span key={l} className={`badge badge--${c}`}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:`var(--color-${c})`, display:'inline-block' }} />
            {l}
          </span>
        ))}
        <span className="badge badge--blue" style={{ marginLeft: 'auto' }}>
          <Navigation2 size={10} /> You: {mySection}
        </span>
      </div>

      {/* Pathfinding prompt */}
      {!showRoute && (
        <p style={{ fontSize:'0.75rem', color:'var(--color-text-muted)', marginBottom:'var(--space-1)' }}>
          Tap a section once to select → tap again to route there.
        </p>
      )}

      {/* Active route banner */}
      {showRoute && targetSection && (
        <div className="card card--green flex items-center justify-between animate-fade-in" style={{ padding:'var(--space-1) var(--space-2)', marginBottom:'var(--space-2)' }}>
          <div className="flex items-center gap-1">
            <Zap size={14} color="var(--color-green)" />
            <span style={{ fontSize:'0.8rem', color:'var(--color-green)', fontWeight:600 }}>
              Smart route → {targetSection}
            </span>
            <span style={{ fontSize:'0.7rem', color:'var(--color-text-secondary)' }}>
              &nbsp;(avoids congestion)
            </span>
          </div>
          <button onClick={clearRoute} aria-label="Clear route" style={{ color:'var(--color-text-muted)' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* SVG Map */}
      <div
        className="card"
        style={{ padding: 0, overflow: 'hidden', background: '#090d12' }}
      >
        <svg
          viewBox="0 0 440 500"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Stadium floor plan with heat zones"
        >
          {/* Background */}
          <rect width="440" height="500" fill="#090d12" />

          {/* Field / Pitch */}
          <rect x="140" y="120" width="160" height="260" rx="12"
            fill="rgba(0,255,136,0.04)" stroke="rgba(0,255,136,0.15)" strokeWidth="1.5" />
          <ellipse cx="220" cy="250" rx="48" ry="48"
            fill="none" stroke="rgba(0,255,136,0.12)" strokeWidth="1" />
          <line x1="140" y1="250" x2="300" y2="250"
            stroke="rgba(0,255,136,0.1)" strokeWidth="1" />
          <text x="220" y="254" textAnchor="middle" fontSize="9" fill="rgba(0,255,136,0.3)" fontFamily="Orbitron, sans-serif">PITCH</text>

          {/* Outer stadium ring */}
          <rect x="20" y="20" width="400" height="460" rx="24"
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" strokeDasharray="6 4" />

          {/* A* Route */}
          {showRoute && routePolyline && (
            <>
              <polyline
                points={routePolyline}
                fill="none"
                stroke="var(--color-green)"
                strokeWidth="3"
                strokeDasharray="8 4"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.8"
              />
              <polyline
                points={routePolyline}
                fill="none"
                stroke="white"
                strokeWidth="1"
                strokeDasharray="8 4"
                strokeLinecap="round"
                opacity="0.3"
              />
            </>
          )}

          {/* Sections */}
          {SECTIONS.map(sec => {
            const d = densities[sec.id] || 0;
            const level = densityLevel(d);
            const cols  = DENSITY_COLORS[level];
            const isMe  = sec.id === mySection;
            const isSel = sec.id === selectedSection;
            const isTgt = sec.id === targetSection;

            return (
              <g
                key={sec.id}
                onClick={() => handleSectionClick(sec.id)}
                style={{ cursor: sec.id === mySection ? 'default' : 'pointer' }}
                role="button"
                aria-label={`${sec.label}: ${densityLabel(d)} (${d}%)`}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && handleSectionClick(sec.id)}
              >
                <rect
                  x={sec.x} y={sec.y} width={sec.w} height={sec.h} rx="8"
                  fill={isMe ? 'rgba(0,180,255,0.22)' : cols.fill}
                  stroke={isMe ? 'var(--color-blue)' : isTgt ? 'var(--color-green)' : isSel ? 'white' : cols.stroke}
                  strokeWidth={isMe || isTgt ? 2.5 : isSel ? 2 : 1}
                  opacity={isMe || isSel || isTgt ? 1 : 0.85}
                />
                {/* Heat pulse on red zones */}
                {level === 'red' && !isMe && (
                  <rect
                    x={sec.x} y={sec.y} width={sec.w} height={sec.h} rx="8"
                    fill="rgba(255,61,90,0.08)"
                    stroke="transparent"
                    className="animate-pulse"
                  />
                )}
                <text x={sec.x + sec.w / 2} y={sec.y + 18} textAnchor="middle"
                  fontSize="9" fontWeight="700" fill={isMe ? 'var(--color-blue)' : cols.text}
                  fontFamily="Orbitron, sans-serif">
                  {sec.label}
                </text>
                <text x={sec.x + sec.w / 2} y={sec.y + 30} textAnchor="middle"
                  fontSize="10" fill={isMe ? 'var(--color-blue)' : cols.text} fontWeight="600">
                  {d}%
                </text>
                {isMe && (
                  <text x={sec.x + sec.w / 2} y={sec.y + 44} textAnchor="middle"
                    fontSize="8" fill="var(--color-blue)">
                    📍 You
                  </text>
                )}
                {isTgt && !isMe && (
                  <text x={sec.x + sec.w / 2} y={sec.y + 44} textAnchor="middle"
                    fontSize="9" fill="var(--color-green)">🎯</text>
                )}
              </g>
            );
          })}

          {/* Amenity markers */}
          {AMENITIES.map(a => (
            <g key={a.id} aria-label={a.label}>
              <circle cx={a.x} cy={a.y} r="13"
                fill="rgba(13,17,23,0.9)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <text x={a.x} y={a.y + 5} textAnchor="middle" fontSize="12">{a.icon}</text>
            </g>
          ))}

          {/* Exit markers */}
          {EXITS.map(ex => {
            const col = ex.clearLevel === 'clear' ? 'var(--color-green)'
                      : ex.clearLevel === 'busy'  ? 'var(--color-amber)'
                      : 'var(--color-red)';
            return (
              <g key={ex.id} aria-label={`${ex.label}: ${ex.clearLevel}`}>
                <circle cx={ex.x} cy={ex.y} r="11"
                  fill="rgba(13,17,23,0.85)" stroke={col} strokeWidth="1.5" />
                <text x={ex.x} y={ex.y + 4} textAnchor="middle" fontSize="9" fill={col} fontWeight="700">
                  EXIT
                </text>
              </g>
            );
          })}

          {/* User location dot with ring */}
          <circle cx={195} cy={215} r="7" fill="var(--color-blue)" opacity="0.9" />
          <circle cx={195} cy={215} r="13" fill="none" stroke="var(--color-blue)"
            strokeWidth="2" opacity="0.4" className="animate-pulse" />
        </svg>
      </div>

      {/* Section detail card */}
      {selectedSection && !showRoute && (
        <div className="card animate-slide-up" style={{ marginTop: 'var(--space-2)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontWeight:700, fontSize:'0.95rem' }}>{selectedSection}</p>
              <p style={{ fontSize:'0.75rem', color:'var(--color-text-secondary)' }}>
                Density: {densities[selectedSection]}% · {densityLabel(densities[selectedSection])}
              </p>
            </div>
            <span className={`badge badge--${densityLevel(densities[selectedSection])}`}>
              {densityLabel(densities[selectedSection])}
            </span>
          </div>
          <button
            className="btn btn--primary w-full"
            style={{ marginTop: 'var(--space-2)' }}
            onClick={() => { setTargetSection(selectedSection); setShowRoute(true); }}
          >
            <Navigation2 size={14} /> Find Fastest Route
          </button>
        </div>
      )}
    </section>
  );
}
