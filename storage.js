/* Storage and backup schema. No external services. */
const Store = (() => {
  'use strict';
  const KEY = 'poker_table_tracker_v1';
  const DEFAULT_TAGS=['REG','FISH','LOOSE','TIGHT','TAG','LAG','LIMPER','TILTADO','BEBADO'];
  const DEFAULT_EMOJIS=['🧠','🐠','🤬','🍺','🦈','👴🏼','🎯','💰','🔥','❄️','🃏','👑'];
  const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const text = v => typeof v === 'string' ? v : '';
  const strings = v => Array.isArray(v) ? [...new Set(v.filter(x => typeof x === 'string' && x.trim()).map(x => x.trim()))] : [];
  const object = v => v && typeof v === 'object' && !Array.isArray(v);
  const profile = p => ({id: typeof p.id === 'number' || typeof p.id === 'string' ? String(p.id) : uid(), nick:text(p.nick).trim() || '—', emoji:text(p.emoji)||null,tags:strings(p.tags),notes:text(p.notes),rooms:strings(p.rooms),updated:Number.isFinite(p.updated)?p.updated:Date.now()});
  function normalize(raw) {
    if (!object(raw)) throw Error('Dados inválidos');
    const count = [6,8,9].includes(Number(raw.count)) ? Number(raw.count) : 8;
    const hero = Number(raw.hero);
    const profiles = [], names = new Set(), ids = new Set();
    for (const p of Array.isArray(raw.profiles)?raw.profiles:[]) { if (!object(p) || !text(p.nick).trim() || p.nick.trim()==='—') continue; const n=profile(p), key=n.nick.toLowerCase(); if(names.has(key)) continue; names.add(key); if(ids.has(n.id)) n.id=uid(); ids.add(n.id); profiles.push(n); }
    const players = {}, playerIds=new Set();
    for (const p of Array.isArray(raw.players)?raw.players:[]) { if(!object(p)||!Number.isInteger(Number(p.seat))||Number(p.seat)<1||Number(p.seat)>9) continue; const n={...profile(p),seat:Number(p.seat)}; if(playerIds.has(n.id)) n.id=uid(); playerIds.add(n.id); players[n.seat]=n; }
    const intentions=(Array.isArray(raw.intentions)?raw.intentions:[]).filter(object).map(i=>({id:uid(),text:text(i.text)}));
    const archivedRooms=strings(raw.archivedRooms);
    const rooms=[...new Set([...strings(raw.rooms),...profiles.flatMap(p=>p.rooms),...Object.values(players).flatMap(p=>p.rooms)])].filter(r=>!archivedRooms.some(a=>a.toLowerCase()===r.toLowerCase()));
    const tags=Array.isArray(raw.tags)?strings(raw.tags):[...DEFAULT_TAGS];
    const emojis=Array.isArray(raw.emojis)?strings(raw.emojis):[...DEFAULT_EMOJIS];
    return {count,hero:Number.isInteger(hero)&&hero>=1&&hero<=count?hero:null,theme:['blue','dark','light'].includes(raw.theme)?raw.theme:'blue',players:Object.values(players),profiles,rooms,archivedRooms,tags,emojis,notes:text(raw.notes),intentions};
  }
  function read() {
    try { const saved=localStorage.getItem(KEY); if(saved) return {data:normalize(JSON.parse(saved)),warning:''};
      const legacy=(k,d)=>{const v=localStorage.getItem(k);return v===null?d:JSON.parse(v)};
      const meta=legacy('tt_meta',{}); return {data:normalize({count:meta?.playersCount,hero:meta?.heroSeat,players:legacy('tt_players',[]),profiles:legacy('tt_profiles',[]),rooms:legacy('tt_rooms',[]),notes:localStorage.getItem('tt_table_notes')||'',intentions:legacy('tt_grind_intentions',[])}),warning:''};
    } catch(e){return {data:normalize({}),warning:'Não foi possível ler os dados locais. Faça um backup antes de continuar.'};}
  }
  function save(data){try{localStorage.setItem(KEY,JSON.stringify(data));return true;}catch{return false;}}
  function upsert(data,p,oldId){if(!p.nick || p.nick==='—')return;const duplicate=data.profiles.find(x=>x.nick.toLowerCase()===p.nick.toLowerCase());const existing=data.profiles.find(x=>x.id===oldId)||duplicate;const n={...profile(p),id:existing?.id||uid(),updated:Date.now()};data.profiles=data.profiles.filter(x=>x.id!==existing?.id && x.id!==duplicate?.id);data.profiles.push(n);return n;}
  function parseBackup(raw){if(Array.isArray(raw)){if(!raw.every(p=>object(p)&&typeof p.nick==='string'&&p.nick.trim()&&p.nick.trim()!=='—'&&['tags','rooms'].every(k=>p[k]===undefined||Array.isArray(p[k]))))throw Error('Lista de perfis inválida');return {type:'profiles',profiles:raw.map(profile)};}if(!object(raw)||raw.format!=='poker-table-tracker'||raw.version!==1||!object(raw.data)||!['players','profiles','rooms','intentions'].every(k=>Array.isArray(raw.data[k])))throw Error('Formato de backup inválido');return {type:'full',data:normalize(raw.data)};}
  return {uid,read,save,upsert,parseBackup,DEFAULT_TAGS,DEFAULT_EMOJIS};
})();
