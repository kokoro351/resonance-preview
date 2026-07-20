import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kokoro351.resonance',
  appName: 'RESONANCE: Tap the Sound',
  webDir: 'dist',
  backgroundColor: '#05070d',
  android: {
    backgroundColor: '#05070d',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
