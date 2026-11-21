import assert from 'node:assert/strict';
import test from 'node:test';
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { createProfileShareHandler } from '../api/profile-share.js';

const id = '73062b78-4fd2-4c0a-97fa-2fdb99a5a5f7';
const postId = '2f2b1f82-9fb9-4af8-bac4-1265e8af321a';
const photoId = 'a6fce123-1fe7-4f91-9c71-daaeb4a77b43';
const photo = `${id}/${postId}/${photoId}.jpg`;
const page = `/people/${id}`;
const key = 'sb_publishable_fixture-not-production';
const listing = { id: postId, owner_id: id, status: 'published', photos: [photo] };
const published = {
  id, name: 'Refugio & Hogar <3', bio: 'Conoce nuestras mascotas. <script>malicious()</script>',
  city: 'Monterrey', region: 'Nuevo León', adoptions: [listing],
  public_email: 'private@example.test', public_phone: 'private-phone',
  private_data: { exact_location: 'private-location' },
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
  await createProfileShareHandler({ ...upstream, readKey })({ url, method, query }, response);
  return response;
}

test('an adoption-only public profile has a crawlable HTTPS page with its exact app target', async () => {
  const upstream = pretendFetch(Response.json(null), Response.json(published));
  const response = await request(page, upstream);
  assert.equal(response.statusCode, 200);
  assert.ok(response.body.includes(`<link rel="canonical" href="https://www.dopmi.org${page}">`));
  assert.ok(response.body.includes(`href="io.dopmi.app://content/people/${id}"`));
  assert.match(response.body, /<meta property="og:title" content="Refugio &amp; Hogar &lt;3 \| DopMi">/);
  assert.ok(response.body.includes(`<meta property="og:image" content="https://www.dopmi.org${page}/cover.jpg">`));
  assert.match(response.body, /Conoce nuestras mascotas\. &lt;script&gt;/);
  assert.match(response.body, /1 mascota en adopción/);
  for (const forbidden of ['<script>', key, photo, 'private@example.test', 'private-phone', 'private-location']) {
    assert.ok(!response.body.includes(forbidden), `Unexpected output: ${forbidden}`);
  }
  assert.deepEqual(upstream.requests.map(({ url }) => url), [
    'https://ysaoeuidcvgtlmphmeyb.supabase.co/rest/v1/rpc/dopmi_rescuer_public',
    'https://ysaoeuidcvgtlmphmeyb.supabase.co/rest/v1/rpc/dopmi_public_profile',
  ]);
  for (const { options } of upstream.requests) {
    assert.deepEqual(JSON.parse(options.body), { person_id: id });
    assert.equal(options.redirect, 'error');
    assert.deepEqual(options.headers, { apikey: key, 'Content-Type': 'application/json' });
  }
});

test('a moderated public profile is used directly and route identifiers take precedence over query parameters', async () => {
  const upstream = pretendFetch(Response.json(published));
  const response = await request(`${page}?id=${postId}&asset=cover`, upstream);
  assert.equal(response.statusCode, 200);
  assert.match(response.headers['Content-Type'], /^text\/html/);
  assert.ok(response.body.includes(`https://www.dopmi.org${page}`));
  assert.equal(upstream.requests.length, 1);
  assert.deepEqual(JSON.parse(upstream.requests[0].options.body), { person_id: id });
});

test('profile covers recheck the public adoption and strip metadata from a correctly sized JPEG', async () => {
  const original = await sharp({
    create: { width: 500, height: 900, channels: 3, background: '#d69e45' },
  }).withExif({ IFD0: { Copyright: 'Not part of the public preview' } }).jpeg().toBuffer();
  assert.ok((await sharp(original).metadata()).exif);
  const upstream = pretendFetch(
    Response.json(published), Response.json(listing),
    new Response(original, { headers: { 'Content-Type': 'image/jpeg' } }),
  );
  const response = await request('/api/profile-share', upstream, { query: { id, asset: 'cover' } });
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['Content-Type'], 'image/jpeg');
  assert.equal(response.headers['Content-Length'], String(response.body.length));
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.equal(upstream.requests[1].url, 'https://ysaoeuidcvgtlmphmeyb.supabase.co/rest/v1/rpc/dopmi_adoption_detail');
  assert.deepEqual(JSON.parse(upstream.requests[1].options.body), { post_id: postId });
  assert.equal(upstream.requests[2].url, `https://ysaoeuidcvgtlmphmeyb.supabase.co/storage/v1/object/authenticated/dopmi-adoption-photos/${photo}`);
  assert.equal(upstream.requests[2].options.redirect, 'error');
  const { format, width, height, exif } = await sharp(response.body).metadata();
  assert.deepEqual({ format, width, height, exif }, { format: 'jpeg', width: 1200, height: 630, exif: undefined });
});

test('unavailable profiles and mismatched identities expose no public card or photo', async () => {
  for (const candidate of [null, { ...published, id: postId }]) {
    for (const route of [page, `${page}/cover.jpg`]) {
      const upstream = candidate === null
        ? pretendFetch(Response.json(null), Response.json(null))
        : pretendFetch(Response.json(candidate));
      const response = await request(route, upstream);
      assert.equal(response.statusCode, 404);
      assert.ok(!response.body?.includes('Refugio &amp; Hogar'));
      assert.ok(!response.body?.includes('Abrir en DopMi'));
      assert.equal(upstream.requests.length, candidate === null ? 2 : 1);
    }
  }
});

test('private listings, other owners and arbitrary photo paths cannot be used as a profile preview', async () => {
  const invalid = { ...published, adoptions: [
    { ...listing, status: 'submitted' },
    { ...listing, owner_id: postId },
    { ...listing, id: 'invalid' },
    { ...listing, photos: [`${postId}/${postId}/${photoId}.jpg`, 'https://example.test/photo.jpg', '../private.jpg'] },
  ] };
  const upstream = pretendFetch(Response.json(invalid), Response.json(invalid));
  const response = await request(page, upstream);
  assert.equal(response.statusCode, 200);
  assert.match(response.body, /<meta property="og:image" content="https:\/\/www\.dopmi\.org\/images\/decorative\/paw-closeup\.png">/);
  assert.match(response.body, /1 mascota en adopción/);
  assert.ok(!response.body.includes(postId));
  const coverResponse = await request(`${page}/cover.jpg`, upstream);
  assert.equal(coverResponse.statusCode, 302);
  assert.equal(coverResponse.headers.Location, '/images/decorative/paw-closeup.png');
  assert.equal(upstream.requests.length, 2);
});

test('withdrawn and reassigned photos are denied by a fresh adoption lookup before storage is read', async () => {
  for (const post of [null, { ...listing, status: 'archived' }, { ...listing, owner_id: postId }, { ...listing, id }]) {
    const upstream = pretendFetch(Response.json(published), Response.json(post));
    const response = await request(`${page}/cover.jpg`, upstream);
    assert.equal(response.statusCode, 302);
    assert.equal(response.headers.Location, '/images/decorative/paw-closeup.png');
    assert.equal(upstream.requests.length, 2);
  }
});

test('an adopted-only profile has a branded fallback while GET and HEAD retain the same public status', async () => {
  const profile = { ...published, adoptions: [] };
  const upstream = pretendFetch(Response.json(profile), Response.json(profile));
  const response = await request(page, upstream);
  assert.equal(response.statusCode, 200);
  assert.match(response.body, /0 mascotas en adopción/);
  assert.match(response.body, /cover-placeholder/);
  assert.match(response.body, /Huella de DopMi/);
  const head = await request(page, upstream, { method: 'HEAD' });
  assert.equal(head.statusCode, response.statusCode);
  assert.equal(head.headers['Content-Type'], response.headers['Content-Type']);
  assert.equal(head.body, undefined);
});

test('invalid requests and unavailable lookups fail without disclosing profile data', async () => {
  const noRequests = pretendFetch();
  assert.equal((await request('/people/not-a-uuid', noRequests)).statusCode, 404);
  const rejected = await request(page, noRequests, { method: 'POST' });
  assert.equal(rejected.statusCode, 405);
  assert.equal(rejected.headers.Allow, 'GET, HEAD');
  const encode = (data) => Buffer.from(JSON.stringify(data)).toString('base64url');
  const secretJwt = `${encode({ alg: 'HS256' })}.${encode({ role: 'service_role', ref: 'ysaoeuidcvgtlmphmeyb' })}.signature`;
  for (const invalid of [undefined, 'sb_secret_forbidden', secretJwt]) {
    assert.equal((await request(page, noRequests, { readKey: () => invalid })).statusCode, 503);
  }
  assert.equal(noRequests.requests.length, 0);
  const unavailable = await request(page, pretendFetch(Response.json({}, { status: 503 })));
  assert.equal(unavailable.statusCode, 503);
  assert.equal(unavailable.headers['Retry-After'], '60');
  assert.ok(!unavailable.body.includes('Abrir en DopMi'));
});

test('the deployed rewrites map profile pages and their images without changing adoption routes', async () => {
  const config = JSON.parse(await readFile(new URL('../vercel.json', import.meta.url), 'utf8'));
  for (const [source, destination] of [
    ['/people/:id', '/api/profile-share?id=:id'],
    ['/people/:id/cover.jpg', '/api/profile-share?id=:id&asset=cover'],
    ['/adoptions/:id', '/api/adoption-share?id=:id'],
    ['/adoptions/:id/cover.jpg', '/api/adoption-share?id=:id&asset=cover'],
  ]) {
    assert.deepEqual(config.rewrites.find((route) => route.source === source), { source, destination });
  }
});
