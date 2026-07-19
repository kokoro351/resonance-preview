import {DEFAULTS,type AppState} from '../config/constants';
import {SyncJudge,type SyncResult} from './SyncJudge';

export type Node={id:number;x:number;y:number;life:number;pulse:number;lockedUntil:number;born:number};
export type Wave={x:number;y:number;r:number;speed:number;alpha:number;power:number;generation:number;hit:Set<number>};
export type Particle={x:number;y:number;vx:number;vy:number;life:number;size:number};
export class ResonanceEngine {
  state:AppState='idle'; energy=0; nodes:Node[]=[]; waves:Wave[]=[]; particles:Particle[]=[]; sync=new SyncJudge();
  finaleStart=0; whiteoutStart=0; silenceStart=0; rebirthStart=0; taps=0; private id=0;
  constructor(public threshold:number=DEFAULTS.energyThreshold,private initialEnergy:number=0){}
  begin(now:number){this.state='active';this.energy=this.initialEnergy;this.nodes=[];this.waves=[];this.particles=[];this.sync.reset();this.taps=0;this.finaleStart=0;this.whiteoutStart=0;}
  tap(x:number,y:number,result:SyncResult){if(this.state!=='active')return;this.taps++;this.addNode(x,y);this.addWave(x,y,result.synced?1.8+(result.streak-1)*.18:1,0);this.burst(x,y,result.synced?24+(result.streak-1)*5:8,result.synced?3.4:1.5);this.energy=Math.min(this.threshold,this.energy+(result.synced?5+result.streak:2));}
  private addNode(x:number,y:number){if(this.nodes.length>=DEFAULTS.maxNodes)this.nodes[0].life=0;this.nodes=this.nodes.filter(n=>n.life>0);this.nodes.push({id:++this.id,x,y,life:1,pulse:1,lockedUntil:0,born:performance.now()});}
  addWave(x:number,y:number,power=1,generation=0){if(this.waves.length>=DEFAULTS.maxWaves)this.waves.shift();this.waves.push({x,y,r:4,speed:1.5+this.progress*1.2,alpha:.95,power,generation,hit:new Set()});}
  burst(x:number,y:number,count:number,speed:number){for(let i=0;i<count&&this.particles.length<DEFAULTS.maxParticles;i++){const a=Math.PI*2*i/count+Math.random()*.3,s=.6+Math.random()*speed;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,size:1+Math.random()*2});}}
  update(now:number,dt:number,judge:()=>SyncResult,onResonance:(sync:SyncResult,index:number)=>void){
    if(this.state==='active')for(let i=this.waves.length-1;i>=0;i--){const w=this.waves[i];w.r+=w.speed*dt*.06;w.alpha-=.0046*dt*.06;let hits=0;for(const [index,n] of this.nodes.entries()){if(hits>=2||w.hit.has(n.id)||now<n.lockedUntil)continue;const d=Math.hypot(n.x-w.x,n.y-w.y);if(Math.abs(d-w.r)<4+w.speed&&d>18){w.hit.add(n.id);const sync=judge();n.lockedUntil=now+DEFAULTS.nodeCooldownMs;n.pulse=sync.synced?2.6+(sync.streak-1)*.5:1.35;this.burst(n.x,n.y,sync.synced?22+(sync.streak-1)*6:9,sync.synced?3:1.65);this.energy=Math.min(this.threshold,this.energy+(sync.synced?6+sync.streak:3));if(w.generation<1&&Math.random()<(sync.synced?.72:.48))this.addWave(n.x,n.y,sync.synced?1.2:.68,1);onResonance(sync,index);hits++;}}
      if(w.alpha<=0) this.waves.splice(i,1);
    }
    for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.x+=p.vx*dt*.06;p.y+=p.vy*dt*.06;p.vx*=.987;p.vy*=.987;p.life-=.016*dt*.06;if(p.life<=0)this.particles.splice(i,1);}
    for(const n of this.nodes){n.life=Math.max(.12,n.life-.00055*dt);n.pulse*=.91;}
  }
  get progress(){return Math.min(1,this.energy/this.threshold);}
}

