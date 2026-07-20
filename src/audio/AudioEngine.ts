import {Synth} from './Synth';
import {CompositionEngine,type MelodyMotif} from './CompositionEngine';
import type {Track} from './TrackDefinitions';

export type BeatEvent={step:number;time:number;progress:number;kick:boolean;snare:boolean;hat:boolean;bar:boolean;melody:number;arp:boolean;arpNote:number;bass:boolean;response?:'memory'|'variation';finaleRound:0|1|2};
export class AudioEngine {
  ctx?:AudioContext;private master?:GainNode;private synth?:Synth;private timer=0;private nextStepTime=0;private step=0;private running=false;private finale=false;private progress=0;private finaleStartStep=0;
  bpm=96;track!:Track;onBeat?:(event:BeatEvent)=>void;onMemory?:(motif:MelodyMotif)=>void;onFinaleRound?:(round:1|2)=>void;readonly composition=new CompositionEngine();currentFinaleRound:0|1|2=0;
  constructor(private syncWindowMs=95){}
  async init(){if(!this.ctx){this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();const highCut=this.ctx.createBiquadFilter(),limiter=this.ctx.createDynamicsCompressor();this.master.gain.value=.3;highCut.type='lowpass';highCut.frequency.value=13200;highCut.Q.value=.35;limiter.threshold.value=-11;limiter.knee.value=8;limiter.ratio.value=7;limiter.attack.value=.003;limiter.release.value=.18;this.master.connect(highCut).connect(limiter).connect(this.ctx.destination);this.synth=new Synth(this.ctx,this.master);}if(this.ctx.state==='suspended')await this.ctx.resume();}
  start(track:Track){if(!this.ctx||!this.master)return;clearTimeout(this.timer);const now=this.ctx.currentTime;this.master.gain.cancelScheduledValues(now);this.master.gain.setValueAtTime(.3,now);this.track=track;this.composition.reset();this.bpm=track.baseBpm;this.step=0;this.progress=0;this.finale=false;this.running=true;this.nextStepTime=now+.04;this.schedule();}
  updateComposition(now:number,dt:number,syncStreak:number){this.composition.update(now,dt,syncStreak);}
  composeTap(x:number,y:number,synced:boolean,syncStreak:number){return this.composition.recordTap(this.track,x,y,synced,performance.now(),syncStreak);}
  composeContact(x:number,y:number,synced:boolean,syncStreak:number){return this.composition.recordContact(this.track,x,y,synced,performance.now(),syncStreak);}
  setProgress(value:number){this.progress=Math.max(0,Math.min(1,value));if(!this.finale)this.bpm=this.track.baseBpm+(142-this.track.baseBpm)*Math.floor(this.progress*8)/8;}
  enterFinale(nodes:Array<{x:number;y:number;note:number}>){this.finale=true;this.finaleStartStep=this.step;this.currentFinaleRound=1;this.composition.freeze(this.track,nodes);this.bpm=Math.min(160,this.bpm+16);this.onFinaleRound?.(1);}
  fadeAfter(seconds:number,fade:number){if(!this.ctx||!this.master)return;const t=this.ctx.currentTime+seconds;this.master.gain.cancelScheduledValues(this.ctx.currentTime);this.master.gain.setValueAtTime(.38,this.ctx.currentTime);this.master.gain.setValueAtTime(.38,t);this.master.gain.exponentialRampToValueAtTime(.0001,t+fade);}
  stop(){this.running=false;clearTimeout(this.timer);}
  private schedule=()=>{if(!this.running||!this.ctx)return;while(this.nextStepTime<this.ctx.currentTime+.12){this.composition.setNextBeat(this.step);this.playStep(this.step,this.nextStepTime);this.step++;this.nextStepTime+=60/this.bpm/2;}this.timer=window.setTimeout(this.schedule,25);};
  private playStep(absolute:number,when:number){
    if(!this.synth||!this.ctx)return;const s=absolute%8,bar=Math.floor(absolute/8),p=this.progress,state=this.composition.playbackState,boost=this.finale?.38:0,shift=this.finale?this.track.modulation:0,semi=(n:number)=>this.track.root*Math.pow(2,n/12),kick=s%2===0,snare=s===2||s===6,eighth=60/this.bpm/2;if(s===0&&!this.finale){const motif=this.composition.onBar(bar);if(motif)this.onMemory?.(motif);}
    const finaleRelative=this.finale?absolute-this.finaleStartStep:0,finaleRound:0|1|2=this.finale?(finaleRelative<44?1:2):0;if(finaleRound&&finaleRound!==this.currentFinaleRound){this.currentFinaleRound=finaleRound;this.onFinaleRound?.(finaleRound);}
    const hatGain=.014+state.hiHatDensity*.008+boost*.006;this.synth.noise(.026,hatGain,when,5600+state.hiHatDensity*1900);
    if(state.hiHatDensity>.25&&(s===1||s===3||s===5||s===7))this.synth.noise(.018,hatGain*.72,when+eighth/2,6500+state.hiHatDensity*1800);
    if(state.hiHatDensity>.72&&s===7){this.synth.noise(.014,hatGain*.62,when+eighth*.25,7600);this.synth.noise(.014,hatGain*.58,when+eighth*.75,7900);}
    if(kick){this.synth.tone(118,.16,'sine',.16+p*.028+boost*.035,when,-70);this.synth.tone(semi(this.track.bass[s]+shift),.2,'sawtooth',.043+p*.022+boost*.018,when);}
    if(snare){this.synth.noise(.1,.04+p*.009,when,1200);this.synth.tone(180,.085,'triangle',.018,when);}
    if(s===0||this.finale&&s===4)for(const[i,n]of[0,4,7].entries())this.synth.tone(semi(n+shift)*2,.48,'sine',.016+i*.005+boost*.01,when);
    const response=!this.finale?this.composition.responseFor(bar,s):undefined,snapshot=state.finaleSnapshot,finaleMotif=snapshot?.primaryMelodyMotif??[],finaleNote=this.finale&&finaleMotif.length?finaleMotif[finaleRelative%finaleMotif.length]:undefined,playerMelody=response?{note:response.note,synced:true}:this.composition.consumeMelody(),melody=finaleNote??playerMelody?.note??this.track.melody[s]+shift,melodyGain=this.finale?.04:response?.variation?.034:response?.038:playerMelody?(playerMelody.synced?.043:.019):.022+p*.019,melodyDuration=this.finale?.18:playerMelody?.synced?.2:.12;
    this.synth.tone(semi(melody+shift+(this.finale?12:0))*2,melodyDuration,playerMelody?.synced||this.finale?'sawtooth':this.track.wave,melodyGain,when);if(playerMelody?.synced||finaleRound===2)this.synth.tone(semi(melody+shift+(finaleRound===2?19:12))*2,.09,'triangle',finaleRound===2?.019:.014,when);
    const flow=state.syncStreak>=3,arpActive=s%2===1||flow||this.finale,arpCount=state.arpeggioNotes.length;let arpNote=arpActive?this.composition.nextArpeggio(this.finale):undefined;if(arpNote===undefined)arpNote=this.track.scale[(absolute+Math.floor(p*8))%this.track.scale.length];arpNote+=shift+(this.finale?12:0);
    if(arpActive)this.synth.tone(semi(arpNote)*4,.072,'triangle',.008+Math.min(6,arpCount)*.0008+p*.009+boost*.012,when);if(flow&&(s%2===1||this.finale))this.synth.tone(semi(arpNote+(state.syncStreak>=6?12:0))*4,.052,'triangle',.006+boost*.007,when+eighth/2);
    const event:BeatEvent={step:absolute,time:when,progress:p,kick,snare,hat:true,bar:s===0,melody,arp:arpActive,arpNote,bass:kick,response:response?(response.variation?'variation':'memory'):undefined,finaleRound},delay=Math.max(0,(when-this.ctx.currentTime)*1000);window.setTimeout(()=>{if(this.running)this.onBeat?.(event);},delay);
  }
  beatAccuracy(at=this.ctx?.currentTime??0){const step=60/this.bpm/2,phase=((at-this.nextStepTime)%step+step)%step,distance=Math.min(phase,step-phase);return{accuracy:Math.max(0,1-distance/Math.min(this.syncWindowMs/1000,step*.28)),beat:Math.round((at-this.nextStepTime)/step)+this.step};}
  tapFeedback(sync:number,note:number){if(!this.synth)return;const gain=.018+sync*.035;this.synth.tone(this.track.root*Math.pow(2,note/12)*2,.055,sync>.4?'triangle':'sine',gain);}
  resonate(sync:number,index:number){if(!this.synth)return;const a=this.track.scale[index%this.track.scale.length],b=this.track.scale[(index+2)%this.track.scale.length],gain=.035*(1+sync*.8);this.synth.tone(this.track.root*Math.pow(2,a/12)*2,.13,sync>.5?'sawtooth':'sine',gain);this.synth.tone(this.track.root*Math.pow(2,b/12)*2,.18,'triangle',gain*.5);}
  get currentVoiceCount(){return this.synth?.activeVoices??0;}
  debugFinaleRound(round:1|2){if(!this.finale)return;this.finaleStartStep=this.step-(round-1)*44;this.currentFinaleRound=round;this.onFinaleRound?.(round);}
}
declare global{interface Window{webkitAudioContext:typeof AudioContext}}
