export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/test") {
      return Response.json({
        d1: !!env.DB,
        r2: !!env.PHOTOS
      });
    }

    return env.ASSETS.fetch(request);
  }
};
