import {
  site, project, fallbackPhoto, uuid, publicHeaders, previewPhoto,
  shortText, renderSharePage, sendSharePage,
} from '../lib/public-share.js';

const idPattern = new RegExp(`^${uuid}$`, 'i');
const sharePath = new RegExp(`^/adoptions/(${uuid})(/cover\\.jpg)?/?$`, 'i');
const photoPath = new RegExp(`^${uuid}/(${uuid})/${uuid}\\.(jpg|png|webp)$`, 'i');

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
  const openApp = post ? `io.dopmi.app://content/adoptions/${post.id}` : null;
  return renderSharePage({
    title, description, link, location, bodyText: story || description, openApp,
    imagePath: post ? cover ? `/adoptions/${post.id}/cover.jpg` : fallbackPhoto : null,
    imageAlt: cover ? `Foto de ${name}` : '', imageIsFallback: !cover,
    imageDescription: cover ? name : 'Huella de DopMi',
  });
}

function sendPage(request, response, status, post = null, cover = null) {
  return sendSharePage(request, response, status, page({ status, post, cover }));
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
