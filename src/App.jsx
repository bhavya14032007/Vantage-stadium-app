/**
 * Vantage — Main App Shell
 * Violet Transport Pro theme — light mode, gradient header.
 */
import { useState } from 'react';
import {
  Map, BarChart2, ShoppingBag, Users, AlertTriangle, Wifi, WifiOff, Bell
} from 'lucide-react';

import { useStadiumData } from './hooks/useStadiumData';
import PulseMap          from './components/PulseMap';
import LiveWaitAnalytics from './components/LiveWaitAnalytics';
import ExpressOrder      from './components/ExpressOrder';
import FriendFinder      from './components/FriendFinder';
import EmergencyFlow     from './components/EmergencyFlow';

const TABS = [
  { id: 'map',       label: 'Pulse',    Icon: Map          },
  { id: 'wait',      label: 'Queues',   Icon: BarChart2    },
  { id: 'order',     label: 'Order',    Icon: ShoppingBag  },
  { id: 'friends',   label: 'Friends',  Icon: Users        },
  { id: 'emergency', label: 'SOS',      Icon: AlertTriangle },
];

export default function App() {
  const [activeTab, setActiveTab]       = useState('map');
  const [emergencyActive, setEmergency] = useState(false);
  const { densities, waitTimes, friends, orders, setOrders, tickCount } = useStadiumData(3500);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== 'emergency') setEmergency(false);
  };

  const handleEmergencyToggle = () => {
    setEmergency(prev => !prev);
    if (activeTab !== 'emergency') setActiveTab('emergency');
  };

  return (
    <div className={`app-layout ${emergencyActive ? 'animate-emergency' : ''}`}>

      {/* ── Header ── */}
      <header className="app-header" role="banner">
        <div className="app-header__hero">
          <div className="app-header__top">
            {/* Logo */}
            <div>
              <h1 className="logo">Vantage</h1>
              <p className="logo-sub">Stadium Companion</p>
            </div>

            {/* Right actions */}
            <div style={{ display:'flex', alignItems:'center', gap:'var(--space-1)', position:'relative', zIndex:1 }}>
              {/* Sync pulse */}
              <div
                key={tickCount}
                className="animate-fade-in"
                style={{
                  background: 'rgba(255,255,255,0.15)',
                  borderRadius: 'var(--radius-full)',
                  padding: '4px 10px',
                  display: 'flex', alignItems: 'center', gap: 5,
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--color-green-light)', animation:'pulse 1.5s ease-in-out infinite', display:'block' }} />
                <span style={{ fontSize:'0.62rem', color:'rgba(255,255,255,0.85)', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase' }}>Live</span>
              </div>

              {/* Notification icon */}
              <button
                style={{ width:34, height:34, borderRadius:'var(--radius-md)', background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', color:'white' }}
                aria-label="Notifications"
              >
                <Bell size={16} />
              </button>

              {/* SOS toggle */}
              <button
                style={{
                  padding: '6px 12px',
                  background: emergencyActive ? 'white' : 'rgba(255,255,255,0.18)',
                  color: emergencyActive ? 'var(--color-red)' : 'white',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex', alignItems: 'center', gap: 5,
                  fontSize: '0.72rem', fontWeight: 700,
                  border: emergencyActive ? '2px solid var(--color-red)' : '1.5px solid rgba(255,255,255,0.3)',
                  transition: 'all 0.2s',
                }}
                onClick={handleEmergencyToggle}
                aria-pressed={emergencyActive}
                aria-label={emergencyActive ? 'Deactivate SOS' : 'Activate SOS'}
                id="header-emergency-btn"
              >
                <AlertTriangle size={12} />
                {emergencyActive ? 'SOS ON' : 'SOS'}
              </button>
            </div>
          </div>

          {/* Venue strip */}
          <div style={{ marginTop:'var(--space-1)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', zIndex:1 }}>
            <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.75)' }}>
              🏟️ Narendra Modi Stadium · 22:30 IST
            </span>
            <span style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.75)' }}>
              Sec <strong style={{ color:'white' }}>B2</strong> · Row 14 · Seat 7
            </span>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="app-content" id="main-content" role="main">
        {activeTab === 'map'       && <div className="animate-fade-in"><PulseMap densities={densities} /></div>}
        {activeTab === 'wait'      && <div className="animate-fade-in"><LiveWaitAnalytics waitTimes={waitTimes} /></div>}
        {activeTab === 'order'     && <div className="animate-fade-in"><ExpressOrder orders={orders} setOrders={setOrders} /></div>}
        {activeTab === 'friends'   && <div className="animate-fade-in"><FriendFinder friends={friends} /></div>}
        {activeTab === 'emergency' && <div className="animate-fade-in"><EmergencyFlow active={emergencyActive} onToggle={handleEmergencyToggle} /></div>}
      </main>

      {/* ── Bottom Navigation ── */}
      <nav className="bottom-nav" aria-label="Primary navigation" role="navigation">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          const isEmergencyTab = id === 'emergency';
          return (
            <button
              key={id}
              className={`bottom-nav__item ${isActive ? 'active' : ''} ${isEmergencyTab ? 'emergency' : ''}`}
              onClick={() => handleTabChange(id)}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
              id={`nav-${id}`}
            >
              <span className="nav-active-indicator" aria-hidden="true" />
              <Icon
                size={20}
                className="nav-icon"
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className="bottom-nav__label">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
