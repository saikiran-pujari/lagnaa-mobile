#!/usr/bin/env node
/**
 * Native Runtime fingerprint: a hash over everything that changes the store binary.
 * Printed, and compared with .runtime-fingerprint (committed). CI fails when it changed without a
 * version bump. Run: `pnpm fingerprint [--write]`.
 */
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IGNORE = new Set([
  'build',
  'Pods',
  '.gradle',
  '.cxx',
  'xcuserdata',
  'DerivedData',
  'node_modules',
  '.kotlin',
  'Firebase',
]);

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE.has(entry) || entry.startsWith('.')) continue;
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const hash = createHash('sha256');
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const nativeDeps = Object.entries({ ...pkg.dependencies }).filter(
  ([n]) =>
    /^(react-native|@react-native|@sentry\/react-native|@shopify\/flash-list|@react-navigation|lucide-react-native)/.test(
      n,
    ) || /^react-native-/.test(n),
);
hash.update(JSON.stringify(nativeDeps));
for (const dir of ['android', 'ios']) {
  const files = [...walk(path.join(root, dir))].sort();
  for (const f of files) {
    hash.update(path.relative(root, f));
    hash.update(readFileSync(f));
  }
}
const fingerprint = hash.digest('hex').slice(0, 16);
const file = path.join(root, '.runtime-fingerprint');
const previous = existsSync(file) ? readFileSync(file, 'utf8').trim() : null;
if (process.argv.includes('--write')) {
  writeFileSync(file, `${fingerprint}\n`);
  console.log(`runtime fingerprint written: ${fingerprint}`);
} else if (previous && previous !== fingerprint) {
  console.error(
    `runtime fingerprint changed: ${previous} -> ${fingerprint}. Native code changed: bump the app version and run pnpm fingerprint --write.`,
  );
  process.exit(1);
} else {
  console.log(
    `runtime fingerprint: ${fingerprint}${previous ? ' (unchanged)' : ' (no baseline; run with --write)'}`,
  );
}
