import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthOverlay from '../components/AuthOverlay';
import React from 'react';

describe('AuthOverlay Component', () => {
  it('should render the login title', () => {
    render(<AuthOverlay onLogin={() => {}} />);
    expect(screen.getByText(/Welcome to Vantage/i)).toBeInTheDocument();
  });

  it('should call onLogin after a delay when form is submitted', async () => {
    const onLogin = vi.fn();
    render(<AuthOverlay onLogin={onLogin} />);
    
    const emailInput = screen.getByPlaceholderText(/yours@example.com/i);
    const passInput = screen.getByPlaceholderText(/••••••••/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In/i });

    fireEvent.change(emailInput, { target: { value: 'test@vantage.io' } });
    fireEvent.change(passInput, { target: { value: 'password123' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Authenticating.../i)).toBeInTheDocument();

    await waitFor(() => expect(onLogin).toHaveBeenCalledWith(expect.objectContaining({
      email: 'test@vantage.io'
    })), { timeout: 2000 });
  });

  it('should call onLogin immediately when guest mode is clicked', () => {
    const onLogin = vi.fn();
    render(<AuthOverlay onLogin={onLogin} />);
    const guestBtn = screen.getByText(/Skip for now/i);
    fireEvent.click(guestBtn);
    expect(onLogin).toHaveBeenCalledWith(expect.objectContaining({ email: 'guest@vantage.io' }));
  });
});
