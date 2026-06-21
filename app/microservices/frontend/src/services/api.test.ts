import { afterEach, describe, expect, it, vi } from 'vitest';

describe('apiClient', () => {
  const originalApiUrl = process.env.REACT_APP_API_URL;

  afterEach(() => {
    vi.resetModules();
    process.env.REACT_APP_API_URL = originalApiUrl;
  });

  it('uses same-origin /api by default', async () => {
    delete process.env.REACT_APP_API_URL;

    const apiClient = (await import('./api')).default;
    expect(apiClient.defaults.baseURL).toBe('/api');
  });

  it('allows an explicit API URL override', async () => {
    process.env.REACT_APP_API_URL = 'https://api.example.test/api';

    const apiClient = (await import('./api')).default;
    expect(apiClient.defaults.baseURL).toBe('https://api.example.test/api');
  });
});
