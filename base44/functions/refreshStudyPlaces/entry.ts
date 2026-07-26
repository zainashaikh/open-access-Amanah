import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// DMV bounding box (south,west,north,east)
const BBOX = '38.3,-77.8,39.5,-76.0';
const OVERPASS = 'https://overpass-api.de/api/interpreter';

function haversineMeters(a, b) {
  const R = 6371000;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLng = (b.lng - a.lng) * Math.PI / 180;
  const la1 = a.lat * Math.PI / 180, la2 = b.lat * Math.PI / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function norm(t) { return (t == null ? '' : String(t)).trim(); }

async function overpass(query) {
  const r = await fetch(OVERPASS, {
    method: 'POST',
    body: 'data=' + encodeURIComponent(query),
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  if (!r.ok) throw new Error('Overpass HTTP ' + r.status);
  return r.json();
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const placesQuery = `[out:json][timeout:60];
(
  node["amenity"="restaurant"](${BBOX})(if:t["cuisine"]~"[Hh]alal");
  way["amenity"="restaurant"](${BBOX})(if:t["cuisine"]~"[Hh]alal");
  node["amenity"="cafe"](${BBOX})(if:t["cuisine"]~"[Hh]alal");
  way["amenity"="cafe"](${BBOX})(if:t["cuisine"]~"[Hh]alal");
  node["diet:halal"="yes"](${BBOX});
  way["diet:halal"="yes"](${BBOX});
);
out center tags;`;
    const json = await overpass(placesQuery);
    const elems = json?.elements || [];

    let mosques = [];
    try {
      const m = await overpass(`[out:json][timeout:25];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](${BBOX});
  way["amenity"="place_of_worship"]["religion"="muslim"](${BBOX});
);
out center;`);
      mosques = (m?.elements || []).map(e => ({ lat: e.lat ?? e.center?.lat, lng: e.lon ?? e.center?.lng })).filter(x => x.lat != null);
    } catch { /* ignore */ }

    const existing = await base44.asServiceRole.entities.StudyPlace.filter({});
    const byOsm = {};
    for (const e of existing) if (e.osm_id) byOsm[e.osm_id] = e;

    const seen = new Set();
    let added = 0, updated = 0;
    for (const el of elems) {
      const t = el.tags || {};
      const name = norm(t.name);
      if (!name) continue;
      const lat = el.lat ?? el.center?.lat;
      const lng = el.lon ?? el.center?.lng;
      if (lat == null || lng == null) continue;
      const osmId = `${el.type}/${el.id}`;
      if (seen.has(osmId)) continue;
      seen.add(osmId);

      const amenity = norm(t.amenity) || 'restaurant';
      const cuisine = norm(t.cuisine).toLowerCase();
      const dietHalal = norm(t['diet:halal']).toLowerCase();
      let halalStatus = 'unknown', halalNote = '';
      if (dietHalal === 'yes' || cuisine.includes('halal')) {
        halalStatus = 'verified';
        halalNote = 'Tagged halal on OpenStreetMap (diet:halal=yes or cuisine=halal). Verify with the venue.';
      } else if (['middle_eastern', 'mediterranean', 'turkish', 'lebanese', 'pakistan', 'pakistani', 'afghan', 'afghani', 'egyptian', 'moroccan'].some(c => cuisine.includes(c))) {
        halalStatus = 'halal_friendly';
        halalNote = 'Cuisine commonly offers halal options — confirm with the venue.';
      }

      const addrParts = [norm(t['addr:housenumber']), norm(t['addr:street'])].filter(Boolean);
      const address = addrParts.length ? addrParts.join(' ') : norm(t['addr:full']);
      const city = norm(t['addr:city']);
      const state = norm(t['addr:state']);
      const website = norm(t.website || t['contact:website'] || t.url || t['contact:facebook']);
      const sourceUrl = `https://www.openstreetmap.org/${el.type}/${el.id}`;
      const openHours = norm(t.opening_hours);
      const wifi = ['yes', 'wlan'].includes(norm(t.wifi || t['internet_access']).toLowerCase());
      let mosqueAdjacent = false;
      for (const ms of mosques) {
        if (haversineMeters({ lat, lng }, ms) <= 600) { mosqueAdjacent = true; break; }
      }

      const record = {
        name,
        place_type: amenity === 'cafe' ? 'cafe' : 'restaurant',
        address, city, state, lat, lng,
        website: website || null,
        source_url: sourceUrl,
        halal_status: halalStatus,
        halal_note: halalNote,
        study_note: amenity === 'cafe' ? 'Cafe — often suitable for studying.' : 'Restaurant — seating for studying may be limited.',
        quiet: false,
        wifi,
        late_night: false,
        family_safe: false,
        women_safe: false,
        mosque_adjacent: mosqueAdjacent,
        open_hours: openHours,
        osm_id: osmId,
        source: 'osm',
        status: 'active',
      };

      if (byOsm[osmId]) {
        await base44.asServiceRole.entities.StudyPlace.update(byOsm[osmId].id, record);
        updated++;
      } else {
        await base44.asServiceRole.entities.StudyPlace.create(record);
        added++;
      }
    }
    return Response.json({ ok: true, added, updated, total: elems.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
