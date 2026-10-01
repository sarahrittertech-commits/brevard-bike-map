#!/usr/bin/env node
/**
 * Prepares a photograph for use as an adventure hero image.
 *
 * The hero is `aspectRatio: 3/2` with `resizeMode="cover"`, so the file is
 * written at 960 x 640 — the hero's own shape, which means the app crops
 * nothing twice. sips quality 35 lands where the originals were, 70-110 KB.
 *
 * Usage:
 *   node scripts/photo-prep.cjs <source-dir> --map <adventure-id>=<file> [...]
 *   node scripts/photo-prep.cjs <source-dir> --map ... --dry-run
 *
 * The key is the adventure's `id`, not its image name — `full-trail` writes
 * `end-to-end.jpg`, because that is what the adventure's `image` field says.
 *
 * It prints a provenance line for each photo. Paste those into the table in
 * docs/runbook.md: a photo without one must not ship, which is the whole
 * reason App Review's question 6 is still unanswered.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const IMAGE_DIR = path.join(ROOT, 'assets', 'adventures');
const WIDTH = 960;
const HEIGHT = 640;
const QUALITY = 35;

const argv = process.argv.slice(2);
const dryRun = argv.includes('--dry-run');
const maps = [];
let sourceDir = null;

for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg === '--dry-run') continue;
  if (arg === '--map') {
    const pair = argv[++i];
    if (!pair || !pair.includes('=')) die(`--map needs <adventure-id>=<file>, got ${pair ?? '(nothing)'}`);
    const [id, file] = pair.split('=');
    maps.push({ id, file });
  } else if (arg.startsWith('--')) {
    die(`Unknown option ${arg}`);
  } else if (sourceDir === null) {
    sourceDir = arg;
  } else {
    die(`Unexpected argument ${arg}`);
  }
}

function die(msg) {
  console.error(`photo-prep: ${msg}\n`);
  console.error('Usage: node scripts/photo-prep.cjs <source-dir> --map <adventure-id>=<file> [--dry-run]');
  process.exit(1);
}

if (!sourceDir) die('needs a source directory');
if (!maps.length) die('needs at least one --map');
if (!fs.existsSync(sourceDir)) die(`source directory does not exist: ${sourceDir}`);

const adventures = JSON.parse(fs.readFileSync(path.join(ROOT, 'src', 'data', 'adventures.json'), 'utf8'));
const byId = Object.fromEntries(adventures.map((a) => [a.id, a]));

// Spotlight knows the capture date and GPS without anything being installed.
function meta(file) {
  const raw = execFileSync('mdls', [
    '-raw',
    '-name', 'kMDItemContentCreationDate',
    '-name', 'kMDItemLatitude',
    '-name', 'kMDItemLongitude',
    '-name', 'kMDItemOrientation',
    '-name', 'kMDItemPixelWidth',
    '-name', 'kMDItemPixelHeight',
    file,
  ]).toString().split('\0');
  const [created, lat, lon, orientation, width, height] = raw.map((v) => (v === '(null)' ? null : v));
  return {
    created,
    lat: lat && Number(lat),
    lon: lon && Number(lon),
    portrait: orientation === '1',
    width: width && Number(width),
    height: height && Number(height),
  };
}

const problems = [];
const plans = [];

for (const { id, file } of maps) {
  const adventure = byId[id];
  if (!adventure) {
    problems.push(`"${id}" is not an adventure id. Known: ${adventures.map((a) => a.id).join(', ')}`);
    continue;
  }
  const source = path.join(sourceDir, file);
  if (!fs.existsSync(source)) {
    problems.push(`${file} is not in ${sourceDir}`);
    continue;
  }
  const target = path.join(IMAGE_DIR, `${adventure.image}.jpg`);
  if (!fs.existsSync(target)) {
    problems.push(`${adventure.image}.jpg does not exist — adventure "${id}" expects it`);
    continue;
  }
  plans.push({ id, file, source, target, adventure, meta: meta(source), wasBytes: fs.statSync(target).size });
}

if (problems.length) {
  for (const p of problems) console.error(`  error    ${p}`);
  console.error('');
  process.exit(1);
}

console.log(`${dryRun ? 'Would prepare' : 'Preparing'} ${plans.length} photo${plans.length === 1 ? '' : 's'} at ${WIDTH}x${HEIGHT}, quality ${QUALITY}\n`);

const warnings = [];
for (const plan of plans) {
  const { id, file, source, target, adventure, meta: m } = plan;
  const date = m.created ? m.created.slice(0, 10) : 'unknown date';
  console.log(`  ${id}`);
  console.log(`    ${file}  ->  assets/adventures/${adventure.image}.jpg`);
  console.log(`    taken ${date}${m.width ? `, ${m.width}x${m.height}` : ''}${m.portrait ? ', PORTRAIT' : ''}`);
  console.log(`    ${m.lat ? `GPS ${m.lat.toFixed(5)}, ${m.lon.toFixed(5)}` : 'no GPS'}`);

  if (m.portrait) {
    warnings.push(`${file} is portrait; the 3:2 crop keeps only a central band of it`);
  }
  if (!m.lat) {
    warnings.push(`${file} has no GPS, so there is nothing to check it was taken on the route`);
  }
  if (!dryRun) {
    // sips works on the stored pixels and ignores the EXIF rotation, so for a
    // photo that displays portrait the axes are swapped: its stored height is
    // the width you see. Resample and crop on that axis, or the file comes out
    // 640x960 the wrong way round and the hero crops it to a sliver.
    const resample = m.portrait ? '--resampleHeight' : '--resampleWidth';
    const crop = m.portrait ? [String(WIDTH), String(HEIGHT)] : [String(HEIGHT), String(WIDTH)];
    execFileSync('sips', ['-s', 'format', 'jpeg', resample, String(WIDTH), source, '--out', target], { stdio: 'ignore' });
    execFileSync('sips', ['-c', ...crop, '-s', 'formatOptions', String(QUALITY), target], { stdio: 'ignore' });
    const now = fs.statSync(target).size;
    console.log(`    written, ${Math.round(now / 1024)} KB (was ${Math.round(plan.wasBytes / 1024)} KB)`);
  }
  console.log('');
}

if (warnings.length) {
  console.log('Warnings:');
  for (const w of warnings) console.log(`  ${w}`);
  console.log('');
}

console.log('Provenance lines for the table in docs/runbook.md:\n');
for (const { adventure, file, meta: m } of plans) {
  const date = m.created ? new Date(m.created.replace(' +0000', 'Z').replace(' ', 'T')) : null;
  const when = date
    ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    : 'date unknown';
  console.log(`| \`${adventure.image}.jpg\` | ${file.replace(/\.[^.]+$/, '')} — <what it shows> | Sarah Ritter, ${when} |`);
}
console.log('');

if (dryRun) console.log('Dry run — nothing was written.');
