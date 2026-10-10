export const STATES = Object.freeze({
  PREP:'PREP',WAVE_ACTIVE:'WAVE_ACTIVE',INTERMISSION:'INTERMISSION',WON:'WON',LOST:'LOST'
});
export const isTerminal = state => state === STATES.WON || state === STATES.LOST;
export function canTransition(from,to){
  return (from===STATES.PREP&&to===STATES.WAVE_ACTIVE)||(from===STATES.WAVE_ACTIVE&&to===STATES.INTERMISSION)||(from===STATES.INTERMISSION&&to===STATES.WAVE_ACTIVE)||((from===STATES.WAVE_ACTIVE||from===STATES.INTERMISSION)&&isTerminal(to))||(isTerminal(from)&&to===STATES.PREP);
}
