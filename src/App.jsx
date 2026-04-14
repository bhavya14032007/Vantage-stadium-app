/**
 * Vantage — Main App Shell
 * Mobile-first stadium companion app with bottom navigation.
 */
import { useState } from 'react';
import {
  Map, BarChart2, ShoppingBag, Users, AlertTriangle, Wifi, WifiOff
} from 'lucide-react';

import { useStadiumData } from './hooks/useStadiumData';
import PulseMap        from './components/PulseMap';
import LiveWaitAnalytics from './components/LiveWaitAnalytics';
import ExpressOrder    from './components/ExpressOrder';
import FriendFinder    from './components/FriendFinder';
import EmergencyFlow   from './components/EmergencyFlow';

const TABS = [
  { id: 'map',      label: 'Pulse',    Icon: Map         },
  { id: 'wait',     label: 'Queues',   Icon: BarChart2   },
  { id: 'order',    label: 'Order',    Icon: ShoppingBag },
  { id: 'friends',  label: 'Friends',  Icon: Users       },
  { id: 'emergency',label: 'SOS',      Icon: AlertTriangle },
];

export default function App() {
  const [activeTab, setActiveTab]         = useState('map');
  const [emergencyActive, setEmergency]   = useState(false);
  const { densities, waitTimes, friends, orders, setOrders, tickCount } = useStadiumData(3500);

  const isConnected = true; // mock — always connected

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    // If navigating to emergency tab, stay in normal view (toggle is inside)
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
        <div className="app-header__top">
          <div>
            <h1 className="logo text-display" aria-label="Vantage app">
              VANTAGE
            </h1>
            <p style={{ fontSize:'0.6rem', color:'var(--color-text-muted)', letterSpacing:'0.15em', textTransform:'uppercase', lineHeight:1 }}>
              Stadium Companion
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Pulse tick indicator */}
            <span
              key={tickCount}
              className="badge badge--green animate-fade-in"
              style={{ fontSize:'0.6rem' }}
              aria-label="Data synchronized"
            >
              <span className="live-indicator__dot" style={{ width:5, height:5 }} />
              Synced
            </span>

            {/* Connection indicator */}
            <span style={{ color: isConnected ? 'var(--color-green)' : 'var(--color-red)' }}
              aria-label={isConnected ? 'Connected' : 'Offline'}>
              {isConnected ? <Wifi size={15} /> : <WifiOff size={15} />}
            </span>

            {/* Emergency quick toggle */}
            <button
              className={`btn ${emergencyActive ? 'btn--danger' : ''}`}
              style={{
                padding:'6px 10px', fontSize:'0.7rem',
                background: emergencyActive ? 'var(--color-red)' : 'var(--color-red-glow)',
                color: 'var(--color-red)',
                border: `1px solid ${emergencyActive ? 'var(--color-red)' : 'rgba(255,61,90,0.3)'}`,
                borderRadius:'var(--radius-md)',
              }}
              onClick={handleEmergencyToggle}
              aria-pressed={emergencyActive}
              aria-label={emergencyActive ? 'Deactivate Emergency Mode' : 'Activate Emergency Mode'}
              id="header-emergency-btn"
            >
              <AlertTriangle size={12} color={emergencyActive ? 'white' : 'var(--color-red)'} />
              {emergencyActive ? 'SOS ON' : 'SOS'}
            </button>
          </div>
        </div>

        {/* Venue info strip */}
        <div className="flex items-center justify-between"
          style={{ paddingTop:4, paddingBottom:2 }}>
          <span style={{ fontSize:'0.68rem', color:'var(--color-text-secondary)' }}>
            🏟️ Narendra Modi Stadium · 22:30 IST
          </span>
          <span style={{ fontSize:'0.68rem', color:'var(--color-text-secondary)' }}>
            Sec <strong style={{ color:'var(--color-blue)' }}>B2</strong> · Row 14 · Seat 7
          </span>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="app-content" id="main-content" role="main">
        {activeTab === 'map'      && (
          <div className="animate-fade-in">
            <PulseMap densities={densities} />
          </div>
        )}
        {activeTab === 'wait'     && (
          <div className="animate-fade-in">
            <LiveWaitAnalytics waitTimes={waitTimes} />
          </div>
        )}
        {activeTab === 'order'    && (
          <div className="animate-fade-in">
            <ExpressOrder orders={orders} setOrders={setOrders} />
          </div>
        )}
        {activeTab === 'friends'  && (
          <div className="animate-fade-in">
            <FriendFinder friends={friends} />
          </div>
        )}
        {activeTab === 'emergency' && (
          <div className="animate-fade-in">
            <EmergencyFlow active={emergencyActive} onToggle={handleEmergencyToggle} />
          </div>
        )}
      </main>

      {/* ── Bottom Navigation ── */}
      <nav className="bottom-nav" aria-label="Primary navigation">
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
              <Icon
                size={20}
                className="nav-icon"
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className="bottom-nav__label">{label}</span>
              {/* Active indicator dot */}
              {isActive && (
                <span style={{
                  position:'absolute', bottom:4, left:'50%', transform:'translateX(-50%)',
                  width:4, height:4, borderRadius:'50%',
                  background: isEmergencyTab ? 'var(--color-red)' : 'var(--color-green)',
                }} aria-hidden="true" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
