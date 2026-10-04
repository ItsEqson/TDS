import { SPECIALIST as S } from '../data/specialists.js';
import { TOWERS } from '../data/towers.js';
import { ECONOMY,DAILY_SKIN_OFFERS,COSMETIC_ODDS,SKINS } from '../data/headquarters.js';
import { MODES } from '../data/headquarters.js';
import { accountLevel,requiredTowerLevel,VARIANTS,GOLDEN_FORMS,baseTower } from '../data/progression.js';
const KEY='copper-reach-profile-v1';
const STARTERS=['prism-sentry','longwatch','blast-courier'];
const initial=()=>({version:1,shards:0,coins:ECONOMY.startCoins,xp:0,wins:0,kills:0,played:0,missions:0,owned:[...STARTERS],loadout:[...STARTERS],forms:{},fov:68,lookSensitivity:1,showQuests:true,skins:['standard'],skin:'standard',towerSkins:{},crates:0,goldenCrates:0,tickets:1,dailyDealDay:'',dailySkinPurchases:{},claims:[],loginDay:'',loginCount:0,tutorialSeen:false,codes:[],records:{},clearedModes:[],secret:false,daily:{period:'',missions:0,kills:0,waves:0,claimed:false},dailyBonusClaimed:false,selectedQuest:null,selectedProgress:0,selectedClaimed:false,weekly:{period:'',kills:0,claimed:false},mastery:{},flawless:0});
// Profile mutations and persistence have one owner. Invalid saves recover field by field.
export class SaveStore {
  constructor(storage){
    this.warning='';
    try{this.storage=storage??window.localStorage;this.data=this.normalize(JSON.parse(this.storage.getItem(KEY)||'null'));}
    catch{this.data=initial();this.warning='Save unavailable. Progress is kept for this session.';}
    this.dirty=false;this.saveClock=0;
    this.refreshPeriods();
  }
  get level(){return accountLevel(this.data.xp);}
  normalize(raw){
    const p=initial();if(!raw||raw.version!==1)return p;
    for(const key of ['shards','coins','xp','wins','kills','played','missions','crates','goldenCrates','tickets','loginCount','flawless'])if(Number.isFinite(raw[key])&&raw[key]>=0)p[key]=Math.min(raw[key],1e9);
    if(Number.isFinite(raw.fov))p.fov=Math.max(50,Math.min(100,raw.fov));
    if(Number.isFinite(raw.lookSensitivity))p.lookSensitivity=Math.max(.25,Math.min(2,raw.lookSensitivity));
    for(const key of ['claims','codes'])if(Array.isArray(raw[key]))p[key]=raw[key].filter(x=>typeof x==='string').slice(0,1000);
    if(Array.isArray(raw.clearedModes))p.clearedModes=[...new Set(raw.clearedModes.filter(x=>typeof x==='string'))];
    p.owned=[...new Set([...STARTERS,...(Array.isArray(raw.owned)?raw.owned.filter(id=>Object.hasOwn(TOWERS,id)):[])])];
    for(const id of [...p.owned])if(VARIANTS[id]&&!p.owned.includes(VARIANTS[id]))p.owned.push(VARIANTS[id]);
    p.skins=['standard',...Object.keys(SKINS).filter(x=>x!=='standard'&&Array.isArray(raw.skins)&&raw.skins.includes(x))];
    p.skin=p.skins.includes(raw.skin)?raw.skin:'standard';
    p.showQuests=raw.showQuests!==false;
    for(const [tower,skin] of Object.entries(raw.towerSkins||{}))if(Object.hasOwn(TOWERS,tower)&&p.skins.includes(skin))p.towerSkins[tower]=skin;
    for(const [skin,day] of Object.entries(raw.dailySkinPurchases||{}))if(Object.hasOwn(SKINS,skin)&&typeof day==='string')p.dailySkinPurchases[skin]=day;
    p.dailyBonusClaimed=raw.dailyBonusClaimed===true;
    if(['wins','kills','waves'].includes(raw.selectedQuest))p.selectedQuest=raw.selectedQuest;
    if(Number.isFinite(raw.selectedProgress)&&raw.selectedProgress>=0)p.selectedProgress=raw.selectedProgress;
    p.selectedClaimed=raw.selectedClaimed===true;
    const used=new Set();p.loadout=Array.from({length:3},(_,i)=>{const id=baseTower(raw.loadout?.[i]);if(!p.owned.includes(id)||used.has(id))return null;used.add(id);return id;});
    for(const [base,form] of Object.entries(raw.forms||{}))if(VARIANTS[form]===base&&p.owned.includes(form))p.forms[base]=form;
    // Older saves stored alternate forms as separate loadout entries.
    for(const id of Array.isArray(raw.loadout)?raw.loadout:[])if(VARIANTS[id]&&p.owned.includes(id)&&!p.forms[VARIANTS[id]])p.forms[VARIANTS[id]]=id;
    p.tutorialSeen=raw.tutorialSeen===true;
    if(typeof raw.loginDay==='string')p.loginDay=raw.loginDay;
    if(typeof raw.dailyDealDay==='string')p.dailyDealDay=raw.dailyDealDay;
    p.secret=raw.secret===true;
    for(const [kind,key] of [['daily','missions'],['weekly','kills']]){const r=raw[kind];if(r&&typeof r.period==='string'&&Number.isFinite(r[key])&&r[key]>=0)p[kind]={...p[kind],period:r.period,[key]:r[key],claimed:r.claimed===true,kills:Math.max(0,Number(r.kills)||0),waves:Math.max(0,Number(r.waves)||0)};}
    for(const id of p.owned)if(Number.isFinite(raw.mastery?.[id])&&raw.mastery[id]>=0)p.mastery[id]=raw.mastery[id];
    for(const id of ['copper-reach','frostline','ember-pass','verdant-loop']){const r=raw.records?.[id];if(r&&Number.isFinite(r.best)&&r.best>0&&Number.isFinite(r.wins)&&r.wins>=0)p.records[id]={best:r.best,wins:r.wins};}
    return p;
  }
  save(){try{this.storage?.setItem(KEY,JSON.stringify(this.data));this.dirty=false;}catch{this.warning='Storage is full or disabled. Progress is session-only.';}}
  change(fn){const result=fn(this.data);this.save();return result;}
  setFov(value){return this.change(p=>p.fov=Math.max(50,Math.min(100,Math.round(value))));}
  setLookSensitivity(value){return this.change(p=>p.lookSensitivity=Number.isFinite(value)?Math.max(.25,Math.min(2,Math.round(value*20)/20)):p.lookSensitivity);}
  setShowQuests(value){return this.change(p=>p.showQuests=!!value);}
  selectQuest(id){return this.change(p=>{if(!['wins','kills','waves'].includes(id)||p.selectedQuest===id)return false;p.selectedQuest=id;p.selectedProgress=0;p.selectedClaimed=false;return true;});}
  claimDailyBonus(){return this.change(p=>{this.refreshPeriods();if(p.dailyBonusClaimed||p.daily.missions<1||p.daily.kills<25||p.daily.waves<3)return 0;p.dailyBonusClaimed=true;p.coins+=100;return 100;});}
  claimSelectedQuest(){return this.change(p=>{const need={wins:1,kills:100,waves:10}[p.selectedQuest];if(!need||p.selectedClaimed||p.selectedProgress<need)return 0;p.selectedClaimed=true;p.coins+=150;return 150;});}
  buyDailySkin(skin){return this.change(p=>{const offer=DAILY_SKIN_OFFERS.find(x=>x.skin===skin),day=new Date().toISOString().slice(0,10);if(!offer||p.dailySkinPurchases[skin]===day||p.coins<120)return false;p.coins-=120;p.dailySkinPurchases[skin]=day;if(!p.skins.includes(skin))p.skins.push(skin);p.towerSkins[offer.tower]=skin;return true;});}
  setForm(base,form){return this.change(p=>{if(form==='standard'){delete p.forms[base];return true;}if(VARIANTS[form]!==base||!p.owned.includes(form)||!p.owned.includes(base))return false;p.forms[base]=form;return true;});}
  refreshPeriods(){
    const now=new Date(),day=now.toISOString().slice(0,10);const monday=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth(),now.getUTCDate()-(now.getUTCDay()+6)%7));const week=monday.toISOString().slice(0,10);
    if(this.data.daily.period!==day){this.data.daily={period:day,missions:0,kills:0,waves:0,claimed:false};this.data.dailyBonusClaimed=false;}
    if(this.data.weekly.period!==week)this.data.weekly={period:week,kills:0,claimed:false};
  }
  tick(dt){this.data.played+=dt;this.saveClock+=dt;if(this.saveClock>=15){this.saveClock=0;this.refreshPeriods();this.save();}}
  equip(id,slot){return this.change(p=>{id=baseTower(id);if(slot<0||slot>2||!p.owned.includes(id))return false;const old=p.loadout.indexOf(id),replaced=p.loadout[slot];if(old>=0)p.loadout[old]=replaced;p.loadout[slot]=id;return true;});}
  unequip(slot){this.change(p=>{if(slot>=0&&slot<3)p.loadout[slot]=null;});}
  markTutorialSeen(){this.change(p=>{p.tutorialSeen=true;});}
  buy(kind){return this.change(p=>{
    const tower=Object.hasOwn(TOWERS,kind)?TOWERS[kind]:null;const currency=tower?.currency||'coins';
    const price=tower?tower.unlockPrice:kind==='crate'?ECONOMY.cratePrice:ECONOMY.skinPrice;
    if(kind==='golden-crate'){if(p.coins<50000)return 'Need 50,000 coins.';p.coins-=50000;p.goldenCrates++;return 'Golden crate added.';}
    if((!tower&&!['crate','amber'].includes(kind))||p[currency]<price||p.owned.includes(kind)||p.skins.includes(kind))return 'Purchase unavailable.';
    if(tower&&tower.tier==='Golden')return 'Golden forms come from the Golden crate.';
    if(tower&&this.level<(requiredTowerLevel[kind]||1))return `Reach level ${requiredTowerLevel[kind]} first.`;
    if(tower&&VARIANTS[kind]&&!p.owned.includes(VARIANTS[kind]))return 'Recruit the base tower first.';
    p[currency]-=price;if(tower)p.owned.push(kind);else if(kind==='crate')p.crates++;else p.skins.push(kind);return 'Added to your collection.';
  });}
  buyOffer(kind){return this.change(p=>{
    const day=new Date().toISOString().slice(0,10);
    const offers={daily:{price:150,crates:2,tickets:0},field:{price:280,crates:3,tickets:1}};
    const offer=offers[kind];
    if(!offer||p.coins<offer.price||kind==='daily'&&p.dailyDealDay===day)return 'Offer unavailable.';
    p.coins-=offer.price;p.crates+=offer.crates;p.tickets+=offer.tickets;
    if(kind==='daily')p.dailyDealDay=day;
    return `${offer.crates} cosmetic crates${offer.tickets?' and 1 spin ticket':''} added.`;
  });}
  openGoldenCrate(){return this.change(p=>{if(!p.goldenCrates)return null;p.goldenCrates--;const remaining=GOLDEN_FORMS.filter(id=>!p.owned.includes(id));if(!remaining.length){p.coins+=50000;return {duplicate:true};}const id=remaining[Math.floor(Math.random()*remaining.length)];p.owned.push(id);return {id,base:VARIANTS[id],duplicate:false};});}
  claim(id){return this.change(p=>{
    this.refreshPeriods();
    const today=new Date().toISOString().slice(0,10);
    if(id==='login'){if(p.loginDay===today)return 'Already claimed today (UTC).';p.loginDay=today;p.loginCount++;const reward=20+Math.min(p.loginCount,7)*10;p.coins+=reward;return `Claimed ${reward} coins.`;}
    if(id==='daily'||id==='weekly'){const q=p[id],ready=id==='daily'?q.missions>=1:q.kills>=50;if(q.claimed||!ready)return 'Reward not ready or already claimed.';q.claimed=true;const coins=id==='daily'?40:100;p.coins+=coins;return `Claimed ${coins} coins.`;}
    const rewards={play:[p.played>=ECONOMY.playSeconds,40],achievement:[p.wins>=1,60],flawless:[p.flawless>=1,75],season:[p.xp>=100,80],season2:[p.xp>=250,120],season3:[p.xp>=500,200]};
    const item=rewards[id];if(!item||!item[0]||p.claims.includes(id))return 'Reward not ready or already claimed.';
    p.claims.push(id);p.coins+=item[1];return `Claimed ${item[1]} coins.`;
  });}
  openCrate(){return this.change(p=>{if(!p.crates)return null;p.crates--;let roll=Math.random()*100,id=COSMETIC_ODDS.at(-1).skin;for(const item of COSMETIC_ODDS){roll-=item.chance;if(roll<0){id=item.skin;break;}}if(p.skins.includes(id)){p.coins+=50;return {id,duplicate:true};}p.skins.push(id);return {id,duplicate:false};});}
  spin(){return this.change(p=>{if(!p.tickets)return null;p.tickets--;const index=Math.floor(Math.random()*4),coins=[25,40,60,100][index];p.coins+=coins;return {index,coins,message:`Wheel reward: ${coins} coins.`};});}
  redeem(value){return this.change(p=>{const code=value.trim().toUpperCase();if(p.codes.includes(code))return 'Already used.';if(code==='OLDRELAY')return 'This code has expired.';if(code!=='FIRSTLIGHT')return 'Invalid code.';p.codes.push(code);p.coins+=100;p.tickets++;return 'Success: 100 coins and 1 spin ticket.';});}
  setSkin(id){this.change(p=>{if(p.skins.includes(id))p.skin=id;});}
  discover(){this.change(p=>{if(!p.secret){p.secret=true;p.coins+=30;}});}
  complete(battle,mission){return this.change(p=>{
    this.refreshPeriods();
    const won=battle.state==='WON',mode=MODES.find(m=>m.id===mission.mode),rewards=mode?.rewards;
    const progress=mode?Math.min(1,Math.max(0,((Number.isFinite(battle.wave)?battle.wave:1)-1)/mode.waves)):0;
    const reward=won?(rewards?(rewards.coins||0):ECONOMY.winCoins):Math.max(ECONOMY.lossCoins,Math.round((rewards?.coins||0)*progress*.25));
    const gems=won?(rewards?(rewards.shards||0):(['fallen','hardcore','voidcore'].includes(mission.mode)?S.victoryShards:0)):Math.round((rewards?.shards||0)*progress*.25);
    const weekday=new Date().getUTCDay(),xpBoost=weekday===0||weekday>=5?2:1;
    const experience=won?(rewards?.xp??50):Math.max(10,Math.round((rewards?.xp||0)*progress*.35));
    p.shards+=gems;p.missions++;p.kills+=battle.killed;p.coins+=reward;p.xp+=experience*xpBoost;
    p.daily.missions++;p.daily.kills+=battle.killed;p.daily.waves+=battle.wavesStarted;p.weekly.kills+=battle.killed;if(won&&battle.health===100)p.flawless++;
    if(!p.selectedClaimed)p.selectedProgress+=p.selectedQuest==='wins'?Number(won):p.selectedQuest==='kills'?battle.killed:p.selectedQuest==='waves'?battle.wavesStarted:0;
    for(const id of new Set(battle.towers.map(t=>baseTower(t.definition.id))))p.mastery[id]=(p.mastery[id]||0)+(won?(rewards?.towerXp??25):5);
    if(won){p.wins++;if(!p.clearedModes.includes(mission.mode))p.clearedModes.push(mission.mode);const old=p.records[mission.map];p.records[mission.map]={wins:(old?.wins||0)+1,best:Math.min(old?.best||Infinity,battle.elapsed)};}
    return reward;
  });}
}
