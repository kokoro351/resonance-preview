import {DEFAULTS} from '../config/constants';
import type {ResonanceEngine} from './ResonanceEngine';
export class FinaleController {
  constructor(private engine:ResonanceEngine,private steps:number=DEFAULTS.finaleSteps){}
  start(now:number,bpm:number){this.engine.state='finale';this.engine.finaleStart=now;for(const wave of this.engine.waves){wave.speed*=.28;wave.alpha*=.65;}return this.steps*(60000/bpm/2);}
  update(now:number,duration:number){const elapsed=now-this.engine.finaleStart,prelude=650;if(this.engine.state==='finale'&&elapsed>=prelude+duration){this.engine.state='whiteout';this.engine.whiteoutStart=now;}else if(this.engine.state==='whiteout'&&now-this.engine.whiteoutStart>=DEFAULTS.whiteHoldMs+DEFAULTS.fadeMs){this.engine.state='silence';this.engine.silenceStart=now;this.engine.nodes=[];this.engine.particles=[];this.engine.waves=[];}else if(this.engine.state==='silence'&&now-this.engine.silenceStart>=DEFAULTS.silenceMs){this.engine.state='rebirth';this.engine.rebirthStart=now;}else if(this.engine.state==='rebirth'&&now-this.engine.rebirthStart>=DEFAULTS.rebirthMs)this.engine.state='idle';}
}
