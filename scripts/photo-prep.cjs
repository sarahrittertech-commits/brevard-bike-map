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
    const at = pair ? pair.indexOf('=') : -1;
    // Split on the FIRST '=' only: a filename is allowed to contain one, and
    // splitting on every '=' would silently truncate it. An empty filename has
    // to be caught here too — path.join(sourceDir, '') is the source directory,
    // which exists, so it sails past the "is not in <dir>" check further down
    // and fails later as "Spotlight has not indexed it", which it is not.
    if (at < 1 || at === pair.length - 1) {
      die(`--map needs <adventure-id>=<file>, got ${pair ?? '(nothing)'}`);
    }
    maps.push({ id: pair.slice(0, at), file: pair.slice(at + 1) });
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
// It only knows them for a file it has indexed, though: on an external volume
// or in a folder excluded from Spotlight, mdls answers "(null)" and says
// nothing about why. What it reports is the photo as it DISPLAYS — an iPhone
// portrait, stored landscape with an EXIF rotation, comes back orientation 0
// and 960x640. That is the opposite of what sips sees, which is the whole
// reason both are read here.
//
// mdls -raw emits the values sorted by attribute name, NOT in the order the
// -name flags were given, so they are zipped back up against a sorted copy of
// the list rather than read off positionally. Getting this wrong transposes
// PixelHeight and PixelWidth, which sort the other way round from how anyone
// writes them, and every photo then reads as the shape it is not.
const MD_NAMES = [
  'kMDItemContentCreationDate',
  'kMDItemLatitude',
  'kMDItemLongitude',
  'kMDItemOrientation',
  'kMDItemPixelWidth',
  'kMDItemPixelHeight',
];

function meta(file) {
  const asked = [...MD_NAMES].sort();
  const raw = execFileSync('mdls', ['-raw', ...asked.flatMap((n) => ['-name', n]), file])
    .toString()
    .split('\0');
  const md = Object.fromEntries(asked.map((n, i) => [n, raw[i] === '(null)' ? null : raw[i]]));
  const created = md.kMDItemContentCreationDate;
  const lat = md.kMDItemLatitude;
  const lon = md.kMDItemLongitude;
  const orientation = md.kMDItemOrientation;
  const width = md.kMDItemPixelWidth;
  const height = md.kMDItemPixelHeight;
  return {
    created,
    lat: lat && Number(lat),
    lon: lon && Number(lon),
    portrait: orientation === '1',
    width: width && Number(width),
    height: height && Number(height),
  };
}

// The stored pixel dimensions, which are what sips worked on — not necessarily
// what the image reads as once its EXIF rotation is applied.
function sipsSize(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', file]).toString();
  const width = Number(out.match(/pixelWidth:\s*(\d+)/)?.[1]);
  const height = Number(out.match(/pixelHeight:\s*(\d+)/)?.[1]);
  return Number.isFinite(width) && Number.isFinite(height) ? { width, height } : null;
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
  const m = meta(source);
  const stored = sipsSize(source);
  if (!m.width || !m.height || !stored) {
    problems.push(
      `No dimensions for ${file} — Spotlight has not indexed it (an external volume or an excluded folder will do that). ` +
        'Copy it somewhere indexed, the Desktop will do, and run again: without both readings there is no way to tell which axis to resample.'
    );
    continue;
  }
  // sips works on the stored pixels; Spotlight reports the displayed ones. The
  // axes need swapping exactly when those two disagree, which is to say when
  // the file carries a 90-degree EXIF rotation. Reading "displays portrait" as
  // "axes are swapped" is wrong for a photo that is simply stored portrait with
  // no rotation, and writes the hero 640x960 the wrong way round.
  const swapped = (m.width > m.height) !== (stored.width > stored.height);
  plans.push({ id, file, source, target, adventure, meta: m, swapped, wasBytes: fs.statSync(target).size });
}

if (problems.length) {
  for (const p of problems) console.error(`  error    ${p}`);
  console.error('');
  process.exit(1);
}

console.log(`${dryRun ? 'Would prepare' : 'Preparing'} ${plans.length} photo${plans.length === 1 ? '' : 's'} at ${WIDTH}x${HEIGHT}, quality ${QUALITY}\n`);

const warnings = [];
for (const plan of plans) {
  const { id, file, source, target, adventure, meta: m, swapped } = plan;
  const date = m.created ? m.created.slice(0, 10) : 'unknown date';
  console.log(`  ${id}`);
  console.log(`    ${file}  ->  assets/adventures/${adventure.image}.jpg`);
  console.log(`    taken ${date}${m.width ? `, ${m.width}x${m.height}` : ''}${m.portrait ? ', PORTRAIT' : ''}`);
  console.log(`    ${m.lat && m.lon ? `GPS ${m.lat.toFixed(5)}, ${m.lon.toFixed(5)}` : 'no GPS'}`);

  if (m.portrait) {
    warnings.push(`${file} is portrait; the 3:2 crop keeps only a central band of it`);
  }
  if (!m.lat || !m.lon) {
    warnings.push(`${file} has no GPS, so there is nothing to check it was taken on the route`);
  }
  if (!dryRun) {
    // sips works on the stored pixels and ignores the EXIF rotation, so for a
    // photo whose axes are swapped its stored height is the width you see.
    // Resample and crop on that axis, or the file comes out 640x960 the wrong
    // way round and the hero crops it to a sliver. `swapped`, not `portrait`:
    // see where it is worked out.
    const resample = swapped ? '--resampleHeight' : '--resampleWidth';
    const crop = swapped ? [String(WIDTH), String(HEIGHT)] : [String(HEIGHT), String(WIDTH)];
    // Both passes go to a scratch file beside the target, and only a complete
    // pair replaces the committed jpg: a sips failure between the two would
    // otherwise leave a resampled-but-uncropped image in assets/.
    // formatOptions is set on both so the intermediate is not written at sips'
    // default quality and then re-encoded at ours, which is two generations of
    // jpeg loss for one photo.
    const scratch = `${target}.prep.jpg`;
    const q = ['-s', 'formatOptions', String(QUALITY)];
    try {
      execFileSync('sips', ['-s', 'format', 'jpeg', ...q, resample, String(WIDTH), source, '--out', scratch], { stdio: 'ignore' });
      execFileSync('sips', ['-c', ...crop, ...q, scratch], { stdio: 'ignore' });
      fs.renameSync(scratch, target);
    } finally {
      if (fs.existsSync(scratch)) fs.rmSync(scratch);
    }
    // A portrait source comes out with its stored pixels 640x960 and an EXIF
    // rotation that puts them back the right way round, so the hero is only
    // correct for as long as something honours that tag. Say so, rather than
    // leaving it to be discovered on a phone.
    const stored = sipsSize(target);
    if (stored && (stored.width !== WIDTH || stored.height !== HEIGHT)) {
      warnings.push(
        `${adventure.image}.jpg is stored ${stored.width}x${stored.height} and only reads as ${WIDTH}x${HEIGHT} ` +
          'through its EXIF rotation; anything that drops the tag crops it to a sliver'
      );
    }
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
