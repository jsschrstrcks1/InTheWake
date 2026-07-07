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
   +'<span class="brand">◢ IN THE WAKE</span><span class="brand-sub">// '+esc(V.brandSub||"")+'</span>'
   +'<select id="wloc" aria-label="Choose a tracked location"></select>'
   +'<button id="wx-unit" class="unitbtn" type="button" aria-label="Toggle temperature units between Fahrenheit and Celsius">°F</button>'
   +'</header>'
   +'<div class="dgr" id="dgr" role="alert" aria-live="assertive" aria-atomic="true"></div>'
   +'<nav class="wtabs" role="tablist" aria-label="Voyage views">'
   +'<button class="wtab on" data-t="overview" role="tab" aria-selected="true" type="button">Overview</button>'
   +'<button class="wtab" data-t="voyage" role="tab" aria-selected="false" type="button">Voyage</button>'
   +'<button class="wtab" data-t="averages" role="tab" aria-selected="false" type="button">Averages</button>'
   +'<button class="wtab" data-t="now" role="tab" aria-selected="false" type="button">Now</button>'
   +'<button class="wtab" data-t="ten" role="tab" aria-selected="false" type="button">10-Day</button>'
   +'<button class="wtab" data-t="radar" role="tab" aria-selected="false" type="button">Radar</button>'
   +'<button class="wtab" data-t="future" role="tab" aria-selected="false" type="button">Futurecast</button>'
   +'<button class="wtab" data-t="alerts" role="tab" aria-selected="false" type="button">Alerts</button>'
   +'</nav>'
   +'<main id="content">'
   +'<div class="wpane on" id="pane-overview"><span class="muted">loading…</span></div>'
   +'<div class="wpane" id="pane-voyage">'
     +'<div class="voyhdr">'
       +'<span class="vt" id="voy-status">'+esc(V.statusInit||(V.ship||"")+" · "+(V.dateRange||""))+'</span>'
       +(V.trackUrl?'<a class="voy-track" href="'+attr(V.trackUrl)+'" target="_blank" rel="noopener noreferrer">'+esc(V.trackLabel||"◢ Track live ↗")+'</a>':'')
     +'</div>'
     +'<div id="voy-list"><span class="muted">loading voyage…</span></div>'
     +'<p class="voy-note">'+esc(V.note||"")+'</p>'
   +'</div>'
   +'<div class="wpane" id="pane-averages"><span class="muted">loading averages…</span></div>'
   +'<div class="wpane" id="pane-now"><span class="muted">loading…</span></div>'
   +'<div class="wpane" id="pane-10day"><span class="muted">loading 10-day forecast…</span></div>'
   +'<div class="wpane" id="pane-map"><div id="map" role="img" aria-label="Precipitation radar map of the tracked locations"></div><div class="maprow"><button class="mapbtn" id="mr-play" type="button">⏸ PAUSE</button><button class="mapbtn" id="mr-fit" type="button">⊡ FIT ALL</button><span class="frame-t" id="mr-time"></span><span class="frame-t" id="mr-mode"></span></div></div>'
   +'<div class="wpane" id="pane-future"><span class="muted">loading precipitation outlook…</span></div>'
   +'<div class="wpane" id="pane-alerts"><span class="muted">loading alerts…</span></div>'
   +'</main>'
   +'<div id="a11y-status" role="status" aria-live="polite" class="sr-only"></div>'
   +'<footer class="wfoot" role="contentinfo"><div class="disc">'+esc(V.footerDisc||"Planning aid only — forecasts and radar can and do change; always confirm conditions locally. No tracking, no ads, not a financial product.")+'</div></footer>'
   +'<div class="sdg">Soli Deo Gloria</div>';
}

function vT(f){return uTemp()==="celsius"?Math.round((f-32)*5/9):Math.round(f);}
function todayISO(){var d=new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2);}
function voyDate(iso){var dt=new Date(iso+"T12:00"),mo=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"][dt.getMonth()],wd=["SUN","MON","TUE","WED","THU","FRI","SAT"][dt.getDay()];return wd+" "+mo+" "+dt.getDate();}
function voyStatus(){var t=todayISO(),first=ITIN[0].date,last=ITIN[ITIN.length-1].date,i,ship=V.ship||"This voyage";if(t<first){var days=Math.round((new Date(first+"T12:00")-new Date(t+"T12:00"))/86400000);return ship+" · departs "+(V.embarkPort||"port")+" in "+days+" day"+(days===1?"":"s")+(V.firstDateParen?" ("+V.firstDateParen+")":"")+".";}if(t>last)return ship+" · voyage complete. Soli Deo Gloria.";for(i=0;i<ITIN.length;i++){if(ITIN[i].date===t)return ship+" · Day "+ITIN[i].d+" — "+ITIN[i].loc+" (today).";}return ship+" · "+(V.dateRange||"")+".";}
function seasonLabel(){return V.seasonLabel||"Typical";}
function fetchVoyWx(s){var u="https://api.open-meteo.com/v1/forecast?latitude="+s.lat+"&longitude="+s.lon+"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit="+uTemp()+"&timezone=auto&start_date="+s.date+"&end_date="+s.date;retryJSON(u,1).then(function(j){if(!j||!j.daily||!j.daily.time||!j.daily.time.length)return;var d=j.daily,hi=d.temperature_2m_max[0],lo=d.temperature_2m_min[0];if(hi==null||lo==null)return;var el=document.getElementById("voy-wx-"+s.d);if(!el)return;var code=(d.weather_code&&d.weather_code[0]!=null)?(WMO[d.weather_code[0]]||""):"";var pp=(d.precipitation_probability_max&&d.precipitation_probability_max[0]!=null)?d.precipitation_probability_max[0]+"% rain":"";el.innerHTML=seasonLabel()+": "+vT(s.wx.hi)+"° / "+vT(s.wx.lo)+"° · "+esc(s.wx.txt)+'<br><span class="fc">Forecast '+voyDate(s.date)+": "+Math.round(hi)+"° / "+Math.round(lo)+"°"+(code?" · "+esc(code):"")+(pp?" · "+pp:"")+"</span>";});}
function renderOverview(){var el=document.getElementById("pane-overview");if(!el)return;var h='';
  if(V.flyer)h+='<img class="ov-flyer" src="'+attr(V.flyer)+'" alt="'+attr((V.ship||"This")+" hosted group cruise flyer")+'" loading="lazy" decoding="async">';
  h+='<div class="voy-cta-wrap">';
  if(V.pdfFull)h+='<a class="voy-cta" href="'+attr(V.pdfFull)+'" target="_blank" rel="noopener noreferrer">📖 '+esc(V.pdfFullLabel||"Open the full Voyage Pack (PDF)")+' →</a>';
  if(V.pdfCondensed)h+='<a class="voy-cta-sec" href="'+attr(V.pdfCondensed)+'" target="_blank" rel="noopener noreferrer">or the condensed quick-reference version (PDF) →</a>';
  h+='</div>';
  h+='<div class="ov-card"><b>'+esc((V.ship||"Your voyage")+" · "+(V.dateRange||""))+'</b>';
  if(V.overview)h+='<p>'+esc(V.overview)+'</p>';
  if(V.host)h+='<p class="ov-host">Hosted by '+esc(V.host)+'</p>';
  h+='<p>This is your offline travel companion for the sailing — the day-by-day itinerary, destination weather averages, and live forecasts as you get close, all in one place. Save it to your phone and it keeps working at sea and in port, with no signal.</p></div>';
  h+='<div class="ov-card"><b>📲 Save this app to your phone</b>'
    +'<p class="ov-step"><strong>iPhone / iPad (Safari):</strong> tap the <strong>Share</strong> button (the square with an up-arrow at the bottom), scroll down, then tap <strong>Add to Home Screen</strong>.</p>'
    +'<p class="ov-step"><strong>Android (Chrome):</strong> tap the <strong>⋮</strong> menu (top-right), then <strong>Add to Home screen</strong> (or <strong>Install app</strong>).</p>'
    +'<p class="ov-step">It opens full-screen like a real app and works offline once loaded — handy where the ship or port has no signal.</p></div>';
  h+='<div class="ov-card"><b>🌊 Sailing solo?</b>'
    +'<p>These are hosted group cruises built for solo travelers — come solo, leave with friends.</p>'
    +'<a class="ov-link" href="https://maulsbytravel.com/hosted-group-cruises-for-solos/" target="_blank" rel="noopener noreferrer">See all hosted group cruises for solo travelers →</a></div>';
  el.innerHTML=h;}
function renderAverages(){var el=document.getElementById("pane-averages");if(!el)return;var h='<div class="fc-head">Destination weather averages · '+esc(V.seasonLabel||"typical")+'</div>';
  ITIN.forEach(function(s){h+='<div class="avg-row"><span class="avg-date">'+voyDate(s.date)+'</span><span class="avg-loc">'+esc(s.loc)+'</span><span class="avg-temp">'+vT(s.wx.hi)+'° / <span class="lo">'+vT(s.wx.lo)+'°</span></span><span class="avg-txt">'+esc(s.wx.txt)+'</span></div>';});
  h+='<p class="voy-note">Typical seasonal averages for your dates — not a forecast. A real forecast appears on the Now and 10-Day tabs once a date falls within about 16 days. Tap °F / °C (top right) to switch units.</p>';
  el.innerHTML=h;}
function renderVoyage(){var el=document.getElementById("voy-list");if(!el)return;var st=document.getElementById("voy-status");if(st)st.textContent=voyStatus();var t=todayISO(),html="";ITIN.forEach(function(s){var today=(s.date===t),badge=s.type==="port"?'<span class="dbadge b-port">Port</span>':(s.type==="scenic"?'<span class="dbadge b-scenic">Scenic</span>':'<span class="dbadge">Sea</span>');html+='<details class="voy-row'+(today?" voy-today":"")+'" id="voy-'+s.d+'"'+(today?" open":"")+'><summary class="voy-sum"><span class="dnum">DAY '+s.d+" · "+voyDate(s.date)+'</span><span class="dloc">'+esc(s.loc)+"</span>"+badge+(today?'<span class="dnow">Today</span>':"")+'</summary><div class="voy-body"><p class="voy-pos">◢ '+esc(s.pos)+'</p>'+(s.dock?'<p class="voy-dock">⚓ '+esc(s.dock)+'</p>':"")+'<p class="voy-wx" id="voy-wx-'+s.d+'">'+seasonLabel()+": "+vT(s.wx.hi)+"° / "+vT(s.wx.lo)+"° · "+esc(s.wx.txt)+'</p>'+(s.booked&&s.booked.length?'<div class="voy-booked"><b>◆ Booked</b><ul>'+s.booked.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ul></div>":"")+'<div class="voy-grid">';if(s.plan&&s.plan.length)html+='<div class="voy-sec"><b>Plan</b><ul>'+s.plan.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ul></div>";if(s.hist)html+='<div class="voy-sec"><b>History</b><p>'+esc(s.hist)+"</p></div>";if(s.poi&&s.poi.length)html+='<div class="voy-sec"><b>Points of Interest</b><ul>'+s.poi.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ul></div>";html+="</div></div></details>";});el.innerHTML=html;ITIN.forEach(function(s){fetchVoyWx(s);});}
function lsG(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function lsS(k,v){try{localStorage.setItem(k,v);}catch(e){}}
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
if(ROUTE&&ROUTE.length){L.polyline(ROUTE,{color:"#2ee6ff",weight:5,opacity:0.10,lineJoin:"round"}).addTo(map);L.polyline(ROUTE,{color:"#2ee6ff",weight:1.6,opacity:0.6,dashArray:"6 7",lineJoin:"round"}).addTo(map);}
var t=todayISO();ITIN.forEach(function(s){var c=(s.mlat!=null)?[s.mlat,s.mlon]:[s.lat,s.lon],today=(s.date===t);if(today)L.circleMarker(c,{radius:11,color:"#eafcff",weight:2,fillColor:"#2ee6ff",fillOpacity:0.30}).addTo(map);L.circleMarker(c,{radius:today?7:5.5,color:"#0a0a0a",weight:1.4,fillColor:today?"#2ee6ff":"#f0c87a",fillOpacity:0.95}).addTo(map).bindTooltip("Day "+s.d+" · "+voyDate(s.date)+" — "+esc(s.loc)+(today?" (today)":""),{direction:"top",className:"wx-tip",offset:[0,-4]});L.marker(c,{icon:L.divIcon({className:"wx-dnum",html:String(s.d),iconSize:[16,16],iconAnchor:[8,8]}),interactive:false,keyboard:false}).addTo(map);});
}catch(e){}}
function ensureMap(){if(map)return;var mc=V.mapCenter||[LOCS.length?LOCS[0].lat:0,LOCS.length?LOCS[0].lon:0,4];map=L.map("map",{zoomControl:true,attributionControl:false}).setView([mc[0],mc[1]],mc[2]||4);L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",{subdomains:"abcd",maxZoom:12}).addTo(map);drawRoute();}
function curWx(p){var key=p.lat.toFixed(3)+","+p.lon.toFixed(3),c=wxCur[key];if(c&&(Date.now()-c.ts)<600000)return Promise.resolve(c);return retryJSON("https://api.open-meteo.com/v1/forecast?latitude="+p.lat+"&longitude="+p.lon+"&current=temperature_2m,weather_code,wind_speed_10m&daily=precipitation_probability_max&forecast_days=1&temperature_unit="+uTemp()+"&wind_speed_unit="+uWind()+"&timezone=auto",2).then(function(j){if(!j||!j.current)return null;var pp=(j.daily&&j.daily.precipitation_probability_max&&j.daily.precipitation_probability_max.length)?j.daily.precipitation_probability_max[0]:null;var o={t:j.current.temperature_2m,code:j.current.weather_code,wind:j.current.wind_speed_10m,pop:pp,ts:Date.now()};wxCur[key]=o;return o;});}
function tipHtml(p,c){var h='<b>'+esc(p.label)+'</b>';if(c)h+='<br><span class="tw">'+Math.round(c.t)+'° '+esc(WMO[c.code]||"")+(c.wind!=null?' · '+Math.round(c.wind)+' '+uWindLab():'')+(c.pop!=null?' · '+c.pop+'% rain':'')+'</span>';else h+='<br><span class="tw">loading…</span>';return h;}
function buildMarkers(){if(!map)return;markers.forEach(function(m){map.removeLayer(m);});markers=[];var ci=selIdx();LOCS.forEach(function(p,i){var on=(i===ci);var m=L.circleMarker([p.lat,p.lon],{radius:on?8:6,color:on?"#ffffff":"#021018",weight:2,fillColor:"#2ee6ff",fillOpacity:0.95}).addTo(map);m.bindTooltip(tipHtml(p,wxCur[p.lat.toFixed(3)+","+p.lon.toFixed(3)]),{direction:"top",className:"wx-tip",offset:[0,-5]});m.on("click",function(){lsS("itw:sel",p.label);refresh();});markers.push(m);curWx(p).then(function(c){if(c)m.setTooltipContent(tipHtml(p,c));});});}
function fitAll(){if(!map||!markers.length)return;try{map.fitBounds(L.featureGroup(markers).getBounds().pad(0.15),{maxZoom:9});}catch(e){}}
function showMap(){if(typeof L==="undefined")return setTimeout(showMap,200);ensureMap();var p=selLoc();if(p)map.setView([p.lat,p.lon],map.getZoom()||6);setTimeout(function(){map.invalidateSize();},60);buildMarkers();if(rv)buildFrames();else retryJSON("https://api.rainviewer.com/public/weather-maps.json",2).then(function(j){rv=j;buildFrames();});var mm=document.getElementById("mr-mode");if(mm)mm.textContent=(mode==="nowcast")?"FUTURECAST (predicted)":"RADAR (past 2h)";}
function clearLayers(){layers.forEach(function(l){if(l)map.removeLayer(l);});layers=[];}
function frameLayer(i){if(!layers[i]&&frames[i]){var l=L.tileLayer(rv.host+frames[i].path+"/256/{z}/{x}/{y}/4/1_1.png",{opacity:0,maxZoom:12,updateWhenIdle:true,keepBuffer:8,className:"rv-layer"});l._ready=false;l.on("load",function(){if(!l._ready){l._ready=true;rvLoaded++;}if(lastShown<0)showFrame(fi);});layers[i]=l.addTo(map);}return layers[i];}
function buildFrames(){if(!map)return;clearLayers();stop();if(!rv||!rv.radar)return;var set=(mode==="nowcast")?(rv.radar.nowcast||[]):(rv.radar.past||[]);frames=set;if(!frames.length)return;layers=new Array(frames.length);rvLoaded=0;lastShown=-1;fi=0;var t=document.getElementById("mr-time");if(t)t.textContent="loading radar…";for(var k=0;k<frames.length;k++){frameLayer(k);}play();}
function showFrame(i){var cur=layers[i];if(!cur||!cur._ready)return;for(var k=0;k<layers.length;k++){if(layers[k]&&k!==i)layers[k].setOpacity(0);}cur.setOpacity(0.72);lastShown=i;var f=frames[i],t=document.getElementById("mr-time");if(t&&f)t.textContent=(mode==="nowcast"?"+ ":"")+new Date(f.time*1000).toLocaleTimeString();}
function play(){stop();if(!frames.length)return;showFrame(fi);anim=setInterval(function(){fi=(fi+1)%frames.length;showFrame(fi);},700);var b=document.getElementById("mr-play");if(b)b.textContent="⏸ PAUSE";}
function stop(){if(anim){clearInterval(anim);anim=null;}}
function togglePlay(){if(anim){stop();var b=document.getElementById("mr-play");if(b)b.textContent="▶ PLAY";}else play();}
function sevRank(s){return {Extreme:4,Severe:3,Moderate:2,Minor:1}[s]||0;}
function loadAlerts(){var p=selLoc();if(!p)return;retryJSON("https://api.weather.gov/alerts/active?point="+p.lat+","+p.lon,2).then(function(j){renderAlerts((j&&j.features)?j.features:[],p);}).catch(function(){renderAlerts(null,p);});}
function renderAlerts(fs,p){var el=document.getElementById("pane-alerts");if(!el)return;var worst=0,top="";if(fs&&fs.length){var h="";fs.sort(function(a,b){return sevRank(b.properties.severity)-sevRank(a.properties.severity);});fs.forEach(function(f){var pr=f.properties,sv=pr.severity||"Unknown";if(sevRank(sv)>worst){worst=sevRank(sv);top=pr.event;}h+='<div class="alertc sev-'+sv+'"><div class="ev">'+esc(pr.event||"Alert")+'</div><div class="meta">'+esc(sv)+(pr.expires?" · until "+new Date(pr.expires).toLocaleString():"")+(pr.areaDesc?" · "+esc(pr.areaDesc):"")+'</div><div class="desc">'+esc(pr.headline||pr.description||"")+'</div></div>';});el.innerHTML=h;}else{el.innerHTML='<div class="alertc"><div class="ev">No active NWS alerts for '+esc(p.label)+'</div><div class="meta">'+esc(V.alertsIntl||"NWS covers the US & its coastal waters. International stops rely on the Now & 10-Day views.")+'</div></div>';}setDanger(worst>=3,top);}
function setDanger(on,ev){document.body.classList.toggle("danger",!!on);var d=document.getElementById("dgr");if(d)d.textContent=on?("⚠ ACTIVE WARNING — "+(ev||"severe weather")+" for this location. See Alerts."):"";}
function fetch10(p){return retryJSON("https://api.open-meteo.com/v1/forecast?latitude="+p.lat+"&longitude="+p.lon+"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit="+uTemp()+"&timezone=auto&forecast_days=10",2);}
function setRow10(idx,d){var row=document.getElementById("d10-"+idx);if(!row)return;var days=row.querySelector(".d10-days");if(!days)return;if(!d||!d.daily){days.innerHTML='<span class="muted">forecast unavailable</span>';return;}var dd=d.daily,h="",n=Math.min(10,dd.time.length);for(var k=0;k<n;k++){h+='<div class="wx-day"><b>'+(k===0?"TODAY":dn(dd.time[k]))+'</b><span class="d10-c">'+esc(WMO[dd.weather_code[k]]||"—")+'</span><span class="hl">'+Math.round(dd.temperature_2m_max[k])+'°</span> / <span class="lo">'+Math.round(dd.temperature_2m_min[k])+'°</span><span class="pp">'+(dd.precipitation_probability_max&&dd.precipitation_probability_max[k]!=null?dd.precipitation_probability_max[k]+'%':'')+'</span></div>';}days.innerHTML=h;}
function load10day(){var el=document.getElementById("pane-10day");if(!el)return;var html="";LOCS.forEach(function(p,idx){html+='<div class="d10-row" id="d10-'+idx+'"><div class="d10-loc">'+esc(p.label)+'</div><div class="d10-days"><span class="muted">…</span></div></div>';});el.innerHTML=html;var i=0,active=0;function pump(){while(active<4&&i<LOCS.length){(function(idx,p){active++;fetch10(p).then(function(d){setRow10(idx,d);active--;pump();}).catch(function(){setRow10(idx,null);active--;pump();});})(i,LOCS[i]);i++;}}pump();}
function fcHour(iso){var h=parseInt(iso.slice(11,13),10);var ap=h<12?"AM":"PM";var hh=h%12;if(hh===0)hh=12;return hh+" "+ap;}
function loadFuture(){var p=selLoc(),el=document.getElementById("pane-future");if(!el||!p)return;el.innerHTML='<span class="muted">loading precipitation outlook…</span>';var pu=(uTemp()==="celsius")?"mm":"inch";var u="https://api.open-meteo.com/v1/forecast?latitude="+p.lat+"&longitude="+p.lon+"&current=temperature_2m&hourly=precipitation,precipitation_probability&precipitation_unit="+pu+"&timezone=auto&forecast_days=2";retryJSON(u,2).then(function(j){if(!j||!j.hourly||!j.hourly.time){el.innerHTML='<span class="muted">forecast unavailable — try again shortly</span>';return;}var H=j.hourly,times=H.time,prob=H.precipitation_probability||[],amt=H.precipitation||[];var nowISO=(j.current&&j.current.time)||times[0];var start=0;for(var i=0;i<times.length;i++){if(times[i]>=nowISO){start=i;break;}}var N=Math.min(24,times.length-start);if(N<=0){el.innerHTML='<span class="muted">no forecast hours available</span>';return;}var bars="",total=0,peak=0,peakT="";for(var k=0;k<N;k++){var idx=start+k,pr=prob[idx]||0,am=amt[idx]||0;total+=am;if(pr>peak){peak=pr;peakT=fcHour(times[idx]);}var hh=4+Math.round(pr*0.46),wet=am>0.005;bars+='<div class="fc-bar" title="'+fcHour(times[idx])+' · '+pr+'% · '+am+(pu==="inch"?"in":"mm")+'"><span class="fc-fill'+(wet?" wet":"")+'" style="height:'+hh+'px"></span><span class="fc-h">'+((k%3===0)?fcHour(times[idx]):"")+'</span></div>';}var unit=(pu==="inch"?" in":" mm");var head="Next "+N+" h at "+esc(p.label)+": "+(Math.round(total*100)/100)+unit+" total"+(peak>0?" · peak "+peak+"% near "+peakT:" · little or no rain expected");el.innerHTML='<div class="fc-head">'+head+'</div><div class="fc-strip">'+bars+'</div><div class="fc-note">Hourly precipitation forecast (Open-Meteo) for '+esc(p.label)+'. Bars show chance of precipitation; glowing bars mark measurable amounts. Planning aid only — confirm conditions locally.</div>';}).catch(function(){el.innerHTML='<span class="muted">forecast unavailable — try again shortly</span>';});}
function setTab(t){tab=t;["overview","voyage","averages","now","ten","radar","future","alerts"].forEach(function(x){var b=document.querySelector('.wtab[data-t="'+x+'"]');if(b){b.classList.toggle("on",x===t);b.setAttribute("aria-selected",x===t?"true":"false");}});document.getElementById("pane-overview").classList.toggle("on",t==="overview");document.getElementById("pane-voyage").classList.toggle("on",t==="voyage");document.getElementById("pane-averages").classList.toggle("on",t==="averages");document.getElementById("pane-now").classList.toggle("on",t==="now");document.getElementById("pane-10day").classList.toggle("on",t==="ten");document.getElementById("pane-map").classList.toggle("on",t==="radar");var _pf=document.getElementById("pane-future");if(_pf)_pf.classList.toggle("on",t==="future");document.getElementById("pane-alerts").classList.toggle("on",t==="alerts");if(t==="overview")renderOverview();else if(t==="voyage")renderVoyage();else if(t==="averages")renderAverages();else if(t==="now")loadNow();else if(t==="ten")load10day();else if(t==="alerts")loadAlerts();else if(t==="radar"){mode="past";showMap();}else if(t==="future")loadFuture();}
function refresh(){buildSel();if(tab==="overview")renderOverview();else if(tab==="voyage")renderVoyage();else if(tab==="averages")renderAverages();else if(tab==="now")loadNow();else if(tab==="ten")load10day();else if(tab==="alerts")loadAlerts();else if(tab==="radar")showMap();else if(tab==="future")loadFuture();loadAlerts();}

// ---- Boot ---------------------------------------------------------------------
buildShell();
document.querySelectorAll(".wtab").forEach(function(b){b.onclick=function(){setTab(b.getAttribute("data-t"));};});
var pb=document.getElementById("mr-play");if(pb)pb.onclick=togglePlay;
var fb=document.getElementById("mr-fit");if(fb)fb.onclick=fitAll;
var ub=document.getElementById("wx-unit");if(ub){ub.textContent=(uTemp()==="celsius"?"°C":"°F");ub.onclick=toggleUnit;}
buildSel();renderOverview();loadAlerts();setInterval(function(){if(tab==="now")loadNow();loadAlerts();},600000);

})();
