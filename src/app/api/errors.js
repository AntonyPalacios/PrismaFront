const FALLBACK = 'Ocurrió un problema inesperado. Inténtalo de nuevo en unos minutos.';

/**
 * The plain-language message to show for an RTK Query error. The backend
 * always answers RFC 7807 Problem Details with a Spanish `detail` meant for
 * end users; network failures and anything else fall back to a generic text.
 */
export function errorDetail(error) {
  return error?.data?.detail ?? FALLBACK;
}
