import type {Track} from '../audio/TrackDefinitions';
import type {ResonanceEngine} from '../game/ResonanceEngine';
export class Renderer {
  private ctx:CanvasRenderingContext2D; w=0;h=0;dpr=1;kick=0;melodyStep=0;
  constructor(private canvas:HTMLCanvasElement){this.ctx=canvas.getContext('2d')!;this.resize();}
  resize=()=>{const r=this.canvas.getBoundingClientRect();this.dpr=Math.min(devicePixelRatio||1,2);this.w=r.width;this.h=r.height;this.canvas.width=Math.floor(this.w*this.dpr);this.canvas.height=Math.floor(this.h*this.dpr);this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);};
  beat(step:number){if(step%2===0)this.kick=1;this.melodyStep=step;}
  draw(now:number,e:ResonanceEngine,t:Track){const c=this.ctx,cx=this.w/2,cy=this.h/2,streak=e.sync.streak;c.save();const scale=1-this.kick*.012;c.translate(cx,cy);c.scale(scale,scale);c.translate(-cx,-cy);c.fillStyle=t.colors.bg;c.fillRect(-10,-10,this.w+20,this.h+20);this.kick*=.84;c.globalCompositeOperation='lighter';
    if(e.state==='active'&&streak>=4){c.globalAlpha=.025+streak*.006*(.5+.5*Math.sin(now*.018));c.fillStyle=t.colors.secondary;c.fillRect(0,0,this.w,this.h);}
    if(e.state==='idle'||e.state==='rebirth'){const appear=e.state==='rebirth'?Math.min(1,(now-e.rebirthStart)/1100):1,p=.5+.5*Math.sin(now*.003);c.fillStyle=t.colors.secondary;c.globalAlpha=(.45+.5*p)*appear;c.beginPath();c.arc(cx,cy,3+5*p,0,Math.PI*2);c.fill();c.globalAlpha=.12*appear;c.beginPath();c.arc(cx,cy,20+10*p,0,Math.PI*2);c.fill();}
    if(e.state==='active'){if(streak>=4){c.strokeStyle=t.colors.primary;c.lineWidth=.6;c.globalAlpha=.12+streak*.02;for(let i=0;i<e.nodes.length;i++){const a=e.nodes[i],b=e.nodes[(i+1)%e.nodes.length];c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();}}
      for(const w of e.waves){c.globalAlpha=w.alpha*.75;c.strokeStyle=t.colors.primary;c.lineWidth=1.2+w.power*1.55+(this.kick*.8);c.beginPath();c.arc(w.x,w.y,w.r,0,Math.PI*2);c.stroke();}for(const [i,n] of e.nodes.entries()){c.globalAlpha=i===this.melodyStep%e.nodes.length?.95:.3+n.life*.5;c.fillStyle=t.colors.secondary;c.beginPath();c.arc(n.x,n.y,2.2+n.pulse*5,0,Math.PI*2);c.fill();}}
    if(e.state==='finale'||e.state==='whiteout')this.finale(c,now,e,t,cx,cy);
    for(const p of e.particles){c.globalAlpha=p.life;c.fillStyle=t.colors.particle;c.beginPath();c.arc(p.x,p.y,p.size*p.life,0,Math.PI*2);c.fill();}c.restore();}
  private finale(c:CanvasRenderingContext2D,now:number,e:ResonanceEngine,t:Track,cx:number,cy:number){const elapsed=now-e.finaleStart,gather=Math.min(1,elapsed/650),bloom=Math.min(1,Math.max(0,elapsed-650)/7000),diag=Math.hypot(this.w,this.h),pts=e.nodes.length?e.nodes:[{x:cx,y:cy}];c.strokeStyle=t.colors.secondary;c.fillStyle=t.colors.secondary;c.lineWidth=1.2;
    for(const p of pts){c.globalAlpha=.2+.7*bloom;c.beginPath();c.moveTo(cx,cy);c.lineTo(p.x+(cx-p.x)*gather,p.y+(cy-p.y)*gather);c.stroke();}
    const spokes=t.pattern==='nova'?40:t.pattern==='rays'?28:24;for(let i=0;i<spokes;i++){const a=Math.PI*2*i/spokes+now*.00035,m=1+.15*Math.sin(i*2.7+now*.004);c.globalAlpha=.08+.5*bloom;c.beginPath();c.moveTo(cx+Math.cos(a)*30,cy+Math.sin(a)*30);c.lineTo(cx+Math.cos(a)*diag*bloom*m,cy+Math.sin(a)*diag*bloom*m);c.stroke();}
    for(let r=1;r<=8;r++){const rr=diag/8*r*bloom,sides=10+r*2+(t.pattern==='grid'?4:0);c.globalAlpha=.07+.28*bloom;c.beginPath();for(let i=0;i<=sides;i++){const a=Math.PI*2*i/sides+now*(.0002+r*.00003),mod=1+.12*Math.sin(a*(3+r%4)+now*.003),x=cx+Math.cos(a)*rr*mod,y=cy+Math.sin(a)*rr*mod;i?c.lineTo(x,y):c.moveTo(x,y);}c.stroke();}
    if(t.pattern==='petals'||t.pattern==='rings')for(let i=0;i<16;i++){const a=Math.PI*2*i/16-now*.00028,rr=diag*(.18+.72*bloom);c.globalAlpha=.08+.28*bloom;c.beginPath();c.ellipse(cx+Math.cos(a)*rr*.36,cy+Math.sin(a)*rr*.36,rr*.72,rr*(t.pattern==='petals'?.14:.08),a,0,Math.PI*2);c.stroke();}
    c.globalAlpha=.08+.38*bloom;c.beginPath();c.arc(cx,cy,30+diag*.66*bloom,0,Math.PI*2);c.fill();}
}
