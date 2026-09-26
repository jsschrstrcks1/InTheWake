/* In the Wake — Voyage Companion PWA · shared engine.
   One shell for every voyage pack. The per-voyage HTML supplies window.__VOYAGE
   (meta + locations + day-by-day itinerary + route); this file builds the whole
   UI from it and runs the live weather / radar / alerts / map logic.
   Live APIs (Open-Meteo, RainViewer, NOAA/NWS) are read-only and never cached.
   Soli Deo Gloria. */
(function(){
var V = window.__VOYAGE || {};
var LOCS = V.locs || [], ITIN = V.itin || [], ROUTE = V.route || [];
var wxCur={},map=null,layers=[],markers=[],frames=[],fi=0,anim=null,mode="past",rv=null,tab="overview",rvLoaded=0,lastShown=-1;
var WMO={0:"Clear",1:"Mostly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Rime fog",51:"Light drizzle",53:"Drizzle",55:"Heavy drizzle",56:"Freezing drizzle",57:"Freezing drizzle",61:"Light rain",63:"Rain",65:"Heavy rain",66:"Freezing rain",67:"Freezing rain",71:"Light snow",73:"Snow",75:"Heavy snow",77:"Snow grains",80:"Rain showers",81:"Rain showers",82:"Violent showers",85:"Snow showers",86:"Snow showers",95:"Thunderstorm",96:"Thunderstorm",99:"Thunderstorm"};

function esc(s){return String(s==null?"":s).replace(/[&<>]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;"}[c];});}
function attr(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c];});}

// ---- Build the shell UI from the per-voyage data ------------------------------
function buildShell(){
  var app=document.getElementById("app");
  if(!app)return;
  app.innerHTML=
   '<header class="wbar" role="banner">'
   +'<span class="brand">◢ IN THE WAKE</span><span class="brand-sub">// '+esc(V.brandSub||"")+(V.dateRange?' · '+esc(V.dateRange):'')+'</span>'
   +'<div class="fsz" role="group" aria-label="Text size"><button type="button" data-fs="0.9" aria-label="Smaller text" aria-pressed="false">A</button><button type="button" data-fs="1" aria-label="Standard text size" aria-pressed="true">A</button><button type="button" data-fs="1.3" aria-label="Larger text" aria-pressed="false">A</button></div>'
   +'<select id="wloc" aria-label="Choose a tracked location"></select>'
   +'<button id="wx-unit" class="unitbtn" type="button" aria-label="Toggle temperature units between Fahrenheit and Celsius">°F</button>'
   +(PACK_INDEX?'<div class="pk-searchbox" role="search"><label class="sr-only" for="pk-q">Search this voyage pack</label><input id="pk-q" type="search" placeholder="Search the pack" autocomplete="off" enterkeyhint="search"></div>':'')
   +'</header>'
   +'<div class="dgr" id="dgr" role="alert" aria-live="assertive" aria-atomic="true"></div>'
   +'<nav class="wtabs" role="tablist" aria-label="Voyage views">'
   +'<button class="wtab on" data-t="overview" role="tab" aria-selected="true" type="button">Overview</button>'
   +'<button class="wtab" data-t="voyage" role="tab" aria-selected="false" type="button">Voyage</button>'
   +(TPL_SHIP?'<button class="wtab" data-t="ship" role="tab" aria-selected="false" type="button">Ship</button>':'')
   +(TPL_PORTS?'<button class="wtab" data-t="ports" role="tab" aria-selected="false" type="button">Ports</button>':'')
   +'<button class="wtab" data-t="weather" role="tab" aria-selected="false" type="button">Weather</button>'
   +(V.emergency?'<button class="wtab" data-t="emg" role="tab" aria-selected="false" type="button">Emergency</button>':'')
   +'<button class="wtab" data-t="journal" role="tab" aria-selected="false" type="button">Journal</button>'
   +(V.faq&&V.faq.length?'<button class="wtab" data-t="faq" role="tab" aria-selected="false" type="button">FAQ</button>':'')
   +'<button class="wtab wtab-al" data-t="alerts" role="tab" aria-selected="false" type="button"><span class="al-mark" aria-hidden="true"></span>Alerts<span class="sr-only al-sr"></span></button>'
   +'</nav>'
   +'<nav class="wtabs wsubtabs" id="wsubtabs" role="tablist" aria-label="Weather views" hidden>'
   +'<button class="wtab wsub" data-t="now" role="tab" aria-selected="false" type="button">Now</button>'
   +'<button class="wtab wsub" data-t="ten" role="tab" aria-selected="false" type="button">Forecast</button>'
   +'<button class="wtab wsub" data-t="radar" role="tab" aria-selected="false" type="button">Radar</button>'
   +'<button class="wtab wsub" data-t="averages" role="tab" aria-selected="false" type="button">Averages</button>'
   +'</nav>'
   +'<main id="content">'
   +'<div class="wpane on" id="pane-overview"><span class="muted">loading…</span></div>'
   +'<div class="wpane" id="pane-voyage">'
     +'<div class="voyhdr">'
       +'<span class="vt" id="voy-status">'+esc(V.statusInit||(V.ship||"")+" · "+(V.dateRange||""))+'</span>'
       +(V.trackUrl?'<a class="voy-track" href="'+attr(V.trackUrl)+'" target="_blank" rel="noopener noreferrer">'+esc(V.trackLabel||"◢ Track live ↗")+'<span class="sr-only"> (opens in a new window)</span></a>':'')
     +'</div>'
     +'<p class="voy-tip">▸ Tap a day to open it. Tap it again to close it.</p><div id="voy-list"><span class="muted">loading voyage…</span></div>'
     +'<p class="voy-note">'+esc(V.note||"")+'</p>'
   +'</div>'
   +(TPL_SHIP?'<div class="wpane pk-pane" id="pane-ship"></div>':'')
   +(TPL_PORTS?'<div class="wpane pk-pane" id="pane-ports"></div>':'')
   +(PACK_INDEX?'<div class="wpane" id="pane-search"><p class="pk-count" id="pk-count" role="status" aria-live="polite"></p><ol class="pk-results" id="pk-results"></ol></div>':'')
   +'<div class="wpane" id="pane-averages"><span class="muted">loading averages…</span></div>'
   +'<div class="wpane" id="pane-now"><span class="muted">loading…</span></div>'
   +'<div class="wpane" id="pane-10day"><span class="muted">loading 10-day forecast…</span></div>'
   +'<div class="wpane" id="pane-map"><div id="map" role="img" aria-label="Precipitation radar map of the tracked locations"></div><div class="maprow"><button class="mapbtn" id="mr-play" type="button">⏸ PAUSE</button><button class="mapbtn" id="mr-fit" type="button">⊡ FIT ALL</button><span class="frame-t" id="mr-time"></span><span class="frame-t" id="mr-mode"></span></div></div>'
   +'<div class="wpane" id="pane-faq"></div>'
   +'<div class="wpane" id="pane-journal"><span class="muted">loading your journal…</span></div>'
   +'<div class="wpane" id="pane-alerts">'
     +'<p class="al-intro">Everything that could affect this sailing, in one place. <b class="al-k al-k-red">Red</b> means serious. <b class="al-k al-k-yel">Yellow</b> means take care. Each item quotes its source and links to it.</p>'
     +'<section class="al-sec" aria-labelledby="al-h-wx"><h2 id="al-h-wx">Weather warnings</h2><div id="al-wx"><span class="muted">loading…</span></div></section>'
     +'<section class="al-sec" aria-labelledby="al-h-ship"><h2 id="al-h-ship">Ship health</h2><div id="al-ship"><span class="muted">loading…</span></div></section>'
     +'<section class="al-sec" aria-labelledby="al-h-ports"><h2 id="al-h-ports">Government travel advisories for your ports</h2><div id="al-ports"><span class="muted">loading…</span></div></section>'
     +'<p class="al-stamp" id="al-stamp"></p>'
   +'</div>'
   +(V.emergency?'<div class="wpane" id="pane-emg"><span class="muted">loading…</span></div>':'')
   +'</main>'
   +'<div id="a11y-status" role="status" aria-live="polite" class="sr-only"></div>'
   +'<footer class="wfoot" role="contentinfo"><div class="disc">'+esc(V.footerDisc||"Planning aid only — forecasts and radar can and do change; always confirm conditions locally. No tracking, no ads, not a financial product.")+'</div><p class="tip">If this companion helped your trip, you can <a href="https://buymeacoffee.com/inthewake" target="_blank" rel="noopener">leave Ken a tip</a>.</p></footer>'
   +'<div class="sdg">Soli Deo Gloria</div>';
}

function vT(f){return uTemp()==="celsius"?Math.round((f-32)*5/9):Math.round(f);}
function todayISO(){var d=new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);}
function voyDate(iso){var dt=new Date(iso+"T12:00"),mo=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][dt.getMonth()],wd=["SUN","MON","TUE","WED","THU","FRI","SAT"][dt.getDay()];return wd+" "+mo+" "+dt.getDate();}
function voyStatus(){var s=voyStatusBase();return s+(V.datesApprox?" ~Dates estimated — cruise documents are authoritative.":"");}
function voyStatusBase(){var t=todayISO(),first=ITIN[0].date,last=ITIN[ITIN.length-1].date,i,ship=V.ship||"This voyage";if(t<first){var days=Math.round((new Date(first+"T12:00")-new Date(t+"T12:00"))/86400000);return ship+" · departs "+(V.embarkPort||"port")+" in "+days+" day"+(days===1?"":"s")+(V.firstDateParen?" ("+V.firstDateParen+")":"")+".";}if(t>last)return ship+" · voyage complete. Soli Deo Gloria.";for(i=0;i<ITIN.length;i++){if(ITIN[i].date===t)return ship+" · Day "+ITIN[i].d+" — "+ITIN[i].loc+" (today).";}return ship+" · "+(V.dateRange||"")+".";}
function seasonLabel(){return V.seasonLabel||"Typical";}
function fetchVoyWx(s){var u="https://api.open-meteo.com/v1/forecast?latitude="+s.lat+"&longitude="+s.lon+"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit="+uTemp()+"&timezone=auto&start_date="+s.date+"&end_date="+s.date;retryJSON(u,1).then(function(j){if(!j||!j.daily||!j.daily.time||!j.daily.time.length)return;var d=j.daily,hi=d.temperature_2m_max[0],lo=d.temperature_2m_min[0];if(hi==null||lo==null)return;var el=document.getElementById("voy-wx-"+s.d);if(!el)return;var code=(d.weather_code&&d.weather_code[0]!=null)?(WMO[d.weather_code[0]]||""):"";var pp=(d.precipitation_probability_max&&d.precipitation_probability_max[0]!=null)?d.precipitation_probability_max[0]+"% rain":"";el.innerHTML=seasonLabel()+": "+vT(s.wx.hi)+"° / "+vT(s.wx.lo)+"° · "+esc(s.wx.txt)+'<br><span class="fc">Forecast '+voyDate(s.date)+": "+Math.round(hi)+"° / "+Math.round(lo)+"°"+(code?" · "+esc(code):"")+(pp?" · "+pp:"")+"</span>";});}
function renderOverview(){var el=document.getElementById("pane-overview");if(!el)return;var h='';
  h+='<p class="ov-lead">This is your offline travel companion for the sailing: the day-by-day itinerary, destination weather averages, and live forecasts as you get close, all in one place. <strong>Save it to your phone and it keeps working at sea and in port, even with no internet.</strong></p>';
  h+='<div class="ov-card ov-save"><b>📲 Save this app to your phone</b>'
    +'<p class="ov-step"><strong>iPhone / iPad (Safari):</strong> tap the <strong>Share</strong> button (the square with an up-arrow at the bottom), scroll down, then tap <strong>Add to Home Screen</strong>.</p>'
    +'<p class="ov-step"><strong>Android (Chrome):</strong> tap the <strong>⋮</strong> menu (top-right), then <strong>Add to Home screen</strong> (or <strong>Install app</strong>).</p>'
    +'<p class="ov-step">It opens full-screen like a real app and works offline once loaded, which is handy where the ship or port has no internet.</p></div>';
  if(V.shipPhoto&&V.shipPhoto.src)h+='<img class="ov-flyer ov-ship" src="'+attr(V.shipPhoto.src)+'" alt="'+attr(V.shipPhoto.alt||"")+'" decoding="async"'+(V.shipPhoto.w?' width="'+attr(V.shipPhoto.w)+'" height="'+attr(V.shipPhoto.h)+'"':'')+'><p class="ov-credit">Photo: '+esc(V.shipPhoto.credit||"")+', <a href="'+attr(V.shipPhoto.licenseUrl||"#")+'" target="_blank" rel="noopener noreferrer">'+esc(V.shipPhoto.license||"")+'</a>.</p>';
  if(V.flyer)h+='<img class="ov-flyer" src="'+attr(V.flyer)+'" alt="'+attr((V.ship||"This")+" hosted group cruise flyer")+'" loading="lazy" decoding="async">';
  h+='<div class="ov-card"><b>'+esc((V.ship||"Your voyage")+" · "+(V.dateRange||""))+'</b>';
  if(V.overview)h+='<p>'+esc(V.overview)+'</p>';
  if(V.host)h+='<p class="ov-host">Hosted by '+esc(V.host)+'</p>';
  if(V.trackUrl)h+='<a class="voy-track voy-track-ov" href="'+attr(V.trackUrl)+'" target="_blank" rel="noopener noreferrer">'+esc(V.trackLabel||"◢ Track live ↗")+'<span class="sr-only"> (opens in a new window)</span></a>';
  h+='</div>';
  function go(t,label){return '<button type="button" class="ov-go" data-go="'+attr(t)+'">'+esc(label)+'</button>';}
  h+='<div class="ov-card"><b>🧭 How to use this page</b>'
    +'<p class="ov-step"><strong>Internet</strong>, in this app, means a connection of any kind: cell data or Wi-Fi, including the ship\'s Wi-Fi. Anything that says it needs the internet waits until you have one.</p>'
    +'<p class="ov-step"><strong>Pick a place</strong> in the box at the top. Every weather view follows it. The <strong>°F</strong> button switches to °C, and the three <strong>A</strong> buttons make the text smaller or larger.</p>'
    +'<p class="ov-step">'+go("voyage","Voyage")+' is the day-by-day plan: tap a day to open it and see where the ship is, what to do there, and the time to be back aboard.</p>'
    +(TPL_SHIP?'<p class="ov-step">'+go("ship","Ship")+' is your guide to the ship: layout, cabins, dining, what to book ahead'+(PACK_VIDEOS.length?', plus videos of the ship that play right here when you have internet':'')+'.</p>':'')
    +(V.faq&&V.faq.length?'<p class="ov-step">'+go("faq","FAQ")+' answers the questions people ask once they\'re aboard: service, food, shows, kids, the casino, your phone, the doctor and more, each with its source.</p>':'')
    +(TPL_PORTS?'<p class="ov-step">'+go("ports","Ports")+' covers every port day: pier or tender, getting into town, what to do and what to skip.</p>':'')
    +'<p class="ov-step">'+go("weather","Weather")+' has four parts: <strong>Now</strong> (conditions right now), <strong>Forecast</strong> (the next 10 days), <strong>Radar</strong> (rain over the last two hours, on a map with your stops numbered) and <strong>Averages</strong> (what this time of year usually brings).</p>'
    +(V.emergency?'<p class="ov-step">'+go("emg","Emergency")+' holds the phone numbers and a card to share with someone at home.</p>':'')
    +'<p class="ov-step">'+go("journal","Journal")+' is a private place to write about each day. It stays on this phone: nobody else sees it, and it is never sent anywhere.</p>'
    +'<p class="ov-step">'+go("alerts","Alerts")+' is always the last tab. It turns <strong class="al-k-yel">yellow</strong> or <strong class="al-k-red">red</strong> when something needs your attention: official weather warnings, a CDC stomach-illness notice for this ship, and U.S., UK and Canadian government travel advice for the countries you visit.</p>'
    +(PACK_INDEX?'<p class="ov-step"><strong>Search</strong> (the box at the top) finds any word in the whole pack, even with no internet.</p>':'')
    +'<p class="ov-step">With no internet, Voyage, Averages'+(V.emergency?', Emergency':'')+(TPL_SHIP||TPL_PORTS?', Ship, Ports and Search':'')+' still work, and Alerts shows the last copy it saved. Now, Forecast and Radar come back when you have internet again.</p></div>';
  if(V.host)h+='<div class="ov-card"><b>🌊 Sailing solo?</b>'
    +'<p>These are hosted group cruises built for solo travelers: come solo, leave with friends.</p>'
    +'<a class="ov-link" href="https://maulsbytravel.com/hosted-group-cruises-for-solos/" target="_blank" rel="noopener noreferrer">See all hosted group cruises for solo travelers →</a></div>';
  // About the builder. Ken built this companion and the rest of In the Wake; a reader who wants to
  // know whose hands made the tool gets his bio and his own site. V.author can override per voyage.
  (function(){var A=V.author||{name:"Ken Baker",photo:"/admin/voyage-pwa/author-ken.webp",
    bio:"Ken built this companion and In the Wake. He is a pastor, a family historian, a sheep farmer at Manatee Creek, and a cruiser who got tired of guessing at what a package was worth. He builds these tools so the numbers are honest and the day is easy.",
    bioUrl:"/authors/ken-baker.html",site:"https://ken-baker.com"};
    h+='<div class="ov-card ov-author"><b>\u2693 About the builder</b>';
    if(A.photo)h+='<img class="ov-avatar" src="'+attr(A.photo)+'" alt="'+attr(A.name||"The builder")+'" width="64" height="64" loading="lazy" decoding="async">';
    if(A.name)h+='<p class="ov-aname">'+esc(A.name)+'</p>';
    if(A.bio)h+='<p>'+esc(A.bio)+'</p>';
    if(A.bioUrl)h+='<a class="ov-link" href="'+attr(A.bioUrl)+'" target="_blank" rel="noopener noreferrer">Read '+esc((A.name||"the builder").split(" ")[0])+'\u2019s bio on In the Wake \u2192</a>';
    if(A.site)h+='<a class="ov-link" href="'+attr(A.site)+'" target="_blank" rel="noopener noreferrer">'+esc(A.site.replace(/^https?:\/\//,""))+' \u2192</a>';
    h+='</div>';})();
  if(V.pdfFull||V.pdfCondensed){h+='<div class="ov-pdfs"><b>🖨 Printable versions</b>';
    if(V.pdfFull)h+='<a class="ov-pdf" href="'+attr(V.pdfFull)+'" target="_blank" rel="noopener noreferrer">Printable version of the full voyage pack (PDF)</a>';
    if(V.pdfCondensed)h+='<a class="ov-pdf" href="'+attr(V.pdfCondensed)+'" target="_blank" rel="noopener noreferrer">Printable short version (PDF)</a>';
    h+='</div>';}
  el.innerHTML=h;usagePdfLinks(el);
  el.querySelectorAll(".ov-go").forEach(function(b){b.addEventListener("click",function(){setTab(b.getAttribute("data-go"));var want=b.getAttribute("data-go"),n=[].filter.call(document.querySelectorAll(".wtab"),function(x){return x.getAttribute("data-t")===want;})[0];if(n)n.focus();});});}
function renderAverages(){var el=document.getElementById("pane-averages");if(!el)return;var h='<div class="fc-head">Destination weather averages · '+esc(V.seasonLabel||"typical")+'</div>';
  ITIN.forEach(function(s){h+='<div class="avg-row"><span class="avg-date">'+(V.datesApprox?"~":"")+voyDate(s.date)+'</span><span class="avg-loc">'+esc(s.loc)+'</span><span class="avg-temp">'+vT(s.wx.hi)+'° / <span class="lo">'+vT(s.wx.lo)+'°</span></span><span class="avg-txt">'+esc(s.wx.txt)+'</span></div>';});
  h+='<p class="voy-note">Typical seasonal averages for your dates — not a forecast. A real forecast appears on the Now and 10-Day tabs once a date falls within about 16 days. Tap °F / °C (top right) to switch units.</p>';
  el.innerHTML=h;}
function renderVoyage(){var el=document.getElementById("voy-list");if(!el)return;var st=document.getElementById("voy-status");if(st)st.textContent=voyStatus();var t=todayISO(),html="",anyToday=ITIN.some(function(s){return s.date===t;}),seaN=0,SH=V.shipHistory||[];ITIN.forEach(function(s,idx){var today=(s.date===t),open=today||(!anyToday&&idx===0),badge=s.type==="port"?'':(s.type==="scenic"?'<span class="dbadge b-scenic">Scenic</span>':'<span class="dbadge b-sea">Sea Day</span>');var shist=(s.type==="sea"&&SH.length)?SH[(seaN++)%SH.length]:"";html+='<details class="voy-row'+(today?" voy-today":"")+'" id="voy-'+s.d+'"'+(open?" open":"")+'><summary class="voy-sum"><span class="dnum">DAY '+s.d+" · "+(V.datesApprox?"~":"")+voyDate(s.date)+'</span><span class="dloc">'+esc(s.loc)+"</span>"+badge+(today?'<span class="dnow">Today</span>':"")+'</summary><div class="voy-body"><p class="voy-pos">◢ '+esc(s.pos)+'</p>'+(s.dock?'<p class="voy-dock">⚓ '+esc(s.dock)+'</p>':"")+'<p class="voy-wx" id="voy-wx-'+s.d+'">'+seasonLabel()+": "+vT(s.wx.hi)+"° / "+vT(s.wx.lo)+"° · "+esc(s.wx.txt)+'</p>'+(s.booked&&s.booked.length?'<div class="voy-booked"><b>◆ Booked</b><ul>'+s.booked.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ul></div>":"")+'<div class="voy-grid">';if(s.plan&&s.plan.length)html+='<div class="voy-sec"><b>'+esc(s.planLabel||"Ideas")+'</b><ul>'+s.plan.map(function(x){return /^depart\b/i.test(x)?'<li class="voy-depart"><b>'+esc(x)+'</b><span class="depart-note">Verify this time on your way off the ship. It is <strong>ship time</strong>, not local time.</span></li>':"<li>"+esc(x)+"</li>";}).join("")+"</ul></div>";if(shist)html+='<div class="voy-sec voy-shiphist"><b>About your ship</b><p>'+esc(shist)+"</p></div>";if(s.hist)html+='<div class="voy-sec"><b>History</b><p>'+esc(s.hist)+"</p></div>";if(s.poi&&s.poi.length)html+='<div class="voy-sec"><b>Points of Interest</b><ul>'+s.poi.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ul></div>";html+="</div></div></details>";});el.innerHTML=html;ITIN.forEach(function(s){fetchVoyWx(s);});}
// ---- Emergency tab (renders only when the voyage supplies V.emergency) -------
// The offline family-handoff card: cruise-line + State Dept numbers plus
// fillable fields persisted in localStorage, so the card survives with no
// signal once the page has loaded once. Never fetches anything.
function emgVal(k){return lsG((V.emergency&&V.emergency.storageKey||"itw-emg")+":"+k)||"";}
// Ship and Ports: the pack's own sections, written into this page at build time as inert <template>s
// (admin/scripts/build-voyage-guides.mjs). Cloned once, never parsed from a string at run time.
var TPL_SHIP=document.getElementById("tpl-ship"),TPL_PORTS=document.getElementById("tpl-ports"),PACK_INDEX=null;
try{var _pi=document.getElementById("pack-index");if(_pi)PACK_INDEX=JSON.parse(_pi.textContent);}catch(e){PACK_INDEX=null;}
var PACK_VIDEOS=[];try{var _pv=document.getElementById("pack-videos");if(_pv)PACK_VIDEOS=JSON.parse(_pv.textContent)||[];}catch(e){PACK_VIDEOS=[];}
function fullPackLink(){if(!V.guide)return null;var p=document.createElement("p");p.className="pk-full";var a=document.createElement("a");a.className="ov-link";a.href=String(V.guide.url);a.textContent="Read the whole pack: packing, budget, emergency and the rest →";p.appendChild(a);return p;}
// A credited photo for a port day, sourced from the port's own page on the site so its attribution is
// the same one the port page carries. Like the videos and the live map, it needs the internet; the port
// text works offline and the alt text stands in when the photo cannot load.
function portFigure(P){if(!P||!P.src)return null;var fig=document.createElement("figure");fig.className="ship-photo port-photo";
  var img=document.createElement("img");img.src=P.src;img.alt=P.alt||"";img.loading="lazy";img.decoding="async";if(P.w)img.width=P.w;if(P.h)img.height=P.h;fig.appendChild(img);
  var cap=document.createElement("figcaption");cap.appendChild(document.createTextNode(P.caption?P.caption+" ":""));
  if(P.flickers){cap.appendChild(document.createTextNode("Photo © "));var fl=document.createElement("a");fl.href="https://www.flickersofmajesty.com";fl.target="_blank";fl.rel="noopener noreferrer";fl.textContent="Flickers of Majesty";var s1=document.createElement("span");s1.className="sr-only";s1.textContent=" (opens in a new window)";fl.appendChild(s1);cap.appendChild(fl);}
  else{cap.appendChild(document.createTextNode("Photo: "+(P.credit||"")+(P.license?" ("+P.license+")":"")+(P.source?" via ":"")));if(P.source){var sc=document.createElement("a");sc.href=P.source;sc.target="_blank";sc.rel="noopener noreferrer";sc.textContent="Wikimedia Commons";var s2=document.createElement("span");s2.className="sr-only";s2.textContent=" (opens in a new window)";sc.appendChild(s2);cap.appendChild(sc);}}
  fig.appendChild(cap);return fig;}
// Drop each port's photo in right under that port day's heading. The key is a slug the day's id contains
// (pk-day-cozumel matches "cozumel"); a day nothing matches, like the sea days and embarkation, gets none.
function insertPortPhotos(body){var P=V.portPhotos;if(!P)return;var keys=Object.keys(P);
  Array.prototype.forEach.call(body.querySelectorAll("h3[id]"),function(h){for(var i=0;i<keys.length;i++){if(h.id.indexOf(keys[i])>=0){var fig=portFigure(P[keys[i]]);if(fig&&h.parentNode)h.parentNode.insertBefore(fig,h.nextSibling);break;}}});}
function renderPackTab(which){var el=document.getElementById("pane-"+which),tpl=which==="ship"?TPL_SHIP:TPL_PORTS;if(!el||!tpl||el.getAttribute("data-filled"))return;
  var body=document.importNode(tpl.content,true),f=fullPackLink();
  if(which==="ship"){var ph=shipPhoto();if(ph)el.appendChild(ph);
    // Order (operator review 2026-09-26): quick links, then the schedule, then the live position.
    var sc=schedCard(),wn=whereNow(),ql=[];
    if(sc)ql.push([sc.id,sc.getAttribute("data-k")]);if(wn)ql.push([wn.id,"Where is "+(V.ship||"the ship")+" right now?"]);
    Array.prototype.forEach.call(body.querySelectorAll("h3[id]"),function(h){ql.push([h.id,h.textContent]);});
    if(PACK_VIDEOS.length)ql.push(["pk-videos-h","Videos"]);if(f){f.id="pk-full";ql.push(["pk-full","The whole pack"]);}
    if(ql.length>1)el.appendChild(quickLinks(ql));if(sc)el.appendChild(sc);if(wn)el.appendChild(wn);}
  else if(which==="ports"){insertPortPhotos(body);
    var qlp=[];Array.prototype.forEach.call(body.querySelectorAll("h3[id]"),function(h){qlp.push([h.id,h.textContent]);});
    if(f){f.id="pk-full";qlp.push(["pk-full","The whole pack"]);}
    if(qlp.length>1)el.appendChild(quickLinks(qlp));}
  el.appendChild(body);
  if(which==="ship"&&PACK_VIDEOS.length)el.appendChild(videoSection());
  if(f)el.appendChild(f);el.setAttribute("data-filled","1");}
// A box of jump links to the sections below. Real links (#id) so they read as links, but the jump
// is done here: the address bar is left alone and focus moves to the section for keyboard users.
function jumpTo(id){var t=document.getElementById(id);if(!t)return;t.scrollIntoView({block:"start"});if(!t.hasAttribute("tabindex"))t.setAttribute("tabindex","-1");try{t.focus({preventScroll:true});}catch(e){}}
// Card titles: the icon is decoration, so a screen reader hears only the words.
function cardHead(h,icon,txt){var i=document.createElement("span");i.setAttribute("aria-hidden","true");i.textContent=icon+" ";h.appendChild(i);h.appendChild(document.createTextNode(txt));}
function quickLinks(list){var nav=document.createElement("nav");nav.className="ov-card pk-card pk-ql";nav.setAttribute("aria-labelledby","pk-ql-h");
  var h=document.createElement("h2");h.id="pk-ql-h";h.className="pk-card-k";cardHead(h,"⚓","On this page");nav.appendChild(h);
  var ul=document.createElement("ul");list.forEach(function(x){var li=document.createElement("li"),a=document.createElement("a");a.href="#"+x[0];a.textContent=x[1];
    a.addEventListener("click",function(e){e.preventDefault();jumpTo(x[0]);});li.appendChild(a);ul.appendChild(li);});
  nav.appendChild(ul);return nav;}
// Where the ship is. Two answers, kept apart so neither passes for the other: what the
// published schedule says for today (in the page, so it works with no signal), and the
// live AIS position from VesselFinder, the same map the ship pages use. The map loads
// nothing until the reader taps, because at sea that is their data and a third party.
function schedNow(){if(!ITIN.length)return null;var t=todayISO(),a=ITIN[0],z=ITIN[ITIN.length-1],i,p,n,ship=V.ship||"The ship";
  if(t<a.date)return {k:"Before the cruise",v:ship+" has not sailed yet. On "+voyDate(a.date)+" she leaves "+a.loc+". Until then the live map shows her on another voyage."};
  if(t>z.date)return {k:"After the cruise",v:"This voyage ended "+voyDate(z.date)+" at "+z.loc+". The live map shows her wherever she is now."};
  for(i=0;i<ITIN.length;i++){if(ITIN[i].date===t)return {k:"By the schedule · "+voyDate(t),v:"Day "+ITIN[i].d+". "+(ITIN[i].pos||ITIN[i].loc),at:ITIN[i]};}
  for(i=1;i<ITIN.length;i++){if(ITIN[i].date>t){p=ITIN[i-1];n=ITIN[i];return {k:"By the schedule · "+voyDate(t),v:"Between stops: last "+p.loc+" ("+voyDate(p.date)+"), next "+n.loc+" ("+voyDate(n.date)+").",at:p};}}
  return null;}
// The schedule card: what the published itinerary says for today. It is in the page, so it works
// with no internet, and it sits above the live map so the two are never read as one.
function schedCard(){var s=schedNow();if(!s)return null;
  var box=document.createElement("section");box.id="pk-sched";box.className="ov-card pk-card";box.setAttribute("aria-labelledby","pk-sched-h");box.setAttribute("data-k",s.k);
  var k=document.createElement("h2");k.id="pk-sched-h";k.className="pk-card-k";cardHead(k,"🗓",s.k);box.appendChild(k);
  var v=document.createElement("p");v.className="pk-sched-v";v.textContent=s.v;box.appendChild(v);
  var q=document.createElement("p");q.className="pk-vnote";q.textContent="This is the published schedule, not a live fix, and it works with no internet. Weather and the captain can change the plan."+(V.datesApprox?" Dates here are estimated; your cruise documents are authoritative.":"");box.appendChild(q);
  return box;}
function whereNow(){if(!V.imo&&!V.trackUrl)return null;var ship=V.ship||"the ship";
  var sec=document.createElement("section");sec.id="pk-where";sec.className="ov-card pk-card pk-whereis";sec.setAttribute("aria-labelledby","pk-where-h");
  var h=document.createElement("h2");h.id="pk-where-h";h.className="pk-card-k";cardHead(h,"◢","Where is "+ship+" right now?");sec.appendChild(h);
  if(V.imo||V.trackUrl){var note=document.createElement("p");note.className="pk-vnote";note.setAttribute("aria-live","polite");
    note.textContent="The ship's own AIS transponder, plotted by VesselFinder. It needs the internet (cell data or Wi-Fi), and nothing loads until you tap. Out at sea the dot can be hours old.";sec.appendChild(note);
    var row=document.createElement("p");row.className="pk-vrow";
    if(V.imo){var b=document.createElement("button");b.type="button";b.className="mapbtn pk-play";b.textContent="◢ Show live map";b.setAttribute("aria-label","Show the live map of "+ship);
      b.addEventListener("click",function(){if(navigator.onLine===false){note.textContent="No internet right now (no cell data or Wi-Fi), so the live map can't load. The schedule above still works.";return;}
        var m=document.createElement("div");m.className="pk-map";var f=document.createElement("iframe");
        // Exactly the address the ship pages use. The scheduled lat/lon this used to add produced
        // "Bad request" from VesselFinder (operator report 2026-09-26); the map centres on the IMO anyway.
        f.src="https://www.vesselfinder.com/aismap?imo="+encodeURIComponent(V.imo)+"&zoom=5&track=true&names=true";
        f.title="Live position of "+ship+" on VesselFinder";f.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
        m.appendChild(f);row.parentNode.insertBefore(m,row);row.removeChild(b);});
      row.appendChild(b);}
    if(V.trackUrl){var a=document.createElement("a");a.className="ov-link";a.href=V.trackUrl;a.target="_blank";a.rel="noopener noreferrer";a.textContent="Open in MarineTraffic ↗";
      var sr=document.createElement("span");sr.className="sr-only";sr.textContent=" (opens in a new window)";a.appendChild(sr);row.appendChild(a);}
    sec.appendChild(row);}
  return sec;}
// One chosen photograph of the ship, credited as its licence requires.
function shipPhoto(){var P=V.shipPhoto;if(!P||!P.src)return null;var fig=document.createElement("figure");fig.className="ship-photo";
  var img=document.createElement("img");img.src=P.src;img.alt=P.alt||"";img.decoding="async";if(P.w)img.width=P.w;if(P.h)img.height=P.h;fig.appendChild(img);
  var cap=document.createElement("figcaption");cap.appendChild(document.createTextNode((P.caption?P.caption+" ":"")+"Photo: "+(P.credit||"")+", "));
  var l=document.createElement("a");l.href=P.licenseUrl||"#";l.target="_blank";l.rel="noopener noreferrer";l.textContent=P.license||"licence";cap.appendChild(l);
  if(P.source){cap.appendChild(document.createTextNode(", via "));var s=document.createElement("a");s.href=P.source;s.target="_blank";s.rel="noopener noreferrer";s.textContent="Wikimedia Commons";cap.appendChild(s);}
  cap.appendChild(document.createTextNode("."));fig.appendChild(cap);return fig;}
// Checked YouTube videos of this ship. Nothing loads from YouTube until the reader taps Play;
// then the player comes from youtube-nocookie.com inside this page.
// Which bucket a video's title puts it in, for the collapsible sections on the Ship tab. Presentation
// only; the ship-page validator keeps its own categoryOf. First match wins, so a whole-ship tour is
// caught before a stray "suite" in its title would pull it into cabins.
// access is tested before cabin on purpose: an accessible cabin tour belongs in Accessibility, where
// the person who needs it will look, not buried among the ordinary cabin tours.
var VCATS=[
  ["ship",/\b(ship tour|walk\s*-?\s*through|full tour|full ship|complete tour|ship walkthrough|full review)\b/],
  ["access",/\b(accessible|accessibility|wheelchair|handicap(ped)?)\b/],
  ["cabin",/\b(haven|suites?|balcon(y|ies)|ocean\s*view|inside cabin|interior|stateroom|studio|cabin)\b/],
  ["food",/\b(food|dining|restaurants?|buffet|menu|specialty|everything we ate)\b/],
  ["tips",/\btop\s*(10|ten)\b|\b\d+\s+things\b|\bthings (you must|to know|to do)\b|\bmust[-\s]?do\b|\b(tips|mistakes|secrets|hacks|need to know)\b/]
];
function videoCat(t){t=String(t||"").toLowerCase();for(var i=0;i<VCATS.length;i++)if(VCATS[i][1].test(t))return VCATS[i][0];return "more";}
function videoCard(v){var card=document.createElement("div");card.className="pk-vid";
  var t=document.createElement("h3");t.className="pk-vtitle";t.textContent=v.t;card.appendChild(t);
  if(v.c){var c=document.createElement("p");c.className="pk-vch";c.textContent=v.c;card.appendChild(c);}
  var row=document.createElement("p");row.className="pk-vrow";
  var b=document.createElement("button");b.type="button";b.className="mapbtn pk-play";b.textContent="▶ Play here";b.setAttribute("aria-label","Play "+v.t);
  b.addEventListener("click",function(){var box=document.createElement("div");box.className="pk-frame";var f=document.createElement("iframe");
    f.src="https://www.youtube-nocookie.com/embed/"+encodeURIComponent(v.id)+"?autoplay=1&rel=0&playsinline=1";f.title=v.t;
    f.setAttribute("allow","autoplay; encrypted-media; picture-in-picture; fullscreen");f.setAttribute("allowfullscreen","");f.setAttribute("referrerpolicy","strict-origin-when-cross-origin");
    box.appendChild(f);row.parentNode.replaceChild(box,row);});
  var a=document.createElement("a");a.className="ov-link pk-yt";a.href="https://www.youtube.com/watch?v="+encodeURIComponent(v.id);a.target="_blank";a.rel="noopener noreferrer";a.textContent="Open on YouTube ↗";
  var sr=document.createElement("span");sr.className="sr-only";sr.textContent=" (opens in a new window)";a.appendChild(sr);
  row.appendChild(b);row.appendChild(a);card.appendChild(row);return card;}
function videoSection(){var sec=document.createElement("section");sec.className="pk-videos";sec.setAttribute("aria-labelledby","pk-videos-h");
  var h=document.createElement("h2");h.id="pk-videos-h";h.textContent="Videos of "+(V.ship||"the ship");sec.appendChild(h);
  var n=document.createElement("p");n.className="pk-vnote";n.textContent="Picked from YouTube and checked against YouTube's own titles, then grouped by what each one shows. They need the internet (cell data or Wi-Fi). Nothing loads from YouTube until you tap Play, and YouTube's terms apply once it plays.";sec.appendChild(n);
  // Group by what the title says the video is; a title nothing places lands in "More videos". Whole-ship
  // tours come first and open by default, since that is what most people came to watch.
  var groups={};PACK_VIDEOS.forEach(function(v){var g=videoCat(v.t);(groups[g]=groups[g]||[]).push(v);});
  var order=[["ship","Ship tours"],["cabin","Cabin & room tours"],["food","Food & dining"],["access","Accessibility"],["tips","Tips & top tens"],["more","More videos"]];
  var firstOpen=true;
  order.forEach(function(o){var list=groups[o[0]];if(!list||!list.length)return;
    var d=document.createElement("details");d.className="voy-row pk-vgroup";if(firstOpen){d.open=true;firstOpen=false;}
    var sm=document.createElement("summary");sm.className="voy-sum";
    var lab=document.createElement("span");lab.className="dloc";lab.textContent=o[1];sm.appendChild(lab);
    var cnt=document.createElement("span");cnt.className="dbadge";cnt.textContent=String(list.length);sm.appendChild(cnt);d.appendChild(sm);
    var body=document.createElement("div");body.className="voy-body";list.forEach(function(v){body.appendChild(videoCard(v));});d.appendChild(body);
    sec.appendChild(d);});
  return sec;}
// Live search over the whole pack, offline. The query never leaves the phone and is never counted.
var preSearchTab="overview";
function fold(s){s=String(s).toLowerCase();try{s=s.normalize("NFD").replace(/[̀-ͯ]/g,"");}catch(e){}return s;}
function runSearch(q){var list=document.getElementById("pk-results"),cnt=document.getElementById("pk-count");if(!list||!PACK_INDEX)return;while(list.firstChild)list.removeChild(list.firstChild);
  var terms=fold(q).split(/\s+/).filter(function(t){return t.length>0;});if(!terms.length){cnt.textContent="";return;}
  var hits=[];PACK_INDEX.forEach(function(b){var ft=fold(b.t),fx=fold(b.x),ok=true,score=0;for(var i=0;i<terms.length;i++){var inT=ft.indexOf(terms[i])>=0,inX=fx.indexOf(terms[i])>=0;if(!inT&&!inX){ok=false;break;}score+=inT?3:1;}if(ok)hits.push({b:b,score:score});});
  hits.sort(function(a,b){return b.score-a.score;});
  cnt.textContent=hits.length?(hits.length+(hits.length===1?" place":" places")+" in the pack mention “"+q+"”"):("Nothing in the pack mentions “"+q+"”.");
  hits.slice(0,40).forEach(function(h){var b=h.b,li=document.createElement("li"),a=document.createElement("a");a.className="pk-hit";
    if(b.s==="guide"&&V.guide)a.href=String(V.guide.url)+"#"+b.a;else a.href="#"+b.a;
    var where=document.createElement("span");where.className="pk-where";where.textContent=b.s==="ship"?"Ship":b.s==="ports"?"Ports":"Full pack";
    var ttl=document.createElement("span");ttl.className="pk-title";ttl.textContent=b.t;
    a.appendChild(where);a.appendChild(ttl);
    if(b.s!=="guide")a.addEventListener("click",function(ev){ev.preventDefault();openHit(b);});
    li.appendChild(a);li.appendChild(snippet(b.x,terms));list.appendChild(li);});}
function snippet(text,terms){var p=document.createElement("p");p.className="pk-snip";var ft=fold(text),at=-1;for(var i=0;i<terms.length&&at<0;i++)at=ft.indexOf(terms[i]);if(at<0)at=0;
  var s0=Math.max(0,at-70),s1=Math.min(text.length,at+150),piece=(s0>0?"…":"")+text.slice(s0,s1)+(s1<text.length?"…":"");
  var fp=fold(piece),pos=0;while(pos<piece.length){var next=-1,len=0;terms.forEach(function(t){var k=fp.indexOf(t,pos);if(k>=0&&(next<0||k<next)){next=k;len=t.length;}});
    if(next<0){p.appendChild(document.createTextNode(piece.slice(pos)));break;}
    if(next>pos)p.appendChild(document.createTextNode(piece.slice(pos,next)));var m=document.createElement("mark");m.textContent=piece.slice(next,next+len);p.appendChild(m);pos=next+len;}
  return p;}
function openHit(b){var box=document.getElementById("pk-q");if(box)box.value="";setTab(b.s);var t=document.getElementById(b.a);if(t){t.scrollIntoView({block:"start"});t.setAttribute("tabindex","-1");try{t.focus({preventScroll:true});}catch(e){}}}
function bindSearch(){var box=document.getElementById("pk-q");if(!box)return;var timer=null;
  box.addEventListener("input",function(){clearTimeout(timer);timer=setTimeout(function(){var q=box.value.trim();if(q.length>=2){if(tab!=="search")preSearchTab=tab;setTab("search");runSearch(q);}else if(tab==="search"){setTab(preSearchTab);}},120);});
  box.addEventListener("keydown",function(ev){if(ev.key==="Escape"){box.value="";if(tab==="search")setTab(preSearchTab);}});}
// Warm the offline copy: the service worker stores this same-scope response, so the guide opens at sea.
function prefetchGuide(){try{if(V.guide&&navigator.onLine!==false)fetch(String(V.guide.url),{credentials:"same-origin"}).catch(function(){});}catch(e){}}

function renderEmergency(){var el=document.getElementById("pane-emg");if(!el||!V.emergency)return;var E=V.emergency,h="";
  h+='<div class="ov-card"><b>⚑ Emergency contacts — works offline</b>'
    +(E.intro?'<p>'+esc(E.intro)+'</p>':'')
    +'<ul class="emg-nums">'+(E.numbers||[]).map(function(n){return '<li><span class="emg-lbl">'+esc(n.label)+'</span><br><a class="emg-tel" href="tel:'+attr(String(n.tel).replace(/[^+\d]/g,""))+'">'+esc(n.tel)+'</a>'+(n.note?' <span class="muted">'+esc(n.note)+'</span>':'')+'</li>';}).join("")+'</ul></div>';
  h+='<div class="ov-card"><b>Family handoff card</b>'
    +'<p class="voy-note">Fill this in once — it saves on this device automatically and stays available offline. Share this page with your at-home contact so they hold a copy too.</p>'
    +(E.fields||[]).map(function(f){return '<label class="emg-f"><span class="emg-lbl">'+esc(f.label)+'</span><input class="emg-in" data-emg="'+attr(f.k)+'" value="'+attr(emgVal(f.k))+'" autocomplete="off"></label>';}).join("")
    +(E.routeNote?'<p class="voy-note">'+esc(E.routeNote)+'</p>':'')
    +'<p class="voy-note">Printable one-page version: '+(E.cardPdf?'<a class="ov-link" href="'+attr(E.cardPdf)+'" target="_blank" rel="noopener noreferrer">emergency handoff card (PDF) →</a>':'see the Voyage Pack')+'</p></div>';
  el.innerHTML=h;
  el.querySelectorAll(".emg-in").forEach(function(inp){inp.addEventListener("input",function(){lsS((E.storageKey||"itw-emg")+":"+inp.getAttribute("data-emg"),inp.value);
    // Once per device per pack: "someone filled the card in". A boolean; the value never leaves the phone.
    var fk=(E.storageKey||"itw-emg")+":filled";if(String(inp.value||"").replace(/\s/g,"")&&!lsG(fk)){lsS(fk,"1");usage("vp_handoff_filled");}});});}

function lsG(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsS(k,v){try{localStorage.setItem(k,v);}catch(e){}}
// ---- Anonymous usage counts (plan §2.1 Setting 1.5) ---------------------------
// Goes through /assets/js/voyage-usage.js → the geo-blind relay. What leaves the phone: the pack
// slug, the tab names used in one sitting, the voyage day, before/during/after, and whether the app
// was opened installed or offline. Never: the handoff card, the chosen location, the unit, or any
// identifier. Nothing is sent unless the page names its pack (V.slug) and the module is present.
var sessTabs={};
function usage(name,data){try{if(!V.slug||!window.ITW_USAGE||typeof window.ITW_USAGE.track!=="function")return;var d={pack:V.slug},k;for(k in (data||{}))d[k]=data[k];window.ITW_USAGE.track(name,d);}catch(e){}}
function voyWhen(){var t=todayISO(),r={phase:"before",day:0};if(!ITIN.length)return r;var first=ITIN[0].date,last=ITIN[ITIN.length-1].date;if(t<first)return r;if(t>last){r.phase="after";return r;}r.phase="during";for(var i=0;i<ITIN.length;i++){if(ITIN[i].date===t){r.day=ITIN[i].d;return r;}}r.day=Math.round((new Date(t+"T12:00")-new Date(first+"T12:00"))/86400000)+1;return r;}
function usageSession(){var names=[],k;for(k in sessTabs)names.push(k);if(!names.length)return;names.sort();sessTabs={};var w=voyWhen();usage("vp_pwa_session",{phase:w.phase,day:w.day,tabs:names.join(",")});}
function usagePdfLinks(el){el.querySelectorAll("a[href]").forEach(function(a){var h=a.getAttribute("href")||"";if(h.indexOf("cruisinginthewake.com/")<0||h.indexOf(".pdf")<0)return;var variant=h===V.pdfCondensed?"condensed":(h===V.pdfFull?"full":"other");a.addEventListener("click",function(){usage("vp_pdf_open",{variant:variant});});});}
function dn(iso){return ["SUN","MON","TUE","WED","THU","FRI","SAT"][new Date(iso+"T00:00").getDay()];}
function uTemp(){return lsG("itw:unit")||"fahrenheit";}
function uWind(){return uTemp()==="celsius"?"kmh":"mph";}
function uWindLab(){return uTemp()==="celsius"?"KM/H":"MPH";}
function retryJSON(u,n){return fetch(u).then(function(r){if((r.status===429||r.status>=500)&&n>0)return new Promise(function(s){setTimeout(s,500+Math.random()*500);}).then(function(){return retryJSON(u,n-1);});return r.ok?r.json():null;}).catch(function(){if(n>0)return new Promise(function(s){setTimeout(s,500+Math.random()*500);}).then(function(){return retryJSON(u,n-1);});return null;});}
function selIdx(){var s=lsG("itw:sel");for(var i=0;i<LOCS.length;i++){if(LOCS[i].label===s)return i;}return 0;}
function selLoc(){return LOCS[selIdx()];}
function buildSel(){var s=document.getElementById("wloc");if(!s)return;var ci=selIdx(),h="";LOCS.forEach(function(p,i){h+='<option value="'+i+'"'+(i===ci?" selected":"")+'>'+esc(p.label)+'</option>';});s.innerHTML=h;s.onchange=function(){lsS("itw:sel",LOCS[s.value|0].label);refresh();};}
function setUnit(u){lsS("itw:unit",u);wxCur={};var b=document.getElementById("wx-unit");if(b)b.textContent=(u==="celsius"?"°C":"°F");refresh();}
function toggleUnit(){setUnit(uTemp()==="celsius"?"fahrenheit":"celsius");}
function loadNow(){var p=selLoc();if(!p)return;var u="https://api.open-meteo.com/v1/forecast?latitude="+p.lat+"&longitude="+p.lon+"&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit="+uTemp()+"&wind_speed_unit="+uWind()+"&timezone=auto&forecast_days=7";retryJSON(u,2).then(function(j){var el=document.getElementById("pane-now");if(!el)return;if(!j||!j.current){el.innerHTML='<span class="muted">forecast unavailable — try again shortly</span>';return;}var c=j.current,d=j.daily,days="",n=(d&&d.time)?Math.min(7,d.time.length):0;for(var i=0;i<n;i++){days+='<div class="wx-day"><b>'+(i===0?"TODAY":dn(d.time[i]))+'</b><span class="hl">'+Math.round(d.temperature_2m_max[i])+'°</span> / <span class="lo">'+Math.round(d.temperature_2m_min[i])+'°</span><span class="pp">'+(d.precipitation_probability_max?d.precipitation_probability_max[i]+'%':'')+'</span></div>';}el.innerHTML='<div class="wx-now"><span class="wx-temp">'+Math.round(c.temperature_2m)+'°</span><span><div class="wx-cond">'+(WMO[c.weather_code]||"—")+'</div><div class="wx-meta">'+esc(p.label)+' · FEELS '+Math.round(c.apparent_temperature)+'° · '+c.relative_humidity_2m+'% RH · '+Math.round(c.wind_speed_10m)+' '+uWindLab()+'</div></span></div><div class="wx-days">'+days+'</div>';});}
function drawRoute(){try{
// Route + day markers are drawn at longitude offsets -360/0/+360 so a voyage
// whose route uses continuous (unwrapped) longitudes — e.g. a circumnavigation
// crossing the antimeridian — stays visible on whichever world copy the user
// is viewing. Leaflet renders vector layers only at their literal coordinates,
// so without the copies a marker at -185° vanishes when the map centers on
// +175°. For regional voyages the extra copies sit harmlessly off-screen.
var OFFS=[-360,0,360];
OFFS.forEach(function(off){
if(ROUTE&&ROUTE.length){var r=ROUTE.map(function(p){return [p[0],p[1]+off];});L.polyline(r,{color:"#2ee6ff",weight:5,opacity:0.10,lineJoin:"round"}).addTo(map);L.polyline(r,{color:"#2ee6ff",weight:1.6,opacity:0.6,dashArray:"6 7",lineJoin:"round"}).addTo(map);}
var t=todayISO();ITIN.forEach(function(s){var c=(s.mlat!=null)?[s.mlat,s.mlon+off]:[s.lat,s.lon+off],today=(s.date===t);if(today)L.circleMarker(c,{radius:11,color:"#eafcff",weight:2,fillColor:"#2ee6ff",fillOpacity:0.30}).addTo(map);L.circleMarker(c,{radius:today?7:5.5,color:"#0a0a0a",weight:1.4,fillColor:today?"#2ee6ff":"#f0c87a",fillOpacity:0.95}).addTo(map).bindTooltip("Day "+s.d+" · "+(V.datesApprox?"~":"")+voyDate(s.date)+" — "+esc(s.loc)+(today?" (today)":""),{direction:"top",className:"wx-tip",offset:[0,-4]});L.marker(c,{icon:L.divIcon({className:"wx-dnum",html:String(s.d),iconSize:[16,16],iconAnchor:[8,8]}),interactive:false,keyboard:false}).addTo(map);});
});
}catch(e){}}
function ensureMap(){if(map)return;var mc=V.mapCenter||[LOCS.length?LOCS[0].lat:0,LOCS.length?LOCS[0].lon:0,4];map=L.map("map",{zoomControl:true,attributionControl:true}).setView([mc[0],mc[1]],mc[2]||4);L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:12,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors · radar <a href="https://www.rainviewer.com/" target="_blank" rel="noopener noreferrer">RainViewer</a>'}).addTo(map);drawRoute();}
function curWx(p){var key=p.lat.toFixed(3)+","+p.lon.toFixed(3),c=wxCur[key];if(c&&(Date.now()-c.ts)<600000)return Promise.resolve(c);return retryJSON("https://api.open-meteo.com/v1/forecast?latitude="+p.lat+"&longitude="+p.lon+"&current=temperature_2m,weather_code,wind_speed_10m&daily=precipitation_probability_max&forecast_days=1&temperature_unit="+uTemp()+"&wind_speed_unit="+uWind()+"&timezone=auto",2).then(function(j){if(!j||!j.current)return null;var pp=(j.daily&&j.daily.precipitation_probability_max&&j.daily.precipitation_probability_max.length)?j.daily.precipitation_probability_max[0]:null;var o={t:j.current.temperature_2m,code:j.current.weather_code,wind:j.current.wind_speed_10m,pop:pp,ts:Date.now()};wxCur[key]=o;return o;});}
function tipHtml(p,c){var h='<b>'+esc(p.label)+'</b>';if(c)h+='<br><span class="tw">'+Math.round(c.t)+'° '+esc(WMO[c.code]||"")+(c.wind!=null?' · '+Math.round(c.wind)+' '+uWindLab():'')+(c.pop!=null?' · '+c.pop+'% rain':'')+'</span>';else h+='<br><span class="tw">loading…</span>';return h;}
function buildMarkers(){if(!map)return;markers.forEach(function(m){map.removeLayer(m);});markers=[];var ci=selIdx();LOCS.forEach(function(p,i){var on=(i===ci);var m=L.circleMarker([p.lat,p.lon],{radius:on?8:6,color:on?"#ffffff":"#021018",weight:2,fillColor:"#2ee6ff",fillOpacity:0.95}).addTo(map);m.bindTooltip(tipHtml(p,wxCur[p.lat.toFixed(3)+","+p.lon.toFixed(3)]),{direction:"top",className:"wx-tip",offset:[0,-5]});m.on("click",function(){lsS("itw:sel",p.label);refresh();});markers.push(m);curWx(p).then(function(c){if(c)m.setTooltipContent(tipHtml(p,c));});});}
function fitAll(){if(!map||!markers.length)return;try{map.fitBounds(L.featureGroup(markers).getBounds().pad(0.15),{maxZoom:9});}catch(e){}}
function showMap(){if(typeof L==="undefined")return setTimeout(showMap,200);ensureMap();var p=selLoc();if(p)map.setView([p.lat,p.lon],map.getZoom()||6);setTimeout(function(){map.invalidateSize();},60);buildMarkers();if(rv)buildFrames();else retryJSON("https://api.rainviewer.com/public/weather-maps.json",2).then(function(j){rv=j;buildFrames();});var mm=document.getElementById("mr-mode");if(mm)mm.textContent=(mode==="nowcast")?"FUTURECAST (predicted)":"RADAR (past 2h)";}
function clearLayers(){layers.forEach(function(l){if(l)map.removeLayer(l);});layers=[];}
function frameLayer(i){if(!layers[i]&&frames[i]){var l=L.tileLayer(rv.host+frames[i].path+"/256/{z}/{x}/{y}/4/1_1.png",{opacity:0,maxZoom:12,maxNativeZoom:7,updateWhenIdle:true,keepBuffer:8,className:"rv-layer"});l._ready=false;l.on("load",function(){if(!l._ready){l._ready=true;rvLoaded++;}if(lastShown<0)showFrame(fi);});layers[i]=l.addTo(map);}return layers[i];}
function buildFrames(){if(!map)return;clearLayers();stop();if(!rv||!rv.radar)return;var set=(mode==="nowcast")?(rv.radar.nowcast||[]):(rv.radar.past||[]);frames=set;if(!frames.length)return;layers=new Array(frames.length);rvLoaded=0;lastShown=-1;fi=0;var t=document.getElementById("mr-time");if(t)t.textContent="loading radar…";for(var k=0;k<frames.length;k++){frameLayer(k);}play();}
function showFrame(i){var cur=layers[i];if(!cur||!cur._ready)return;for(var k=0;k<layers.length;k++){if(layers[k]&&k!==i)layers[k].setOpacity(0);}cur.setOpacity(0.72);lastShown=i;var f=frames[i],t=document.getElementById("mr-time");if(t&&f)t.textContent=(mode==="nowcast"?"+ ":"")+new Date(f.time*1000).toLocaleTimeString();}
function play(){stop();if(!frames.length)return;showFrame(fi);anim=setInterval(function(){fi=(fi+1)%frames.length;showFrame(fi);},700);var b=document.getElementById("mr-play");if(b)b.textContent="⏸ PAUSE";}
function stop(){if(anim){clearInterval(anim);anim=null;}}
function togglePlay(){if(anim){stop();var b=document.getElementById("mr-play");if(b)b.textContent="▶ PLAY";}else play();}
function sevRank(s){return {Extreme:4,Severe:3,Moderate:2,Minor:1}[s]||0;}
function loadAlerts(){var p=selLoc();if(!p)return;var u="https://api.weather.gov/alerts/active?point="+p.lat+","+p.lon;function once(){return fetch(u).then(function(r){if(r.status===400)return{outside:true};if(!r.ok)throw new Error(r.status);return r.json();});}
// 400 means the point is outside NWS coverage (every non-U.S. port): that is "not covered", not "couldn't check".
once().catch(once).then(function(j){if(j&&j.outside)renderAlerts([],p,true);else renderAlerts((j&&j.features)?j.features:[],p);}).catch(function(){renderAlerts(null,p);});}
function renderAlerts(fs,p,outside){var el=document.getElementById("al-wx");if(!el)return;var worst=0,top="";if(fs===null){el.innerHTML='<div class="alertc al-unknown"><div class="ev">Couldn\'t check weather warnings for '+esc(p.label)+'</div><div class="meta">No connection to the National Weather Service right now. This is not an all-clear.</div></div>';AL.wx="unknown";updateAlertTab();return;}if(fs&&fs.length){var h="";fs.sort(function(a,b){return sevRank(b.properties.severity)-sevRank(a.properties.severity);});fs.forEach(function(f){var pr=f.properties,sv=pr.severity||"Unknown";if(sevRank(sv)>worst){worst=sevRank(sv);top=pr.event;}h+='<div class="alertc sev-'+sv+'"><div class="ev">'+esc(pr.event||"Alert")+'</div><div class="meta">'+esc(sv)+(pr.expires?" · until "+new Date(pr.expires).toLocaleString():"")+(pr.areaDesc?" · "+esc(pr.areaDesc):"")+'</div><div class="desc">'+esc(pr.headline||pr.description||"")+'</div></div>';});el.innerHTML=h;}else{el.innerHTML='<div class="alertc al-ok"><div class="ev">'+(outside?'The National Weather Service does not cover '+esc(p.label):'No active National Weather Service warnings for '+esc(p.label))+'</div><div class="meta">'+esc(V.alertsIntl||"NWS covers the US & its coastal waters. International stops rely on the Now & 10-Day views.")+'</div></div>';}setDanger(worst>=3,top);AL.wx=worst>=3?"red":worst>=1?"yellow":"none";updateAlertTab();}
var AL={wx:"none",ship:"none",ports:"none",stale:false};
function alRank(c){return c==="red"?3:(c==="yellow"||c==="unknown")?2:0;}
function alWorst(a,b){return alRank(b)>alRank(a)?b:a;}
function updateAlertTab(){var b=document.querySelector('.wtab[data-t="alerts"]');if(!b)return;var w=["wx","ship","ports"].reduce(function(a,k){return alWorst(a,AL[k]);},"none");if(AL.stale)w=alWorst(w,"yellow");var red=w==="red",yel=!red&&alRank(w)===2;b.classList.toggle("al-red",red);b.classList.toggle("al-yel",yel);var m=b.querySelector(".al-mark"),sr=b.querySelector(".al-sr");if(m)m.textContent=red?"⚠ ":yel?"▲ ":"";if(sr)sr.textContent=red?" (serious)":yel?" (take care)":"";}
function alCard(colour,title,lines){return '<div class="alertc al-'+(colour==="red"?"red":colour==="none"?"ok":"yel")+'"><div class="ev">'+(colour==="red"?"⚠ ":colour==="none"?"":"▲ ")+esc(title)+'</div>'+lines.join("")+'</div>';}
function alLine(label,text,url){return '<div class="meta"><b>'+esc(label)+':</b> '+esc(text)+(url?' <a href="'+attr(url)+'" target="_blank" rel="noopener noreferrer">source<span class="sr-only"> (opens in a new window)</span></a>':'')+'</div>';}
var MONTHS_EN=["January","February","March","April","May","June","July","August","September","October","November","December"];
function loadVoyageAlerts(){fetch("/admin/voyage-pwa/alerts.json",{cache:"no-cache"}).then(function(r){if(!r.ok)throw new Error(r.status);return r.json();}).then(renderVoyageAlerts).catch(function(){renderVoyageAlerts(null);});}
function renderVoyageAlerts(d){var sh=document.getElementById("al-ship"),po=document.getElementById("al-ports"),st=document.getElementById("al-stamp");if(!sh||!po)return;
 if(!d){var no='<div class="alertc al-unknown"><div class="ev">Couldn\'t load the alert list</div><div class="meta">It needs a connection once; after that the last copy works offline. This is not an all-clear.</div></div>';sh.innerHTML=no;po.innerHTML=no;AL.ship="unknown";AL.ports="unknown";if(st)st.textContent="";updateAlertTab();return;}
 var ageDays=(Date.now()-Date.parse(d.generated))/864e5;AL.stale=!(ageDays<=14);
 if(st)st.textContent="Checked "+new Date(d.generated).toLocaleDateString(undefined,{month:"long",day:"numeric",year:"numeric"})+(AL.stale?" · not checked recently, so treat this as out of date":"")+". Sources: CDC Vessel Sanitation Program, U.S. Department of State, UK Foreign Office, Government of Canada.";
 var src=d.sources||{},s=(d.ships||{})[V.ship];
 if(!s||s.unavailable||(src.cdc&&src.cdc.status!=="ok")){sh.innerHTML='<div class="alertc al-unknown"><div class="ev">Couldn\'t check the CDC list for '+esc(V.ship||"this ship")+'</div><div class="meta">This is not an all-clear.</div></div>';AL.ship="unknown";}
 else if(!s.posts.length){sh.innerHTML=alCard("none","No stomach-illness outbreak posted for "+(V.ship||"this ship"),['<div class="meta">The CDC posts an outbreak when 3% or more of passengers or crew report symptoms on a voyage it oversees. <a href="https://www.cdc.gov/vessel-sanitation/cruise-ship-outbreaks/index.html" target="_blank" rel="noopener noreferrer">CDC list<span class="sr-only"> (opens in a new window)</span></a></div>']);AL.ship="none";}
 else{var h="",w="none",now=new Date(),ym=now.getFullYear()*12+now.getMonth();s.posts.forEach(function(p){var c=(ym-(p.year*12+p.month-1))<=1?"red":"yellow";w=alWorst(w,c);h+=alCard(c,"CDC posted a stomach-illness outbreak on "+(V.ship||"this ship")+", "+MONTHS_EN[p.month-1]+" "+p.year,[alLine("What to do","Wash hands with soap often, and tell the ship's medical centre early if you feel unwell.",p.url)]);});sh.innerHTML=h;AL.ship=w;}
 var v=(d.voyages||{})[V.slug];
 if(!v){po.innerHTML='<div class="alertc al-unknown"><div class="ev">Port advisories aren\'t set up for this voyage yet</div><div class="meta">Check travel.state.gov before you sail. This is not an all-clear.</div></div>';AL.ports="unknown";}
 else if(!v.countries.length){po.innerHTML=alCard("none","Every port on this voyage is in the United States",['<div class="meta">No foreign travel advisory applies.</div>']);AL.ports="none";}
 else{var ph="",pw="none";v.countries.forEach(function(iso){var c=(d.countries||{})[iso]||{};var lines=[];
  if(c.us&&c.us.title)lines.push(alLine("U.S. State Department",c.us.title,c.us.url));else if(c.us&&c.us.missing)lines.push(alLine("U.S. State Department","not found in the State Department's feed; check travel.state.gov","https://travel.state.gov/content/travel/en/traveladvisories/traveladvisories.html"));else lines.push(alLine("U.S. State Department","couldn't check",""));
  if(c.uk&&c.uk.statuses)lines.push(alLine("UK Foreign Office",c.uk.statuses.length?"The UK "+c.uk.words.join("; "):"no advice against travel",c.uk.url));else if(c.uk)lines.push(alLine("UK Foreign Office","couldn't check",""));
  if(c.ca&&!c.ca.none)lines.push(alLine("Government of Canada",c.ca.words+(c.ca.regional?"; regional advisories in place for some areas":""),c.ca.url));else if(c.ca)lines.push(alLine("Government of Canada","no advisory found",""));
  var col=c.colour||"unknown";pw=alWorst(pw,col);
  if(/_to_parts/.test(JSON.stringify((c.uk&&c.uk.statuses)||[]))||(c.ca&&c.ca.regional))lines.push('<div class="meta al-note">Some of this advice covers only parts of the country. Read the source to see whether it includes your port.</div>');
  ph+=alCard(col,c.name||iso,lines);});po.innerHTML=ph;AL.ports=pw;}
 updateAlertTab();}
function setDanger(on,ev){document.body.classList.toggle("danger",!!on);var d=document.getElementById("dgr");if(d)d.textContent=on?("⚠ ACTIVE WARNING — "+(ev||"severe weather")+" for this location. See Alerts."):"";}
function fetch10(p){return retryJSON("https://api.open-meteo.com/v1/forecast?latitude="+p.lat+"&longitude="+p.lon+"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit="+uTemp()+"&timezone=auto&forecast_days=10",2);}
function setRow10(idx,d){var row=document.getElementById("d10-"+idx);if(!row)return;var days=row.querySelector(".d10-days");if(!days)return;if(!d||!d.daily){days.innerHTML='<span class="muted">forecast unavailable</span>';return;}var dd=d.daily,h="",n=Math.min(10,dd.time.length);for(var k=0;k<n;k++){h+='<div class="wx-day"><b>'+(k===0?"TODAY":dn(dd.time[k]))+'</b><span class="d10-c">'+esc(WMO[dd.weather_code[k]]||"—")+'</span><span class="hl">'+Math.round(dd.temperature_2m_max[k])+'°</span> / <span class="lo">'+Math.round(dd.temperature_2m_min[k])+'°</span><span class="pp">'+(dd.precipitation_probability_max&&dd.precipitation_probability_max[k]!=null?dd.precipitation_probability_max[k]+'%':'')+'</span></div>';}days.innerHTML=h;}
function load10day(){var el=document.getElementById("pane-10day");if(!el)return;var html="";LOCS.forEach(function(p,idx){html+='<div class="d10-row" id="d10-'+idx+'"><div class="d10-loc">'+esc(p.label)+'</div><div class="d10-days"><span class="muted">…</span></div></div>';});el.innerHTML=html;var i=0,active=0;function pump(){while(active<4&&i<LOCS.length){(function(idx,p){active++;fetch10(p).then(function(d){setRow10(idx,d);active--;pump();}).catch(function(){setRow10(idx,null);active--;pump();});})(i,LOCS[i]);i++;}}pump();}
function fcHour(iso){var h=parseInt(iso.slice(11,13),10);var ap=h<12?"AM":"PM";var hh=h%12;if(hh===0)hh=12;return hh+" "+ap;}
var WX_TABS=["now","ten","radar","averages"],lastWx="now";function setTab(t){if(t==="weather")t=lastWx;var isWx=WX_TABS.indexOf(t)>=0;if(isWx)lastWx=t;tab=t;if(t!=="overview"&&t!=="search")sessTabs[t]=1;["overview","voyage","ship","ports","weather","emg","journal","faq","alerts"].forEach(function(x){var b=document.querySelector('.wtab:not(.wsub)[data-t="'+x+'"]');if(b){var on=x===t||(x==="weather"&&isWx);b.classList.toggle("on",on);b.setAttribute("aria-selected",on?"true":"false");}});WX_TABS.forEach(function(x){var b=document.querySelector('.wsub[data-t="'+x+'"]');if(b){b.classList.toggle("on",x===t);b.setAttribute("aria-selected",x===t?"true":"false");}});var _ws=document.getElementById("wsubtabs");if(_ws)_ws.hidden=!isWx;document.getElementById("pane-overview").classList.toggle("on",t==="overview");document.getElementById("pane-voyage").classList.toggle("on",t==="voyage");document.getElementById("pane-averages").classList.toggle("on",t==="averages");document.getElementById("pane-now").classList.toggle("on",t==="now");document.getElementById("pane-10day").classList.toggle("on",t==="ten");document.getElementById("pane-map").classList.toggle("on",t==="radar");document.getElementById("pane-alerts").classList.toggle("on",t==="alerts");var _pe=document.getElementById("pane-emg");if(_pe)_pe.classList.toggle("on",t==="emg");["ship","ports","search","journal","faq"].forEach(function(x){var p=document.getElementById("pane-"+x);if(p)p.classList.toggle("on",t===x);});if(t==="overview")renderOverview();else if(t==="voyage")renderVoyage();else if(t==="averages")renderAverages();else if(t==="now")loadNow();else if(t==="ten")load10day();else if(t==="alerts"){loadAlerts();loadVoyageAlerts();}else if(t==="radar"){mode="past";showMap();}else if(t==="emg")renderEmergency();else if(t==="ship"||t==="ports")renderPackTab(t);else if(t==="journal")renderJournal();else if(t==="faq")renderFaq();blankify(document.body);}
function refresh(){buildSel();if(tab==="overview")renderOverview();else if(tab==="voyage")renderVoyage();else if(tab==="averages")renderAverages();else if(tab==="now")loadNow();else if(tab==="ten")load10day();else if(tab==="alerts")loadAlerts();else if(tab==="radar")showMap();loadAlerts();}

// ---- Links that leave the page (operator directive 2026-09-26) -----------------------------
// Installed to a home screen the companion has no back button, so a link that navigates this page
// away strands the reader. Every link to anywhere else, cruisinginthewake.com included, opens in a
// new window. Two ties: blankify() rewrites each pane as it renders (so screen readers are told
// before the tap), and a capture-phase click handler catches anything rendered later.
function isExternal(a){var h=a.getAttribute("href")||"";if(!h||h.charAt(0)==="#")return false;
  try{var u=new URL(h,location.href);if(u.protocol!=="http:"&&u.protocol!=="https:")return false;
    return !(u.origin===location.origin&&u.pathname===location.pathname);}catch(e){return false;}}
function blankify(root){if(!root||!root.querySelectorAll)return;root.querySelectorAll("a[href]").forEach(function(a){if(!isExternal(a)||a.target==="_blank")return;
  a.target="_blank";a.rel="noopener noreferrer";var sr=document.createElement("span");sr.className="sr-only";sr.textContent=" (opens in a new window)";a.appendChild(sr);});}
// The way back: the reader's tab and scroll spot are saved when they tap out. Normally the app is
// still on screen when they return. But phones (iPhone especially) can drop the app from memory
// while the browser is up, and it reopens on the Overview; then this saved spot puts a
// "Back to where you were" button at the bottom. Returning alive clears the spot, so the button
// never shows stale.
function spotKey(){return "itw-spot:"+(V.slug||location.pathname);}
function saveSpot(){try{localStorage.setItem(spotKey(),JSON.stringify({t:tab,y:Math.round(window.scrollY||0),ts:Date.now()}));}catch(e){}}
function clearSpot(){try{localStorage.removeItem(spotKey());}catch(e){}}
document.addEventListener("click",function(e){var n=e.target,a=null;while(n&&n!==document){if(n.tagName==="A"){a=n;break;}n=n.parentNode;}
  if(!a||!isExternal(a))return;a.target="_blank";a.rel="noopener noreferrer";saveSpot();},true);
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="visible")clearSpot();});
function spotBar(){var raw=null;try{raw=localStorage.getItem(spotKey());}catch(e){}if(!raw)return;
  var sp=null;try{sp=JSON.parse(raw);}catch(e){}
  if(!sp||!sp.t||!(Date.now()-(sp.ts||0)<12*3600000)){clearSpot();return;}
  var bar=document.createElement("div");bar.className="spot-bar";bar.setAttribute("role","region");bar.setAttribute("aria-label","Pick up where you left off");
  var b=document.createElement("button");b.type="button";b.className="mapbtn";b.textContent="\u21a9 Back to where you were";
  b.addEventListener("click",function(){clearSpot();bar.remove();try{setTab(sp.t);}catch(e){}setTimeout(function(){window.scrollTo(0,sp.y||0);},150);});
  var x=document.createElement("button");x.type="button";x.className="spot-x";x.textContent="\u2715";x.setAttribute("aria-label","Dismiss");
  x.addEventListener("click",function(){clearSpot();bar.remove();});
  bar.appendChild(b);bar.appendChild(x);document.body.appendChild(bar);}

// ---- Boot ---------------------------------------------------------------------
buildShell();
document.querySelectorAll(".wtab").forEach(function(b){b.onclick=function(){setTab(b.getAttribute("data-t"));};});
var pb=document.getElementById("mr-play");if(pb)pb.onclick=togglePlay;
var fb=document.getElementById("mr-fit");if(fb)fb.onclick=fitAll;
var ub=document.getElementById("wx-unit");if(ub){ub.textContent=(uTemp()==="celsius"?"°C":"°F");ub.onclick=toggleUnit;}
// Text size: a little A, a standard A and a large A. Scales every font size in companion.css through
// --fs, so text reflows instead of the page zooming (zoom would break the radar map's tap targets).
// The choice is a per-phone convenience, kept in localStorage when the browser allows it.
function setFs(k){k=Number(k)||1;document.documentElement.style.setProperty("--fs",String(k));document.querySelectorAll(".fsz button").forEach(function(b){b.setAttribute("aria-pressed",Number(b.getAttribute("data-fs"))===k?"true":"false");});try{localStorage.setItem("itw-fs",String(k));}catch(e){}}
function initFs(){var k=1;try{k=Number(localStorage.getItem("itw-fs"))||1;}catch(e){}setFs(k);document.querySelectorAll(".fsz button").forEach(function(b){b.addEventListener("click",function(){setFs(b.getAttribute("data-fs"));});});}
// Install popup: shown once per phone, never when the app is already installed. Built with DOM calls.
var _bip=null;window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();_bip=e;});
function installedAlready(){try{return window.matchMedia("(display-mode: standalone)").matches||window.navigator.standalone===true;}catch(e){return false;}}
function maybeInstallPopup(){var seen=false;try{seen=!!localStorage.getItem("itw-install-seen");}catch(e){seen=true;}if(seen||installedAlready())return;
  setTimeout(function(){if(document.getElementById("inst-dlg"))return;var prev=document.activeElement;var ios=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
    var bg=document.createElement("div");bg.className="inst-bg";var d=document.createElement("div");d.id="inst-dlg";d.className="inst-dlg";d.setAttribute("role","dialog");d.setAttribute("aria-modal","true");d.setAttribute("aria-labelledby","inst-h");
    var h=document.createElement("h2");h.id="inst-h";h.textContent="📲 Save this app to your phone";d.appendChild(h);
    var p1=document.createElement("p");p1.textContent=ios?"In Safari, tap the Share button (the square with an up-arrow), scroll down, then tap Add to Home Screen.":"Tap the ⋮ menu (top-right), then Add to Home screen or Install app.";d.appendChild(p1);
    var p2=document.createElement("p");p2.textContent="It then opens like a real app and keeps working at sea and in port, even with no internet.";d.appendChild(p2);
    var row=document.createElement("div");row.className="inst-row";
    function close(){try{localStorage.setItem("itw-install-seen","1");}catch(e){}bg.remove();d.remove();document.removeEventListener("keydown",esc1);if(prev&&prev.focus)prev.focus();}
    function esc1(e){if(e.key==="Escape")close();}
    if(_bip){var ib=document.createElement("button");ib.type="button";ib.className="inst-go";ib.textContent="Install now";ib.addEventListener("click",function(){_bip.prompt();_bip=null;close();});row.appendChild(ib);}
    var ok=document.createElement("button");ok.type="button";ok.className="inst-ok";ok.textContent="Got it";ok.addEventListener("click",close);row.appendChild(ok);d.appendChild(row);
    bg.addEventListener("click",close);document.body.appendChild(bg);document.body.appendChild(d);document.addEventListener("keydown",esc1);(row.firstChild||ok).focus();},2500);}
// ---- Journal: private, per voyage, kept only on this phone (plan: admin/claude/plans/voyage-journal.md) ----
// IndexedDB, keyed by voyage slug, day and (optionally) whose entry. Nothing is sent anywhere. Every
// piece of text a traveler typed reaches the page through .value / textContent, never HTML strings.
var JDB=null,JNAME="";
function jKey(day,who){return (V.slug||"voyage")+"|"+day+"|"+(who||"");}
function jOpen(){if(JDB)return Promise.resolve(JDB);return new Promise(function(res,rej){if(!window.indexedDB)return rej(new Error("no indexedDB"));var r=indexedDB.open("itw-journal",1);r.onupgradeneeded=function(){r.result.createObjectStore("entries",{keyPath:"k"});};r.onsuccess=function(){JDB=r.result;res(JDB);};r.onerror=function(){rej(r.error);};});}
function jAll(){return jOpen().then(function(db){return new Promise(function(res,rej){var out=[],pre=(V.slug||"voyage")+"|";var c=db.transaction("entries").objectStore("entries").openCursor();c.onsuccess=function(){var cur=c.result;if(cur){if(String(cur.key).indexOf(pre)===0)out.push(cur.value);cur.continue();}else res(out);};c.onerror=function(){rej(c.error);};});});}
function jPut(e){return jOpen().then(function(db){return new Promise(function(res,rej){var t=db.transaction("entries","readwrite");t.objectStore("entries").put(e);t.oncomplete=function(){res();};t.onerror=function(){rej(t.error);};});});}
function jSet(k,v){try{localStorage.setItem("itw-journal:"+(V.slug||"")+":"+k,v);}catch(e){}}
function jGet(k){try{return localStorage.getItem("itw-journal:"+(V.slug||"")+":"+k);}catch(e){return null;}}
function jPersist(){try{if(navigator.storage&&navigator.storage.persist)navigator.storage.persist();}catch(e){}}
function jIsIOS(){return /iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);}
function jEl(tag,cls,text){var e=document.createElement(tag);if(cls)e.className=cls;if(text!=null)e.textContent=text;return e;}
function jWhose(){return jGet("whose")==="1";}
function jNames(){try{return JSON.parse(jGet("names")||"[]").filter(function(x){return typeof x==="string"&&x;});}catch(e){return [];}}
function jEsc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
// jClean strips control and invisible/bidi characters from UNTRUSTED imported text — a loaded journal
// file could come from anywhere. Keeps tab, newline and carriage return; everything a reader can see
// stays, emoji included. Applied to imported data only, never to the traveler's own typing. This is
// defence in depth: rendering is already textContent/textarea.value and the keepsake escapes via jEsc,
// so imported text cannot execute; jClean keeps a hostile file from smuggling invisible content in.
function jClean(s){var re=new RegExp("[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F-\\u009F\\u200B-\\u200F\\u2028\\u2029\\u202A-\\u202E\\uFEFF]","g");return String(s==null?"":s).replace(re,"");}
function jDownload(name,type,body){var blob=new Blob([body],{type:type});var file=null;try{file=new File([blob],name,{type:type});}catch(e){}
  if(file&&navigator.canShare&&navigator.canShare({files:[file]})){navigator.share({files:[file],title:name}).catch(function(){});return;}
  var a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},1500);}
// The keepsake is a standalone HTML file the traveler opens later; every value in it goes through jEsc,
// which escapes & < > " and ' (class K: the full escaper, never a partial one).
function jKeepsake(entries,who){var title=(V.ship||"Voyage")+" journal"+(who?" · "+who:"");var h='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>'+jEsc(title)+'</title><style>body{font:17px/1.6 Georgia,serif;max-width:680px;margin:32px auto;padding:0 16px;color:#1b2a33}h1{font-size:26px}h2{font-size:19px;margin-top:28px;border-bottom:1px solid #ccd}.who{color:#557;font-style:italic}p{white-space:pre-wrap}</style></head><body><h1>'+jEsc(title)+'</h1><p>'+jEsc(V.dateRange||"")+'</p>';
  ITIN.forEach(function(s){var es=entries.filter(function(e){return e.day===s.d&&e.text&&e.text.trim()&&(!who||e.person===who);});if(!es.length)return;h+='<h2>Day '+jEsc(s.d)+' · '+jEsc(s.loc)+'</h2>';es.forEach(function(e){if(e.person)h+='<p class="who">'+jEsc(e.person)+'</p>';h+='<p>'+jEsc(e.text)+'</p>';});});
  return h+'<p style="margin-top:40px;color:#889">Saved from the In the Wake voyage companion. Soli Deo Gloria.</p></body></html>';}
function renderJournal(){var el=document.getElementById("pane-journal");if(!el)return;el.textContent="";
  var intro=jEl("div","ov-card j-privacy");intro.appendChild(jEl("b",null,"🔒 Your journal is private"));
  intro.appendChild(jEl("p",null,"It lives only on this phone. We never see it, and it is never sent anywhere."));
  var warn=jEl("p","j-warn");warn.appendChild(jEl("strong",null,"That also means: if you delete this app, your journal is deleted with it. If you lose this phone, your journal is gone too."));warn.appendChild(document.createTextNode(" Tap Save a copy to keep it safe."));intro.appendChild(warn);
  if(jIsIOS())intro.appendChild(jEl("p","j-ios","On iPhone: the app on your home screen keeps its own storage, separate from Safari. Anything you write in Safari before adding the app to your home screen will not show up in the app. Add the app to your home screen first, then write in it there."));
  el.appendChild(intro);
  var bar=jEl("div","j-bar");var save=jEl("button","j-btn","Save a copy");save.type="button";var load=jEl("button","j-btn j-btn2","Load a copy");load.type="button";var file=document.createElement("input");file.type="file";file.accept="application/json,.json";file.hidden=true;file.setAttribute("aria-label","Choose a saved journal file");
  bar.appendChild(save);bar.appendChild(load);bar.appendChild(file);el.appendChild(bar);
  var status=jEl("p","j-status");status.setAttribute("role","status");status.setAttribute("aria-live","polite");el.appendChild(status);
  var last=ITIN.length?ITIN[ITIN.length-1].date:"";if(last&&todayISO()>=last)el.appendChild(jEl("p","j-remind","Your cruise ends today. Save a copy of your journal before you leave the ship."));
  if(jWhose()){var whoWrap=jEl("div","j-who");var lab=jEl("label",null,"Writing as ");var sel=document.createElement("select");sel.id="j-who-sel";lab.htmlFor="j-who-sel";var names=jNames();if(!JNAME||names.indexOf(JNAME)<0)JNAME=names[0]||"";
    names.forEach(function(n){var o=document.createElement("option");o.value=n;o.textContent=n;if(n===JNAME)o.selected=true;sel.appendChild(o);});var add=document.createElement("option");add.value="__add";add.textContent="Add a name…";sel.appendChild(add);if(!names.length)add.selected=true;
    sel.addEventListener("change",function(){if(sel.value==="__add"){var n=(window.prompt("Whose entries are these? Type a first name.")||"").trim().slice(0,40);if(n){var ns=jNames(),first=!ns.length;if(ns.indexOf(n)<0)ns.push(n);jSet("names",JSON.stringify(ns));JNAME=n;
      // The first name added takes the entries already written without one, so turning names on never hides them.
      if(first){jAll().then(function(all){return Promise.all(all.filter(function(e){return !e.person&&e.text;}).map(function(e){var k2=jKey(e.day,n);if(all.some(function(x){return x.k===k2;}))return null;return jPut({k:k2,slug:e.slug,day:e.day,person:n,text:e.text,updated:e.updated});}));}).then(renderJournal,renderJournal);return;}}renderJournal();return;}JNAME=sel.value;renderJournal();});
    whoWrap.appendChild(lab);whoWrap.appendChild(sel);el.appendChild(whoWrap);if(!JNAME)el.appendChild(jEl("p","j-status","Choose “Add a name…” to start writing."));}
  var list=jEl("div","j-days");el.appendChild(list);
  var settings=document.createElement("details");settings.className="ov-card j-set";settings.appendChild(jEl("summary",null,"⚙ Journal settings"));
  var wl=jEl("label","j-toggle");var wc=document.createElement("input");wc.type="checkbox";wc.checked=jWhose();wl.appendChild(wc);wl.appendChild(document.createTextNode(" Whose entry: put a name on each entry, for two people sharing one phone"));settings.appendChild(wl);
  wc.addEventListener("change",function(){jSet("whose",wc.checked?"1":"0");renderJournal();var d=document.querySelector("#pane-journal .j-set");if(d)d.open=true;});
  var cb=jEl("p","j-soon");var cbi=document.createElement("input");cbi.type="checkbox";cbi.disabled=true;cbi.id="j-cloud";var cbl=jEl("label",null," Cloud backup: coming soon. Your journal is not backed up anywhere yet.");cbl.htmlFor="j-cloud";cb.appendChild(cbi);cb.appendChild(cbl);settings.appendChild(cb);el.appendChild(settings);
  var soon=document.createElement("details");soon.className="ov-card j-coming";soon.appendChild(jEl("summary",null,"✨ Coming soon"));
  [["Photos in your journal","Add pictures to each day, sized to fit on your phone."],["Cloud backup, per trip","An optional paid backup, so a lost phone no longer means a lost journal."],["Your favorite photos, printed and delivered","Pick the ones you love and have them printed and sent to your home."]].forEach(function(x){var p=jEl("p",null);p.appendChild(jEl("strong",null,x[0]+". "));p.appendChild(document.createTextNode(x[1]+" Coming soon."));soon.appendChild(p);});
  el.appendChild(soon);
  jAll().then(function(all){var by={};all.forEach(function(e){by[e.k]=e;});
    ITIN.forEach(function(s,idx){var row=document.createElement("details");row.className="voy-row j-day";if(idx===0||s.date===todayISO())row.open=true;var sum=jEl("summary","voy-sum");sum.appendChild(jEl("span","dnum","DAY "+s.d+" · "+voyDate(s.date)));sum.appendChild(jEl("span","dloc",s.loc));row.appendChild(sum);
      var body=jEl("div","voy-body");var person=jWhose()?JNAME:"";var k=jKey(s.d,person);var ta=document.createElement("textarea");ta.className="j-text";ta.rows=6;ta.id="j-"+s.d;var tl=jEl("label","sr-only","Day "+s.d+" journal entry");tl.htmlFor=ta.id;ta.placeholder="Best thing I ate…  Someone we met…  What I want to remember…";ta.value=(by[k]&&by[k].text)||"";ta.disabled=jWhose()&&!JNAME;
      var saved=jEl("span","j-saved","");saved.setAttribute("aria-live","polite");var timer=null;ta.addEventListener("input",function(){clearTimeout(timer);saved.textContent="saving…";timer=setTimeout(function(){jPersist();jPut({k:k,slug:V.slug,day:s.d,person:person,text:ta.value,updated:new Date().toISOString()}).then(function(){saved.textContent="saved on this phone";}).catch(function(){saved.textContent="couldn't save: this browser is blocking storage";});},400);});
      body.appendChild(tl);body.appendChild(ta);body.appendChild(saved);row.appendChild(body);list.appendChild(row);});
  }).catch(function(){list.appendChild(jEl("p","j-warn","This browser won't let the app save a journal here (a private window, or storage turned off). Nothing you type can be kept."));});
  save.addEventListener("click",function(){jAll().then(function(all){var who=(jWhose()&&JNAME&&jNames().length>1&&!window.confirm("Save everyone's entries? Choose Cancel to save only "+JNAME+"'s."))?JNAME:"";
    var slug=(V.slug||"voyage");jDownload(slug+"-journal"+(who?"-"+who.replace(/[^A-Za-z0-9]+/g,"-"):"")+".html","text/html",jKeepsake(all,who));
    setTimeout(function(){jDownload(slug+"-journal-data.json","application/json",JSON.stringify({app:"itw-journal",v:1,slug:slug,ship:V.ship||"",saved:new Date().toISOString(),entries:all.filter(function(e){return !who||e.person===who;}).map(function(e){return {day:e.day,person:e.person||"",text:e.text||"",updated:e.updated||""};})},null,1));},600);
    status.textContent="Saved two files: a keepsake you can open and print, and a data copy you can load into the app on another phone.";}).catch(function(){status.textContent="Couldn't read the journal to save it.";});});
  load.addEventListener("click",function(){file.click();});
  file.addEventListener("change",function(){var f=file.files&&file.files[0];if(!f){return;}
    // A journal data copy is tiny (days × people). Anything over 5 MB is not one, and reading it would
    // just be a way to hang the phone, so refuse before parsing.
    if(f.size>5*1024*1024){status.textContent="That file is too large to be a journal data copy.";file.value="";return;}
    var rd=new FileReader();rd.onload=function(){var d=null;try{d=JSON.parse(String(rd.result));}catch(e){}
    if(!d||typeof d!=="object"||d.app!=="itw-journal"||!Array.isArray(d.entries)){status.textContent="That file isn't a saved journal data copy (its name ends in -journal-data.json).";file.value="";return;}
    if(d.slug&&V.slug&&d.slug!==V.slug&&!window.confirm("This journal was saved from a different voyage. Load it into this one anyway?")){file.value="";return;}
    // Cap the rows a single file can add. A real trip has at most days × people entries; a file with
    // thousands is malformed or hostile, and processing it unbounded would exhaust this phone's storage.
    var MAXE=2000,rows=d.entries.slice(0,MAXE),truncated=d.entries.length>MAXE;
    jAll().then(function(all){var by={};all.forEach(function(e){by[e.k]=e;});var n=0,ps=[];rows.forEach(function(e){if(!e||typeof e!=="object")return;var day=Number(e.day);if(!ITIN.some(function(s){return s.d===day;}))return;var person=jClean(String(e.person||"")).slice(0,40),text=jClean(String(e.text||"")).slice(0,20000),k=jKey(day,person),cur=by[k];
      if(cur&&cur.updated&&e.updated&&cur.updated>=e.updated)return;n++;ps.push(jPut({k:k,slug:V.slug,day:day,person:person,text:text,updated:String(e.updated||new Date().toISOString()).slice(0,40)}));if(person){var ns=jNames();if(ns.indexOf(person)<0&&ns.length<50){ns.push(person);jSet("names",JSON.stringify(ns));}}});
      Promise.all(ps).then(function(){renderJournal();var s2=document.querySelector("#pane-journal .j-status");if(s2)s2.textContent=(n?("Loaded "+n+" entr"+(n===1?"y":"ies")+". Newer entries already on this phone were kept."):"Nothing new to load: this phone already has those entries.")+(truncated?" The file held more than "+MAXE+" entries; the rest were skipped.":"");});});file.value="";};rd.readAsText(f);});
}
// ---- FAQ: the questions people ask once they're booked, per voyage (V.faq). Each answer names its
// source. Built with DOM calls; links must be site-relative or https.
function faqHref(h){h=String(h||"");return /^(https:\/\/|\/)/.test(h)?h:"";}
function renderFaq(){var el=document.getElementById("pane-faq");if(!el||el.getAttribute("data-filled"))return;el.textContent="";
  el.appendChild(jEl("p","al-intro","Questions people ask once they're aboard. Tap a question to open it. Every answer says where it comes from."));
  (V.faq||[]).forEach(function(f,i){var d=document.createElement("details");d.className="voy-row faq-q";if(i===0)d.open=true;var sm=jEl("summary","voy-sum");sm.appendChild(jEl("span","dloc faq-t",f.q));d.appendChild(sm);
    var b=jEl("div","voy-body");(f.a||[]).forEach(function(par){b.appendChild(jEl("p",null,par));});
    if(f.links&&f.links.length){var ul=jEl("ul","faq-links");f.links.forEach(function(l){var h=faqHref(l.href);if(!h)return;var li=document.createElement("li");var a=jEl("a",null,l.t);a.href=h;if(/^https:/.test(h)){a.target="_blank";a.rel="noopener noreferrer";a.appendChild(jEl("span","sr-only"," (opens in a new window)"));}li.appendChild(a);ul.appendChild(li);});b.appendChild(ul);}
    if(f.source)b.appendChild(jEl("p","faq-src","Source: "+f.source));
    d.appendChild(b);el.appendChild(d);});
  el.setAttribute("data-filled","1");}
initFs();buildSel();renderOverview();blankify(document.body);spotBar();loadAlerts();loadVoyageAlerts();maybeInstallPopup();prefetchGuide();bindSearch();setInterval(function(){if(tab==="now")loadNow();loadAlerts();},600000);
// Usage: one open event now, one session summary when the sitting ends, one install event ever.
(function(){var w=voyWhen(),standalone=false;try{standalone=!!(window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||window.navigator.standalone===true;}catch(e){}
usage("vp_pwa_open",{standalone:standalone,offline:!(navigator.onLine!==false),phase:w.phase,day:w.day});
document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")usageSession();});
window.addEventListener("pagehide",usageSession);
window.addEventListener("appinstalled",function(){usage("vp_pwa_install");});})();

})();
