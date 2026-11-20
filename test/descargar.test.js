import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { after, before, test } from 'node:test';
import handler from '../api/descargar.js';

const android = 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/141.0.0.0 Mobile Safari/537.36 [FBAN/FB4A]';
const iphone = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 [FBAN/FBIOS]';
const play = 'https://play.google.com/store/apps/details?id=com.mycompany.dopmi';
const apple = 'https://apps.apple.com/mx/app/dopmi/id6468691532';
const server = createServer(handler);
let local;

before(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  local = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

function request(path, agent, { headers, ...options } = {}) {
  return fetch(`${local}${path}`, {
    redirect: 'manual',
    ...options,
    headers: { 'User-Agent': agent, ...headers },
  });
}

function linksIn(page) {
  return [...page.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)]
    .map((match) => ({ href: match[1].replaceAll('&amp;', '&'), text: match[2] }));
}

test('plain Android links open Play by gesture and carry no campaign, even with supplied query values', async () => {
  const response = await request('/descargar?variant=pagina-b&fbclid=facebook-id', android);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('location'), null);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  const links = linksIn(await response.text());
  assert.equal(links[0].text, 'Abrir Google Play');
  assert.equal(links[0].href, `intent://play.google.com/store/apps/details?id=com.mycompany.dopmi#Intent;scheme=https;action=android.intent.action.VIEW;package=com.android.vending;S.browser_fallback_url=${encodeURIComponent(play)};end`);
  assert.deepEqual(links[1], { href: play, text: 'Ver en el navegador' });
});

test('all four Android native intents and HTTPS fallbacks preserve the exact campaign', async () => {
  for (const variant of ['personal-a', 'personal-b', 'pagina-a', 'pagina-b']) {
    const response = await request(`/descargar/${variant}?variant=unrelated&url=https://example.com`, android);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('location'), null);
    const [native, web] = linksIn(await response.text());
    assert.equal(native.text, 'Abrir Google Play');
    const [nativeUrl, intent] = native.href.split('#Intent;');
    assert.match(intent, /^scheme=https;action=android\.intent\.action\.VIEW;package=com\.android\.vending;/);
    const fallback = intent.match(/(?:^|;)S\.browser_fallback_url=([^;]+);end$/);
    assert.ok(fallback);
    const location = new URL(nativeUrl.replace(/^intent:/, 'https:'));
    assert.equal(location.origin, 'https://play.google.com');
    assert.equal(location.searchParams.get('id'), 'com.mycompany.dopmi');
    assert.deepEqual(Object.fromEntries(new URLSearchParams(location.searchParams.get('referrer'))), {
      utm_source: 'facebook',
      utm_medium: 'organic_comment',
      utm_campaign: `dopmi_rescatistas_mty_${variant}`,
      utm_content: variant,
    });
    assert.deepEqual([...location.searchParams.keys()], ['id', 'referrer']);
    assert.equal(decodeURIComponent(fallback[1]), location.href);
    assert.deepEqual(web, { href: location.href, text: 'Ver en el navegador' });
  }
});

test('typed Android navigation presents an anchor instead of an automatic intent redirect', async () => {
  // Chrome refuses intent redirects from typed URLs or without a user gesture.
  // https://developer.chrome.com/docs/android/intents#considerations
  const response = await request('/descargar/personal-a', android, {
    headers: { 'Sec-Fetch-Site': 'none', 'Sec-Fetch-User': '?1' },
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('location'), null);
  const page = await response.text();
  assert.match(page, /<a href="intent:[^"]+">Abrir Google Play<\/a>/);
  assert.doesNotMatch(page, /<script|http-equiv=["']refresh|window\.location|setTimeout/i);
  assert.match(response.headers.get('content-security-policy'), /default-src 'none'/);
});

test('iPhone and iPad open the verified Mexican App Store listing', async () => {
  for (const agent of [iphone, iphone.replaceAll('iPhone', 'iPad')]) {
    const response = await request('/descargar/pagina-a', agent);
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), apple);
  }
});

test('explicit platform hints can identify mobile devices when the UA is reduced', async () => {
  const google = await request('/descargar', 'Mozilla/5.0', { headers: { 'Sec-CH-UA-Platform': '"Android"' } });
  const ios = await request('/descargar', 'Mozilla/5.0', { headers: { 'Sec-CH-UA-Platform': '"iOS"' } });
  assert.equal(google.status, 200);
  assert.equal(linksIn(await google.text())[1].href, play);
  assert.equal(ios.headers.get('location'), apple);
});

test('desktop, social crawlers and ambiguous mobile signals get both accessible links', async () => {
  const cases = [
    { agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    { agent: '' },
    { agent: `facebookexternalhit/1.1 ${android}` },
    { agent: android, headers: { 'Sec-CH-UA-Platform': '"iOS"' } },
    { agent: android, headers: { 'Sec-Purpose': 'prefetch' } },
  ];
  for (const { agent, headers } of cases) {
    const response = await request('/descargar/personal-a', agent, { headers });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8');
    assert.equal(response.headers.get('location'), null);
    const page = await response.text();
    assert.match(page, /<html lang="es-MX">/);
    assert.match(page, /property="og:url" content="https:\/\/www\.dopmi\.org\/descargar\/personal-a"/);
    assert.match(page, /play\.google\.com\/store\/apps\/details\?id=com\.mycompany\.dopmi&amp;referrer=/);
    assert.ok(page.includes(apple));
    assert.equal(linksIn(page).some((link) => link.href.startsWith('intent:')), false);
  }
});

test('internal rewrite requests accept known variants and discard unrecognized values', async () => {
  const tagged = await request('/api/descargar?variant=pagina-b', android);
  const untracked = await request('/api/descargar?variant=untracked', android);
  const attemptedRedirect = await request('/api/descargar?variant=https://evil.example&destination=https://evil.example', android);
  const referrer = new URL(linksIn(await tagged.text())[1].href).searchParams.get('referrer');
  assert.equal(new URLSearchParams(referrer).get('utm_content'), 'pagina-b');
  assert.equal(linksIn(await untracked.text())[1].href, play);
  const attemptedPage = await attemptedRedirect.text();
  assert.equal(linksIn(attemptedPage)[1].href, play);
  assert.doesNotMatch(attemptedPage, /evil\.example/);
});

test('HEAD sends metadata without a body and other methods return 405', async () => {
  const head = await request('/descargar', 'facebookexternalhit/1.1', { method: 'HEAD' });
  const post = await request('/descargar', android, { method: 'POST' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('allow'), 'GET, HEAD');
});
