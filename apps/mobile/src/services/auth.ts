import { Platform } from 'react-native';
import { api, setAuthToken } from './api';

// In-memory token store with fallback
let inMemoryStore: Record<string, string> = {};

export const saveSecureItem = async (key: string, value: string) => {
  try {
    inMemoryStore[key] = value;
    // Attempt dynamic SecureStore if available in environment
    const SecureStore = require('expo-secure-store');
    if (SecureStore && SecureStore.setItemAsync) {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (e) {
    inMemoryStore[key] = value;
  }
};

export const getSecureItem = async (key: string): Promise<string | null> => {
  try {
    const SecureStore = require('expo-secure-store');
    if (SecureStore && SecureStore.getItemAsync) {
      const val = await SecureStore.getItemAsync(key);
      if (val) return val;
    }
    return inMemoryStore[key] || null;
  } catch (e) {
    return inMemoryStore[key] || null;
  }
};

export const removeSecureItem = async (key: string) => {
  try {
    delete inMemoryStore[key];
    const SecureStore = require('expo-secure-store');
    if (SecureStore && SecureStore.deleteItemAsync) {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (e) {
    delete inMemoryStore[key];
  }
};

export const getDevicePayload = () => {
  const os = Platform.OS === 'ios' ? 'iOS' : 'Android';
  return {
    deviceName: `${os} Mobile Device (EDU CLICK App)`,
    platform: Platform.OS.toUpperCase(),
  };
};

export const loginUser = async (identifier: string, password: string) => {
  const device = getDevicePayload();
  const res = await api.post('/auth/login', {
    identifier,
    password,
    ...device,
  });

  if (res.data.success) {
    const { accessToken, refreshToken, user } = res.data.data;
    setAuthToken(accessToken);
    await saveSecureItem('accessToken', accessToken);
    if (refreshToken) await saveSecureItem('refreshToken', refreshToken);
    await saveSecureItem('user', JSON.stringify(user));
    return { user, accessToken };
  }
  throw new Error(res.data.message || 'Login failed');
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout', {});
  } catch (e) {}
  setAuthToken(null);
  await removeSecureItem('accessToken');
  await removeSecureItem('refreshToken');
  await removeSecureItem('user');
};
