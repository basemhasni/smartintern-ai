import { appConfig } from '@/core/config/appConfig';
import { getAccessToken } from '@/core/storage/secureStorage';
import { ApiError } from './apiError';

type RequestOptions = RequestInit & {
  timeoutMs?: number;
  skipAuth?: boolean;
};

type UnauthorizedHandler = () => void | Promise<void>;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  unauthorizedHandler = handler;
};

const parseResponseBody = async (response: Response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
};

const extractApiMessage = (body: unknown) => {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message?: unknown }).message;
    if (typeof message === 'string') return message;
  }

  return null;
};

export async function mobileApiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const controller = new AbortController();
  const { timeoutMs, skipAuth, headers, ...requestOptions } = options;
  const timeout = setTimeout(
    () => controller.abort(),
    timeoutMs ?? appConfig.apiTimeoutMs,
  );

  try {
    const token = skipAuth ? null : await getAccessToken();
    const isMultipart = typeof FormData !== 'undefined' && requestOptions.body instanceof FormData;
    const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(!isMultipart ? { 'Content-Type': 'application/json' } : {}),
        'X-Client-Type': 'mobile',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
    const body = await parseResponseBody(response);

    if (!response.ok) {
      if (response.status === 401 && !skipAuth && unauthorizedHandler) {
        await unauthorizedHandler();
      }
      throw new ApiError(
        extractApiMessage(body) ?? 'La requete API a echoue.',
        response.status,
      );
    }

    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('La requete a expire.', 408, 'TIMEOUT');
    }
    throw new ApiError('Impossible de joindre le serveur.', undefined, 'NETWORK');
  } finally {
    clearTimeout(timeout);
  }
}
