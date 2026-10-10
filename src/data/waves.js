export const WAVE = Object.freeze({
  count:10,spawnIntervalSeconds:1.1,startingCash:200,baseHealth:100,
  durationSeconds:90,intermissionSeconds:5,skipVoteSeconds:10,
  skipPolicyByMode:Object.freeze({easy:'third',casual:'third',intermediate:'third',molten:'third',fallen:'third',hardcore:'twenty',voidcore:'twenty',beginner:'third'}),
  waveBonusBase:20,waveBonusPerWave:12,
  clearBonusRateByPlayerCount:Object.freeze({1:.25,2:.20,3:.15,4:.10})
});
export function waveBonus(wave){return WAVE.waveBonusBase+wave*WAVE.waveBonusPerWave;}
export function waveClearBonus(wave,mode,playerCount=1){
  if(mode==='hardcore'||mode==='voidcore')return 0;
  const players=Math.max(1,Math.min(4,Math.floor(playerCount)||1));
  return Math.round(waveBonus(wave)*WAVE.clearBonusRateByPlayerCount[players]);
}
export const TIMING = Object.freeze({
  stepSeconds:1/60,maxFrameSeconds:0.1,maxPixelRatio:2
});
