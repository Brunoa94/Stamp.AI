/**
 * Serves objects of the R2 bucket bound as ASSETS, read-only: GET and HEAD of
 * /<key> return the object with its stored Content-Type and Cache-Control.
 * Conditional requests (If-None-Match) answer 304, so revalidations are cheap.
 */

const DEFAULT_CACHE_CONTROL = 'public, max-age=2592000';

function errorResponse(status, message) {
  return new Response(message, { status, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

const worker = {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return errorResponse(405, 'Method not allowed');
    }
    const key = decodeURIComponent(new URL(request.url).pathname.replace(/^\/+/, ''));
    if (!key) return errorResponse(404, 'Not found');

    const object = await env.ASSETS.get(key, { onlyIf: request.headers });
    if (object === null) return errorResponse(404, 'Not found');

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('ETag', object.httpEtag);
    if (!headers.has('Cache-Control')) headers.set('Cache-Control', DEFAULT_CACHE_CONTROL);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cross-Origin-Resource-Policy', 'cross-origin');
    headers.set('X-Content-Type-Options', 'nosniff');

    // onlyIf matched the stored ETag: the object has no body to send.
    if (!('body' in object)) return new Response(null, { status: 304, headers });
    return new Response(request.method === 'HEAD' ? null : object.body, { headers });
  },
};

export default worker;
