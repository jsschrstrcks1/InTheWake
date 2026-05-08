// assets/js/tools/cruise-tipping-calculator/persist.js
const STORAGE_KEY = "ctc_v1";

export function encodeHash(state) {
  return "#" + btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function decodeHash(hash) {
  if (!hash || hash === "#") return null;
  try {
    return JSON.parse(decodeURIComponent(escape(atob(hash.slice(1)))));
  } catch {
    return null;
  }
}

export function loadFromStorage() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
  catch { return null; }
}

export function saveToStorage(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function clearStorage() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function attachPersistence(state) {
  const fromHash = (typeof location !== "undefined") ? decodeHash(location.hash) : null;
  const fromStorage = loadFromStorage();
  if (fromHash)         state.update(fromHash);
  else if (fromStorage) state.update(fromStorage);

  state.subscribe((value) => {
    saveToStorage(value);
    if (typeof history !== "undefined") {
      history.replaceState(null, "", encodeHash(value));
    }
  });
}
