const APP_STORAGE_PREFIX = 'telemark.';

export function clearLocalAppCache() {
  const keys = Array.from({ length: localStorage.length }, (_, index) =>
    localStorage.key(index),
  ).filter((key): key is string =>
    Boolean(key?.startsWith(APP_STORAGE_PREFIX)),
  );

  for (const key of keys) {
    localStorage.removeItem(key);
  }
}
