#!/usr/bin/env node
/**
 * Regenerates every app icon and splash logo from assets/icons/source-artwork.png.
 *
 * The source artwork is a 1024px PNG with a rounded maroon gradient square and a cream
 * "L + lotus" mark baked onto a black background. Neither platform wants that:
 *   - iOS needs a full-bleed square (the OS applies the mask)
 *   - Android adaptive icons need a transparent foreground over a background layer
 * So this script (1) extracts the mark by luminance keying, (2) rebuilds the gradient as a
 * clean layer, and (3) composes platform-correct assets. Run: `pnpm icons`.
 */
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(root, 'assets/icons/source-artwork.png');
const OUT = path.join(root, 'assets/icons/generated');

const GRADIENT_TOP = '#c5565d';
const GRADIENT_BOTTOM = '#771927';
const SPLASH_BG = '#7A1F3A';
const SIZE = 1024;

const gradientSvg = (size, top, bottom) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
       <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
         <stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/>
       </linearGradient></defs>
       <rect width="${size}" height="${size}" fill="url(#g)"/>
     </svg>`,
  );

const roundedMaskSvg = (size, radius) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
       <rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="#fff"/>
     </svg>`,
  );

const circleMaskSvg = (size) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
       <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/>
     </svg>`,
  );

/**
 * Key the cream/pink mark out of the maroon gradient. The discriminator is the *minimum* RGB channel:
 * cream and pink have a high minimum (blue channel), every shade of maroon has a low one.
 */
async function extractMark() {
  const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H, channels: C } = info;
  const out = Buffer.alloc(W * H * 4);
  const LO = 125;
  const HI = 165;
  let minx = W,
    maxx = 0,
    miny = H,
    maxy = 0;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * C;
      const r = data[i],
        g = data[i + 1],
        b = data[i + 2];
      const lo = Math.min(r, g, b);
      const a = Math.max(0, Math.min(1, (lo - LO) / (HI - LO)));
      const o = (y * W + x) * 4;
      out[o] = r;
      out[o + 1] = g;
      out[o + 2] = b;
      out[o + 3] = Math.round(a * 255);
      if (a > 0.5) {
        if (x < minx) minx = x;
        if (x > maxx) maxx = x;
        if (y < miny) miny = y;
        if (y > maxy) maxy = y;
      }
    }
  }
  const mark = sharp(out, { raw: { width: W, height: H, channels: 4 } });
  return {
    mark: await mark.png().toBuffer(),
    bbox: { minx, miny, w: maxx - minx + 1, h: maxy - miny + 1 },
  };
}

/** Mark cropped to its bbox, scaled so its longest side is `target` px, on a transparent canvas of `canvas` px. */
async function markOnCanvas(markPng, bbox, canvas, target) {
  const cropped = sharp(markPng).extract({
    left: bbox.minx,
    top: bbox.miny,
    width: bbox.w,
    height: bbox.h,
  });
  const scale = target / Math.max(bbox.w, bbox.h);
  const w = Math.round(bbox.w * scale),
    h = Math.round(bbox.h * scale);
  const resized = await cropped.resize(w, h).png().toBuffer();
  return sharp({
    create: {
      width: canvas,
      height: canvas,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: resized, left: Math.round((canvas - w) / 2), top: Math.round((canvas - h) / 2) },
    ])
    .png()
    .toBuffer();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const { mark, bbox } = await extractMark();
  const markFull = await markOnCanvas(mark, bbox, SIZE, Math.round(SIZE * 0.66)); // iOS / legacy: 66% of tile
  const markSafe = await markOnCanvas(mark, bbox, SIZE, Math.round(SIZE * 0.56)); // adaptive foreground: within 66% safe zone
  const gradient = await sharp(gradientSvg(SIZE, GRADIENT_TOP, GRADIENT_BOTTOM))
    .png()
    .toBuffer();

  // iOS: full-bleed 1024 square, no alpha.
  const ios = await sharp(gradient)
    .composite([{ input: markFull }])
    .flatten({ background: GRADIENT_BOTTOM })
    .png()
    .toBuffer();
  await writeFile(path.join(OUT, 'ios-appicon-1024.png'), ios);

  // Android adaptive: background (gradient) + foreground (mark on transparent), 1024 each (108dp @ ~9.5x).
  await writeFile(path.join(OUT, 'android-adaptive-background.png'), gradient);
  await writeFile(path.join(OUT, 'android-adaptive-foreground.png'), markSafe);

  // Android legacy launcher (API < 26): rounded square + mark, and round variant.
  const legacyBase = sharp(gradient).composite([{ input: markFull }]);
  const legacy = await legacyBase
    .clone()
    .composite([{ input: roundedMaskSvg(SIZE, 180), blend: 'dest-in' }])
    .png()
    .toBuffer();
  const legacyRound = await sharp(await legacyBase.clone().png().toBuffer())
    .composite([{ input: circleMaskSvg(SIZE), blend: 'dest-in' }])
    .png()
    .toBuffer();
  const densities = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  for (const [d, px] of Object.entries(densities)) {
    const dir = path.join(OUT, 'android', `mipmap-${d}`);
    await mkdir(dir, { recursive: true });
    await sharp(legacy).resize(px, px).png().toFile(path.join(dir, 'ic_launcher.png'));
    await sharp(legacyRound).resize(px, px).png().toFile(path.join(dir, 'ic_launcher_round.png'));
    await sharp(markSafe)
      .resize(Math.round((px * 108) / 48), Math.round((px * 108) / 48))
      .png()
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));
    await sharp(gradient)
      .resize(Math.round((px * 108) / 48), Math.round((px * 108) / 48))
      .png()
      .toFile(path.join(dir, 'ic_launcher_background.png'));
  }

  // Splash logo for react-native-bootsplash: mark on transparent, 1024 wide.
  await writeFile(
    path.join(OUT, 'splash-logo.png'),
    await markOnCanvas(mark, bbox, SIZE, Math.round(SIZE * 0.9)),
  );
  await writeFile(
    path.join(OUT, 'README.md'),
    `Generated by scripts/generate-icons.mjs. Do not edit by hand.\n\nSplash background: ${SPLASH_BG}\n`,
  );
  console.log('icons generated in', OUT, 'mark bbox', bbox);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
