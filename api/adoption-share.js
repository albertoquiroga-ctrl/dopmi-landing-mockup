import sharp from 'sharp';

const site = 'https://www.dopmi.org';
const projectRef = 'ysaoeuidcvgtlmphmeyb';
const project = `https://${projectRef}.supabase.co`;
const fallbackPhoto = '/images/decorative/paw-closeup.png';
const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const idPattern = new RegExp(`^${uuid}$`, 'i');
const sharePath = new RegExp(`^/adoptions/(${uuid})(/cover\\.jpg)?/?$`, 'i');
const photoPath = new RegExp(`^${uuid}/(${uuid})/${uuid}\\.(jpg|png|webp)$`, 'i');
const photoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const photoFormats = new Set(['jpeg', 'png', 'webp']);
const maxPhotoBytes = 5 * 1024 * 1024;
const photoWidth = 1200;
const photoHeight = 630;

function targetOf(request) {
  const url = new URL(request.url, site);
  const match = url.pathname.match(sharePath);
  if (match) return { id: match[1].toLowerCase(), photo: Boolean(match[2]) };
  if (url.pathname !== '/api/adoption-share') return null;
  const id = request.query?.id ?? url.searchParams.get('id');
  const asset = request.query?.asset ?? url.searchParams.get('asset');
  if (typeof id !== 'string' || !idPattern.test(id)) return null;
  return { id: id.toLowerCase(), photo: asset === 'cover' };
}

function publicHeaders(key) {
  if (!key) return null;
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return { apikey: key };
  if (!/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) return null;
  try {
    const claims = JSON.parse(Buffer.from(key.split('.')[1], 'base64url').toString());
    if (claims.role === 'anon' && claims.ref === projectRef) {
      return { apikey: key, Authorization: `Bearer ${key}` };
    }
  } catch {
    // The configured key must be publishable or the project's legacy anon key.
  }
  return null;
}

async function publicAdoption(id, headers, fetchFrom, signal) {
  const response = await fetchFrom(`${project}/rest/v1/rpc/dopmi_adoption_detail`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ post_id: id }),
    redirect: 'error',
    signal,
  });
  if (!response.ok) throw new Error('Adoption lookup unavailable');
  const post = await response.json();
  return post?.status === 'published' && post.id === id ? post : null;
}

function coverOf(post) {
  if (!Array.isArray(post.photos)) return null;
  return post.photos.find((photo) => typeof photo === 'string' &&
    photo.match(photoPath)?.[1].toLowerCase() === post.id) ?? null;
}

async function readPhoto(response) {
  if (!response.body) return null;
  if (Number(response.headers.get('content-length')) > maxPhotoBytes) {
    await response.body.cancel();
    return null;
  }
  const reader = response.body.getReader();
  const chunks = [];
  let bytes = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) return Buffer.concat(chunks, bytes);
      bytes += value.byteLength;
      if (bytes > maxPhotoBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
}

async function previewPhoto(cover, headers, fetchFrom, signal) {
  if (!cover) return null;
  const source = await fetchFrom(`${project}/storage/v1/object/authenticated/dopmi-adoption-photos/${cover}`, {
    headers,
    redirect: 'error',
    signal,
  });
  if (!source.ok || !photoTypes.has(source.headers.get('content-type')?.split(';')[0])) {
    await source.body?.cancel();
    return null;
  }
  const original = await readPhoto(source);
  if (!original?.length) return null;
  const photo = sharp(original, { limitInputPixels: 16_000_000 });
  if (!photoFormats.has((await photo.metadata()).format)) return null;
  return photo
    .rotate()
    .resize(photoWidth, photoHeight, { fit: 'cover', position: 'attention' })
    .flatten({ background: '#fff8e9' })
    .jpeg({ quality: 82 })
    .toBuffer();
}

const htmlEntities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (text) => text.replace(/[&<>"']/g, (char) => htmlEntities[char]);

function shortText(value, limit) {
  if (typeof value !== 'string') return '';
  const characters = Array.from(value.replace(/\s+/gu, ' ').trim());
  return characters.length > limit
    ? `${characters.slice(0, limit - 1).join('').trimEnd()}…`
    : characters.join('');
}

function page({ post, cover, status }) {
  const name = shortText(post?.pet_name, 80) || 'Mascota';
  const title = post ? `${name} busca hogar` : status === 503
    ? 'Intenta nuevamente en unos minutos'
    : 'Esta publicación ya no está disponible';
  const location = Array.from(new Set([
    shortText(post?.city, 60), shortText(post?.region, 60),
  ].filter(Boolean))).join(', ');
  const story = shortText(post?.story, 1200);
  const description = post
    ? shortText(story, 155) || 'Conoce a esta mascota y descubre cómo adoptarla en DopMi.'
    : 'Encuentra más mascotas en adopción en DopMi.';
  const link = post ? `${site}/adoptions/${post.id}` : site;
  const coverUrl = cover ? `${link}/cover.jpg` : `${site}${fallbackPhoto}`;
  const previewTitle = escapeHtml(`${title} | DopMi`);
  const previewDescription = escapeHtml(description);
  const openApp = post ? `io.dopmi.app://content/adoptions/${post.id}` : null;
  return `<!doctype html>
<html lang="es-MX" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>${previewTitle}</title>
  <meta name="description" content="${previewDescription}">
  <link rel="canonical" href="${link}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="DopMi">
  <meta property="og:locale" content="es_MX">
  <meta property="og:title" content="${previewTitle}">
  <meta property="og:description" content="${previewDescription}">
  <meta property="og:url" content="${link}">
  <meta property="og:image" content="${coverUrl}">
  <meta property="og:image:alt" content="${cover ? escapeHtml(name) : 'Huella de DopMi'}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${previewTitle}">
  <meta name="twitter:description" content="${previewDescription}">
  <meta name="twitter:image" content="${coverUrl}">
  <link rel="stylesheet" href="/adoption-share.css">
</head>
<body>
  <header><a href="/" aria-label="Inicio de DopMi">DopMi<span aria-hidden="true"></span></a></header>
  <main>
    ${post ? `<img class="cover${cover ? '' : ' cover-placeholder'}" src="${cover ? `/adoptions/${post.id}/cover.jpg` : fallbackPhoto}" width="${photoWidth}" height="${photoHeight}" alt="${cover ? `Foto de ${escapeHtml(name)}` : ''}">` : ''}
    <div class="details">
      <h1>${escapeHtml(title)}</h1>
      ${location ? `<p class="location">${escapeHtml(location)}</p>` : ''}
      <p>${escapeHtml(story || description)}</p>
      <nav aria-label="Conoce más en DopMi">
        ${openApp ? `<a class="primary" href="${openApp}">Abrir en DopMi</a>` : ''}
        <div class="stores">
          <a href="https://play.google.com/store/apps/details?id=com.mycompany.dopmi">Google Play</a>
          <a href="https://apps.apple.com/mx/app/dopmi/id6468691532">App Store</a>
        </div>
      </nav>
    </div>
  </main>
</body>
</html>`;
}

function sendPage(request, response, status, post = null, cover = null) {
  response.statusCode = status;
  if (status === 503) response.setHeader('Retry-After', '60');
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  return response.end(request.method === 'HEAD' ? undefined : page({ status, post, cover }));
}

export function createAdoptionShareHandler({ fetchFrom = fetch, readKey = () => process.env.DOPMI_SUPABASE_PUBLISHABLE_KEY } = {}) {
  return async function handler(request, response) {
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.setHeader('Allow', 'GET, HEAD');
      response.statusCode = 405;
      return response.end();
    }
    const target = targetOf(request);
    if (!target) return sendPage(request, response, 404);
    const headers = publicHeaders(readKey());
    let post;
    try {
      if (!headers) throw new Error('Missing publishable key');
      post = await publicAdoption(target.id, headers, fetchFrom, AbortSignal.timeout(3000));
    } catch {
      if (!target.photo) return sendPage(request, response, 503);
      response.statusCode = 503;
      return response.end();
    }
    if (!post) {
      if (!target.photo) return sendPage(request, response, 404);
      response.statusCode = 404;
      return response.end();
    }
    const cover = coverOf(post);
    if (!target.photo) return sendPage(request, response, 200, post, cover);
    let jpeg;
    try {
      jpeg = await previewPhoto(cover, headers, fetchFrom, AbortSignal.timeout(4000));
    } catch {
      // A rejected or unreadable source is never returned to the browser.
    }
    if (!jpeg) {
      response.statusCode = 302;
      response.setHeader('Location', fallbackPhoto);
      return response.end();
    }
    response.statusCode = 200;
    response.setHeader('Content-Type', 'image/jpeg');
    response.setHeader('Content-Length', String(jpeg.length));
    return response.end(request.method === 'HEAD' ? undefined : jpeg);
  };
}

export default createAdoptionShareHandler();
