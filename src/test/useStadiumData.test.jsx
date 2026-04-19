import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useStadiumData } from '../hooks/useStadiumData';
import React from 'react';

// Mock the Firebase modules since they are imported in useStadiumData
vi.mock('../utils/firebase', () => ({
  db: {},
  analytics: {},
}));

describe('useStadiumData', () => {
  it('should initialize with default stadium data and announcements', () => {
    const { result } = renderHook(() => useStadiumData());
    
    expect(result.current.densities).toBeDefined();
    expect(result.current.waitTimes).toBeDefined();
    expect(result.current.friends).toBeDefined();
    expect(result.current.announcements).toBeDefined();
    expect(result.current.tickCount).toBe(0);
  });

  it('should handle login state changes', () => {
    const { result } = renderHook(() => useStadiumData());
    
    act(() => {
      result.current.handleLogin({ name: 'Test User', email: 'test@vantage.io' });
    });
    
    expect(result.current.user).toEqual({ name: 'Test User', email: 'test@vantage.io' });
  });

  it('should increment tickCount after the interval', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useStadiumData(1000));
    
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(result.current.tickCount).toBeGreaterThan(0);
    vi.useRealTimers();
  });
});
