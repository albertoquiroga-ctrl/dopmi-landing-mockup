const site = 'https://www.dopmi.org';
const appStore = 'https://apps.apple.com/mx/app/dopmi/id6468691532';
const playStore = 'https://play.google.com/store/apps/details?id=com.mycompany.dopmi';
const variants = new Set(['personal-a', 'personal-b', 'pagina-a', 'pagina-b']);

function device(headers) {
  const agent = headers['user-agent'] ?? '';
  const platform = headers['sec-ch-ua-platform'] ?? '';
  const purpose = `${headers.purpose ?? ''} ${headers['sec-purpose'] ?? ''}`;
  if (/facebookexternalhit|facebookcatalog|facebot|meta-external|bot\b|crawler|spider/i.test(agent) || /prefetch|prerender/i.test(purpose)) {
    return null;
  }

  const android = /\bAndroid\b/i.test(agent) || /^"?Android"?$/i.test(platform);
  const apple = /\b(iPhone|iPad|iPod)\b/i.test(agent) || /^"?iOS"?$/i.test(platform);
  if (android === apple) return null;
  return android ? 'android' : 'ios';
}

function variantFrom(request) {
  const url = new URL(request.url, site);
  // Prefer the public path if the runtime preserves it through the rewrite.
  const candidate = url.pathname === '/api/descargar'
    ? request.query?.variant ?? url.searchParams.get('variant')
    : url.pathname.match(/^\/descargar\/([^/]+)\/?$/)?.[1];
  return variants.has(candidate) ? candidate : null;
}

function playStoreFor(variant) {
  if (!variant) return playStore;
  const store = new URL(playStore);
  store.searchParams.set('referrer', new URLSearchParams({
    utm_source: 'facebook',
    utm_medium: 'organic_comment',
    utm_campaign: `dopmi_rescatistas_mty_${variant}`,
    utm_content: variant,
  }).toString());
  return store.href;
}

function downloadPage(google, variant) {
  const pageUrl = `${site}/descargar${variant ? `/${variant}` : ''}`;
  const description = 'Descarga DopMi para publicar mascotas en adopción.';
  return `<!doctype html>
<html lang="es-MX">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Descarga DopMi</title>
  <meta name="description" content="${description}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Descarga DopMi">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${site}/images/hero-dog.jpg">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 1rem; color: #161616; background: #fff8e9; font: 1rem/1.5 system-ui, sans-serif; }
    main { width: min(100%, 27rem); padding: 2rem; border: 1px solid #eadfc9; border-radius: 1.5rem; background: white; }
    h1 { margin: 0; font-size: clamp(1.6rem, 6vw, 2rem); }
    p { margin: .5rem 0 1.25rem; color: #505050; }
    nav { display: grid; gap: .75rem; }
    a { display: block; padding: .75rem 1rem; border: 1px solid #161616; border-radius: .8rem; color: #161616; background: #f6c94a; text-decoration: none; font-weight: 650; }
    a:focus-visible { outline: 3px solid #5b3fff; outline-offset: 3px; }
  </style>
</head>
<body>
  <main>
    <h1>Descarga DopMi</h1>
    <p>Elige la tienda de tu celular.</p>
    <nav aria-label="Tiendas de aplicaciones">
      <a href="${google.replaceAll('&', '&amp;')}">Google Play para Android</a>
      <a href="${appStore}">App Store para iPhone y iPad</a>
    </nav>
  </main>
</body>
</html>`;
}

export default function handler(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Vary', 'User-Agent, Sec-CH-UA-Platform, Purpose, Sec-Purpose');
  response.setHeader('Referrer-Policy', 'no-referrer');

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    response.statusCode = 405;
    return response.end();
  }

  const variant = variantFrom(request);
  const google = playStoreFor(variant);
  const platform = device(request.headers);
  if (platform) {
    response.setHeader('Location', platform === 'android' ? google : appStore);
    response.statusCode = 302;
    return response.end();
  }

  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'");
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.statusCode = 200;
  return response.end(request.method === 'HEAD' ? undefined : downloadPage(google, variant));
}
