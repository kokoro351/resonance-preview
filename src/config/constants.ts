export const DEFAULTS = {
  energyThreshold: 800, maxNodes: 10, maxWaves: 20, maxParticles: 220,
  syncWindowMs: 95, finaleSteps: 44, whiteHoldMs: 1000, fadeMs: 2800,
  silenceMs: 1100, rebirthMs: 1500, nodeCooldownMs: 480,
  normalSfx: .8, syncSfx: 1.25,
} as const;

export type AppState = 'idle'|'active'|'finale'|'whiteout'|'silence'|'rebirth';

export function debugConfig() {
  const q = new URLSearchParams(location.search);
  const n = (key:string, fallback:number) => {
    const value=Number(q.get(key)); return Number.isFinite(value)&&value>0?value:fallback;
  };
  return {
    debug:q.get('debug')==='1', track:Math.max(0,Math.min(4,n('track',1)-1)),
    initialEnergy:Math.max(0,n('energy',0)), threshold:n('threshold',DEFAULTS.energyThreshold),
    syncWindow:n('sync',DEFAULTS.syncWindowMs), finaleSteps:n('finaleSteps',DEFAULTS.finaleSteps),
  };
}
