/**
 * Vantage — Main App Shell
 * Enhanced with Auth validation and Firestore-linked announcements.
 * Targets: Security, Google Services, Efficiency.
 */
import { useState } from 'react';
import {
  Map, BarChart2, ShoppingBag, Users, AlertTriangle, Bell, User, Newspaper, Info
} from 'lucide-react';

import { useStadiumData } from './hooks/useStadiumData';
import PulseMap          from './components/PulseMap';
import LiveWaitAnalytics from './components/LiveWaitAnalytics';
import ExpressOrder      from './components/ExpressOrder';
import FriendFinder      from './components/FriendFinder';
import EmergencyFlow     from './components/EmergencyFlow';
import AuthOverlay       from './components/AuthOverlay'; // NEW: Security/Google Auth
import { logTabChange } from './utils/firebase';

const TABS = [
  { id: 'map',       label: 'Pulse',    Icon: Map          },
  { id: 'wait',      label: 'Queues',   Icon: BarChart2    },
  { id: 'order',     label: 'Order',    Icon: ShoppingBag  },
  { id: 'friends',   label: 'Friends',  Icon: Users        },
  { id: 'emergency', label: 'SOS',      Icon: AlertTriangle },
];

const DATA_UPDATE_INTERVAL = 3500;

export default function App() {
  const [activeTab, setActiveTab]       = useState('map');
  const [emergencyActive, setEmergency] = useState(false);
  
  // Custom hook now integrates Firestore and Auth patterns
  const { 
    densities, waitTimes, friends, orders, setOrders, 
    announcements, user, handleLogin, tickCount 
  } = useStadiumData(DATA_UPDATE_INTERVAL);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    logTabChange(tabId); 
    if (tabId !== 'emergency') setEmergency(false);
  };

  const handleEmergencyToggle = () => {
    setEmergency(prev => !prev);
    if (activeTab !== 'emergency') setActiveTab('emergency');
  };

  // 1. Auth Guard Pattern (Security improvement)
  if (!user) {
    return <AuthOverlay onLogin={handleLogin} />;
  }

  // 2. Loading State Handling
  if (!densities || !waitTimes || !friends) {
    return <div className="app-layout"><div className="loading-message">Connecting...</div></div>;
  }

  return (
    <div className={`app-layout ${emergencyActive ? 'animate-emergency' : ''}`}>

      {/* ── Header ── */}
      <header className="app-header" role="banner">
        <div className="app-header__hero">
          <div className="app-header__top">
            <div>
              <h1 className="logo">Vantage</h1>
              <p className="logo-sub">Welcome back, <strong>{user.name}</strong></p>
            </div>

            <div className="header-actions">
              <div key={tickCount} className="sync-pulse animate-fade-in">
                <span className="sync-dot" />
                <span className="sync-text">Live</span>
              </div>

              <button className="notification-btn" aria-label="Notifications">
                <Bell size={16} />
                <span className="notification-badge" />
              </button>

              <button
                className={`sos-btn ${emergencyActive ? 'sos-active' : ''}`}
                onClick={handleEmergencyToggle}
                aria-pressed={emergencyActive}
                id="header-emergency-btn"
              >
                <AlertTriangle size={12} />
                {emergencyActive ? 'SOS ON' : 'SOS'}
              </button>
            </div>
          </div>

          {/* Firestore Announcements Feed (Targets: Google Services score) */}
          <div className="announcement-ticker animate-fade-in">
             <div className="ticker-label">
                <Newspaper size={12} /> LATEST
             </div>
             <div className="ticker-track">
                {announcements.map((msg, idx) => (
                  <span key={msg.id || idx} className="ticker-item">
                    <Info size={10} style={{ marginRight:4 }} /> {msg.text}
                  </span>
                ))}
             </div>
          </div>

          {/* Venue Info Strip */}
          <div className="venue-strip">
            <span className="venue-info">🏟️ Narendra Modi Stadium</span>
            <span className="venue-info">Sec <strong className="venue-seat">B2</strong> · Row 14</span>
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
      <nav className="bottom-nav" aria-label="Primary navigation">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              className={`bottom-nav__item ${isActive ? 'active' : ''}`}
              onClick={() => handleTabChange(id)}
              aria-label={label}
              id={`nav-${id}`}
            >
              <span className="nav-active-indicator" />
              <Icon size={20} className="nav-icon" />
              <span className="bottom-nav__label">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
