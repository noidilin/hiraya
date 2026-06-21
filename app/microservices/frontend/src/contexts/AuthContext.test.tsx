import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from './AuthContext';
import { authService } from '../services/authService';

jest.mock('../services/authService', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
    getCurrentUser: jest.fn(),
  },
}));

const mockedAuthService = authService as jest.Mocked<typeof authService>;

const demoUser = {
  id: 'f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6',
  email: 'demo@hirayavintage.test',
  firstName: 'Demo',
  lastName: 'User',
  role: 'customer' as const,
  createdAt: '2026-02-07T13:04:03.836Z',
  updatedAt: '2026-02-07T13:04:03.836Z',
};

const AuthStatus = () => {
  const { isAuthenticated, loading, login, user } = useAuth();

  return (
    <div>
      <p>{loading ? 'Loading' : isAuthenticated ? `Signed in as ${user?.firstName}` : 'Signed out'}</p>
      <button onClick={() => login(demoUser.email, 'password')}>Sign in</button>
    </div>
  );
};

const renderAuthStatus = () => {
  render(
    <AuthProvider>
      <AuthStatus />
    </AuthProvider>
  );
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('treats a visitor with no stored token as unauthenticated', async () => {
    renderAuthStatus();

    expect(await screen.findByText('Signed out')).toBeInTheDocument();
    expect(mockedAuthService.getCurrentUser).not.toHaveBeenCalled();
  });

  it('stores authenticated user state returned by login', async () => {
    mockedAuthService.login.mockResolvedValueOnce({
      user: demoUser,
      token: 'demo-access-token',
    });

    renderAuthStatus();

    await screen.findByText('Signed out');
    userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Signed in as Demo')).toBeInTheDocument();
    await waitFor(() => expect(localStorage.getItem('accessToken')).toBe('demo-access-token'));
    expect(localStorage.getItem('refreshToken')).toBeNull();
  });

  it('loads current identity when a token is already stored', async () => {
    localStorage.setItem('accessToken', 'existing-token');
    mockedAuthService.getCurrentUser.mockResolvedValueOnce(demoUser);

    renderAuthStatus();

    expect(await screen.findByText('Signed in as Demo')).toBeInTheDocument();
    expect(mockedAuthService.getCurrentUser).toHaveBeenCalledTimes(1);
  });
});
