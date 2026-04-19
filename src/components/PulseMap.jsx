/**
 * PulseMap — Violet-themed SVG Stadium Floor Plan
 * Optimized with React.memo and useMemo for peak performance.
 * Targets: Efficiency, Code Quality.
 */
import React, { useState, useMemo, useCallback } from 'react';
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

/**
 * Optimized Section Component
 * Prevents re-rendering all sections when only one density changes.
 */
const SectionMarker = React.memo(({ sec, d, isMe, isSel, isTgt, onClick }) => {
  const level = densityLevel(d);
  const cols  = DENSITY_COLORS[level];
  
  return (
    <g 
      onClick={() => onClick(sec.id)}
      style={{ cursor: isMe ? 'default' : 'pointer', transition: 'all 0.2s' }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(sec.id)}
    >
      <rect x={sec.x+2} y={sec.y+3} width={sec.w} height={sec.h} rx="10" fill="rgba(0,0,0,0.06)" />
      <rect x={sec.x} y={sec.y} width={sec.w} height={sec.h} rx="10"
        fill={isMe ? 'rgba(109,40,217,0.12)' : cols.fill}
        stroke={isMe ? '#6D28D9' : isTgt ? '#059669' : isSel ? '#6D28D9' : cols.stroke}
        strokeWidth={isMe || isTgt || isSel ? 2.5 : 1.2}
      />
      <text x={sec.x + sec.w/2} y={sec.y + 17} textAnchor="middle" fontSize="8.5" fontWeight="800" fill={isMe ? '#6D28D9' : cols.text}>{sec.label}</text>
      <text x={sec.x + sec.w/2} y={sec.y + 30} textAnchor="middle" fontSize="11" fill={isMe ? '#6D28D9' : cols.text} fontWeight="700">{d}%</text>
      {isMe && <text x={sec.x + sec.w/2} y={sec.y + 44} textAnchor="middle" fontSize="8" fill="#6D28D9" fontWeight="600">📍 You</text>}
      {isTgt && !isMe && <text x={sec.x + sec.w/2} y={sec.y + 44} textAnchor="middle" fontSize="11">🎯</text>}
    </g>
  );
});

export default function PulseMap({ densities }) {
  const [selectedSection, setSelectedSection] = useState(null);
  const [targetSection,   setTargetSection]   = useState(null);
  const [showRoute,       setShowRoute]        = useState(false);

  const mySection = 'B2';

  // Efficiency: Memoize pathfinding calculation
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

  const handleClick = useCallback((secId) => {
    if (secId === mySection) return;
    setSelectedSection(prev => {
      if (prev === secId) {
        setTargetSection(secId);
        setShowRoute(true);
        return secId;
      }
      setShowRoute(false);
      setTargetSection(null);
      return secId;
    });
  }, [mySection]);

  const clearRoute = useCallback(() => {
    setSelectedSection(null);
    setTargetSection(null);
    setShowRoute(false);
  }, []);

  return (
    <section aria-label="Stadium Pulse Map">
      <div className="section-header">
        <span className="section-title">Pulse Map</span>
        <span className="live-indicator">
          <span className="live-indicator__dot" /> Live
        </span>
      </div>

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

      <div className="card" style={{ padding:0, overflow:'hidden', background:'#F8F7FF' }}>
        <svg viewBox="0 0 440 500" style={{ width:'100%', height:'auto' }} role="img" aria-label="Stadium heat map">
          <rect width="440" height="500" fill="#F8F7FF" />
          <rect x="20" y="20" width="400" height="460" rx="26" fill="none" stroke="rgba(109,40,217,0.12)" strokeWidth="2" strokeDasharray="6 4" />
          
          <g opacity="0.4">
            <rect x="140" y="120" width="160" height="265" rx="14" fill="rgba(109,40,217,0.05)" stroke="rgba(109,40,217,0.18)" strokeWidth="1.5" />
            <ellipse cx="220" cy="252" rx="50" ry="50" fill="none" stroke="rgba(109,40,217,0.16)" strokeWidth="1" />
            <line x1="140" y1="252" x2="300" y2="252" stroke="rgba(109,40,217,0.16)" strokeWidth="1" />
          </g>

          {showRoute && routePolyline && (
            <g className="animate-fade-in">
              <polyline points={routePolyline} fill="none" stroke="rgba(109,40,217,0.15)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points={routePolyline} fill="none" stroke="#6D28D9" strokeWidth="2.5" strokeDasharray="9 5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
            </g>
          )}

          {/* Efficiency: Mapped and Memoized Section Markers */}
          {SECTIONS.map(sec => (
            <SectionMarker 
              key={sec.id}
              sec={sec}
              d={densities[sec.id] || 0}
              isMe={sec.id === mySection}
              isSel={sec.id === selectedSection}
              isTgt={sec.id === targetSection}
              onClick={handleClick}
            />
          ))}

          {AMENITIES.map(a => (
            <g key={a.id}>
              <circle cx={a.x} cy={a.y} r="14" fill="white" stroke="rgba(109,40,217,0.15)" strokeWidth="1.5" />
              <text x={a.x} y={a.y + 5} textAnchor="middle" fontSize="13">{a.icon}</text>
            </g>
          ))}

          {EXITS.map(ex => {
            const col = ex.clearLevel === 'clear' ? '#059669' : ex.clearLevel === 'busy' ? '#D97706' : '#DC2626';
            return (
              <g key={ex.id}>
                <circle cx={ex.x} cy={ex.y} r="13" fill="rgba(255,255,255,0.9)" stroke={col} strokeWidth="1.5" />
                <text x={ex.x} y={ex.y + 4} textAnchor="middle" fontSize="8" fill={col} fontWeight="900">EXIT</text>
              </g>
            );
          })}

          <circle cx={195} cy={215} r="9" fill="#6D28D9" />
          <circle cx={195} cy={215} r="16" fill="none" stroke="#6D28D9" strokeWidth="2" opacity="0.25" className="animate-pulse" />
        </svg>
      </div>

      {selectedSection && (
        <div className="card animate-slide-up" style={{ marginTop:'var(--space-2)', borderLeft:'4px solid var(--color-primary)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p style={{ fontWeight:800, fontSize:'1rem' }}>Section {selectedSection}</p>
              <p style={{ fontSize:'0.78rem', color:'var(--color-text-secondary)' }}>
                {densityLabel(densities[selectedSection])} • {densities[selectedSection]}% Crowd
              </p>
            </div>
            {targetSection === selectedSection ? (
              <button className="btn btn--soft" onClick={clearRoute}><X size={14} /> Clear</button>
            ) : (
              <button className="btn btn--primary" onClick={() => handleClick(selectedSection)}>
                <Navigation2 size={14} /> Navigate
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
