// Genera _site/ : copia le pagine, fa uno screenshot di ognuna e crea la home con le card.
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SRC = 'pages', OUT = '_site';
const SITE_TITLE = 'Giochi';          // titolo della home
const WAIT_MS = 1500;                  // attesa prima dello screenshot
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT + '/thumbs', { recursive: true });
fs.cpSync(SRC, OUT + '/p', { recursive: true });

// data di ultima modifica: da git se disponibile, altrimenti dal file
const dateOf = f => {
  try { const d = execSync(`git log -1 --format=%cI -- "${path.join(SRC, f)}"`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); if (d) return new Date(d); } catch {}
  return fs.statSync(path.join(SRC, f)).mtime;
};

const files = fs.readdirSync(SRC).filter(f => f.toLowerCase().endsWith('.html'));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
page.on('dialog', d => d.dismiss());

const items = [];
for (const f of files) {
  const n = path.basename(f, path.extname(f));
  try {
    await page.goto('file://' + path.resolve(SRC, f), { waitUntil: 'load', timeout: 20000 });
    await page.waitForTimeout(WAIT_MS);
    await page.screenshot({ path: `${OUT}/thumbs/${n}.jpg`, type: 'jpeg', quality: 80 });
  } catch (e) { console.warn('Thumbnail non riuscita per', f, e.message); }
  const title = ((await page.title().catch(() => '')) || n).trim();
  items.push({ f, n, title, date: dateOf(f) });
}
await browser.close();
items.sort((a, b) => b.date - a.date);   // più recenti per primi

const fmt = d => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' });
const cards = items.map(i => `<a href="p/${encodeURI(i.f)}"><img src="thumbs/${encodeURI(i.n)}.jpg" alt="" loading="lazy" onerror="this.style.visibility='hidden'"><div><b>${esc(i.title)}</b><small>${fmt(i.date)}</small></div></a>`).join('\n');

fs.writeFileSync(OUT + '/index.html', `<!doctype html>
<html lang="it"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(SITE_TITLE)}</title>
<style>
:root{color-scheme:light dark;--bg:#fff;--card:#f3f4f6;--fg:#111;--mut:#666}
@media(prefers-color-scheme:dark){:root{--bg:#111318;--card:#1c1f27;--fg:#eee;--mut:#9aa}}
*{box-sizing:border-box}body{margin:0;padding:32px 20px;background:var(--bg);color:var(--fg);font:16px/1.4 system-ui,sans-serif}
header{max-width:1100px;margin:0 auto 24px}h1{margin:0;font-size:28px}header p{margin:4px 0 0;color:var(--mut)}
main{max-width:1100px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:16px}
a{color:inherit;text-decoration:none;background:var(--card);border-radius:12px;overflow:hidden;transition:transform .15s}
a:hover{transform:translateY(-3px)}
img{width:100%;display:block;aspect-ratio:16/10;object-fit:cover;background:#0002}
div{padding:10px 14px 12px}b{display:block}small{color:var(--mut)}
</style>
<header><h1>${esc(SITE_TITLE)}</h1><p>${items.length} ${items.length === 1 ? 'pagina' : 'pagine'}</p></header>
<main>
${cards}
</main></html>`);
console.log('OK:', items.map(i => i.f).join(', '));
