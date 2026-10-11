export interface Env {
  ASSETS: Fetcher;
  BACKEND_URL?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. If an external backend is configured (e.g. Railway, Render, Fly.io, or VPS),
    // proxy API requests seamlessly to avoid CORS issues.
    if (url.pathname.startsWith('/api') && env.BACKEND_URL) {
      const backendBase = env.BACKEND_URL.replace(/\/+$/, '');
      const targetUrl = new URL(url.pathname + url.search, backendBase);

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('Host', targetUrl.host);

      try {
        const backendResponse = await fetch(targetUrl.toString(), {
          method: request.method,
          headers: requestHeaders,
          body: request.body,
          redirect: 'follow',
        });
        return backendResponse;
      } catch (err: any) {
        return new Response(
          JSON.stringify({
            error: 'Backend Gateway Error',
            message: err?.message || 'Failed to connect to upstream backend API.',
          }),
          {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    }

    // 2. Serve static assets with single-page-application (SPA) fallback
    return env.ASSETS.fetch(request);
  },
};
