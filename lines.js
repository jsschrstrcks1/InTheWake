/* eslint-disable */
window.ITW_LINES = {
  groups: [
    {
      id: "carnival-corp", name: "Carnival Corporation & plc", order: 1,
      brands: [
        { id:"carnival", name:"Carnival Cruise Line", url:"brand.html?brand=carnival" },
        { id:"princess", name:"Princess Cruises", url:"brand.html?brand=princess" },
        { id:"pando", name:"P&O Cruises (UK)", url:"brand.html?brand=pando" },
        { id:"aida", name:"AIDA Cruises", url:"brand.html?brand=aida" },
        { id:"hal", name:"Holland America Line", url:"brand.html?brand=hal" },
        { id:"costa", name:"Costa Cruises", url:"brand.html?brand=costa" },
        { id:"cunard", name:"Cunard Line", url:"brand.html?brand=cunard" },
        { id:"seabourn", name:"Seabourn", url:"brand.html?brand=seabourn" }
      ]
    },
    {
      id: "royal-caribbean-group", name: "Royal Caribbean Group", order: 2,
      brands: [
        { id:"royal", name:"Royal Caribbean International", url:"brand.html?brand=royal" },
        { id:"celebrity", name:"Celebrity Cruises", url:"brand.html?brand=celebrity" },
        { id:"silversea", name:"Silversea", url:"brand.html?brand=silversea" }
      ]
    },
    {
      id: "nclh", name: "Norwegian Cruise Line Holdings", order: 3,
      brands: [
        { id:"ncl", name:"Norwegian Cruise Line", url:"brand.html?brand=ncl" },
        { id:"oceania", name:"Oceania Cruises", url:"brand.html?brand=oceania" },
        { id:"regent", name:"Regent Seven Seas", url:"brand.html?brand=regent" }
      ]
    },
    { id:"msc", name:"MSC Cruises", order: 4, brands: [ { id:"msc", name:"MSC Cruises", url:"brand.html?brand=msc" }, { id:"explora", name:"Explora Journeys", url:"brand.html?brand=explora" } ] },
    { id:"viking", name:"Viking", order: 5, brands: [ { id:"viking", name:"Viking", url:"brand.html?brand=viking" } ] },
    { id:"disney", name:"Disney Cruise Line", order: 6, brands: [ { id:"disney", name:"Disney Cruise Line", url:"brand.html?brand=disney" } ] },
    { id:"tui", name:"TUI Cruises", order: 7, brands: [ { id:"tui", name:"TUI Cruises", url:"brand.html?brand=tui" } ] },
    /* Long‑tail & independents */
    { id:"azamara", name:"Azamara", order: 8, brands: [ { id:"azamara", name:"Azamara", url:"brand.html?brand=azamara" } ] },
    { id:"windstar", name:"Windstar Cruises", order: 9, brands:[{id:"windstar",name:"Windstar",url:"brand.html?brand=windstar"}]},
    { id:"star-clippers", name:"Star Clippers", order: 10, brands:[{id:"starclippers",name:"Star Clippers",url:"brand.html?brand=starclippers"}]},
    { id:"paul-gauguin", name:"Paul Gauguin Cruises", order: 11, brands:[{id:"paulgauguin",name:"Paul Gauguin",url:"brand.html?brand=paulgauguin"}]},
    { id:"ponant", name:"Ponant", order: 12, brands:[{id:"ponant",name:"Ponant",url:"brand.html?brand=ponant"}]},
    { id:"scenic", name:"Scenic", order: 13, brands:[{id:"scenic",name:"Scenic",url:"brand.html?brand=scenic"},{id:"emerald",name:"Emerald Cruises",url:"brand.html?brand=emerald"}]},
    { id:"virgin", name:"Virgin Voyages", order: 14, brands:[{id:"virgin",name:"Virgin Voyages",url:"brand.html?brand=virgin"}]},
    { id:"celestyal", name:"Celestyal Cruises", order: 15, brands:[{id:"celestyal",name:"Celestyal",url:"brand.html?brand=celestyal"}]},
    { id:"hurtigruten", name:"Hurtigruten / HX", order: 16, brands:[{id:"hurtigruten",name:"Hurtigruten",url:"brand.html?brand=hurtigruten"},{id:"hx",name:"HX (Expeditions)",url:"brand.html?brand=hx"}]},
    { id:"natgeo", name:"National Geographic – Lindblad", order: 17, brands:[{id:"natgeo",name:"Nat Geo–Lindblad",url:"brand.html?brand=natgeo"}]},
    { id:"quark", name:"Quark Expeditions", order: 18, brands:[{id:"quark",name:"Quark",url:"brand.html?brand=quark"}]},
    { id:"victory", name:"Victory Cruise Lines", order: 19, brands:[{id:"victory",name:"Victory",url:"brand.html?brand=victory"}]}
  ],

  /* Minimal examples for classes & ships — extend as you load all fleets */
  brands:{
    royal:{
      classes:[
        { id:"icon", name:"Icon Class", ships:[
          { id:"icon-of-the-seas", name:"Icon of the Seas", url:"icon-of-the-seas.html" },
          { id:"star-of-the-seas", name:"Star of the Seas", url:"#" }
        ]},
        { id:"oasis", name:"Oasis Class", ships:[
          { id:"utopia-of-the-seas", name:"Utopia of the Seas", url:"utopia-of-the-seas.html" },
          { id:"wonder-of-the-seas", name:"Wonder of the Seas", url:"wonder-of-the-seas.html" }
        ]}
      ],
      allShipsIndex:[
        { id:"grandeur-of-the-seas", name:"Grandeur of the Seas", class:"Vision", year:1996, url:"grandeur-of-the-seas.html" },
        { id:"enchantment-of-the-seas", name:"Enchantment of the Seas", class:"Vision", year:1997, url:"enchantment-of-the-seas.html" }
      ]
    },
    princess:{ classes:[{id:"sphere", name:"Sphere Class", ships:[{id:"sun-princess-2024",name:"Sun Princess",url:"#"},{id:"star-princess-2025",name:"Star Princess",url:"#"}]}], allShipsIndex:[] },
    celebrity:{ classes:[], allShipsIndex:[] },
    silversea:{ classes:[], allShipsIndex:[] },
    ncl:{ classes:[], allShipsIndex:[] },
    oceania:{ classes:[], allShipsIndex:[] },
    regent:{ classes:[], allShipsIndex:[] },
    msc:{ classes:[], allShipsIndex:[] },
    explora:{ classes:[], allShipsIndex:[] },
    viking:{ classes:[], allShipsIndex:[] },
    disney:{ classes:[], allShipsIndex:[] },
    tui:{ classes:[], allShipsIndex:[] },
    azamara:{ classes:[], allShipsIndex:[] },
    windstar:{ classes:[], allShipsIndex:[] },
    starclippers:{ classes:[], allShipsIndex:[] },
    paulgauguin:{ classes:[], allShipsIndex:[] },
    ponant:{ classes:[], allShipsIndex:[] },
    scenic:{ classes:[], allShipsIndex:[] },
    emerald:{ classes:[], allShipsIndex:[] },
    celestyal:{ classes:[], allShipsIndex:[] },
    hurtigruten:{ classes:[], allShipsIndex:[] },
    hx:{ classes:[], allShipsIndex:[] },
    natgeo:{ classes:[], allShipsIndex:[] },
    quark:{ classes:[], allShipsIndex:[] },
    victory:{ classes:[], allShipsIndex:[] }
  }
};
