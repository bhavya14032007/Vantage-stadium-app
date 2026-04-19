import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import LiveWaitAnalytics from '../components/LiveWaitAnalytics';
import React from 'react';

const mockWaitTimes = {
  rest_A: { current: 12, nearby: { label: 'WC East', wait: 2, distance: 3 } },
  rest_B: { current: 5,  nearby: { label: 'WC West', wait: 4, distance: 5 } },
  con_A:  { current: 9,  nearby: { label: 'Food Truck', wait: 1, distance: 4 } },
  con_B:  { current: 4,  nearby: { label: 'Kiosk', wait: 0, distance: 6 } },
};

describe('LiveWaitAnalytics Component', () => {
  it('should render the dashboard title', () => {
    render(<LiveWaitAnalytics waitTimes={mockWaitTimes} />);
    expect(screen.getByText(/Live Queues/i)).toBeInTheDocument();
  });

  it('should display smart suggestions when wait times are high', () => {
    render(<LiveWaitAnalytics waitTimes={mockWaitTimes} />);
    // rest_A has high wait and significant saving near-by
    const suggestions = screen.getAllByText(/Smart Pick/i);
    expect(suggestions.length).toBeGreaterThan(0);
  });
});
