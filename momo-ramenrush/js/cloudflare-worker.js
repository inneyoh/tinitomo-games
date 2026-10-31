// TiniTomo Momo-ya temporary save transfer API
// Cloudflare Worker: bind a KV namespace with variable name SAVES.
// Set ALLOWED_ORIGIN as an environment variable if the game origin changes.
const ORIGIN = 'https://inneyoh.github.io';
const TTL = 1800;
const MAX_BYTES = 200000;
const CODE_RE = /^[A-F0-9]{16}$/;

function response(data, status=200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': ORIGIN,
      'Vary': 'Origin',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
function validSave(s) {
  return s && typeof s === 'object' && !Array.isArray(s) &&
    Number.isSafeInteger(s.day) && s.day >= 1 &&
    Number.isFinite(s.money) && s.money >= 0 &&
    s.stock && typeof s.stock === 'object' && !Array.isArray(s.stock) &&
    s.upgrades && typeof s.upgrades === 'object' && !Array.isArray(s.upgrades);
}
function code() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, b => b.toString(16).padStart(2,'0')).join('').toUpperCase();
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    if (origin && origin !== ORIGIN) return response({error:'Origin not allowed'},403);
    if (request.method === 'OPTIONS') {
      return new Response(null,{status:204,headers:{
        'Access-Control-Allow-Origin':ORIGIN,
        'Access-Control-Allow-Methods':'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers':'Content-Type',
        'Access-Control-Max-Age':'86400',
        'Vary':'Origin'
      }});
    }
    const url = new URL(request.url);
    if (url.pathname === '/health' && request.method === 'GET')
      return response({status:'ok',version:'2.0'});
    if (!env.SAVES) return response({error:'KV binding SAVES is missing'},503);
    try {
      if (url.pathname === '/save' && request.method === 'POST') {
        if (!origin || origin !== ORIGIN) return response({error:'Origin required'},403);
        if (Number(request.headers.get('Content-Length')) > MAX_BYTES)
          return response({error:'Save too large'},413);
        const raw = await request.text();
        if (new TextEncoder().encode(raw).length > MAX_BYTES)
          return response({error:'Save too large'},413);
        let body;
        try {body = JSON.parse(raw);} catch {return response({error:'Invalid JSON'},400);}
        if (!validSave(body?.save)) return response({error:'Invalid Momo-ya save'},400);
        const transferCode = code();
        await env.SAVES.put('momo:'+transferCode,JSON.stringify(body.save),{expirationTtl:TTL});
        return response({status:'ok',code:transferCode,expiresIn:TTL});
      }
      if (url.pathname === '/save' && request.method === 'GET') {
        const transferCode = (url.searchParams.get('code')||'').replace(/-/g,'').toUpperCase();
        if (!CODE_RE.test(transferCode)) return response({error:'Invalid code'},400);
        const raw = await env.SAVES.get('momo:'+transferCode);
        if (!raw) return response({error:'Transfer not found or expired'},404);
        let save;
        try {save=JSON.parse(raw);} catch {return response({error:'Stored save is invalid'},500);}
        if (!validSave(save)) return response({error:'Stored save is invalid'},500);
        return response({status:'ok',save});
      }
      return response({error:'Not found'},404);
    } catch (e) {
      console.error('Transfer API failure',e);
      return response({error:'Temporary server error'},500);
    }
  }
};
