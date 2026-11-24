import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import handler from '../api/descargar.js';

const bytes = readFileSync(new URL('../config/rescuer-wave3-48-v2.json', import.meta.url));
const wave = JSON.parse(bytes);
const previous = ['rescuer-pilot-60-v1.json', 'rescuer-wave2-24-v1.json'].flatMap(file =>
  JSON.parse(readFileSync(new URL(`../config/${file}`, import.meta.url))).placements);
const android = 'Mozilla/5.0 (Linux; Android 16) Chrome/142.0.0.0 Mobile Safari/537.36';
const ios = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) Mobile/15E148';
const oldProvider = process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN;
const server = createServer(handler);
let local;
before(async () => {
  process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN = '123456789';
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  local = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  if (oldProvider === undefined) delete process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN;
  else process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN = oldProvider;
});
const request = (path, agent = android, method = 'GET') => fetch(`${local}${path}`, {
  redirect: 'manual', method, headers: { 'User-Agent': agent },
});
const links = html => [...html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map(m => m[1].replaceAll('&amp;', '&'));
const referrer = p => ({ utm_source: 'facebook', utm_medium: 'organic_comment', utm_campaign: 'dopmi_rescatistas_mty_p60_v1', utm_content: p.token });

test('wave3 freezes48 non-QA placements with reproducible arm blocks and copy meaning scoped to its experiment', () => {
  assert.equal(createHash('sha256').update(bytes.toString('utf8').replaceAll('\r\n', '\n')).digest('hex'), '4c847a02682a1e20d8072eb9038115ea89404130daacc5dffe245b31c4a6f55f');
  assert.equal(wave.experimentId, 'resc_mty_20261124_wave3_v2');
  assert.equal(wave.utmCampaign, 'dopmi_rescatistas_mty_p60_v1');
  assert.equal(wave.appleCampaignPrefix, 'resc_mty_wave3_v2');
  assert.equal(wave.maxPublicPlacements, 48);
  assert.equal(wave.placements.length, 48);
  assert.equal(previous.length, 85);
  assert.equal(new Set([...previous, ...wave.placements].map(p => p.token)).size, 133);
  let state = wave.assignmentSeed;
  function random() { let t = state += 0x6D2B79F5; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }
  const variants = { R1: 'personal-a', R2: 'personal-b', R3: 'pagina-a', R4: 'pagina-b' };
  for (let block = 1; block <= 12; block++) {
    const order = Object.keys(variants);
    for (let i = 3; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const group = wave.placements.filter(p => p.block === block);
    assert.deepEqual(group.map(p => p.armId), order);
    assert.equal(group.length, 4);
    for (const p of group) {
      assert.match(p.token, /^[a-f0-9]{32}$/);
      assert.equal(p.isQa, false);
      assert.equal(p.species, block % 2 ? 'cat' : 'dog');
      assert.equal(p.variant, variants[p.armId]);
      assert.equal(p.copyId, ['R1', 'R3'].includes(p.armId) ? 'control' : 'support');
      assert.equal(p.copyVersion, p.copyId === 'control' ? 'v1' : 'v2');
      assert.deepEqual(Object.keys(p).sort(), ['armId', 'block', 'copyId', 'copyVersion', 'isQa', 'species', 'token', 'variant']);
    }
  }
  for (const arm of Object.keys(variants)) {
    assert.equal(wave.placements.filter(p => p.armId === arm).length, 12);
    for (const species of ['cat', 'dog']) assert.equal(wave.placements.filter(p => p.armId === arm && p.species === species).length, 6);
  }
  assert.equal(wave.templates.control.text, 'También puedes publicar a [mascota] en DopMi para que personas que buscan adoptar puedan conocer su historia. Publicar la ficha es gratis. Soy parte de DopMi. Descarga la app y elige «Publicar una adopción»: [enlace]');
  assert.equal(wave.templates.support.text, 'Vi que buscas hogar para [mascota]. Si te sirve, puedes publicar su ficha gratis en DopMi. Soy parte de DopMi; si tienes dudas sobre cómo publicarla, con gusto te orientamos aquí. Descarga la app y elige «Publicar una adopción»: [enlace]');
});

test('all48 Android routes preserve the exact compatible four-field referrer through intent and HTTPS fallback', async () => {
  for (const p of wave.placements) {
    const response = await request(`/descargar/piloto/${p.token}`);
    assert.equal(response.status, 200);
    const [native, web] = links(await response.text());
    const store = new URL(web);
    assert.equal(store.origin, 'https://play.google.com');
    assert.equal(store.searchParams.get('id'), 'com.mycompany.dopmi');
    const utm = new URLSearchParams(store.searchParams.get('referrer'));
    assert.equal([...utm].length, 4);
    assert.deepEqual(Object.fromEntries(utm), referrer(p));
    assert.equal(native.split('#Intent;')[0], web.replace(/^https:/, 'intent:'));
    assert.match(native, /;package=com\.android\.vending;/);
    assert.equal(decodeURIComponent(native.match(/;S\.browser_fallback_url=([^;]+);end$/)[1]), web);
    assert.equal(web.includes(wave.experimentId), false);
  }
});

test('all48 Apple routes use separate wave3 aggregate ct values and no login, code or placement identity', async () => {
  for (const p of wave.placements) {
    for (const agent of [ios, 'Mozilla/5.0 (iPad; CPU OS 18_6 like Mac OS X) Mobile/15E148']) {
      const response = await request(`/descargar/piloto/${p.token}`, agent);
      assert.equal(response.status, 302);
      assert.equal(response.headers.get('location'), `https://apps.apple.com/mx/app/dopmi/id6468691532?pt=123456789&ct=resc_mty_wave3_v2_${p.armId.toLowerCase()}&mt=8`);
    }
  }
});

test('wave3 crawler and desktop metadata stays canonical with both stores and unchanged security headers', async () => {
  for (const p of wave.placements) {
    for (const agent of ['facebookexternalhit/1.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)']) {
      const response = await request(`/descargar/piloto/${p.token}`, agent);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('location'), null);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
      assert.match(response.headers.get('content-security-policy'), /default-src 'none'/);
      const html = await response.text();
      assert.ok(html.includes(`property="og:url" content="https://www.dopmi.org/descargar/piloto/${p.token}"`));
      const [google, apple] = links(html);
      assert.deepEqual(Object.fromEntries(new URLSearchParams(new URL(google).searchParams.get('referrer'))), referrer(p));
      assert.equal(new URL(apple).searchParams.get('ct'), `resc_mty_wave3_v2_${p.armId.toLowerCase()}`);
    }
  }
});

test('wave3 query inputs cannot replace assignment and unknown or duplicate tokens fail closed', async () => {
  const p = wave.placements[0];
  for (const path of [
    `/descargar/piloto/${p.token}?placement=${previous[0].token}&variant=personal-a&ct=evil&destination=https://evil.example`,
    `/api/descargar?placement=${p.token}&variant=personal-a&arm=R1&utm_campaign=evil`,
  ]) {
    const response = await request(path);
    assert.equal(response.status, 200);
    const web = links(await response.text())[1];
    assert.deepEqual(Object.fromEntries(new URLSearchParams(new URL(web).searchParams.get('referrer'))), referrer(p));
  }
  for (const path of ['/descargar/piloto/ffffffffffffffffffffffffffffffff', `/api/descargar?placement=${p.token}&placement=${wave.placements[1].token}`]) {
    assert.equal((await request(path)).status, 404);
  }
  const head = await request(`/descargar/piloto/${p.token}`, android, 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal((await request(`/descargar/piloto/${p.token}`, android, 'POST')).status, 405);
});

test('latest f855224 privacy, legal pages and routing bytes are preserved', () => {
  for (const [file, hash] of [
    ['public/pages/privacy-policy/index.html', '4c044b756c62082c747cef20a47a2e57092c3dad068bd49d4945fa3aedb0a716'],
    ['public/pages/terms/index.html', 'ad35801269fe7bb956c4d01da8a30eb39ee1cd1fd8f51d6d6aa0d441cdb0054c'],
    ['public/pages/delete-account/index.html', '0b01bfcf691b7ec62367c03db5631ec0fbaec20eee7e6e22a38cbd31cf15c8e7'],
    ['public/pages/support/index.html', 'd13141416bd99175b6f397fa26d3fcb23d370c910dd3c61069c2f77fb99fcbc9'],
    ['vercel.json', '9547d27b889c000af7eca0a4666a14008d3a718fa36d322cbda070065d56e041'],
  ]) assert.equal(createHash('sha256').update(readFileSync(new URL(`../${file}`, import.meta.url), 'utf8').replaceAll('\r\n', '\n')).digest('hex'), hash);
});
