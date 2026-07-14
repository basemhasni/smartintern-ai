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
      return /credential|password|email/i.test(apiError.message)
        ? 'Email ou mot de passe incorrect.'
        : 'Votre session a expire. Reconnectez-vous.';
    case 403:
      return 'Acces interdit pour ce compte.';
    case 404:
      return 'Ressource introuvable.';
    case 409:
      return apiError.message || 'Cette operation a deja ete effectuee.';
    case 410:
      return 'Cette ressource n est plus disponible.';
    case 413:
      return 'Le contenu est trop long. Reduisez sa taille avant de reessayer.';
    case 422:
      return apiError.message || 'Les conditions requises ne sont pas encore remplies.';
    case 429:
      return 'Trop de tentatives. Reessayez plus tard.';
    case 500:
      return 'Erreur serveur. Reessayez plus tard.';
    case 502:
    case 503:
    case 504:
      return 'La generation IA est temporairement indisponible. Reessayez plus tard.';
    default:
      return apiError.message || 'Une erreur inattendue est survenue.';
  }
};
