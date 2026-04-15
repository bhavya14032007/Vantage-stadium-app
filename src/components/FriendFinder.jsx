/**
 * FriendFinder — Violet-themed group coordination map.
 */
import { useState } from 'react';
import { Users, MessageCircle, Navigation2, Phone, UserCheck } from 'lucide-react';
import { SECTIONS } from '../hooks/useStadiumData';

const MY_POS = { x: 195, y: 215, section: 'B2' };
const SVG_W = 400, SVG_H = 440;

function distance(a, b) {
  return Math.round(Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2)) / 22);
}

const STATUS_CONFIG = {
  online:  { color: '#059669', bg: 'rgba(5,150,105,0.1)',  label: 'Online'  },
  away:    { color: '#D97706', bg: 'rgba(217,119,6,0.1)',  label: 'Away'    },
  offline: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', label: 'Offline' },
};

const FRIEND_GRADIENT = [
  { start: '#7C3AED', end: '#4F46E5' },
  { start: '#0891B2', end: '#06B6D4' },
  { start: '#D97706', end: '#F59E0B' },
];

export default function FriendFinder({ friends }) {
  const [selected, setSelected] = useState(null);
  const [meetMsg, setMeetMsg]   = useState(null);

  const handleMeet = (friend) => {
    setMeetMsg(`✅ Meet-up request sent to ${friend.name}! Suggested: Gate B walkway.`);
    setTimeout(() => setMeetMsg(null), 4000);
  };

  return (
    <section aria-label="Friend Finder">
      {/* Header */}
      <div className="section-header">
        <span className="section-title">Friend Finder</span>
        <span className="badge badge--violet">
          <Users size={10} />
          {friends.filter(f => f.status === 'online').length} Online
        </span>
      </div>

      {/* Meet-up toast */}
      {meetMsg && (
        <div className="card animate-slide-up" role="status"
          style={{ marginBottom:'var(--space-2)', borderColor:'rgba(109,40,217,0.3)', background:'rgba(109,40,217,0.06)', padding:'var(--space-1) var(--space-2)' }}>
          <div className="flex items-center gap-2">
            <UserCheck size={16} color="var(--color-primary)" />
            <p style={{ fontSize:'0.8rem', color:'var(--color-text-primary)' }}>{meetMsg}</p>
          </div>
        </div>
      )}

      {/* Mini venue map */}
      <div className="card" style={{ padding:0, overflow:'hidden', background:'#F8F7FF', marginBottom:'var(--space-2)' }}>
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ width:'100%', height:'auto', display:'block' }}
          role="img" aria-label="Venue map showing friend locations">

          <defs>
            {FRIEND_GRADIENT.map((g, i) => (
              <radialGradient key={i} id={`fg${i}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={g.start} />
                <stop offset="100%" stopColor={g.end} />
              </radialGradient>
            ))}
            <radialGradient id="myGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#4F46E5" />
            </radialGradient>
          </defs>

          {/* Background */}
          <rect width={SVG_W} height={SVG_H} fill="#F8F7FF" />

          {/* Stadium outer ring */}
          <rect x="18" y="18" width={SVG_W - 36} height={SVG_H - 36} rx="24"
            fill="none" stroke="rgba(109,40,217,0.1)" strokeWidth="1.5" strokeDasharray="5 4" />

          {/* Pitch */}
          <rect x="130" y="110" width="140" height="220" rx="12"
            fill="rgba(109,40,217,0.05)" stroke="rgba(109,40,217,0.15)" strokeWidth="1.2" />
          <ellipse cx="200" cy="220" rx="42" ry="42"
            fill="none" stroke="rgba(109,40,217,0.08)" strokeWidth="1" />
          <text x="200" y="225" textAnchor="middle" fontSize="9"
            fill="rgba(109,40,217,0.25)" fontFamily="Plus Jakarta Sans, sans-serif" fontWeight="800">PITCH</text>

          {/* Sections (muted) */}
          {SECTIONS.map(sec => (
            <rect key={sec.id} x={sec.x} y={sec.y} width={sec.w} height={sec.h} rx="8"
              fill="rgba(109,40,217,0.04)" stroke="rgba(109,40,217,0.08)" strokeWidth="1" />
          ))}

          {/* Dotted connection lines */}
          {friends.map(f => f.status !== 'offline' && (
            <line key={`line-${f.id}`}
              x1={MY_POS.x} y1={MY_POS.y} x2={f.x} y2={f.y}
              stroke="rgba(109,40,217,0.15)" strokeWidth="1.2" strokeDasharray="5 4" />
          ))}

          {/* Friend markers */}
          {friends.map((f, idx) => {
            const cfg   = STATUS_CONFIG[f.status] || STATUS_CONFIG.offline;
            const isSel = selected === f.id;
            const gradId = `fg${idx % FRIEND_GRADIENT.length}`;

            return (
              <g key={f.id}
                onClick={() => setSelected(isSel ? null : f.id)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`${f.name}: ${cfg.label}, Section ${f.section}`}
                onKeyDown={e => e.key === 'Enter' && setSelected(isSel ? null : f.id)}
              >
                {/* Pulse ring */}
                {f.status === 'online' && (
                  <circle cx={f.x} cy={f.y} r="20"
                    fill="none" stroke={cfg.color} strokeWidth="1.5" opacity="0.3"
                    className="animate-pulse" />
                )}
                {/* Shadow */}
                <circle cx={f.x + 1} cy={f.y + 2} r="14"
                  fill="rgba(0,0,0,0.08)" />
                {/* Circle bg */}
                <circle cx={f.x} cy={f.y} r="14"
                  fill={isSel ? `url(#${gradId})` : 'white'}
                  stroke={isSel ? 'transparent' : cfg.color}
                  strokeWidth={isSel ? 0 : 2} />
                {/* Avatar */}
                <text x={f.x} y={f.y + 5} textAnchor="middle" fontSize="13">{f.avatar}</text>

                {/* Name tag */}
                <rect x={f.x - 18} y={f.y - 32} width="36" height="14" rx="7"
                  fill="white" stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                <text x={f.x} y={f.y - 22} textAnchor="middle"
                  fontSize="7.5" fill={isSel ? '#6D28D9' : '#374151'} fontWeight="700">{f.name}</text>
                <text x={f.x} y={f.y + 21} textAnchor="middle"
                  fontSize="7" fill={cfg.color} fontWeight="600">{f.section}</text>
              </g>
            );
          })}

          {/* My position */}
          <circle cx={MY_POS.x + 1} cy={MY_POS.y + 2} r="12" fill="rgba(0,0,0,0.1)" />
          <circle cx={MY_POS.x} cy={MY_POS.y} r="12" fill="url(#myGrad)" />
          <circle cx={MY_POS.x} cy={MY_POS.y} r="20" fill="none"
            stroke="#6D28D9" strokeWidth="2" opacity="0.2" className="animate-pulse" />
          <text x={MY_POS.x} y={MY_POS.y + 5} textAnchor="middle" fontSize="11">📍</text>
          <text x={MY_POS.x} y={MY_POS.y - 16} textAnchor="middle"
            fontSize="8" fill="#6D28D9" fontWeight="800">You</text>
        </svg>
      </div>

      {/* Friend list cards */}
      <div style={{ display:'flex', flexDirection:'column', gap:'var(--space-2)' }}>
        {friends.map((f, idx) => {
          const cfg   = STATUS_CONFIG[f.status] || STATUS_CONFIG.offline;
          const dist  = distance(f, MY_POS);
          const isSel = selected === f.id;
          const grad  = FRIEND_GRADIENT[idx % FRIEND_GRADIENT.length];

          return (
            <article key={f.id} className="card"
              style={{ borderColor: isSel ? 'rgba(109,40,217,0.35)' : 'var(--color-border-subtle)', transition:'all 0.2s' }}>
              <button
                className="flex items-center justify-between w-full"
                onClick={() => setSelected(isSel ? null : f.id)}
                style={{ background:'none', border:'none', color:'inherit', textAlign:'left', padding:0 }}
                aria-expanded={isSel}
              >
                <div className="flex items-center gap-2">
                  {/* Avatar with gradient ring */}
                  <div style={{
                    width:44, height:44, borderRadius:'50%', flexShrink:0,
                    background: isSel ? `linear-gradient(135deg, ${grad.start}, ${grad.end})` : cfg.bg,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    border: `2px solid ${isSel ? 'transparent' : cfg.color}`,
                    fontSize:'1.5rem', position:'relative',
                  }}>
                    {f.avatar}
                    {/* Online dot */}
                    <span style={{
                      position:'absolute', bottom:1, right:1,
                      width:10, height:10, borderRadius:'50%',
                      background: cfg.color,
                      border: '2px solid white',
                    }} />
                  </div>
                  <div>
                    <p style={{ fontWeight:700, fontSize:'0.9rem', color:'var(--color-text-primary)' }}>{f.name}</p>
                    <div className="flex items-center gap-2" style={{ marginTop:2 }}>
                      <span style={{ fontSize:'0.72rem', color: cfg.color, fontWeight:600 }}>{cfg.label}</span>
                      <span style={{ fontSize:'0.72rem', color:'var(--color-text-muted)' }}>· Sec {f.section}</span>
                    </div>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <p style={{ fontFamily:'var(--font-display)', fontSize:'1.3rem', fontWeight:800, color:'var(--color-primary)' }}>
                    {dist}
                    <span style={{ fontSize:'0.7rem', fontWeight:500, color:'var(--color-text-secondary)' }}>m</span>
                  </p>
                  <p style={{ fontSize:'0.62rem', color:'var(--color-text-muted)', textTransform:'uppercase', fontWeight:600, letterSpacing:'0.06em' }}>away</p>
                </div>
              </button>

              {/* Actions */}
              {isSel && (
                <div className="animate-slide-up" style={{ marginTop:'var(--space-2)', display:'flex', gap:'var(--space-1)' }}>
                  <button
                    className="btn flex-1"
                    style={{ padding:'9px', background:'var(--color-primary-soft)', color:'var(--color-primary)', borderRadius:'var(--radius-md)', fontSize:'0.78rem', fontWeight:700 }}
                    onClick={() => handleMeet(f)}
                    id={`meet-${f.id}`}
                  ><Navigation2 size={13} /> Meet Up</button>
                  <button
                    className="btn flex-1"
                    style={{ padding:'9px', background:'var(--color-teal-soft)', color:'var(--color-teal)', borderRadius:'var(--radius-md)', fontSize:'0.78rem', fontWeight:700 }}
                    id={`msg-${f.id}`}
                  ><MessageCircle size={13} /> Message</button>
                  <button
                    className="btn btn--ghost"
                    style={{ padding:'9px 13px' }}
                    aria-label={`Call ${f.name}`}
                  ><Phone size={13} /></button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
