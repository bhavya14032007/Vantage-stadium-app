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
  const { densities, waitTimes, friends, orders, setOrders, tickCount, loading, error } = useStadiumData(DATA_UPDATE_INTERVAL);
  // Error handling: Check if essential data is loaded
  if (!densities || !waitTimes || !friends) {
    return (
      <div className="app-layout loading-state">
        <div className="loading-message">Loading stadium data...</div>
      </div>
    );
  }
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    logTabChange(tabId); // Push analytics event to Google Services
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
            <div className="header-actions">
              {/* Sync pulse */}
              <div
                key={tickCount}
                className="sync-pulse animate-fade-in"
              >
                <span className="sync-dot" />
                <span className="sync-text">Live</span>
              </div>

              {/* Notification icon */}
              <button
                className="notification-btn"
                aria-label="Notifications"
              >
                <Bell size={16} />
              </button>

              {/* SOS toggle */}
              <button
                className={`sos-btn ${emergencyActive ? 'sos-active' : ''}`}
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
          <div className="venue-strip">
            <span className="venue-info">
              🏟️ Narendra Modi Stadium · 22:30 IST
            </span>
            <span className="venue-info">
              Sec <strong className="venue-seat">B2</strong> · Row 14 · Seat 7
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
