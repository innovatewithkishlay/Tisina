// Run by .github/workflows/fetch-photos.yml. Unsplash photos are free for
// commercial use under the Unsplash License (no attribution required).
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

// The workflow also fires when the request file is removed: nothing to do then.
if (!existsSync('.image-review/request.json')) {
  console.log('No .image-review/request.json — nothing to fetch.');
  process.exit(0);
}
const req = JSON.parse(readFileSync('.image-review/request.json', 'utf8'));
const HEADERS = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36', accept: 'application/json' };

async function download(url, file) {
  const res = await fetch(url, { headers: { 'user-agent': HEADERS['user-agent'] } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

// Candidate image URLs for a query: Unsplash's public search page first, then
// Openverse (CC0 / public-domain only, so no attribution is needed).
async function candidates(q) {
  const found = [];
  if (!req.skipUnsplash) try {
    const slug = q.query.trim().replace(/\s+/g, '-');
    const page = await fetch(`https://unsplash.com/s/photos/${encodeURIComponent(slug)}${q.orientation ? `?orientation=${q.orientation}` : ''}`, {
      headers: { ...HEADERS, accept: 'text/html' },
    });
    console.log('unsplash page', q.query, page.status);
    if (page.ok) {
      const html = await page.text();
      const ids = [...new Set([...html.matchAll(/https:\/\/images\.unsplash\.com\/(photo-[\w-]+)/g)].map((m) => m[1]))];
      for (const id of ids) found.push({ src: 'unsplash', id, url: `https://images.unsplash.com/${id}?ixlib=rb-4.0.3` });
    }
  } catch (e) { console.log('unsplash error', e.message); }
  if (found.length < 6) {
    try {
      const params = new URLSearchParams({ q: q.query, license: req.licenses ?? 'cc0,pdm', category: 'photograph', page_size: '20', ...(q.orientation === 'landscape' ? { aspect_ratio: 'wide' } : {}) });
      const res = await fetch(`https://api.openverse.org/v1/images/?${params}`, { headers: HEADERS });
      console.log('openverse', q.query, res.status);
      if (res.ok) for (const r of (await res.json()).results) found.push({ src: 'openverse', id: r.id, url: r.url, title: r.title, by: r.creator, license: r.license, w: r.width, h: r.height });
    } catch (e) { console.log('openverse error', e.message); }
  }
  if (req.commons) {
    try {
      // Wikimedia Commons: free-licensed files; licence + author kept for credits.
      const params = new URLSearchParams({
        action: 'query', format: 'json', generator: 'search', gsrnamespace: '6', gsrlimit: '15',
        gsrsearch: `${q.commons ?? q.query} filetype:bitmap`, prop: 'imageinfo', iiprop: 'url|extmetadata|size', iiurlwidth: '1600',
      });
      const res = await fetch(`https://commons.wikimedia.org/w/api.php?${params}`, { headers: { 'user-agent': 'TisinaStarterPhotoFetch/1.0 (https://github.com/innovatewithkishlay/starter)' } });
      console.log('commons', q.query, res.status);
      if (res.ok) {
        const pages = Object.values((await res.json()).query?.pages ?? {}).sort((a, b) => a.index - b.index);
        for (const pg of pages) {
          const ii = pg.imageinfo?.[0];
          if (!ii || ii.width < 900) continue;
          const meta = ii.extmetadata ?? {};
          const strip = (v) => String(v?.value ?? '').replace(/<[^>]+>/g, '').trim();
          found.push({ src: 'commons', id: pg.title, url: ii.thumburl ?? ii.url, page: ii.descriptionurl, license: strip(meta.LicenseShortName), by: strip(meta.Artist).slice(0, 80), w: ii.width, h: ii.height });
        }
      }
    } catch (e) { console.log('commons error', e.message); }
  }
  await new Promise((r) => setTimeout(r, 1500));
  return found;
}

if (req.mode === 'search') {
  const out = '.image-review/candidates';
  mkdirSync(out, { recursive: true });
  const manifest = {};
  for (const [key, q] of Object.entries(req.queries)) {
    const list = await candidates(q);
    manifest[key] = [];
    const tiles = [];
    for (const c of list) {
      if (manifest[key].length >= (req.perQuery ?? 9)) break;
      const i = manifest[key].length;
      const file = `${out}/${key}-${i}.jpg`;
      try {
        const url = c.src === 'unsplash' ? `${c.url}&w=480&h=360&fit=crop&q=60&fm=jpg` : c.url;
        await download(url, file);
        execFileSync('convert', [file, '-resize', '480x360^', '-gravity', 'center', '-extent', '480x360', file]);
        manifest[key].push({ i, ...c });
        tiles.push('-label', `${i}`, file);
      } catch (e) { console.log('skip', e.message); }
    }
    if (tiles.length) {
      execFileSync('montage', [...tiles, '-tile', '3x', '-geometry', '480x360+4+4', '-pointsize', '28', '-background', '#222', '-fill', 'white', `.image-review/sheet-${key}.jpg`]);
    }
  }
  writeFileSync('.image-review/manifest.json', JSON.stringify(manifest, null, 1));
  execFileSync('rm', ['-rf', out]);
}

// previews: { groups: { key: [[stockId, previewUrl], ...] } } → labelled contact sheets
if (req.mode === 'previews') {
  const out = '.image-review/candidates';
  mkdirSync(out, { recursive: true });
  for (const [key, list] of Object.entries(req.groups)) {
    const tiles = [];
    for (const [id, url] of list) {
      const file = `${out}/${key}-${id}.jpg`;
      try {
        await download(url, file);
        execFileSync('convert', [file, '-resize', '480x360^', '-gravity', 'center', '-extent', '480x360', file]);
        tiles.push('-label', String(id), file);
      } catch (e) { console.log('skip', id, e.message); }
    }
    if (tiles.length) execFileSync('montage', [...tiles, '-tile', '3x', '-geometry', '480x360+4+4', '-pointsize', '24', '-background', '#222', '-fill', 'white', `.image-review/sheet-${key}.jpg`]);
  }
  execFileSync('rm', ['-rf', out]);
}

if (req.mode === 'fetch') {
  // photos: [{ url, file, w? }] — url as listed in manifest.json
  for (const { url, file, w = 1800 } of req.photos) {
    mkdirSync(file.split('/').slice(0, -1).join('/'), { recursive: true });
    const full = url.startsWith('https://images.unsplash.com') ? `${url}&w=${w}&q=82&fm=jpg` : url;
    try {
      await download(full, file);
      execFileSync('convert', [file, '-resize', `${w}x${w}>`, '-quality', '82', '-strip', file]);
      console.log('saved', file);
    } catch (e) { console.log('failed', file, e.message); }
  }
}
