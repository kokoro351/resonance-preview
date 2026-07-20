import type {RuntimeConfig} from '../config/constants';

export type SessionPhase='A'|'B'|'C'|'D';
export type FinaleRequirements={energy:number;threshold:number;nodeCount:number;melodyCount:number;arpeggioCount:number;motifCount:number};
export class SessionController {
  startedAt=0;preludeAt=0;phase:SessionPhase='A';canStartFinale=false;expectedDuration=52000;
  private cfg:RuntimeConfig;
  constructor(cfg:RuntimeConfig){this.cfg=cfg;}
  begin(now:number){this.startedAt=now;this.preludeAt=0;this.phase='A';this.canStartFinale=false;}
  update(now:number,data:FinaleRequirements){const elapsed=now-this.startedAt;this.phase=this.preludeAt?'D':elapsed<10000?'A':elapsed<38000?'B':'C';this.canStartFinale=elapsed>=this.cfg.minimumActiveMs&&data.energy>=data.threshold&&data.nodeCount>=4&&data.melodyCount>=4&&data.arpeggioCount>=3&&data.motifCount>=1;return{elapsed,shouldPrelude:!this.preludeAt&&(this.canStartFinale||elapsed>=this.cfg.maximumActiveMs),shouldFinale:this.preludeAt>0&&now-this.preludeAt>=this.cfg.anticipationMs};}
  startPrelude(now:number){this.preludeAt=now;this.phase='D';}
  forcePhase(phase:SessionPhase,now:number){const offsets={A:0,B:12000,C:40000,D:this.cfg.maximumActiveMs};this.startedAt=now-offsets[phase];if(phase==='D')this.preludeAt=now;this.phase=phase;}
  get elapsed(){return Math.max(0,performance.now()-this.startedAt);}
  get nextCallResponseTime(){const barMs=8*(60000/120/2);return Math.max(0,barMs-(this.elapsed%barMs));}
}
