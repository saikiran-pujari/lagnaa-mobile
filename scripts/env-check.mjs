#!/usr/bin/env node
/** Validates env/.env.* files: required keys present, production has no localhost/http. Run: pnpm env:check */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REQUIRED = [
  'APP_ENV',
  'API_BASE_URL',
  'API_BASE_URL_ANDROID_EMULATOR',
  'OTA_CHANNEL',
  'SENTRY_ENVIRONMENT',
  'DEEP_LINK_SCHEME',
  'UNIVERSAL_LINK_HOST',
  'LOG_LEVEL',
];
const ENVS = ['development', 'staging', 'production'];

const parse = (text) =>
  Object.fromEntries(
    text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#'))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
      }),
  );

let failed = false;
for (const name of ENVS) {
  const file = path.join(root, 'env', `.env.${name}`);
  const vars = parse(await readFile(file, 'utf8'));
  const problems = [];
  for (const k of REQUIRED) if (!(k in vars)) problems.push(`missing ${k}`);
  if (vars.APP_ENV !== name) problems.push(`APP_ENV must be ${name}`);
  if (vars.OTA_CHANNEL !== name) problems.push(`OTA_CHANNEL must be ${name}`);
  if (name !== 'development') {
    for (const k of ['API_BASE_URL', 'API_BASE_URL_ANDROID_EMULATOR', 'OTA_UPDATE_URL']) {
      const v = vars[k] ?? '';
      if (/localhost|127\.0\.0\.1|10\.0\.2\.2/.test(v))
        problems.push(`${k} points at a local host`);
      if (v && !v.startsWith('https://')) problems.push(`${k} must be https`);
    }
  }
  for (const [k, v] of Object.entries(vars))
    if (/SECRET|PRIVATE|PASSWORD|TOKEN(?!_)|API_KEY/.test(k) && v)
      problems.push(`${k} looks like a secret`);
  if (problems.length) {
    failed = true;
    console.error(`env/.env.${name}:\n  - ${problems.join('\n  - ')}`);
  } else console.log(`env/.env.${name}: ok`);
}
process.exit(failed ? 1 : 0);
