import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distIndexPath = path.resolve(root, 'dist/index.html');

const MAX_COVER_BYTES = 26 * 1024;
const REQUIRED_COVER_COUNT = 4;

function fail(message) {
  console.error(`Performance guardrail failed: ${message}`);
  process.exitCode = 1;
}

function parseAttributes(tag) {
  const attributes = {};
  for (const match of tag.matchAll(/([a-zA-Z:-]+)=\"([^\"]*)\"/g)) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}

function decodeHtml(value) {
  return value.replaceAll('&amp;', '&');
}

async function checkFileSize(urlPath) {
  const filePath = path.resolve(root, 'dist', urlPath.replace(/^\//, ''));
  const fileStat = await stat(filePath);
  if (fileStat.size > MAX_COVER_BYTES) {
    fail(`${urlPath} is ${fileStat.size} bytes (max allowed ${MAX_COVER_BYTES}).`);
  }
}

async function main() {
  let html;
  try {
    html = await readFile(distIndexPath, 'utf-8');
  } catch {
    fail('dist/index.html not found. Run `pnpm build` before this check.');
    return;
  }

  if (/\/images\/tienda-.*\.(jpg|jpeg)\b/i.test(html)) {
    fail('Home is still referencing store cover JPG/JPEG assets. Use optimized WebP variants.');
  }

  const coverTags = [...html.matchAll(/<img[^>]*class=\"[^\"]*store-cover[^\"]*\"[^>]*>/g)].map((entry) => entry[0]);

  if (coverTags.length !== REQUIRED_COVER_COUNT) {
    fail(`Expected ${REQUIRED_COVER_COUNT} store-cover images, found ${coverTags.length}.`);
    return;
  }

  const parsedCovers = coverTags.map((tag) => parseAttributes(tag));

  const first = parsedCovers[0];
  if (first.loading !== 'eager') {
    fail('First store cover must use loading="eager" for LCP.');
  }

  if (first.fetchpriority !== 'high') {
    fail('First store cover must use fetchpriority="high" for LCP.');
  }

  for (const [index, cover] of parsedCovers.entries()) {
    if (!cover.srcset) {
      fail(`Store cover #${index + 1} is missing srcset.`);
      continue;
    }

    const srcsetItems = decodeHtml(cover.srcset)
      .split(',')
      .map((chunk) => chunk.trim().split(/\s+/)[0])
      .filter(Boolean);

    if (srcsetItems.length < 2) {
      fail(`Store cover #${index + 1} must expose at least 2 responsive sources.`);
    }

    for (const item of srcsetItems) {
      if (!item.endsWith('.webp')) {
        fail(`Store cover #${index + 1} srcset contains non-webp asset: ${item}`);
      } else {
        await checkFileSize(item);
      }
    }

    if (cover.src?.endsWith('.webp')) {
      await checkFileSize(cover.src);
    }
  }

  if (process.exitCode === 1) {
    return;
  }

  console.log('OK: Home performance guardrails passed.');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
