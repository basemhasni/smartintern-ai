import { Platform } from 'react-native';

const API_URLS = {
  web: 'http://localhost:5000/api',
  ios: 'http://localhost:5000/api',
  android: 'http://10.0.2.2:5000/api',
} as const;

/**
 * Android Emulator reaches the host through 10.0.2.2.
 * Web and iOS Simulator can use localhost.
 * For a real phone, set EXPO_PUBLIC_API_URL to http://YOUR_PC_LAN_IP:5000/api.
 */
export const appConfig = {
  name: 'SmartIntern AI',
  apiBaseUrl:
    process.env.EXPO_PUBLIC_API_URL ??
    API_URLS[Platform.OS as keyof typeof API_URLS] ??
    API_URLS.web,
  apiTimeoutMs: 12_000,
} as const;
