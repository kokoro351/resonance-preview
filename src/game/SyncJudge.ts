export type SyncResult={synced:boolean;accuracy:number;streak:number;label:string};
export class SyncJudge {
  streak=0; private lastBeat=-999; private lastAt=0;
  reset(){this.streak=0;this.lastBeat=-999;this.lastAt=0;}
  judge(accuracy:number,beat:number,now:number):SyncResult{
    const synced=accuracy>.38;
    if(synced&&beat!==this.lastBeat){ this.streak=beat-this.lastBeat<=2?Math.min(8,this.streak+1):1; this.lastBeat=beat; this.lastAt=now; }
    else if(!synced&&now-this.lastAt>900)this.streak=Math.max(0,this.streak-1);
    return {synced,accuracy,streak:this.streak,label:this.label};
  }
  get label(){return this.streak>=6?'RESONANCE':this.streak>=4?'TRANCE':this.streak>=3?'FLOW':this.streak>=2?`SYNC ×${this.streak}`:'SYNC';}
}
