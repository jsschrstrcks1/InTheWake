/* drink-worker.js — v3.014.0 (module worker) */

let computeFn = null;

// derive version query (?v=...) from worker URL so we import the same version of math
const v = new URLSearchParams(self.location.search).get('v') || '';
const mathURL = `/assets/js/drink-math.js${v ? `?v=${encodeURIComponent(v)}` : ''}`;

(async function init(){
  try {
    const mod = await import(mathURL);
    computeFn = mod.compute;
    self.postMessage({ type: 'ready' });
  } catch (err) {
    // If import fails, try to fall back to any global attached by math (unlikely here), otherwise stay silent.
    // eslint-disable-next-line no-undef
    if (self.ITW_MATH && typeof self.ITW_MATH.compute === 'function') {
      computeFn = self.ITW_MATH.compute;
      self.postMessage({ type: 'ready' });
    } else {
      // still post ready so UI can switch to inline path after a grace period
      self.postMessage({ type: 'ready' });
    }
  }
})();

self.onmessage = (e) => {
  const { type, payload } = e.data || {};
  if (type !== 'compute' || !payload) return;

  try {
    const { inputs, economics, dataset } = payload;
    const res = (typeof computeFn === 'function')
      ? computeFn(inputs, economics, dataset)
      : null;

    if (res) {
      self.postMessage({ type: 'result', payload: res });
    } else {
      // Degenerate fallback; return minimal zeroed structure so UI doesn't hang
      self.postMessage({ type: 'result', payload: {
        hasRange:false,
        bars:{ alc:{min:0,mean:0,max:0}, soda:{min:0,mean:0,max:0}, refresh:{min:0,mean:0,max:0}, deluxe:{min:0,mean:0,max:0} },
        winnerKey:'alc',
        perDay:0, trip:0, groupRows:[],
        included:{soda:0,refresh:0,deluxe:0},
        overcap:0, deluxeRequired:false
      }});
    }
  } catch (err) {
    // On any unexpected error, return a safe zeroed payload so the main thread can keep going.
    self.postMessage({ type: 'result', payload: {
      hasRange:false,
      bars:{ alc:{min:0,mean:0,max:0}, soda:{min:0,mean:0,max:0}, refresh:{min:0,mean:0,max:0}, deluxe:{min:0,mean:0,max:0} },
      winnerKey:'alc',
      perDay:0, trip:0, groupRows:[],
      included:{soda:0,refresh:0,deluxe:0},
      overcap:0, deluxeRequired:false
    }});
  }
};
