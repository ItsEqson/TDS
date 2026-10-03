import { MODE_CAMPAIGNS } from './modeCampaigns.js';

export const ENEMY = Object.freeze({
  id:'copper-crawler',health:10,speedUnitsPerSecond:3,baseDamage:1
});

const FAST = /fast|speed|quick|swift|bolt|rusher|hound|reaver|soul/i;
const SLOW = /slow|tank|giant|golem|brute|guardian|bulwark|heavy|hefty|king|boss/i;
const SPLITS=Object.freeze({Breaker2:['Breaker'],Breaker3:['Breaker2'],Breaker4:['Breaker3','Breaker3','Breaker3'],'Fallen Dreg':['Corpse'],Mandrake:['Odd','Swift'],Mandragora:['Mandrake','Mandrake'],Mystery:['Odd'], 'Elite Mystery':['Voidling'], 'Unknown Boss':['Voidling','Voidling']});
const SUMMONS=Object.freeze({Necromancer:'Skeleton','Molten Necromancer':'Molten Demon','Molten Summoner':'Elite Molten','Fallen Necromancer':'Fallen Skeleton','Fallen Summoner':'Necrotic Skeleton','Grave Digger':'Skeleton','Patient Zero':'Living Experiment','Fallen King':'Necrotic Skeleton','Void Reaper':'Mystery','Void Portal':'Voidling','Void Trickster':'Void Portal','Void Cultist':'Healing Beacon',Nightshade:'Voidling','Void Keeper':'Voidling','Void Reaver':'Voidling','Void Caster':'Voidling'});
const STUNNERS=/Brute|Patient Zero|Molten Warlord|Molten Executioner|Fallen Guardian|Fallen King|Heavy Voidling|Void Knight|Void Guardian|Void Reaver|Void Eye/;

export function campaignEnemy(mode,name){
  const source=MODE_CAMPAIGNS[mode]?.enemies[name];
  if(!source)return null;
  const speed=FAST.test(name+' '+source.description)?4.4:SLOW.test(name+' '+source.description)?1.8:3;
  const percent=source.description.match(/(\d+)% Defense/i);
  const defense=percent?Number(percent[1])/100:/defense|armored|protected/i.test(source.description)?.25:0;
  return {name,health:source.health,description:source.description,speedUnitsPerSecond:speed,
    hidden:/Hidden|Phantom|^Soul$|^Elite Soul$/.test(name),
    flying:/Balloon|Floater|Fallen Angel/.test(name),
    lead:/^(Elite )?Lead$|Void Pike/.test(name),
    defense,splitInto:SPLITS[name]||null,summons:SUMMONS[name]||null,
    stuns:STUNNERS.test(name),heals:name==='Healing Beacon',
  };
}
