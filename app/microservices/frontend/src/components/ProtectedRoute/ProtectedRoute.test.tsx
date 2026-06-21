import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

const navigateSpy = vi.hoisted(() => vi.fn());

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, state }: { to: string; state?: unknown }) => {
    navigateSpy({ to, state });
    return <div>Redirected to {to}</div>;
  },
  useLocation: () => ({ pathname: '/profile', search: '?tab=orders', hash: '#latest' }),
}));

vi.mock('../../services/authService', () => ({
  authService: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
  },
}));

const mockedAuthService = vi.mocked(authService);

const renderProtectedRoute = () => {
  render(
    <AuthProvider>
      <ProtectedRoute>
        <h1>My Profile</h1>
      </ProtectedRoute>
    </AuthProvider>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('redirects an anonymous profile route to login', async () => {
    renderProtectedRoute();

    expect(await screen.findByText('Redirected to /login')).toBeInTheDocument();
    expect(navigateSpy).toHaveBeenCalledWith({
      to: '/login',
      state: {
        from: expect.objectContaining({
          pathname: '/profile',
          search: '?tab=orders',
          hash: '#latest',
        }),
      },
    });
    expect(screen.queryByRole('heading', { name: /my profile/i })).not.toBeInTheDocument();
    expect(mockedAuthService.getCurrentUser).not.toHaveBeenCalled();
  });
});
