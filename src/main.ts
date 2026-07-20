import './style.css';
import {AudioEngine} from './audio/AudioEngine';
import {TRACKS} from './audio/TrackDefinitions';
import {debugConfig,DEFAULTS} from './config/constants';
import {ResonanceEngine} from './game/ResonanceEngine';
import {FinaleController} from './game/FinaleController';
import {Renderer} from './visual/Renderer';

const canvas=document.querySelector<HTMLCanvasElement>('#resonance')!,hint=document.querySelector<HTMLDivElement>('#hint')!,syncEl=document.querySelector<HTMLDivElement>('#sync')!,whiteout=document.querySelector<HTMLDivElement>('#whiteout')!;
const debugToggle=document.querySelector<HTMLButtonElement>('#debug-toggle')!,debugPanel=document.querySelector<HTMLElement>('#debug-panel')!,debugReadout=document.querySelector<HTMLOutputElement>('#debug-readout')!,forceFinale=document.querySelector<HTMLButtonElement>('#force-finale')!;
const cfg=debugConfig(),audio=new AudioEngine(cfg.syncWindow),engine=new ResonanceEngine(cfg.threshold,cfg.initialEnergy,cfg),finale=new FinaleController(engine,cfg.finaleSteps),renderer=new Renderer(canvas,cfg);
let trackIndex=cfg.track,track=TRACKS[trackIndex],finaleDuration=0,last=performance.now(),syncTimer=0,finaleStarted=false;
document.documentElement.style.background=track.colors.bg;

function showSync(label:string){syncEl.textContent=label;syncEl.classList.add('show');clearTimeout(syncTimer);syncTimer=window.setTimeout(()=>syncEl.classList.remove('show'),360);}
function judge(){const{accuracy,beat}=audio.beatAccuracy(),result=engine.sync.judge(accuracy,beat,performance.now());if(result.synced)showSync(result.label);return result;}
function advanceTrackIfNeeded(){if(!finaleStarted)return;trackIndex=(trackIndex+1)%TRACKS.length;track=TRACKS[trackIndex];finaleStarted=false;document.documentElement.style.background=track.colors.bg;}
async function begin(){await audio.init();engine.begin();audio.start(track);hint.style.opacity='0';finaleStarted=false;whiteout.classList.remove('show');}
async function input(x:number,y:number){if(engine.state==='idle'||engine.state==='rebirth'){advanceTrackIfNeeded();await begin();x=renderer.w/2;y=renderer.h/2;}if(engine.state!=='active'){engine.burst(x,y,3,.5);return;}const point=renderer.screenToWorld(x,y),result=judge();engine.tap(point.x,point.y,result);audio.tap(result.synced?result.accuracy:0,engine.taps);if(result.synced)renderer.focus(point.x,point.y,result.accuracy);}
canvas.addEventListener('pointerdown',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();void input(e.clientX-r.left,e.clientY-r.top);},{passive:false});
window.addEventListener('resize',renderer.resize);document.addEventListener('visibilitychange',()=>{if(!document.hidden&&audio.ctx?.state==='suspended')void audio.ctx.resume();});
audio.onBeat=event=>renderer.beat(event);

function startFinale(now:number){finaleStarted=true;finaleDuration=finale.start(now,Math.min(160,audio.bpm+16));audio.enterFinale();audio.fadeAfter(finaleDuration/1000+DEFAULTS.whiteHoldMs/1000,DEFAULTS.fadeMs/1000);}
function loop(now:number){const dt=Math.min(34,now-last);last=now;if(engine.state==='active'||engine.state==='finale')audio.setProgress(engine.progress);engine.update(now,dt,judge,(result,index)=>{audio.resonate(result.synced?result.accuracy:0,index);if(result.synced){showSync(result.label);const n=engine.nodes[index];if(n)renderer.focus(n.x,n.y,result.accuracy);}});if(engine.state==='active'&&engine.energy>=engine.threshold&&!finaleStarted)startFinale(now);finale.update(now,finaleDuration);whiteout.classList.toggle('show',engine.state==='whiteout');if(engine.state==='silence')audio.stop();if(engine.state==='rebirth'){hint.textContent='中央の光をタップ';hint.style.opacity='1';}if(engine.state==='idle'&&finaleStarted)advanceTrackIfNeeded();renderer.draw(now,engine,track);if(cfg.debug)debugReadout.textContent=`${engine.state} · ${track.name}\n${Math.round(audio.bpm)} BPM · energy ${Math.round(engine.energy)}/${engine.threshold}\nnodes ${engine.nodes.length}/10 · waves ${engine.waves.length}/20 · particles ${engine.particles.length}/${engine.sync.streak>=cfg.flowAt?280:220}\nSYNC ${engine.sync.streak} · level ${engine.transitionLevel}\nwave a:${cfg.waveOpacity} w:${cfg.waveWidth} life:${cfg.waveLife}\nbeat:${cfg.beatPulse} zoom:${cfg.cameraZoom} rotate:${cfg.cameraRotation}\nfinale ${cfg.finaleGather}/${cfg.finaleStructure}/${cfg.finaleExpand}ms\nlines ${cfg.mainLines}/${cfg.structureLines}/${cfg.echoLines}`;requestAnimationFrame(loop);}
if(cfg.debug){debugToggle.hidden=false;debugToggle.onclick=()=>debugPanel.hidden=!debugPanel.hidden;forceFinale.onclick=()=>{if(engine.state==='active')engine.energy=engine.threshold;};}
requestAnimationFrame(loop);
