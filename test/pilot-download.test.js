import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import handler from '../api/descargar.js';

const manifestBytes = readFileSync(new URL('../config/rescuer-pilot-60-v1.json', import.meta.url));
const manifest = JSON.parse(manifestBytes);
const android = 'Mozilla/5.0 (Linux; Android 16) Chrome/142.0.0.0 Mobile Safari/537.36';
const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) Mobile/15E148';
const crawler = 'facebookexternalhit/1.1';
const play = 'https://play.google.com/store/apps/details?id=com.mycompany.dopmi';
const apple = 'https://apps.apple.com/mx/app/dopmi/id6468691532';
const originalProvider = process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN;
const server = createServer(handler);
let local;

before(async () => {
  process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN = '123456789';
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  local = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  if (originalProvider === undefined) delete process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN;
  else process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN = originalProvider;
});

function request(path, agent = android, options = {}) {
  return fetch(`${local}${path}`, {
    redirect: 'manual',
    ...options,
    headers: { 'User-Agent': agent, ...options.headers },
  });
}

function links(page) {
  return [...page.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)]
    .map((match) => ({ href: match[1].replaceAll('&amp;', '&'), text: match[2] }));
}

function expectedReferrer(placement) {
  return {
    utm_source: 'facebook',
    utm_medium: 'organic_comment',
    utm_campaign: 'dopmi_rescatistas_mty_p60_v1',
    utm_content: placement.token,
  };
}

function expectedApple(placement) {
  return `${apple}?pt=123456789&ct=resc_mty_p60_v1_${placement.armId.toLowerCase()}${placement.isQa ? '_qa' : ''}&mt=8`;
}

test('the canonical pilot manifest is unchanged, balanced and contains no social identifiers', () => {
  assert.equal(createHash('sha256').update(manifestBytes).digest('hex'), 'edcf94d92aa3af4e17e98a73797b20c15ad96df5b9742608342018a50ada7e5a');
  assert.equal(manifest.schemaVersion, 1);
  assert.equal(manifest.experimentId, 'resc_mty_20261121_p60_v1');
  assert.equal(manifest.utmCampaign, 'dopmi_rescatistas_mty_p60_v1');
  assert.equal(manifest.placements.length, 61);
  assert.equal(new Set(manifest.placements.map((placement) => placement.token)).size, 61);
  assert.equal(manifest.placements.filter((placement) => placement.isQa).length, 1);
  for (const armId of ['R1', 'R2', 'R3', 'R4']) {
    assert.equal(manifest.placements.filter((placement) => !placement.isQa && placement.armId === armId).length, 15);
  }
  for (const placement of manifest.placements) {
    assert.match(placement.token, /^[a-f0-9]{32}$/);
    assert.deepEqual(Object.keys(placement).sort(), ['armId', 'block', 'isQa', 'token', 'variant']);
  }
});

test('every registered pilot placement survives both the native Play handoff and HTTPS fallback', async () => {
  for (const placement of manifest.placements) {
    const response = await request(`/descargar/piloto/${placement.token}`);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('location'), null);
    const page = await response.text();
    const [native, web] = links(page);
    assert.equal(native.text, 'Abrir Google Play');
    const [nativeUrl, intent] = native.href.split('#Intent;');
    const store = new URL(nativeUrl.replace(/^intent:/, 'https:'));
    assert.equal(store.origin, 'https://play.google.com');
    assert.equal(store.searchParams.get('id'), 'com.mycompany.dopmi');
    assert.deepEqual([...store.searchParams.keys()], ['id', 'referrer']);
    assert.deepEqual(Object.fromEntries(new URLSearchParams(store.searchParams.get('referrer'))), expectedReferrer(placement));
    assert.match(intent, /^scheme=https;action=android\.intent\.action\.VIEW;package=com\.android\.vending;/);
    const fallback = intent.match(/S\.browser_fallback_url=([^;]+);end$/);
    assert.ok(fallback);
    assert.equal(decodeURIComponent(fallback[1]), store.href);
    assert.deepEqual(web, { href: store.href, text: 'Ver en el navegador' });
    assert.match(page, new RegExp(`property="og:url" content="https://www\\.dopmi\\.org/descargar/piloto/${placement.token}"`));
    assert.doesNotMatch(page, /<script|http-equiv=["']refresh|window\.location|setTimeout/i);
  }
});

test('public path tokens ignore query attempts to replace the placement, arm, campaign or destination', async () => {
  const placement = manifest.placements[0];
  const injection = `?placement=${manifest.placements[1].token}&variant=pagina-a&utm_campaign=evil&arm=R4&destination=https://evil.example&pt=666&ct=evil`;
  const response = await request(`/descargar/piloto/${placement.token}${injection}`);
  const page = await response.text();
  const store = new URL(links(page)[1].href);
  assert.deepEqual(Object.fromEntries(new URLSearchParams(store.searchParams.get('referrer'))), expectedReferrer(placement));
  assert.doesNotMatch(page, /evil\.example|ct=evil|pt=666/);
  const ios = await request(`/descargar/piloto/${placement.token}${injection}`, iphone);
  assert.equal(ios.headers.get('location'), expectedApple(placement));
});

test('internal Vercel rewrites resolve registered placements without accepting a free mapping', async () => {
  const placement = manifest.placements[2];
  const response = await request(`/api/descargar?placement=${placement.token}&variant=pagina-b&arm=R4`);
  assert.equal(response.status, 200);
  const store = new URL(links(await response.text())[1].href);
  assert.deepEqual(Object.fromEntries(new URLSearchParams(store.searchParams.get('referrer'))), expectedReferrer(placement));
  const duplicate = await request(`/api/descargar?placement=${placement.token}&placement=${manifest.placements[3].token}`);
  assert.equal(duplicate.status, 404);
});

test('unknown or malformed pilot tokens fail closed rather than becoming a legacy campaign', async () => {
  const token = manifest.placements[0].token;
  const paths = [
    '/descargar/piloto',
    '/descargar/piloto/',
    `/descargar/piloto/${'0'.repeat(32)}`,
    `/descargar/piloto/${token.toUpperCase()}`,
    `/descargar/piloto/${token}/extra`,
    `/descargar/piloto/${token.slice(1)}`,
    `/descargar/piloto/%3Cscript%3E?placement=${token}`,
    `/api/descargar?placement=unknown&variant=personal-a`,
    '/api/descargar?placement=',
  ];
  for (const path of paths) {
    for (const agent of [android, iphone, crawler]) {
      const response = await request(path, agent);
      assert.equal(response.status, 404, path);
      assert.equal(response.headers.get('location'), null);
      const page = await response.text();
      assert.doesNotMatch(page, /play\.google\.com|apps\.apple\.com|script|utm_campaign|unknown/i);
    }
  }
});

test('iOS keeps direct App Store downloads with distinct aggregate pilot campaigns and a separate QA campaign', async () => {
  for (const placement of manifest.placements) {
    for (const agent of [iphone, iphone.replaceAll('iPhone', 'iPad')]) {
      const response = await request(`/descargar/piloto/${placement.token}`, agent);
      assert.equal(response.status, 302);
      assert.equal(response.headers.get('location'), expectedApple(placement));
      assert.doesNotMatch(response.headers.get('location'), /ppid=|io\.dopmi|personal_a|pagina_a/);
      assert.equal(await response.text(), '');
    }
  }
});

test('crawlers, desktops and ambiguous devices preserve the placement in accessible store links without an intent redirect', async () => {
  const placement = manifest.placements[0];
  const cases = [
    [crawler, {}],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', {}],
    [android, { 'Purpose': 'prefetch' }],
    [android, { 'Sec-CH-UA-Platform': '"iOS"' }],
  ];
  for (const [agent, headers] of cases) {
    const response = await request(`/descargar/piloto/${placement.token}`, agent, { headers });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('location'), null);
    const page = await response.text();
    const [google, ios] = links(page);
    assert.equal(google.href.startsWith('intent:'), false);
    assert.deepEqual(Object.fromEntries(new URLSearchParams(new URL(google.href).searchParams.get('referrer'))), expectedReferrer(placement));
    assert.equal(ios.href, expectedApple(placement));
    assert.match(page, /<html lang="es-MX">/);
  }
});

test('new pilot GET and HEAD retain security headers, HEAD has no body and other methods are rejected', async () => {
  const path = `/descargar/piloto/${manifest.placements[0].token}`;
  for (const method of ['GET', 'HEAD']) {
    for (const agent of [android, iphone, crawler]) {
      const response = await request(path, agent, { method });
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.equal(response.headers.get('referrer-policy'), 'no-referrer');
      assert.equal(response.headers.get('set-cookie'), null);
      assert.equal(response.headers.get('vary'), 'User-Agent, Sec-CH-UA-Platform, Purpose, Sec-Purpose');
      if (method === 'HEAD') assert.equal(await response.text(), '');
      if (agent !== iphone) {
        assert.match(response.headers.get('content-security-policy'), /default-src 'none'/);
        assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
      }
    }
  }
  const invalidHead = await request('/descargar/piloto/unknown', android, { method: 'HEAD' });
  assert.equal(invalidHead.status, 404);
  assert.equal(await invalidHead.text(), '');
  for (const method of ['POST', 'PUT', 'DELETE']) {
    const response = await request(path, android, { method });
    assert.equal(response.status, 405);
    assert.equal(response.headers.get('allow'), 'GET, HEAD');
  }
});

test('pilot iOS campaigns fall back to the original store URL if its public provider configuration is absent', async () => {
  const previous = process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN;
  delete process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN;
  try {
    const response = await request(`/descargar/piloto/${manifest.placements[0].token}`, iphone);
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), apple);
  } finally {
    process.env.APPLE_CAMPAIGN_PROVIDER_TOKEN = previous;
  }
});

test('Vercel exposes the finite pilot token route through the download handler', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  assert.ok(config.rewrites.some((rewrite) => rewrite.source === '/descargar/piloto/:placement([a-f0-9]{32})'
    && rewrite.destination === '/api/descargar?placement=:placement'));
});
