export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const toApiError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;
  if (error instanceof Error) return new ApiError(error.message);
  return new ApiError('Une erreur inattendue est survenue.');
};

export const normalizeApiError = (error: unknown): string => {
  const apiError = toApiError(error);

  if (apiError.code === 'NETWORK') return 'Backend indisponible. Verifiez que le serveur API est lance.';
  if (apiError.code === 'TIMEOUT') return 'La requete a expire. Reessayez dans quelques instants.';

  switch (apiError.status) {
    case 400:
      return apiError.message || 'Les donnees envoyees sont invalides.';
    case 401:
      return apiError.message === 'Invalid or expired token'
        ? 'Votre session a expire. Reconnectez-vous.'
        : 'Email ou mot de passe incorrect.';
    case 403:
      return 'Acces interdit pour ce compte.';
    case 404:
      return 'Ressource introuvable.';
    case 409:
      return 'Un compte existe deja avec ces informations.';
    case 429:
      return 'Trop de tentatives. Reessayez plus tard.';
    case 500:
      return 'Erreur serveur. Reessayez plus tard.';
    default:
      return apiError.message || 'Une erreur inattendue est survenue.';
  }
};
