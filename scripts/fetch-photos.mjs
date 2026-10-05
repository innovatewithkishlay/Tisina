// Run by .github/workflows/fetch-photos.yml. Unsplash photos are free for
// commercial use under the Unsplash License (no attribution required).
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const req = JSON.parse(readFileSync('.image-review/request.json', 'utf8'));
const HEADERS = { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36', accept: 'application/json' };

async function download(url, file) {
  const res = await fetch(url, { headers: { 'user-agent': HEADERS['user-agent'] } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  writeFileSync(file, Buffer.from(await res.arrayBuffer()));
}

if (req.mode === 'search') {
  const out = '.image-review/candidates';
  mkdirSync(out, { recursive: true });
  const manifest = {};
  for (const [key, q] of Object.entries(req.queries)) {
    const params = new URLSearchParams({ query: q.query, per_page: '20' });
    if (q.orientation) params.set('orientation', q.orientation);
    const res = await fetch(`https://unsplash.com/napi/search/photos?${params}`, { headers: HEADERS });
    if (!res.ok) { console.log('search failed', key, res.status); manifest[key] = { error: res.status }; continue; }
    const json = await res.json();
    const free = json.results.filter((r) => !r.premium && !r.plus && r.urls.raw.startsWith('https://images.unsplash.com'));
    manifest[key] = [];
    const tiles = [];
    for (const [i, r] of free.slice(0, req.perQuery ?? 9).entries()) {
      const file = `${out}/${key}-${i}.jpg`;
      try {
        await download(`${r.urls.raw}&w=480&h=360&fit=crop&q=60&fm=jpg`, file);
        manifest[key].push({ i, id: r.id, w: r.width, h: r.height, alt: r.alt_description, by: r.user?.name });
        tiles.push('-label', `${i}`, file);
      } catch (e) { console.log(e.message); }
    }
    if (tiles.length) {
      execFileSync('montage', [...tiles, '-tile', '3x', '-geometry', '480x360+4+4', '-pointsize', '28', '-background', '#222', '-fill', 'white', `.image-review/sheet-${key}.jpg`]);
    }
  }
  writeFileSync('.image-review/manifest.json', JSON.stringify(manifest, null, 1));
  execFileSync('rm', ['-rf', out]);
}

if (req.mode === 'fetch') {
  for (const { id, file, w = 1800 } of req.photos) {
    const res = await fetch(`https://unsplash.com/napi/photos/${id}`, { headers: HEADERS });
    if (!res.ok) { console.log('photo failed', id, res.status); continue; }
    const r = await res.json();
    mkdirSync(file.split('/').slice(0, -1).join('/'), { recursive: true });
    await download(`${r.urls.raw}&w=${w}&q=82&fm=jpg`, file);
    console.log('saved', file);
  }
}
