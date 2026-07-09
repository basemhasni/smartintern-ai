import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'smartintern.mobile.accessToken';
const USER_ROLE_KEY = 'smartintern.mobile.userRole';
const webMemoryStore = new Map<string, string>();

const getWebStorage = () => {
  if (Platform.OS !== 'web') return null;
  if (typeof window === 'undefined') return null;
  return window.localStorage ?? null;
};

const setItem = async (key: string, value: string) => {
  const webStorage = getWebStorage();

  if (webStorage) {
    webStorage.setItem(key, value);
    return;
  }

  if (Platform.OS === 'web') {
    webMemoryStore.set(key, value);
    return;
  }

  await SecureStore.setItemAsync(key, value);
};

const getItem = async (key: string) => {
  const webStorage = getWebStorage();

  if (webStorage) return webStorage.getItem(key);
  if (Platform.OS === 'web') return webMemoryStore.get(key) ?? null;

  return SecureStore.getItemAsync(key);
};

const deleteItem = async (key: string) => {
  const webStorage = getWebStorage();

  if (webStorage) {
    webStorage.removeItem(key);
    return;
  }

  if (Platform.OS === 'web') {
    webMemoryStore.delete(key);
    return;
  }

  await SecureStore.deleteItemAsync(key);
};

export const saveAccessToken = (token: string): Promise<void> => setItem(ACCESS_TOKEN_KEY, token);

export const getAccessToken = (): Promise<string | null> => getItem(ACCESS_TOKEN_KEY);

export const clearAccessToken = (): Promise<void> => deleteItem(ACCESS_TOKEN_KEY);

export const saveUserRole = (role: string): Promise<void> => setItem(USER_ROLE_KEY, role);

export const getUserRole = (): Promise<string | null> => getItem(USER_ROLE_KEY);

export const clearAuthStorage = async (): Promise<void> => {
  await Promise.all([
    deleteItem(ACCESS_TOKEN_KEY),
    deleteItem(USER_ROLE_KEY),
  ]);
};

export const secureStorage = {
  saveAccessToken,
  getAccessToken,
  clearAccessToken,
  saveUserRole,
  getUserRole,
  clearAuthStorage,
};
