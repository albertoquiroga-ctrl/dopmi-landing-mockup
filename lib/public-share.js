import sharp from 'sharp';

export const site = 'https://www.dopmi.org';
const projectRef = 'ysaoeuidcvgtlmphmeyb';
export const project = `https://${projectRef}.supabase.co`;
export const fallbackPhoto = '/images/decorative/paw-closeup.png';
export const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const photoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const photoFormats = new Set(['jpeg', 'png', 'webp']);
const maxPhotoBytes = 5 * 1024 * 1024;
const photoWidth = 1200;
const photoHeight = 630;

export function publicHeaders(key) {
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

export async function previewPhoto(cover, headers, fetchFrom, signal) {
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
export const escapeHtml = (text) => text.replace(/[&<>"']/g, (char) => htmlEntities[char]);

export function shortText(value, limit) {
  if (typeof value !== 'string') return '';
  const characters = Array.from(value.replace(/\s+/gu, ' ').trim());
  return characters.length > limit
    ? `${characters.slice(0, limit - 1).join('').trimEnd()}…`
    : characters.join('');
}

export function renderSharePage({
  title, description, link = site, location = '', bodyText = description,
  openApp = null, imagePath = null, imageAlt = '', imageIsFallback = false,
  imageDescription = 'Huella de DopMi', availability = '',
}) {
  const previewTitle = escapeHtml(`${title} | DopMi`);
  const previewDescription = escapeHtml(description);
  const coverUrl = imagePath ? `${site}${imagePath}` : `${site}${fallbackPhoto}`;
  const imageMarkup = imagePath
    ? `<img class="cover${imageIsFallback ? ' cover-placeholder' : ''}" src="${imagePath}" width="${photoWidth}" height="${photoHeight}" alt="${escapeHtml(imageAlt)}">`
    : '';
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
  <meta property="og:image:alt" content="${escapeHtml(imageDescription)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${previewTitle}">
  <meta name="twitter:description" content="${previewDescription}">
  <meta name="twitter:image" content="${coverUrl}">
  <link rel="stylesheet" href="/adoption-share.css">
</head>
<body>
  <header><a href="/" aria-label="Inicio de DopMi">DopMi<span aria-hidden="true"></span></a></header>
  <main>
    ${imageMarkup}
    <div class="details">
      <h1>${escapeHtml(title)}</h1>
      ${location ? `<p class="location">${escapeHtml(location)}</p>` : ''}
      <p>${escapeHtml(bodyText)}</p>
      ${availability ? `<p>${escapeHtml(availability)}</p>` : ''}
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

export function sendSharePage(request, response, status, html) {
  response.statusCode = status;
  if (status === 503) response.setHeader('Retry-After', '60');
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Content-Security-Policy', "default-src 'none'; img-src 'self'; style-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
  return response.end(request.method === 'HEAD' ? undefined : html);
}
