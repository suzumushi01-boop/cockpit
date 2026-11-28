// Cockpit Nav 航空機データ中継（Cloudflare Workers）
// adsb.lol / airplanes.live の公開航空機位置を、ブラウザのアプリに渡す（10秒キャッシュ）
// /delay で鉄道の遅延情報も中継する
const ORIGIN = '*';
export default {
  async fetch(req, env, ctx) {
    const cors = { 'Access-Control-Allow-Origin': ORIGIN, 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Vary': 'Origin' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const u = new URL(req.url);
    // 鉄道の遅延情報（鉄道com の情報をまとめた公開JSON）を中継（60秒キャッシュ）
    if (u.pathname === '/delay') {
      const key = new Request('https://cache.local/delay');
      const cache = caches.default;
      let res = await cache.match(key);
      if (!res) {
        try {
          const r = await fetch('https://tetsudo.rti-giken.jp/free/delay.json', { headers: { 'User-Agent': 'cockpit-nav-relay' } });
          if (!r.ok) throw new Error('upstream ' + r.status);
          res = new Response(await r.text(), { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=60' } });
          ctx.waitUntil(cache.put(key, res.clone()));
        } catch (e) {
          return new Response(JSON.stringify({ error: 'upstream' }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
        }
      }
      const out = new Response(res.body, res);
      for (const [k, v] of Object.entries(cors)) out.headers.set(k, v);
      return out;
    }
    const lat = Number(u.searchParams.get('lat')), lon = Number(u.searchParams.get('lon'));
    const nm = Math.min(50, Math.max(5, Number(u.searchParams.get('nm')) || 25));
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return new Response('lat と lon を指定してください', { status: 400, headers: cors });
    }
    const la = lat.toFixed(2), lo = lon.toFixed(2);
    const key = new Request(`https://cache.local/ac/${la}/${lo}/${nm}`);
    const cache = caches.default;
    let res = await cache.match(key);
    if (!res) {
      const srcs = [`https://api.adsb.lol/v2/point/${la}/${lo}/${nm}`, `https://api.airplanes.live/v2/point/${la}/${lo}/${nm}`];
      for (const s of srcs) {
        try {
          const r = await fetch(s, { headers: { 'User-Agent': 'cockpit-nav-relay' } });
          if (!r.ok) continue;
          const j = await r.json();
          res = new Response(JSON.stringify({ src: new URL(s).host, ac: j.ac || [] }), {
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'max-age=10' },
          });
          ctx.waitUntil(cache.put(key, res.clone()));
          break;
        } catch (e) { /* 次の取得先へ */ }
      }
      if (!res) return new Response(JSON.stringify({ error: 'upstream' }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    }
    const out = new Response(res.body, res);
    for (const [k, v] of Object.entries(cors)) out.headers.set(k, v);
    return out;
  },
};
