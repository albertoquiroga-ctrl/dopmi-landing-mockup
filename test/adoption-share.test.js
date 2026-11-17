import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';
import { createAdoptionShareHandler } from '../api/adoption-share.js';

const id = '73062b78-4fd2-4c0a-97fa-2fdb99a5a5f7';
const owner = '2f2b1f82-9fb9-4af8-bac4-1265e8af321a';
const object = 'a6fce123-1fe7-4f91-9c71-daaeb4a77b43.jpg';
const cover = `${owner}/${id}/${object}`;
const page = `/adoptions/${id}`;
const key = 'sb_publishable_fixture-not-production';
const published = {
  id, status: 'published', photos: [cover], owner_id: owner,
  pet_name: 'Mía & Hugo <3', city: 'Monterrey', region: 'Nuevo León',
  story: 'Tiene un corazón enorme. <script>alert("hola")</script>',
  publisher_name: 'Do not include', private_location: '100,100',
};

function pretendFetch(...replies) {
  const requests = [];
  return {
    requests,
    async fetchFrom(url, options) {
      requests.push({ url, options });
      assert.ok(replies.length, 'Unexpected upstream request');
      return replies.shift();
    },
  };
}

async function request(url, upstream, { method = 'GET', query, readKey = () => key } = {}) {
  const response = {
    headers: {},
    setHeader(name, value) { this.headers[name] = value; },
    end(body) { this.body = body; },
  };
  await createAdoptionShareHandler({ ...upstream, readKey })({ url, method, query }, response);
  return response;
}

test('renders crawlable and escaped pet metadata with the correct app and store targets', async () => {
  const upstream = pretendFetch(Response.json(published));
  const otherId = '5af61f79-93dd-4904-bcfc-db29f96265b8';
  const response = await request(`${page}?id=${otherId}&asset=cover`, upstream);
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['Cache-Control'], 'no-store');
  const { body } = response;
  assert.match(body, /<meta property="og:title" content="Mía &amp; Hugo &lt;3 busca hogar \| DopMi">/);
  assert.match(body, /<meta property="og:description" content="Tiene un corazón enorme\. &lt;script&gt;/);
  assert.ok(body.includes(`<meta property="og:image" content="https://www.dopmi.org${page}/cover.jpg">`));
  assert.ok(body.includes(`<link rel="canonical" href="https://www.dopmi.org${page}">`));
  assert.match(body, /<img class="cover" .*alt="Foto de Mía &amp; Hugo &lt;3">/);
  assert.ok(body.includes(`href="io.dopmi.app://content/adoptions/${id}"`));
  assert.match(body, /play\.google\.com\/store\/apps\/details\?id=com\.mycompany\.dopmi/);
  assert.match(body, /apps\.apple\.com\/mx\/app\/dopmi\/id6468691532/);
  for (const forbidden of ['<script>', key, cover, owner, published.publisher_name, published.private_location]) {
    assert.ok(!body.includes(forbidden), `Unexpected output: ${forbidden}`);
  }
  assert.equal(upstream.requests.length, 1);
  const [{ url, options }] = upstream.requests;
  assert.equal(url, 'https://ysaoeuidcvgtlmphmeyb.supabase.co/rest/v1/rpc/dopmi_adoption_detail');
  assert.deepEqual(JSON.parse(options.body), { post_id: id });
  assert.deepEqual(options.headers, { apikey: key, 'Content-Type': 'application/json' });
});

test('rewritten cover requests recheck publication and return a clean, correctly sized JPEG', async () => {
  const original = await sharp({
    create: { width: 500, height: 900, channels: 3, background: '#d69e45' },
  }).withExif({ IFD0: { Copyright: 'Metadata removed from public copy' } }).jpeg().toBuffer();
  assert.ok((await sharp(original).metadata()).exif);
  const served = new Response(original, { headers: { 'Content-Type': 'image/jpeg' } });
  const upstream = pretendFetch(Response.json(published), served);
  const response = await request('/api/adoption-share', upstream, { query: { id, asset: 'cover' } });
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['Content-Type'], 'image/jpeg');
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.equal(response.headers['Content-Length'], String(response.body.length));
  assert.equal(upstream.requests[1].url, `https://ysaoeuidcvgtlmphmeyb.supabase.co/storage/v1/object/authenticated/dopmi-adoption-photos/${cover}`);
  assert.equal(upstream.requests[1].options.redirect, 'error');
  const { format, width, height, exif } = await sharp(response.body).metadata();
  assert.deepEqual({ format, width, height, exif }, { format: 'jpeg', width: 1200, height: 630, exif: undefined });
});

test('unavailable and unpublished listings stay private for the page and the cover', async () => {
  for (const post of [null, { ...published, status: 'adopted' }, { ...published, status: 'submitted' }]) {
    for (const route of [page, `${page}/cover.jpg`]) {
      const upstream = pretendFetch(Response.json(post));
      const response = await request(route, upstream);
      assert.equal(response.statusCode, 404);
      assert.ok(!response.body?.includes(published.pet_name));
      assert.ok(!response.body?.includes('Abrir en DopMi'));
      assert.equal(upstream.requests.length, 1);
    }
  }
});

test('a missing or invalid photo cannot expose a storage path and falls back safely', async () => {
  const otherId = '5af61f79-93dd-4904-bcfc-db29f96265b8';
  const photoFromOtherPost = `${owner}/${otherId}/${object}`;
  const untrusted = { ...published, photos: [photoFromOtherPost, 'https://example.org/img.jpg'] };
  const upstream = pretendFetch(Response.json(untrusted), Response.json(untrusted));
  const response = await request(page, upstream);
  assert.match(response.body, /<meta property="og:image" content="https:\/\/www\.dopmi\.org\/images\/decorative\/paw-closeup\.png">/);
  assert.match(response.body, /<img class="cover cover-placeholder" .*alt="">/);
  assert.ok(!response.body.includes(otherId));
  const fallback = await request(`${page}/cover.jpg`, upstream);
  assert.equal(fallback.statusCode, 302);
  assert.equal(fallback.headers.Location, '/images/decorative/paw-closeup.png');
  assert.equal(upstream.requests.length, 2);
});

test('a storage denial or oversized object results in an illustrated fallback', async () => {
  for (const denied of [
    new Response('denied', { status: 403 }),
    new Response(new Uint8Array(5 * 1024 * 1024 + 1), { headers: { 'Content-Type': 'image/jpeg' } }),
    new Response('fake photo', { headers: { 'Content-Type': 'text/html' } }),
  ]) {
    const upstream = pretendFetch(Response.json(published), denied);
    const response = await request(`${page}/cover.jpg`, upstream);
    assert.equal(response.statusCode, 302);
    assert.equal(response.headers.Location, '/images/decorative/paw-closeup.png');
    assert.equal(response.body, undefined);
  }
});

test('misconfigured credentials, invalid paths and methods do not reach the backend', async () => {
  const upstream = pretendFetch();
  const encode = (data) => Buffer.from(JSON.stringify(data)).toString('base64url');
  const jwt = `${encode({ alg: 'HS256' })}.${encode({ role: 'service_role', ref: 'ysaoeuidcvgtlmphmeyb' })}.signature`;
  for (const invalidKey of ['sb_secret_no', jwt, undefined]) {
    assert.equal((await request(page, upstream, { readKey: () => invalidKey })).statusCode, 503);
  }
  assert.equal((await request('/adoptions/not-a-uuid', upstream)).statusCode, 404);
  assert.equal((await request(page, upstream, { method: 'POST' })).statusCode, 405);
  assert.equal(upstream.requests.length, 0);
});

test('HEAD provides status and a body-less response, and a lookup failure is retryable', async () => {
  const upstream = pretendFetch(Response.json(published), Response.json({}, { status: 504 }));
  const response = await request(page, upstream, { method: 'HEAD' });
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['Content-Type'], 'text/html; charset=utf-8');
  assert.equal(response.body, undefined);
  const unavailable = await request(page, upstream);
  assert.equal(unavailable.statusCode, 503);
  assert.equal(unavailable.headers['Retry-After'], '60');
  assert.ok(!unavailable.body.includes(published.pet_name));
});
