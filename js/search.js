
/* search.js — line-specific fuzzy search with aliases (no external deps) */
function dlDistance(a, b) {
  a = a.toLowerCase(); b = b.toLowerCase();
  const m = [];
  for (let i=0; i<=a.length; i++){ m[i]=[i]; }
  for (let j=0; j<=b.length; j++){ m[0][j]=j; }
  for (let i=1; i<=a.length; i++){
    for (let j=1; j<=b.length; j++){
      const cost = a[i-1] === b[j-1] ? 0 : 1;
      m[i][j] = Math.min(m[i-1][j] + 1, m[i][j-1] + 1, m[i-1][j-1] + cost);
      if (i>1 && j>1 && a[i-1]===b[j-2] && a[i-2]===b[j-1]){
        m[i][j] = Math.min(m[i][j], m[i-2][j-2] + 1);
      }
    }
  }
  return m[a.length][b.length];
}
function normalize(s){ return (s||"").toLowerCase().replace(/[^a-z0-9\s\-]/g,'').trim(); }
function scoreQuery(name, q){
  name = normalize(name); q = normalize(q);
  if (!q) return 0;
  if (name.includes(q)) return 1;
  const d = dlDistance(name, q);
  const maxLen = Math.max(name.length, q.length);
  return 1 - (d / (maxLen || 1));
}
function setupShipSearch(dataset){
  const input = document.getElementById('shipSearch');
  const btn = document.getElementById('btnSearch');
  const out = document.getElementById('searchResults');
  function renderResults(results){
    out.innerHTML = results.slice(0, 24).map(r => `
      <div class="card">
        <h3><a href="../ships/${r.url}">${r.name}</a></h3>
        <p class="small">Match: ${(r._score*100|0)}%</p>
      </div>`).join('') || '<p class="small">No results yet. Try a different spelling.</p>';
  }
  function run(){
    const q = input.value || '';
    const scored = dataset.map(item => {
      const names = [item.name].concat(item.aliases||[]);
      let s = 0;
      for (const n of names){
        s = Math.max(s, scoreQuery(n, q));
      }
      return Object.assign({_score:s}, item);
    }).filter(x => x._score > 0.35)
      .sort((a,b)=> b._score - a._score || a.name.localeCompare(b.name));
    renderResults(scored);
  }
  input.addEventListener('input', run);
  btn.addEventListener('click', run);
}
