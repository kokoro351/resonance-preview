import {DEFAULTS,type AppState,type RuntimeConfig} from '../config/constants';
import {SyncJudge,type SyncResult} from './SyncJudge';

export type Node={id:number;x:number;y:number;life:number;pulse:number;lockedUntil:number;born:number;anticipation:number;hitFlash:number;hitDx:number;hitDy:number};
export type Wave={x:number;y:number;r:number;speed:number;alpha:number;power:number;generation:number;hit:Set<number>;born:number};
export type Particle={x:number;y:number;vx:number;vy:number;life:number;size:number};
export type Contact={x:number;y:number;dx:number;dy:number;life:number;synced:boolean;fromX:number;fromY:number};
export class ResonanceEngine {
  state:AppState='idle'; energy=0; nodes:Node[]=[]; waves:Wave[]=[]; particles:Particle[]=[]; contacts:Contact[]=[]; sync=new SyncJudge();
  finaleStart=0; whiteoutStart=0; silenceStart=0; rebirthStart=0; taps=0; transitionPulse=0; transitionLevel=0; lastSyncNode?:{x:number;y:number}; private id=0;
  constructor(public threshold:number=DEFAULTS.energyThreshold,private initialEnergy:number=0,private cfg?:RuntimeConfig){}
  begin(){this.state='active';this.energy=this.initialEnergy;this.nodes=[];this.waves=[];this.particles=[];this.contacts=[];this.sync.reset();this.taps=0;this.finaleStart=0;this.whiteoutStart=0;this.transitionPulse=0;this.transitionLevel=0;this.lastSyncNode=undefined;}
  tap(x:number,y:number,result:SyncResult){if(this.state!=='active')return;this.taps++;this.addNode(x,y);this.addWave(x,y,result.synced?1.65+(result.streak-1)*.12:1,0);this.burst(x,y,result.synced?16+(result.streak-1)*3:7,result.synced?3.1:1.4);this.energy=Math.min(this.threshold,this.energy+(result.synced?5+result.streak:2));this.trackTransition(result.streak);}
  private addNode(x:number,y:number){if(this.nodes.length>=DEFAULTS.maxNodes)this.nodes[0].life=0;this.nodes=this.nodes.filter(n=>n.life>0);this.nodes.push({id:++this.id,x,y,life:1,pulse:1,lockedUntil:0,born:performance.now(),anticipation:0,hitFlash:0,hitDx:0,hitDy:0});}
  addWave(x:number,y:number,power=1,generation=0){if(this.waves.length>=DEFAULTS.maxWaves)this.waves.shift();this.waves.push({x,y,r:4,speed:1.5+this.progress*1.2,alpha:.95,power,generation,hit:new Set(),born:performance.now()});}
  burst(x:number,y:number,count:number,speed:number){const cap=this.sync.streak>=(this.cfg?.flowAt??3)?DEFAULTS.flowParticles:DEFAULTS.maxParticles;for(let i=0;i<count&&this.particles.length<cap;i++){const a=Math.PI*2*i/count+Math.random()*.3,s=.6+Math.random()*speed;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,size:1+Math.random()*2});}}
  private trackTransition(streak:number){const level=streak>=(this.cfg?.resonanceAt??6)?3:streak>=(this.cfg?.tranceAt??4)?2:streak>=(this.cfg?.flowAt??3)?1:0;if(level>this.transitionLevel)this.transitionPulse=1;this.transitionLevel=level;}
  update(now:number,dt:number,judge:()=>SyncResult,onResonance:(sync:SyncResult,index:number)=>void){
    for(const n of this.nodes)n.anticipation=0;
    if(this.state==='active')for(let i=this.waves.length-1;i>=0;i--){const w=this.waves[i],age=now-w.born;w.r+=w.speed*dt*.06;w.alpha=Math.max(0,1-age/(this.cfg?.waveLife??DEFAULTS.waveLifeMs));let hits=0;for(const [index,n] of this.nodes.entries()){const d=Math.hypot(n.x-w.x,n.y-w.y),gap=d-w.r;if(gap>0&&gap<70)n.anticipation=Math.max(n.anticipation,1-gap/70);if(hits>=2||w.hit.has(n.id)||now<n.lockedUntil)continue;if(Math.abs(gap)<4+w.speed&&d>18){w.hit.add(n.id);const sync=judge(),dx=(n.x-w.x)/d,dy=(n.y-w.y)/d;n.lockedUntil=now+DEFAULTS.nodeCooldownMs;n.pulse=sync.synced?3.2+(sync.streak-1)*.35:1.8;n.hitFlash=1;n.hitDx=dx;n.hitDy=dy;const base=this.cfg?.contactParticles??DEFAULTS.contactParticles,mult=sync.synced?(this.cfg?.syncParticleMultiplier??DEFAULTS.syncParticleMultiplier):1;this.burst(n.x,n.y,Math.round(base*mult),sync.synced?3.2:1.7);this.contacts.push({x:n.x,y:n.y,dx,dy,life:1,synced:sync.synced,fromX:sync.synced&&this.lastSyncNode?this.lastSyncNode.x:w.x,fromY:sync.synced&&this.lastSyncNode?this.lastSyncNode.y:w.y});if(this.contacts.length>18)this.contacts.shift();this.energy=Math.min(this.threshold,this.energy+(sync.synced?6+sync.streak:3));if(sync.synced)this.lastSyncNode={x:n.x,y:n.y};this.trackTransition(sync.streak);if(w.generation<1&&Math.random()<(sync.synced?.68:.42))this.addWave(n.x,n.y,sync.synced?1.12:.65,1);onResonance(sync,index);hits++;}}
      if(w.alpha<=0)this.waves.splice(i,1);
    }
    for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.x+=p.vx*dt*.06;p.y+=p.vy*dt*.06;p.vx*=.987;p.vy*=.987;p.life-=.016*dt*.06;if(p.life<=0)this.particles.splice(i,1);}
    for(let i=this.contacts.length-1;i>=0;i--){this.contacts[i].life-=dt/(this.contacts[i].synced?620:420);if(this.contacts[i].life<=0)this.contacts.splice(i,1);}
    for(const n of this.nodes){n.life=Math.max(.12,n.life-.00055*dt);n.pulse*=.9;n.hitFlash*=.86;}
    this.transitionPulse*=Math.pow(.88,dt/16.67);
  }
  get progress(){return Math.min(1,this.energy/this.threshold);}
}
