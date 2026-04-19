import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmergencyFlow from '../components/EmergencyFlow';
import React from 'react';

// Mock the stadium data exits
const mockExits = [
  { id: 'exit_1', label: 'Gate North', x: 100, y: 100, clearLevel: 'clear', shuttleWait: 5 },
  { id: 'exit_2', label: 'Gate South', x: 200, y: 200, clearLevel: 'busy', shuttleWait: 10 },
];

describe('EmergencyFlow Component', () => {
  it('should render the activation screen when inactive', () => {
    render(<EmergencyFlow active={false} onToggle={() => {}} />);
    expect(screen.getByText(/Emergency Exit Mode/i)).toBeInTheDocument();
  });

  it('should show the emergency banner and recommended route when active', () => {
    render(<EmergencyFlow active={true} onToggle={() => {}} />);
    expect(screen.getByText(/EMERGENCY MODE ACTIVE/i)).toBeInTheDocument();
    expect(screen.getByText(/Recommended Route/i)).toBeInTheDocument();
  });

  it('should call onToggle when Dismiss is clicked', () => {
    const onToggle = vi.fn();
    render(<EmergencyFlow active={true} onToggle={onToggle} />);
    const dismissBtn = screen.getByText(/Dismiss/i);
    fireEvent.click(dismissBtn);
    expect(onToggle).toHaveBeenCalled();
  });
});
