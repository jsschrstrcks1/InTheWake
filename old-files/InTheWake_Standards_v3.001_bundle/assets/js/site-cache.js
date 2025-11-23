/* In the Wake — SiteCache (v3.001)
 * - JSON get with TTL + optional versionPath invalidation
 * - Uses localStorage for metadata + body storage
 */
(function(global){
  const store = {
    get k(){ return 'itw-cache-meta'; },
    read(){ try{ return JSON.parse(localStorage.getItem(this.k)||'{' + '}' ); }catch(_){ return {}; } },
    write(obj){ try{ localStorage.setItem(this.k, JSON.stringify(obj)); }catch(_){ } }
  };
  function now(){ return Date.now(); }
  function getAt(obj, path){
    try{
      return (Array.isArray(path) ? path : String(path||'').split('.'))
        .reduce((acc, k)=> (acc && acc[k]!=null ? acc[k] : undefined), obj);
    }catch(_){ return undefined; }
  }
  async function fetchJSON(url){
    const r = await fetch(url, { cache: 'no-store', credentials:'omit' });
    if(!r.ok) throw new Error('Fetch failed: '+r.status);
    const data = await r.clone().json();
    return { data, response: r };
  }
  const SiteCache = {
    async getJSON(url, opts){
      opts = opts || {};
      const ttlMs = Math.max(0,(opts.ttlDays||0))*24*60*60*1000;
      const versionPath = opts.versionPath || null;
      const meta = store.read();
      const m = meta[url];
      const expired = !m || (ttlMs && (now() - (m.storedAt||0) > ttlMs));
      if (!expired){
        try{
          const text = localStorage.getItem('itw-json:'+url);
          if (text){
            return JSON.parse(text);
          }
        }catch(_){}
      }
      const { data } = await fetchJSON(url);
      const ver = versionPath ? getAt(data, versionPath) : undefined;
      meta[url] = { storedAt: now(), ver: ver };
      store.write(meta);
      try{
        localStorage.setItem('itw-json:'+url, JSON.stringify(data));
      }catch(_){}
      return data;
    }
  };
  global.SiteCache = global.SiteCache || SiteCache;
})(window);
