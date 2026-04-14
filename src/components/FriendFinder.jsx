/**
 * FriendFinder — Low-latency group coordination using
 * relative venue coordinates mapped to the SVG floor plan.
 */
import { useState } from 'react';
import { Users, MessageCircle, Navigation2, Phone } from 'lucide-react';
import { SECTIONS } from '../hooks/useStadiumData';

const MY_POS = { x: 195, y: 215, section: 'B2' };
const SVG_W = 400, SVG_H = 450;

function distance(a, b) {
  return Math.round(Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) / 22);
}

const STATUS_CONFIG = {
  online: { color: 'var(--color-green)', label: 'Online' },
  away:   { color: 'var(--color-amber)', label: 'Away'   },
  offline:{ color: 'var(--color-text-muted)', label: 'Offline' },
};

export default function FriendFinder({ friends }) {
  const [selected, setSelected] = useState(null);
  const [meetMsg, setMeetMsg] = useState(null);

  const handleMeet = (friend) => {
    setMeetMsg(`📍 Meet-up request sent to ${friend.name}! Suggested: Gate B walkway.`);
    setTimeout(() => setMeetMsg(null), 4000);
  };

  return (
    <section aria-label="Friend Finder">
      <div className="section-header">
        <span className="section-title">Friend Finder</span>
        <span className="badge badge--purple">
          <Users size={10} /> {friends.filter(f => f.status === 'online').length} Online
        </span>
      </div>

      {meetMsg && (
        <div
          className="card animate-slide-up"
          style={{ marginBottom:'var(--space-2)', borderColor:'rgba(168,85,247,0.35)', background:'rgba(168,85,247,0.08)', padding:'var(--space-1) var(--space-2)' }}
          role="status"
        >
          <p style={{ fontSize:'0.8rem', color:'var(--color-text-primary)' }}>{meetMsg}</p>
        </div>
      )}

      {/* Mini venue map */}
      <div
        className="card"
        style={{ padding:0, overflow:'hidden', background:'#090d12', marginBottom:'var(--space-2)' }}
      >
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          style={{ width:'100%', height:'auto', display:'block' }}
          role="img"
          aria-label="Venue map showing friend locations"
        >
          {/* Background */}
          <rect width={SVG_W} height={SVG_H} fill="#090d12" />

          {/* Outer ring */}
          <rect x="18" y="18" width={SVG_W-36} height={SVG_H-36} rx="22"
            fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" strokeDasharray="5 4" />

          {/* Pitch */}
          <rect x="130" y="120" width="140" height="210" rx="10"
            fill="rgba(0,255,136,0.04)" stroke="rgba(0,255,136,0.12)" strokeWidth="1" />
          <text x="200" y="230" textAnchor="middle" fontSize="8" fill="rgba(0,255,136,0.25)" fontFamily="Orbitron, sans-serif">PITCH</text>

          {/* Sections (dim) */}
          {SECTIONS.map(sec => (
            <rect key={sec.id} x={sec.x} y={sec.y} width={sec.w} height={sec.h} rx="8"
              fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          ))}

          {/* Route lines from user to friends */}
          {friends.map(f => f.status !== 'offline' && (
            <line key={`line-${f.id}`}
              x1={MY_POS.x} y1={MY_POS.y}
              x2={f.x} y2={f.y}
              stroke="rgba(168,85,247,0.2)"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
          ))}

          {/* Friend markers */}
          {friends.map(f => {
            const cfg  = STATUS_CONFIG[f.status] || STATUS_CONFIG.offline;
            const isSel = selected === f.id;
            return (
              <g
                key={f.id}
                onClick={() => setSelected(isSel ? null : f.id)}
                style={{ cursor:'pointer' }}
                role="button"
                aria-label={`${f.name}: ${cfg.label}, Section ${f.section}`}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setSelected(isSel ? null : f.id)}
              >
                {/* Pulse ring for online */}
                {f.status === 'online' && (
                  <circle cx={f.x} cy={f.y} r="18"
                    fill="none" stroke={cfg.color} strokeWidth="1.5" opacity="0.3"
                    className="animate-pulse" />
                )}
                {/* Avatar bubble */}
                <circle cx={f.x} cy={f.y} r="13"
                  fill={isSel ? 'rgba(168,85,247,0.3)' : 'rgba(13,17,23,0.92)'}
                  stroke={isSel ? 'var(--color-purple)' : cfg.color}
                  strokeWidth={isSel ? 2.5 : 1.5} />
                <text x={f.x} y={f.y+5} textAnchor="middle" fontSize="12">{f.avatar}</text>
                {/* Name label */}
                <text x={f.x} y={f.y-17} textAnchor="middle" fontSize="8.5" fill="var(--color-text-secondary)" fontWeight="600">
                  {f.name}
                </text>
                <text x={f.x} y={f.y-7} textAnchor="middle" fontSize="7" fill={cfg.color}>
                  {f.section}
                </text>
              </g>
            );
          })}

          {/* User position */}
          <circle cx={MY_POS.x} cy={MY_POS.y} r="10" fill="var(--color-blue)" opacity="0.95" />
          <circle cx={MY_POS.x} cy={MY_POS.y} r="18" fill="none"
            stroke="var(--color-blue)" strokeWidth="2" opacity="0.35" className="animate-pulse" />
          <text x={MY_POS.x} y={MY_POS.y+4} textAnchor="middle" fontSize="10">📍</text>
          <text x={MY_POS.x} y={MY_POS.y-14} textAnchor="middle" fontSize="8" fill="var(--color-blue)" fontWeight="700">
            You
          </text>
        </svg>
      </div>

      {/* Friend List */}
      <div className="flex flex-col gap-2">
        {friends.map(f => {
          const cfg  = STATUS_CONFIG[f.status] || STATUS_CONFIG.offline;
          const dist = distance(f, MY_POS);
          const isSel = selected === f.id;

          return (
            <article
              key={f.id}
              className="card"
              style={{ borderColor: isSel ? 'rgba(168,85,247,0.4)' : 'var(--color-border)', background: isSel ? 'rgba(168,85,247,0.06)' : undefined }}
            >
              <button
                className="flex items-center justify-between w-full"
                onClick={() => setSelected(isSel ? null : f.id)}
                style={{ background:'none', border:'none', color:'inherit', textAlign:'left', padding:0 }}
                aria-expanded={isSel}
              >
                <div className="flex items-center gap-2">
                  <div style={{ position:'relative', flexShrink:0 }}>
                    <span style={{ fontSize:'1.8rem' }}>{f.avatar}</span>
                    <span style={{
                      position:'absolute', bottom:0, right:0,
                      width:10, height:10, borderRadius:'50%',
                      background: cfg.color,
                      border:'2px solid var(--color-bg-card)',
                    }} />
                  </div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:'0.9rem' }}>{f.name}</p>
                    <div className="flex items-center gap-2" style={{ marginTop:2 }}>
                      <span style={{ fontSize:'0.7rem', color:cfg.color, fontWeight:600 }}>{cfg.label}</span>
                      <span style={{ fontSize:'0.7rem', color:'var(--color-text-muted)' }}>· Sec {f.section}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:'1.2rem', fontWeight:900, color:'var(--color-purple)' }}>
                    {dist}m
                  </p>
                  <p style={{ fontSize:'0.65rem', color:'var(--color-text-muted)' }}>away</p>
                </div>
              </button>

              {/* Expanded actions */}
              {isSel && (
                <div className="animate-slide-up" style={{ marginTop:'var(--space-2)', display:'flex', gap:'var(--space-1)' }}>
                  <button
                    className="btn flex-1"
                    style={{ padding:'8px', background:'rgba(168,85,247,0.12)', color:'var(--color-purple)', borderRadius:'var(--radius-md)', fontSize:'0.75rem', fontWeight:600 }}
                    onClick={() => handleMeet(f)}
                    id={`meet-${f.id}`}
                  >
                    <Navigation2 size={12} /> Meet Up
                  </button>
                  <button
                    className="btn flex-1"
                    style={{ padding:'8px', background:'rgba(0,180,255,0.1)', color:'var(--color-blue)', borderRadius:'var(--radius-md)', fontSize:'0.75rem', fontWeight:600 }}
                    onClick={() => {}}
                    id={`msg-${f.id}`}
                  >
                    <MessageCircle size={12} /> Message
                  </button>
                  <button
                    className="btn"
                    style={{ padding:'8px 12px', background:'rgba(255,255,255,0.05)', color:'var(--color-text-secondary)', borderRadius:'var(--radius-md)', fontSize:'0.75rem' }}
                    onClick={() => {}}
                    aria-label={`Call ${f.name}`}
                  >
                    <Phone size={12} />
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
