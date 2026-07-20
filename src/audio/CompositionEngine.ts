import type {Track} from './TrackDefinitions';

export interface CompositionState {
  tapDensity:number; averageTapInterval:number; averageTapX:number; averageTapY:number;
  kickIntensity:number; kickVariation:number; snareTone:number; snareFillLevel:number;
  hiHatDensity:number; hiHatOpenAmount:number; melodyNotes:number[]; melodyCursor:number;
  arpeggioNotes:number[]; arpeggioCursor:number; syncStreak:number; compositionEnergy:number;
  currentMelodyNote:number; nextQuantizedBeat:number;
}
type QueuedMelody={note:number;synced:boolean};

const NOTE_MAPS=[[0,2,4,5,7],[0,1,3,4,6],[0,2,3,5,7],[0,2,4,6,7],[0,2,4,5,7]];

export class CompositionEngine {
  state:CompositionState=this.createState();
  private taps:{at:number;x:number;y:number}[]=[];private melodyQueue:QueuedMelody[]=[];private frozen?:CompositionState;
  reset(){this.state=this.createState();this.taps=[];this.melodyQueue=[];this.frozen=undefined;}
  update(now:number,dt:number,syncStreak:number){
    this.taps=this.taps.filter(t=>now-t.at<=4000);const rawDensity=this.taps.length/4,targetHat=rawDensity<.65?0:rawDensity<1.55?.5:1,k=1-Math.exp(-dt/650);
    this.state.tapDensity+=(rawDensity-this.state.tapDensity)*k;this.state.hiHatDensity+=(targetHat-this.state.hiHatDensity)*k;this.state.syncStreak=syncStreak;this.state.compositionEnergy=Math.min(1,this.state.tapDensity*.25+syncStreak*.08+this.state.melodyNotes.length*.025+this.state.arpeggioNotes.length*.02);
    if(this.taps.length>1){const intervals=this.taps.slice(1).map((t,i)=>t.at-this.taps[i].at);this.state.averageTapInterval=intervals.reduce((a,b)=>a+b,0)/intervals.length;}
  }
  recordTap(track:Track,x:number,y:number,synced:boolean,now:number){
    const px=this.clamp(x),py=this.clamp(y),note=this.noteForPoint(track,px,py);this.taps.push({at:now,x:px,y:py});if(this.taps.length>16)this.taps.shift();
    const smoothing=.22;this.state.averageTapX+=(px-this.state.averageTapX)*smoothing;this.state.averageTapY+=(py-this.state.averageTapY)*smoothing;this.melodyQueue.push({note,synced});if(this.melodyQueue.length>8)this.melodyQueue.shift();
    if(synced){this.state.melodyNotes.push(note);if(this.state.melodyNotes.length>8)this.state.melodyNotes.shift();}
    this.state.currentMelodyNote=note;return note;
  }
  recordContact(track:Track,x:number,y:number,synced:boolean){
    const note=this.noteForPoint(track,this.clamp(x),this.clamp(y));if(synced){this.state.arpeggioNotes.push(note);if(this.state.arpeggioNotes.length>8)this.state.arpeggioNotes.shift();}else if(this.state.arpeggioNotes.length<2)this.state.arpeggioNotes.push(note);return note;
  }
  consumeMelody(){const queued=this.melodyQueue.shift();if(queued){this.state.currentMelodyNote=queued.note;return queued;}if(this.state.melodyNotes.length){const note=this.state.melodyNotes[this.state.melodyCursor++%this.state.melodyNotes.length];this.state.currentMelodyNote=note;return{note,synced:false};}return undefined;}
  nextArpeggio(finale=false){const state=finale&&this.frozen?this.frozen:this.state,notes=state.arpeggioNotes.length?state.arpeggioNotes:undefined;if(!notes)return undefined;const note=notes[state.arpeggioCursor++%notes.length];return note;}
  freeze(){this.frozen={...this.state,melodyNotes:[...this.state.melodyNotes],arpeggioNotes:[...this.state.arpeggioNotes]};}
  get playbackState(){return this.frozen??this.state;}
  setNextBeat(step:number){this.state.nextQuantizedBeat=step;}
  private noteForPoint(track:Track,x:number,y:number){const trackIndex=['LUMEN DRIVE','EMBER PULSE','AQUA BLOOM','VIOLET GRID','NOVA ASCENT'].indexOf(track.name),map=NOTE_MAPS[Math.max(0,trackIndex)],bucket=Math.min(4,Math.floor(x*5)),scaleIndex=map[bucket]%track.scale.length,octave=y<.33?12:y>.67?-12:0;return track.scale[scaleIndex]+octave;}
  private clamp(v:number){return Math.max(0,Math.min(.999,v));}
  private createState():CompositionState{return{tapDensity:0,averageTapInterval:0,averageTapX:.5,averageTapY:.5,kickIntensity:0,kickVariation:0,snareTone:.5,snareFillLevel:0,hiHatDensity:0,hiHatOpenAmount:0,melodyNotes:[],melodyCursor:0,arpeggioNotes:[],arpeggioCursor:0,syncStreak:0,compositionEnergy:0,currentMelodyNote:0,nextQuantizedBeat:0};}
}
