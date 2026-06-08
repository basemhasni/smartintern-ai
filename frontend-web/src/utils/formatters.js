export const normalizeJsonField = (value) => {
  if (!value) {
    return value;
  }

  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }

  return value;
};

export const toArray = (value) => {
  const normalized = normalizeJsonField(value);

  if (!normalized) {
    return [];
  }

  if (Array.isArray(normalized)) {
    return normalized.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
  }

  return [];
};

export const formatDate = (value) => {
  if (!value) {
    return 'Non renseignee';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Date invalide';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

export const formatFileSize = (bytes) => {
  const value = Number(bytes);

  if (!Number.isFinite(value) || value <= 0) {
    return 'Taille inconnue';
  }

  if (value < 1024) {
    return `${value} o`;
  }

  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} Ko`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} Mo`;
};

export const normalizeScore = (value) => {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
};

export const getApplicationStatusLabel = (status) => {
  const labels = {
    SENT: 'Envoyee',
    PENDING: 'En attente',
    ACCEPTED: 'Acceptee',
    REJECTED: 'Refusee',
    CANCELLED: 'Annulee',
  };

  return labels[status] || status || 'Inconnu';
};

export const getApplicationStatusCounts = (applications = []) => {
  const base = {
    SENT: 0,
    PENDING: 0,
    ACCEPTED: 0,
    REJECTED: 0,
    CANCELLED: 0,
  };

  applications.forEach((application) => {
    if (base[application.status] !== undefined) {
      base[application.status] += 1;
    }
  });

  return base;
};
