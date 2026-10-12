type Stored = { t: 'string' | 'number' | 'boolean'; v: string | number | boolean };

export function createMMKV(options: { id: string }) {
  const prefix = `lagnaa.web.mmkv.${options.id}.`;

  const read = (key: string): Stored | undefined => {
    const raw = localStorage.getItem(prefix + key);
    if (raw == null) return undefined;
    return JSON.parse(raw) as Stored;
  };

  return {
    getString(key: string) {
      const item = read(key);
      return item?.t === 'string' ? String(item.v) : undefined;
    },
    getNumber(key: string) {
      const item = read(key);
      return item?.t === 'number' ? Number(item.v) : undefined;
    },
    getBoolean(key: string) {
      const item = read(key);
      return item?.t === 'boolean' ? Boolean(item.v) : undefined;
    },
    set(key: string, value: string | number | boolean) {
      const t =
        typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'boolean' : 'string';
      localStorage.setItem(prefix + key, JSON.stringify({ t, v: value }));
    },
    remove(key: string) {
      localStorage.removeItem(prefix + key);
    },
    getAllKeys() {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const stored = localStorage.key(i);
        if (stored?.startsWith(prefix)) keys.push(stored.slice(prefix.length));
      }
      return keys;
    },
    clearAll() {
      const keys = this.getAllKeys();
      for (const key of keys) localStorage.removeItem(prefix + key);
    },
  };
}
