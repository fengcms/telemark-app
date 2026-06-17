import { sha256 } from '@/utils/crypto';

const SAVED_LOGIN_KEY = 'telemark.saved-login';
const KEY_SEED = 'telemark-app-local-saved-login-v1';

type SavedLoginRecord = {
  username: string;
  password: string;
  iv: string;
};

export type SavedLogin = {
  username: string;
  password: string;
};

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function getStorageKey() {
  const keyHash = await sha256(`${KEY_SEED}:${navigator.userAgent}`);
  const keyBytes = new TextEncoder().encode(keyHash.slice(0, 32));

  return crypto.subtle.importKey('raw', keyBytes, 'AES-GCM', false, [
    'encrypt',
    'decrypt',
  ]);
}

export async function saveLoginCredentials(credentials: SavedLogin) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await getStorageKey();
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(credentials.password),
  );

  const record: SavedLoginRecord = {
    username: credentials.username,
    password: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
  };

  localStorage.setItem(SAVED_LOGIN_KEY, JSON.stringify(record));
}

export async function getSavedLoginCredentials() {
  const raw = localStorage.getItem(SAVED_LOGIN_KEY);
  if (!raw) {
    return null;
  }

  try {
    const record = JSON.parse(raw) as SavedLoginRecord;
    const key = await getStorageKey();
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: base64ToBytes(record.iv) },
      key,
      base64ToBytes(record.password),
    );

    return {
      username: record.username,
      password: new TextDecoder().decode(decrypted),
    };
  } catch {
    localStorage.removeItem(SAVED_LOGIN_KEY);
    return null;
  }
}

export function clearSavedLoginCredentials() {
  localStorage.removeItem(SAVED_LOGIN_KEY);
}
