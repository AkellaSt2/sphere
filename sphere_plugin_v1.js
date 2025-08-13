/*!
 * Sphere v1.0 — Lampa plugin
 * Adds Sphere source in menu with Quick Import from GitHub JSON
 * 2025-08-13
 */
(function(){
  'use strict';

  const ID = 'sphere_v1';
  const TITLE = 'Sphere';
  const PREF_KEY = 'sphere_v1_prefs';
  const MENU_COLOR = '#1a1a1a';
  const TEST_JSON_URL = 'https://raw.githubusercontent.com/AkellaSt2/sphere/main/sphere_sources.json';

  const Storage = (window.Lampa && Lampa.Storage) ? Lampa.Storage : {
    get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch(e){ return d; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch(e){} }
  };
  const Noty = (window.Lampa && Lampa.Noty) ? Lampa.Noty.show.bind(Lampa.Noty) : (msg)=>console.log('[Sphere]', msg);

  function readPrefs(){
    return Object.assign({
      enabled: true,
      extended_enabled: false,
      extended_catalog: []
    }, Storage.get(PREF_KEY, {}));
  }
  function writePrefs(p){ Storage.set(PREF_KEY, p); }
  const prefs = readPrefs();

  function fetchJSON(url,opt={}){ return fetch(url,opt).then(r=>{ if(!r.ok) throw new Error(r.status); return r.json(); }); }

  function ensureMenuSource(){
    if(!Lampa || !Lampa.Source) return false;
    const src = {
      title: TITLE, type: 'online', background: MENU_COLOR,
      search: async (q, cb, done)=>{ cb([]); done(); },
      details: async (m, cb)=>cb(m),
      play: async (m, cb)=>cb([])
    };
    Lampa.Source.add(ID, src);
    if(Lampa.Menu && Lampa.Menu.update) Lampa.Menu.update();
    console.log('[Sphere] Source registered');
    return true;
  }

  function importFromJSON(url){
    fetchJSON(url).then(arr=>{
      if(Array.isArray(arr)){ prefs.extended_catalog = arr; writePrefs(prefs); Noty('Sources updated'); }
      else Noty('Invalid JSON format');
    }).catch(e=>Noty('Import error: '+e));
  }

  function registerSettings(){
    if(!Lampa || !Lampa.Settings) return;
    const section = {
      title: TITLE,
      items: [
        {title:'Enable Sphere', value:prefs.enabled?'Yes':'No', onClick(){ prefs.enabled=!prefs.enabled; this.value=prefs.enabled?'Yes':'No'; writePrefs(prefs);} },
        {title:'Quick Import', subtitle:'Load default source list', value:'Import', onClick(){ importFromJSON(TEST_JSON_URL); }},
      ]
    };
    Lampa.Settings.add(section);
  }

  function delayedInit(){
    if(!prefs.enabled) return;
    let tries = 0;
    const timer = setInterval(()=>{
      tries++;
      if(ensureMenuSource()){
        registerSettings();
        clearInterval(timer);
        console.log('[Sphere] Initialized');
      }
      if(tries > 40) clearInterval(timer);
    }, 500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', delayedInit);
  else delayedInit();

})();
