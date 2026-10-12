/// <reference types="vite/client" />
import raw from '../../env/.env.development?raw';

/** Browser stand-in for react-native-config. Reads the development env file at build time. */
function parseEnv(source: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of source.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    out[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return out;
}

const Config = parseEnv(raw);
export default Config;
