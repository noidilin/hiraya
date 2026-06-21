export {};

describe('apiClient', () => {
  const originalApiUrl = process.env.REACT_APP_API_URL;

  afterEach(() => {
    jest.resetModules();
    process.env.REACT_APP_API_URL = originalApiUrl;
  });

  it('uses same-origin /api by default', () => {
    delete process.env.REACT_APP_API_URL;

    jest.isolateModules(() => {
      const apiClient = require('./api').default;
      expect(apiClient.defaults.baseURL).toBe('/api');
    });
  });

  it('allows an explicit API URL override', () => {
    process.env.REACT_APP_API_URL = 'https://api.example.test/api';

    jest.isolateModules(() => {
      const apiClient = require('./api').default;
      expect(apiClient.defaults.baseURL).toBe('https://api.example.test/api');
    });
  });
});
