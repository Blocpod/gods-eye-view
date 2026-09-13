export const CONFLICT_PICK_PREFIX = 'gev-conflict:';

export function conflictIdFromPick(pickId) {
  return typeof pickId === 'string' && pickId.startsWith(CONFLICT_PICK_PREFIX)
    ? pickId.slice(CONFLICT_PICK_PREFIX.length) || null
    : null;
}

export function formatConflictCoordinates(latitude, longitude) {
  return `${Math.abs(latitude).toFixed(2)}° ${latitude < 0 ? 'S' : 'N'}  /  ${Math.abs(longitude).toFixed(2)}° ${longitude < 0 ? 'W' : 'E'}`;
}

export function safeSourceUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.href
      : null;
  } catch {
    return null;
  }
}

export function formatReviewDate(value) {
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime())
    ? 'Date unavailable'
    : new Intl.DateTimeFormat('en', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
      }).format(date);
}
