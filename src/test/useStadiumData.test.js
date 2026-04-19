import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useStadiumData } from '../hooks/useStadiumData';

describe('useStadiumData', () => {
  it('should initialize with default stadium data', () => {
    const { result } = renderHook(() => useStadiumData());
    
    expect(result.current.densities).toBeDefined();
    expect(result.current.waitTimes).toBeDefined();
    expect(result.current.friends).toBeDefined();
    expect(result.current.orders).toBeDefined();
    expect(result.current.tickCount).toBe(0);
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
