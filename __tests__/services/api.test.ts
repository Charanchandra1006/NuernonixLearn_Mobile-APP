import api, { authAPI } from '../../src/services/api';
import MockAdapter from 'axios-mock-adapter';
import * as SecureStore from 'expo-secure-store';

jest.mock('expo-secure-store');

describe('API Services', () => {
  let mock: MockAdapter;

  beforeAll(() => {
    mock = new MockAdapter(api);
  });

  afterEach(() => {
    mock.reset();
  });

  it('should add Authorization header if token exists', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-token');
    
    mock.onGet('/auth/me').reply(200, { user: { name: 'Test' } });

    const res = await authAPI.getMe();
    expect(res.config.headers?.Authorization).toBe('Bearer test-token');
    expect(res.data.user.name).toBe('Test');
  });

  it('should refresh token on 401 response', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('old-token');
    
    // First request fails with 401
    mock.onGet('/auth/me').replyOnce(401);
    
    // Refresh succeeds
    mock.onPost(`${process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5050/api'}/auth/refresh`).replyOnce(200, { token: 'new-token' });
    
    // Second request succeeds
    mock.onGet('/auth/me').replyOnce(200, { user: { name: 'Refreshed' } });

    const res = await authAPI.getMe();
    expect(res.data.user.name).toBe('Refreshed');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token', 'new-token');
  });
});
