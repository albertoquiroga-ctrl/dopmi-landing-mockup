import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import handler from '../api/descargar.js';

const bytes = readFileSync(new URL('../config/rescuer-wave2-24-v1.json', import.meta.url));
const wave = JSON.parse(bytes);
const original = JSON.parse(readFileSync(new URL('../config/rescuer-pilot-60-v1.json', import.meta.url)));
const android = 'Mozilla/5.0 (Linux; Android 16) Chrome/142.0.0.0 Mobile Safari/537.36';
const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) Mobile/15E148';
const priorProvider = process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN;
const server = createServer(handler);
let local;

before(async () => {
  process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN = '123456789';
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  local = `http://127.0.0.1:${server.address().port}`;
});
after(async () => {
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  if (priorProvider === undefined) delete process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN;
  else process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN = priorProvider;
});

function request(path, agent = android, options = {}) {
  return fetch(`${local}${path}`, { redirect: 'manual', ...options, headers: { 'User-Agent': agent } });
}
function links(page) {
  return [...page.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map(match => match[1].replaceAll('&amp;', '&'));
}
function expectedReferrer(placement) {
  return {
    utm_source: 'facebook', utm_medium: 'organic_comment',
    // The installed Android parser accepts this transport namespace. The
    // registry, not the UTM name, separates the new experimental cohort.
    utm_campaign: 'dopmi_rescatistas_mty_p60_v1', utm_content: placement.token,
  };
}

test('wave2 is frozen separately with 24 unique placements and species-balanced randomized arm blocks', () => {
  assert.equal(createHash('sha256').update(bytes.toString('utf8').replaceAll('\r\n', '\n')).digest('hex'), 'c9ae0a81c466d9301a6aaeb6a0a109c5b974f3b9329b345eb03931bd0b1b71a7');
  assert.equal(wave.experimentId, 'resc_mty_20261122_wave2_v1');
  assert.equal(wave.utmCampaign, original.utmCampaign);
  assert.equal(wave.copyVersion, 'v1');
  assert.equal(wave.placements.length, 24);
  const all = [...original.placements, ...wave.placements];
  assert.equal(new Set(all.map(p => p.token)).size, 85);
  for (const species of ['cat', 'dog']) {
    assert.equal(wave.placements.filter(p => p.species === species).length, 12);
    for (const arm of ['R1', 'R2', 'R3', 'R4']) {
      assert.equal(wave.placements.filter(p => p.species === species && p.armId === arm).length, 3);
    }
  }
  for (let block = 1; block <= 6; block++) {
    const group = wave.placements.filter(p => p.block === block);
    assert.deepEqual(group.map(p => p.armId).sort(), ['R1', 'R2', 'R3', 'R4']);
    assert.equal(new Set(group.map(p => p.species)).size, 1);
  }
  for (const p of wave.placements) {
    assert.match(p.token, /^[a-f0-9]{32}$/);
    assert.equal(p.isQa, false);
    assert.deepEqual(Object.keys(p).sort(), ['armId', 'block', 'isQa', 'species', 'token', 'variant']);
  }
});

test('every wave2 token reaches Play natively and via HTTPS with the compatible exact four-field referrer', async () => {
  for (const placement of wave.placements) {
    const response = await request(`/descargar/piloto/${placement.token}`);
    assert.equal(response.status, 200);
    const [native, web] = links(await response.text());
    assert.match(native, /^intent:\/\/play\.google\.com\/store\/apps\/details\?/);
    assert.match(native, /;package=com\.android\.vending;/);
    const store = new URL(web);
    assert.equal(store.origin, 'https://play.google.com');
    assert.equal(store.searchParams.get('id'), 'com.mycompany.dopmi');
    assert.deepEqual(Object.fromEntries(new URLSearchParams(store.searchParams.get('referrer'))), expectedReferrer(placement));
    const fallback = native.match(/;S\.browser_fallback_url=([^;]+);/);
    assert.equal(decodeURIComponent(fallback[1]), web);
  }
});

test('wave2 iOS downloads use a distinct aggregate campaign instead of contaminating the original60', async () => {
  for (const placement of wave.placements) {
    const response = await request(`/descargar/piloto/${placement.token}`, iphone);
    assert.equal(response.status, 302);
    const store = new URL(response.headers.get('location'));
    assert.equal(store.origin, 'https://apps.apple.com');
    assert.equal(store.searchParams.get('ct'), `resc_mty_wave2_v1_${placement.armId.toLowerCase()}`);
    assert.equal(store.searchParams.get('pt'), '123456789');
    assert.equal(store.searchParams.get('mt'), '8');
    assert.equal(store.searchParams.has('placement'), false);
  }
});

test('wave2 public paths cannot be reassigned through query parameters and rewrites resolve only registered tokens', async () => {
  const p = wave.placements[0];
  for (const path of [
    `/descargar/piloto/${p.token}?placement=${original.placements[0].token}&variant=pagina-b&utm_campaign=evil&ct=evil`,
    `/api/descargar?placement=${p.token}&variant=pagina-b&arm=R4`,
  ]) {
    const response = await request(path);
    assert.equal(response.status, 200);
    const web = links(await response.text())[1];
    assert.deepEqual(Object.fromEntries(new URLSearchParams(new URL(web).searchParams.get('referrer'))), expectedReferrer(p));
  }
  for (const path of [
    '/descargar/piloto/ffffffffffffffffffffffffffffffff',
    `/api/descargar?placement=${p.token}&placement=${wave.placements[1].token}`,
  ]) assert.equal((await request(path)).status, 404);
});

test('wave2 crawler previews keep the public token and security headers without redirecting to stores', async () => {
  const p = wave.placements[0];
  const response = await request(`/descargar/piloto/${p.token}`, 'facebookexternalhit/1.1');
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('location'), null);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
  assert.match(response.headers.get('content-security-policy'), /default-src 'none'/);
  const page = await response.text();
  assert.ok(page.includes(`property="og:url" content="https://www.dopmi.org/descargar/piloto/${p.token}"`));
  assert.ok(page.includes('https://apps.apple.com/mx/app/dopmi/id6468691532?pt=123456789&amp;ct=resc_mty_wave2_v1_'));
});
