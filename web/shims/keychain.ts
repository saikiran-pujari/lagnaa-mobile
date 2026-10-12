const PREFIX = 'lagnaa.web.keychain.';

export const ACCESSIBLE = {
  AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: 'AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY',
};

function storageKey(service: string): string {
  return PREFIX + service;
}

export async function getGenericPassword(options: { service: string }) {
  const raw = localStorage.getItem(storageKey(options.service));
  if (!raw) return false;
  const parsed = JSON.parse(raw) as { username: string; password: string };
  return { username: parsed.username, password: parsed.password, service: options.service };
}

export async function setGenericPassword(
  username: string,
  password: string,
  options: { service: string },
) {
  localStorage.setItem(storageKey(options.service), JSON.stringify({ username, password }));
  return true;
}

export async function resetGenericPassword(options: { service: string }) {
  localStorage.removeItem(storageKey(options.service));
  return true;
}
