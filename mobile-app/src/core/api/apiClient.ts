import { appConfig } from '@/core/config/appConfig';
import { ApiError } from './apiError';

type RequestOptions = RequestInit & { timeoutMs?: number };

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? appConfig.apiTimeoutMs,
  );

  try {
    // TODO Step 2: inject the mobile auth token from SecureStore.
    const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Client-Type': 'mobile',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError('La requête API a échoué.', response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('La requête a expiré.', 408, 'TIMEOUT');
    }
    throw new ApiError('Impossible de joindre le serveur.');
  } finally {
    clearTimeout(timeout);
  }
}
