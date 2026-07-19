export class Synth {
  constructor(private ctx:AudioContext, private destination:AudioNode) {}
  tone(freq:number,duration=.12,type:OscillatorType='sine',gain=.05,when=this.ctx.currentTime,slide=0) {
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,when);
    if(slide) o.frequency.exponentialRampToValueAtTime(Math.max(20,freq+slide),when+duration);
    g.gain.setValueAtTime(.0001,when); g.gain.exponentialRampToValueAtTime(gain,when+.008); g.gain.exponentialRampToValueAtTime(.0001,when+duration);
    o.connect(g).connect(this.destination); o.start(when); o.stop(when+duration+.03);
  }
  noise(duration=.05,gain=.02,when=this.ctx.currentTime,cutoff=4800) {
    const length=Math.ceil(this.ctx.sampleRate*duration), buffer=this.ctx.createBuffer(1,length,this.ctx.sampleRate), data=buffer.getChannelData(0);
    for(let i=0;i<length;i++) data[i]=(Math.random()*2-1)*(1-i/length);
    const source=this.ctx.createBufferSource(), filter=this.ctx.createBiquadFilter(), g=this.ctx.createGain();
    source.buffer=buffer; filter.type='highpass'; filter.frequency.value=cutoff;
    g.gain.setValueAtTime(gain,when); g.gain.exponentialRampToValueAtTime(.0001,when+duration);
    source.connect(filter).connect(g).connect(this.destination); source.start(when);
  }
}
