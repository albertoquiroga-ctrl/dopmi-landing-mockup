import {
  site, project, fallbackPhoto, uuid, publicHeaders, previewPhoto,
  shortText, renderSharePage, sendSharePage,
} from '../lib/public-share.js';

const idPattern = new RegExp(`^${uuid}$`, 'i');
const sharePath = new RegExp(`^/people/(${uuid})(/cover\\.jpg)?/?$`, 'i');
const photoPath = new RegExp(`^(${uuid})/(${uuid})/${uuid}\\.(jpg|png|webp)$`, 'i');

function targetOf(request) {
  const url = new URL(request.url, site);
  const match = url.pathname.match(sharePath);
  if (match) return { id: match[1].toLowerCase(), photo: Boolean(match[2]) };
  if (url.pathname !== '/api/profile-share') return null;
  const id = request.query?.id ?? url.searchParams.get('id');
  const asset = request.query?.asset ?? url.searchParams.get('asset');
  if (typeof id !== 'string' || !idPattern.test(id)) return null;
  return { id: id.toLowerCase(), photo: asset === 'cover' };
}

async function publicLookup(name, parameters, headers, fetchFrom, signal) {
  const response = await fetchFrom(`${project}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(parameters),
    redirect: 'error',
    signal,
  });
  if (!response.ok) throw new Error('Public profile lookup unavailable');
  return response.json();
}

async function publicProfile(id, headers, fetchFrom, signal) {
  const parameters = { person_id: id };
  const profile = await publicLookup('dopmi_rescuer_public', parameters, headers, fetchFrom, signal)
    ?? await publicLookup('dopmi_public_profile', parameters, headers, fetchFrom, signal);
  return profile?.id === id ? profile : null;
}

function availableAdoptions(profile) {
  if (!Array.isArray(profile.adoptions)) return [];
  return profile.adoptions.filter((post) => post?.status === 'published'
    && post.owner_id === profile.id && typeof post.id === 'string' && idPattern.test(post.id));
}

function coverOf(post, owner) {
  if (!Array.isArray(post.photos)) return null;
  return post.photos.find((photo) => {
    if (typeof photo !== 'string') return false;
    const match = photo.match(photoPath);
    return match?.[1].toLowerCase() === owner && match[2].toLowerCase() === post.id;
  }) ?? null;
}

function profileCover(profile) {
  for (const post of availableAdoptions(profile)) {
    const path = coverOf(post, profile.id);
    if (path) return { id: post.id, path };
  }
  return null;
}

function page(status, profile, cover) {
  const name = shortText(profile?.name, 80) || 'Perfil de rescatista';
  const title = profile ? name : status === 503
    ? 'Intenta nuevamente en unos minutos'
    : 'Este perfil ya no está disponible';
  const location = Array.from(new Set([
    shortText(profile?.city, 60), shortText(profile?.region, 60),
  ].filter(Boolean))).join(', ');
  const bio = shortText(profile?.bio, 1200);
  const description = profile
    ? shortText(bio, 155) || `Conoce el perfil de ${name} y sus mascotas en adopción en DopMi.`
    : 'Encuentra mascotas en adopción y conoce a quienes las cuidan en DopMi.';
  const link = profile ? `${site}/people/${profile.id}` : site;
  const count = profile ? availableAdoptions(profile).length : 0;
  const availability = profile
    ? count === 1 ? '1 mascota en adopción' : `${count} mascotas en adopción`
    : '';
  return renderSharePage({
    title, description, link, location, bodyText: bio || description, availability,
    openApp: profile ? `io.dopmi.app://content/people/${profile.id}` : null,
    imagePath: profile ? cover ? `/people/${profile.id}/cover.jpg` : fallbackPhoto : null,
    imageAlt: cover ? `Mascota publicada por ${name}` : '', imageIsFallback: !cover,
    imageDescription: cover ? `Mascota publicada por ${name}` : 'Huella de DopMi',
  });
}

function sendPage(request, response, status, profile = null, cover = null) {
  return sendSharePage(request, response, status, page(status, profile, cover));
}

export function createProfileShareHandler({ fetchFrom = fetch, readKey = () => process.env.DOPMI_SUPABASE_PUBLISHABLE_KEY } = {}) {
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
    let profile;
    try {
      if (!headers) throw new Error('Missing publishable key');
      profile = await publicProfile(target.id, headers, fetchFrom, AbortSignal.timeout(3000));
    } catch {
      if (!target.photo) return sendPage(request, response, 503);
      response.statusCode = 503;
      return response.end();
    }
    if (!profile) {
      if (!target.photo) return sendPage(request, response, 404);
      response.statusCode = 404;
      return response.end();
    }
    const cover = profileCover(profile);
    if (!target.photo) return sendPage(request, response, 200, profile, cover);
    let jpeg;
    try {
      if (cover) {
        const signal = AbortSignal.timeout(4000);
        const post = await publicLookup('dopmi_adoption_detail', { post_id: cover.id }, headers, fetchFrom, signal);
        if (post?.id === cover.id && post.owner_id === profile.id && post.status === 'published') {
          jpeg = await previewPhoto(coverOf(post, profile.id), headers, fetchFrom, signal);
        }
      }
    } catch {
      // A withdrawn, denied or unreadable photo falls back to the public brand image.
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

export default createProfileShareHandler();
