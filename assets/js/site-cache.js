<!-- put this near the bottom, before any pre-warm calls -->
<script>
/* SiteCache (v1)
   - JSON cache with weekly TTL + optional version invalidation
   - Stored in localStorage per-origin (client-side only)
*/
(function(){
  function k(u){ return 'sc::' + u; }
  function now(){ return Date.now(); }
  function get(obj, path){
    try { return (path||[]).reduce((a,k)=> (a && a[k]!=null ? a[k] : undefined), obj); } catch { return undefined; }
  }
  async function fetchJSON(url){ const r=await fetch(url,{cache:'no-store'}); if(!r.ok) throw new Error(r.status); return r.json(); }

  window.SiteCache = {
    async getJSON(url, {ttlDays=7, versionPath=null} = {}){
      const key = k(url);
      const ttl = ttlDays*24*60*60*1000;
      try{
        const raw = localStorage.getItem(key);
        if (raw){
          const rec = JSON.parse(raw);
          if (rec && rec.expires > now()){
            return rec.data;
          }
        }
      }catch{}
      // (re)fetch
      const data = await fetchJSON(url);
      let version = versionPath ? get(data, versionPath) : null;
      const rec = { data, expires: now()+ttl, version };
      try{ localStorage.setItem(key, JSON.stringify(rec)); }catch{}
      return data;
    },
    // optional: manual bust if you know a new version string
    bust(url){ try{ localStorage.removeItem(k(url)); }catch{} }
  };
})();
</script>
