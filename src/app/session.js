// A one-shot flag so the login page can say "your session expired" after
// a 401 kicked the user out. It is UI state for a single navigation, not
// session data — who the user is lives only in the RTK Query cache.
const KEY = 'prisma.sessionExpired';

export function markSessionExpired() {
  try {
    sessionStorage.setItem(KEY, '1');
  } catch {
    // storage unavailable (private mode): the notice is just not shown
  }
}

/** Returns true once after a session expired, then clears the flag. */
export function consumeSessionExpired() {
  try {
    const expired = sessionStorage.getItem(KEY) === '1';
    sessionStorage.removeItem(KEY);
    return expired;
  } catch {
    return false;
  }
}
