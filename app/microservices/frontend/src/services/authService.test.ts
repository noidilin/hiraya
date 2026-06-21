import apiClient from './api';
import { authService } from './authService';

jest.mock('./api', () => ({
  __esModule: true,
  default: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

const demoUser = {
  id: 'f8b01ff1-9114-4c3e-92a7-45a8d1f2d6e6',
  email: 'demo@hirayavintage.test',
  firstName: 'Demo',
  lastName: 'User',
  role: 'customer' as const,
  createdAt: '2026-02-07T13:04:03.836Z',
  updatedAt: '2026-02-07T13:04:03.836Z',
};

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('unwraps a successful login envelope', async () => {
    mockedApiClient.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          user: demoUser,
          token: 'demo-access-token',
        },
        message: 'Login successful',
      },
    });

    await expect(authService.login({ email: demoUser.email, password: 'password' })).resolves.toEqual({
      user: demoUser,
      token: 'demo-access-token',
    });
  });

  it('unwraps the current identity envelope', async () => {
    mockedApiClient.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: demoUser,
      },
    });

    await expect(authService.getCurrentUser()).resolves.toEqual(demoUser);
  });
});
