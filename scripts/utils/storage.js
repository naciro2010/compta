const STORAGE_KEY = 'atlas-compta-poc-v1';

/**
 * Read data from localStorage safely.
 * @returns {object|null}
 */
export function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.warn('Impossible de lire le stockage local', error);
    return null;
  }
}

/**
 * Persist data to localStorage.
 * @param {object} payload
 */
export function writeStorage(payload) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (error) {
    console.warn('Impossible d\'écrire le stockage local', error);
  }
}

/**
 * Remove dataset from localStorage.
 */
export function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getStorageKey() {
  return STORAGE_KEY;
}
