import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const q = body.q;
    if (!q) return Response.json({ error: 'Query required' }, { status: 400 });

    // Nominatim usage policy: identify the application, light usage.
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, { headers: { 'User-Agent': 'Amanah/1.0 (amanah.app)' } });
    if (!r.ok) return Response.json({ error: 'Geocoding failed' }, { status: 502 });
    const arr = await r.json();
    if (!arr.length) return Response.json({ error: 'No match found' }, { status: 404 });
    const a = arr[0];
    return Response.json({ lat: parseFloat(a.lat), lng: parseFloat(a.lon), display_name: a.display_name });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
