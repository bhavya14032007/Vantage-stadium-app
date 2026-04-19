import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Vite environment variables
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_FIREBASE_API_KEY: 'test-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'test-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'test.appspot.com',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '12345',
      VITE_FIREBASE_APP_ID: 'test-app-id',
      VITE_FIREBASE_MEASUREMENT_ID: 'G-TEST'
    }
  }
});

// Robust Firebase Mocking
vi.mock('firebase/app', () => ({ initializeApp: vi.fn() }));
vi.mock('firebase/analytics', () => ({ getAnalytics: vi.fn(), logEvent: vi.fn() }));
vi.mock('firebase/firestore', () => ({ 
  getFirestore: vi.fn(), 
  collection: vi.fn(), 
  query: vi.fn(), 
  limit: vi.fn(), 
  onSnapshot: vi.fn(() => vi.fn()) 
}));

/**
 * Standard Named Export Mock for Lucide-React
 * Comprehensive list of icons used in Vantage to ensure no 'No export defined' errors.
 */
const MockIcon = ({ id, ...props }) => <div data-testid={`icon-${id}`} {...props} />;

vi.mock('lucide-react', () => ({
  Map: (p) => <MockIcon id="Map" {...p} />,
  BarChart2: (p) => <MockIcon id="BarChart2" {...p} />,
  ShoppingBag: (p) => <MockIcon id="ShoppingBag" {...p} />,
  Users: (p) => <MockIcon id="Users" {...p} />,
  AlertTriangle: (p) => <MockIcon id="AlertTriangle" {...p} />,
  Bell: (p) => <MockIcon id="Bell" {...p} />,
  User: (p) => <MockIcon id="User" {...p} />,
  Newspaper: (p) => <MockIcon id="Newspaper" {...p} />,
  Info: (p) => <MockIcon id="Info" {...p} />,
  ShieldCheck: (p) => <MockIcon id="ShieldCheck" {...p} />,
  Mail: (p) => <MockIcon id="Mail" {...p} />,
  Lock: (p) => <MockIcon id="Lock" {...p} />,
  ArrowRight: (p) => <MockIcon id="ArrowRight" {...p} />,
  Github: (p) => <MockIcon id="Github" {...p} />,
  Chrome: (p) => <MockIcon id="Chrome" {...p} />,
  Fingerprint: (p) => <MockIcon id="Fingerprint" {...p} />,
  Navigation2: (p) => <MockIcon id="Navigation2" {...p} />,
  X: (p) => <MockIcon id="X" {...p} />,
  Zap: (p) => <MockIcon id="Zap" {...p} />,
  Layers: (p) => <MockIcon id="Layers" {...p} />,
  Phone: (p) => <MockIcon id="Phone" {...p} />,
  MapPin: (p) => <MockIcon id="MapPin" {...p} />,
  ShieldAlert: (p) => <MockIcon id="ShieldAlert" {...p} />,
  Bus: (p) => <MockIcon id="Bus" {...p} />,
  Droplets: (p) => <MockIcon id="Droplets" {...p} />,
  Clock: (p) => <MockIcon id="Clock" {...p} />,
  Lightbulb: (p) => <MockIcon id="Lightbulb" {...p} />,
  TrendingDown: (p) => <MockIcon id="TrendingDown" {...p} />,
  ChevronRight: (p) => <MockIcon id="ChevronRight" {...p} />,
  Sparkles: (p) => <MockIcon id="Sparkles" {...p} />,
  ShoppingCart: (p) => <MockIcon id="ShoppingCart" {...p} />,
  CheckCircle2: (p) => <MockIcon id="CheckCircle2" {...p} />,
  ChefHat: (p) => <MockIcon id="ChefHat" {...p} />,
  Plus: (p) => <MockIcon id="Plus" {...p} />,
  Minus: (p) => <MockIcon id="Minus" {...p} />,
  Package: (p) => <MockIcon id="Package" {...p} />,
  MessageCircle: (p) => <MockIcon id="MessageCircle" {...p} />,
  UserCheck: (p) => <MockIcon id="UserCheck" {...p} />,
}));
