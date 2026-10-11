import { useAuthStore } from '../../src/store/authStore';
import { authAPI } from '../../src/services/api';
import * as SecureStore from 'expo-secure-store';

jest.mock('../../src/services/api', () => ({
  authAPI: {
    login: jest.fn(),
    logout: jest.fn(),
    getMe: jest.fn(),
  },
}));

jest.mock('expo-secure-store');

describe('Auth Store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, isAuthenticated: false, isLoading: true });
    jest.clearAllMocks();
  });

  it('should login and set token', async () => {
    const mockUser = { id: '1', name: 'Test User' };
    (authAPI.login as jest.Mock).mockResolvedValue({ data: { token: 'token-123', user: mockUser } });

    await useAuthStore.getState().login('test@test.com', 'password');

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe('token-123');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('token', 'token-123');
  });

  it('should logout and clear token', async () => {
    useAuthStore.setState({ user: { name: 'Test' } as any, token: 'token-123', isAuthenticated: true });

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('token');
  });

  it('should loadUser and return the user object when token exists', async () => {
    const mockUser = { _id: 'u1', name: 'Learner' };
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('token-abc');
    (authAPI.getMe as jest.Mock).mockResolvedValue({ data: { user: mockUser } });

    const result = await useAuthStore.getState().loadUser();

    expect(result).toEqual(mockUser);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().user).toEqual(mockUser);
  });

  it('should not delete token on network failure during loadUser', async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('token-abc');
    (authAPI.getMe as jest.Mock).mockRejectedValue(new Error('Network error'));

    const result = await useAuthStore.getState().loadUser();

    expect(result).toBeNull();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalledWith('token');
  });
});
