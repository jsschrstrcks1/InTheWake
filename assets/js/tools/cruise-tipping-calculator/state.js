// assets/js/tools/cruise-tipping-calculator/state.js
const DEFAULTS = {
  line: "royal-caribbean",
  cabinTier: "standard",
  sailingDate: "",
  nights: 7,
  adults: 2,
  children: 0,
  childAges: [],
  barTab: 0, barPrepaid: false,
  specialtyCost: 0, specialtyMeals: 0,
  spaTotal: 0,
  roomServiceCount: 0, roomServiceAvg: 0,
  cashExtras: {}
};

export function createState(initial) {
  let value = { ...DEFAULTS, ...(initial || {}) };
  const subs = new Set();
  return {
    get: () => value,
    update: (patch) => { value = { ...value, ...patch }; subs.forEach(fn => fn(value)); },
    subscribe: (fn) => { subs.add(fn); return () => subs.delete(fn); }
  };
}
