// Original synthesized cues; browsers only create the audio context after a user gesture.
export class Audio {
  constructor(){this.volume=0;this.voices=new Set();}
  setVolume(volume){
    this.volume=Math.max(0,Math.min(1,volume));
    if(!this.context&&this.volume){
      const Context=window.AudioContext||window.webkitAudioContext;if(!Context)return;
      this.context=new Context();this.master=this.context.createGain();this.master.connect(this.context.destination);
      this.hum=this.context.createOscillator();this.hum.frequency.value=55;const gain=this.context.createGain();gain.gain.value=.035;this.hum.connect(gain);gain.connect(this.master);this.hum.start();
    }
    if(this.context){this.master.gain.setTargetAtTime(this.volume,this.context.currentTime,.08);if(this.volume)this.context.resume().catch(()=>{});}
  }
  play(name){
    if(!this.context||!this.volume||this.context.state!=='running')return;
    const frequencies={'tower-fire':440,'deploy':180,'reward':660,'ui':280};const f=frequencies[name];if(!f)return;
    const voice=this.context.createOscillator(),gain=this.context.createGain(),now=this.context.currentTime;voice.type='sine';voice.frequency.setValueAtTime(f,now);voice.frequency.exponentialRampToValueAtTime(f*1.5,now+.15);gain.gain.setValueAtTime(.07,now);gain.gain.exponentialRampToValueAtTime(.001,now+.18);voice.connect(gain);gain.connect(this.master);this.voices.add(voice);voice.onended=()=>{this.voices.delete(voice);voice.disconnect();gain.disconnect();};voice.start();voice.stop(now+.2);
  }
  suspend(){this.context?.suspend().catch(()=>{});}
  resume(){if(this.volume)this.context?.resume().catch(()=>{});}
  dispose(){for(const v of this.voices){v.onended=null;v.stop();v.disconnect();}this.voices.clear();this.hum?.stop();this.context?.close().catch(()=>{});}
}
