import { ECONOMY } from '../data/headquarters.js';
const KEY='copper-reach-profile-v1';
const initial=()=>({version:1,coins:ECONOMY.startCoins,xp:0,wins:0,kills:0,played:0,missions:0,owned:['prism-sentry'],loadout:['prism-sentry',null,null],skins:['standard'],skin:'standard',crates:0,tickets:1,claims:[],loginDay:'',loginCount:0,codes:[],records:{},secret:false,daily:{period:'',missions:0,claimed:false},weekly:{period:'',kills:0,claimed:false},mastery:{},flawless:0});
// Profile mutations and persistence have one owner. Invalid saves recover field by field.
export class SaveStore {
  constructor(storage){
    this.warning='';
    try{this.storage=storage??window.localStorage;this.data=this.normalize(JSON.parse(this.storage.getItem(KEY)||'null'));}
    catch{this.data=initial();this.warning='Save unavailable. Progress is kept for this session.';}
    this.dirty=false;this.saveClock=0;
    this.refreshPeriods();
  }
  normalize(raw){
    const p=initial();if(!raw||raw.version!==1)return p;
    for(const key of ['coins','xp','wins','kills','played','missions','crates','tickets','loginCount','flawless'])if(Number.isFinite(raw[key])&&raw[key]>=0)p[key]=Math.min(raw[key],1e9);
    for(const key of ['claims','codes'])if(Array.isArray(raw[key]))p[key]=raw[key].filter(x=>typeof x==='string').slice(0,1000);
    p.owned=['prism-sentry',...(Array.isArray(raw.owned)&&raw.owned.includes('longwatch')?['longwatch']:[])];
    p.skins=['standard',...['amber','violet'].filter(x=>Array.isArray(raw.skins)&&raw.skins.includes(x))];
    p.skin=p.skins.includes(raw.skin)?raw.skin:'standard';
    const used=new Set();p.loadout=Array.from({length:3},(_,i)=>{const id=raw.loadout?.[i];if(!p.owned.includes(id)||used.has(id))return null;used.add(id);return id;});
    if(typeof raw.loginDay==='string')p.loginDay=raw.loginDay;
    p.secret=raw.secret===true;
    for(const [kind,key] of [['daily','missions'],['weekly','kills']]){const r=raw[kind];if(r&&typeof r.period==='string'&&Number.isFinite(r[key])&&r[key]>=0)p[kind]={period:r.period,[key]:r[key],claimed:r.claimed===true};}
    for(const id of p.owned)if(Number.isFinite(raw.mastery?.[id])&&raw.mastery[id]>=0)p.mastery[id]=raw.mastery[id];
    for(const id of ['copper-reach','frostline']){const r=raw.records?.[id];if(r&&Number.isFinite(r.best)&&r.best>0&&Number.isFinite(r.wins)&&r.wins>=0)p.records[id]={best:r.best,wins:r.wins};}
    return p;
  }
  save(){try{this.storage?.setItem(KEY,JSON.stringify(this.data));this.dirty=false;}catch{this.warning='Storage is full or disabled. Progress is session-only.';}}
  change(fn){const result=fn(this.data);this.save();return result;}
  refreshPeriods(){
    const now=new Date(),day=now.toISOString().slice(0,10);const monday=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-(now.getUTCDay()+6)%7));const week=monday.toISOString().slice(0,10);
    if(this.data.daily.period!==day)this.data.daily={period:day,missions:0,claimed:false};
    if(this.data.weekly.period!==week)this.data.weekly={period:week,kills:0,claimed:false};
  }
  tick(dt){this.data.played+=dt;this.saveClock+=dt;if(this.saveClock>=15){this.saveClock=0;this.refreshPeriods();this.save();}}
  equip(id,slot){return this.change(p=>{if(slot<0||slot>2||!p.owned.includes(id))return false;const old=p.loadout.indexOf(id),replaced=p.loadout[slot];if(old>=0)p.loadout[old]=replaced;p.loadout[slot]=id;return true;});}
  unequip(slot){this.change(p=>{if(slot>=0&&slot<3)p.loadout[slot]=null;});}
  buy(kind){return this.change(p=>{
    const price=kind==='longwatch'?ECONOMY.towerPrice:kind==='crate'?ECONOMY.cratePrice:ECONOMY.skinPrice;
    if(!['longwatch','crate','amber'].includes(kind)||p.coins<price||p.owned.includes(kind)||p.skins.includes(kind))return 'Purchase unavailable.';
    p.coins-=price;if(kind==='longwatch')p.owned.push(kind);else if(kind==='crate')p.crates++;else p.skins.push(kind);return 'Added to your collection.';
  });}
  claim(id){return this.change(p=>{
    this.refreshPeriods();
    const today=new Date().toISOString().slice(0,10);
    if(id==='login'){if(p.loginDay===today)return 'Already claimed today (UTC).';p.loginDay=today;p.loginCount++;const reward=20+Math.min(p.loginCount,7)*10;p.coins+=reward;return `Claimed ${reward} coins.`;}
    if(id==='daily'||id==='weekly'){const q=p[id],ready=id==='daily'?q.missions>=1:q.kills>=50;if(q.claimed||!ready)return 'Reward not ready or already claimed.';q.claimed=true;const coins=id==='daily'?40:100;p.coins+=coins;return `Claimed ${coins} coins.`;}
    const rewards={play:[p.played>=ECONOMY.playSeconds,40],achievement:[p.wins>=1,60],flawless:[p.flawless>=1,75],season:[p.xp>=100,80],season2:[p.xp>=250,120],season3:[p.xp>=500,200]};
    const item=rewards[id];if(!item||!item[0]||p.claims.includes(id))return 'Reward not ready or already claimed.';
    p.claims.push(id);p.coins+=item[1];return `Claimed ${item[1]} coins.`;
  });}
  openCrate(){return this.change(p=>{if(!p.crates)return null;p.crates--;const id=Math.random()<.7?'amber':'violet';if(p.skins.includes(id)){p.coins+=50;return {id,duplicate:true};}p.skins.push(id);return {id,duplicate:false};});}
  spin(){return this.change(p=>{if(!p.tickets)return 'No spin tickets remaining.';p.tickets--;const coins=[25,40,60,100][Math.floor(Math.random()*4)];p.coins+=coins;return `Wheel reward: ${coins} coins.`;});}
  redeem(value){return this.change(p=>{const code=value.trim().toUpperCase();if(p.codes.includes(code))return 'Already used.';if(code==='OLDRELAY')return 'This code has expired.';if(code!=='FIRSTLIGHT')return 'Invalid code.';p.codes.push(code);p.coins+=100;p.tickets++;return 'Success: 100 coins and 1 spin ticket.';});}
  setSkin(id){this.change(p=>{if(p.skins.includes(id))p.skin=id;});}
  discover(){this.change(p=>{if(!p.secret){p.secret=true;p.coins+=30;}});}
  complete(battle,mission){return this.change(p=>{
    this.refreshPeriods();
    const won=battle.state==='WON',reward=won?Math.round(ECONOMY.winCoins*(mission.mode==='challenge'?1.5:1)):ECONOMY.lossCoins;
    p.missions++;p.kills+=battle.killed;p.coins+=reward;p.xp+=won?50:10;
    p.daily.missions++;p.weekly.kills+=battle.killed;if(won&&battle.health===10)p.flawless++;
    for(const id of new Set(battle.towers.map(t=>t.definition.id)))p.mastery[id]=(p.mastery[id]||0)+(won?25:5);
    if(won){p.wins++;const old=p.records[mission.map];p.records[mission.map]={wins:(old?.wins||0)+1,best:Math.min(old?.best||Infinity,battle.elapsed)};}
    return reward;
  });}
}
