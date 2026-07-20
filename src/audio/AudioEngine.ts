import {Synth} from './Synth';
import type {Track} from './TrackDefinitions';

export type BeatEvent={step:number;time:number;progress:number};
export class AudioEngine {
  ctx?:AudioContext; private master?:GainNode; private synth?:Synth; private timer=0;
  private nextStepTime=0; private step=0; private running=false; private finale=false; private progress=0;
  bpm=96; track!:Track; onBeat?:(event:BeatEvent)=>void;
  async init(){
    if(!this.ctx){ this.ctx=new (window.AudioContext||window.webkitAudioContext)(); this.master=this.ctx.createGain(); this.master.gain.value=.34; this.master.connect(this.ctx.destination); this.synth=new Synth(this.ctx,this.master); }
    if(this.ctx.state==='suspended') await this.ctx.resume();
  }
  start(track:Track){
    if(!this.ctx||!this.master)return;
    clearTimeout(this.timer);
    const now=this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(.34,now);
    this.track=track; this.bpm=track.baseBpm; this.step=0; this.progress=0; this.finale=false;
    this.running=true; this.nextStepTime=now+.04; this.schedule();
  }
  setProgress(value:number){ this.progress=Math.max(0,Math.min(1,value)); if(!this.finale)this.bpm=this.track.baseBpm+(142-this.track.baseBpm)*Math.floor(this.progress*8)/8; }
  enterFinale(){ this.finale=true; this.bpm=Math.min(160,this.bpm+16); }
  fadeAfter(seconds:number,fade:number){ if(!this.ctx||!this.master)return; const t=this.ctx.currentTime+seconds; this.master.gain.cancelScheduledValues(this.ctx.currentTime); this.master.gain.setValueAtTime(.42,this.ctx.currentTime); this.master.gain.setValueAtTime(.42,t); this.master.gain.exponentialRampToValueAtTime(.0001,t+fade); }
  stop(){ this.running=false; clearTimeout(this.timer); }
  private schedule=()=>{
    if(!this.running||!this.ctx)return;
    while(this.nextStepTime<this.ctx.currentTime+.12){ this.playStep(this.step,this.nextStepTime); this.step++; this.nextStepTime+=60/this.bpm/2; }
    this.timer=window.setTimeout(this.schedule,25);
  };
  private playStep(absolute:number,when:number){
    if(!this.synth)return; const s=absolute%8, p=this.progress, boost=this.finale?.38:0, shift=this.finale?this.track.modulation:0, semi=(n:number)=>this.track.root*Math.pow(2,n/12);
    this.synth.noise(s%2===0?.045:.025,(s%2===0?.03:.018)+boost*.012,when);
    if(s%2===0){ this.synth.tone(118,.16,'sine',.17+p*.03+boost*.04,when,-70); this.synth.tone(semi(this.track.bass[s]+shift),.2,'sawtooth',.045+p*.025+boost*.02,when); }
    if(s===2||s===6){ this.synth.noise(.11,.045+p*.01,when,1100); this.synth.tone(180,.09,'triangle',.02,when); }
    if(s===0||this.finale&&s===4) for(const [i,n] of [0,4,7].entries()) this.synth.tone(semi(n+shift)*2,.5,'sine',.018+i*.006+boost*.012,when);
    const high=this.finale&&p>.5?12:0; this.synth.tone(semi(this.track.melody[s]+shift+high)*2,.13,this.finale?'sawtooth':this.track.wave,.025+p*.026+boost*.025,when);
    if(s%2===1||this.finale){ const n=this.track.scale[(absolute+Math.floor(p*8))%this.track.scale.length]+shift+(this.finale?12:0); this.synth.tone(semi(n)*4,.075,'triangle',.012+p*.012+boost*.014,when); }
    this.onBeat?.({step:absolute,time:when,progress:p});
  }
  beatAccuracy(at=this.ctx?.currentTime??0){ const step=60/this.bpm/2, phase=((at-this.nextStepTime)%step+step)%step, distance=Math.min(phase,step-phase); return {accuracy:Math.max(0,1-distance/Math.min(.095,step*.28)),beat:Math.round((at-this.nextStepTime)/step)+this.step}; }
  tap(sync:number,index:number){ if(!this.synth||!this.ctx)return; const n=this.track.scale[index%this.track.scale.length], gain=.055+sync*.075; this.synth.tone(this.track.root*Math.pow(2,n/12)*2,.1,sync>.4?'sawtooth':'triangle',gain); if(sync>.55)this.synth.tone(this.track.root*Math.pow(2,(n+12)/12)*2,.07,'triangle',.035*sync); }
  resonate(sync:number,index:number){ if(!this.synth)return; const a=this.track.scale[index%this.track.scale.length], b=this.track.scale[(index+2)%this.track.scale.length], gain=.045*(1+sync); this.synth.tone(this.track.root*Math.pow(2,a/12)*2,.15,sync>.5?'sawtooth':'sine',gain); this.synth.tone(this.track.root*Math.pow(2,b/12)*2,.21,'triangle',gain*.55); }
}

declare global { interface Window { webkitAudioContext: typeof AudioContext } }
