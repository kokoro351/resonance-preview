export const DEFAULTS = {
  energyThreshold: 800, maxNodes: 10, maxWaves: 20, maxParticles: 220,
  flowParticles: 280, finaleParticles: 350, maxConnections: 45, maxEchoLines: 80,
  syncWindowMs: 95, finaleSteps: 44, whiteHoldMs: 1000, fadeMs: 2800,
  silenceMs: 1100, rebirthMs: 1500, nodeCooldownMs: 480,
  normalSfx: .8, syncSfx: 1.25,
  waveOpacity: .72, waveWidth: 2.15, waveLifeMs: 3600,
  contactParticles: 10, syncParticleMultiplier: 2.1,
  beatPulse: .032, cameraZoom: .018, cameraRotation: .018,
  flowAt: 3, tranceAt: 4, resonanceAt: 6,
  finaleGatherMs: 900, finaleStructureMs: 1500, finaleExpandMs: 5200,
  finaleMainLines: 12, finaleStructureLines: 36, finaleEchoLines: 72,
} as const;

export type AppState = 'idle'|'active'|'finale'|'whiteout'|'silence'|'rebirth';

export function debugConfig() {
  const q = new URLSearchParams(location.search);
  const n = (key:string, fallback:number, min=0, max=Infinity) => {
    const value=Number(q.get(key)); return Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
  };
  return {
    debug:q.get('debug')==='1', track:Math.round(n('track',1,1,5))-1,
    initialEnergy:n('energy',0), threshold:n('threshold',DEFAULTS.energyThreshold,1),
    syncWindow:n('sync',DEFAULTS.syncWindowMs,40,160), finaleSteps:n('finaleSteps',DEFAULTS.finaleSteps,4,80),
    waveOpacity:n('waveOpacity',DEFAULTS.waveOpacity,.1,1), waveWidth:n('waveWidth',DEFAULTS.waveWidth,.5,5),
    waveLife:n('waveLife',DEFAULTS.waveLifeMs,1200,7000), contactParticles:n('contactParticles',DEFAULTS.contactParticles,2,30),
    syncParticleMultiplier:n('syncParticles',DEFAULTS.syncParticleMultiplier,1,4), beatPulse:n('beatPulse',DEFAULTS.beatPulse,0,.1),
    cameraZoom:n('cameraZoom',DEFAULTS.cameraZoom,0,.03), cameraRotation:n('cameraRotation',DEFAULTS.cameraRotation,0,.04),
    flowAt:Math.round(n('flowAt',DEFAULTS.flowAt,2,5)), tranceAt:Math.round(n('tranceAt',DEFAULTS.tranceAt,3,7)), resonanceAt:Math.round(n('resonanceAt',DEFAULTS.resonanceAt,5,10)),
    finaleGather:n('finaleGather',DEFAULTS.finaleGatherMs,400,1800), finaleStructure:n('finaleStructure',DEFAULTS.finaleStructureMs,700,3000), finaleExpand:n('finaleExpand',DEFAULTS.finaleExpandMs,2500,9000),
    mainLines:Math.round(n('mainLines',DEFAULTS.finaleMainLines,6,20)), structureLines:Math.round(n('structureLines',DEFAULTS.finaleStructureLines,12,45)), echoLines:Math.round(n('echoLines',DEFAULTS.finaleEchoLines,20,80)),
  };
}

export type RuntimeConfig = ReturnType<typeof debugConfig>;
