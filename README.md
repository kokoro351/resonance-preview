# RESONANCE: Tap the Sound

RESONANCE is a touch-first audiovisual instrument. Every tap creates a point and a wave; every collision becomes light, rhythm, melody, and arpeggio. The world remembers short motifs, answers them one bar later, and develops the session into a continuous two-part finale.

The music and visuals are generated in real time. No copyrighted audio samples, accounts, ads, analytics, or network connection are required.

## Web development

Requirements: Node.js 20.19+ or 22.12+.

```sh
npm install
npm run dev
npm run typecheck
npm run build
```

Public web preview: <https://kokoro351.github.io/resonance-preview/>

## Android development

The Android app uses Capacitor and packages the Vite build locally, so gameplay works offline.
Android builds require JDK 21. Android Studio's bundled JBR can be used as `JAVA_HOME`.

```sh
npm run android:sync
cd android
gradlew.bat assembleDebug
```

Open the `android` directory in Android Studio to run the app on a physical device or emulator.

### Release bundle

Google Play releases use an upload key. Generate it once and back it up securely:

```sh
keytool -genkeypair -v -keystore android/resonance-upload-key.jks -alias resonance-upload -keyalg RSA -keysize 2048 -validity 10000
```

Copy `android/keystore.properties.example` to `android/keystore.properties`, then enter the real passwords. Both the properties file and keystore are excluded from Git.

```sh
npm run android:sync
cd android
gradlew.bat bundleRelease
```

The signed bundle is created at `android/app/build/outputs/bundle/release/app-release.aab`.

## Google Play materials

- English listing text: `store-assets/metadata/en-US/`
- Store icon and feature graphic: `store-assets/google-play/`
- Console checklist and Data safety draft: `store-assets/PLAY_CONSOLE_CHECKLIST.md`
- Privacy policy: `public/privacy.html`

## Debug mode

Use `?debug=1` for the development panel. Useful query parameters include `track`, `energy`, `threshold`, `sync`, `waveOpacity`, `beatPulse`, `cameraZoom`, and finale timing/line-count controls.

## Architecture

- `src/audio`: Web Audio clock, synthesis, five track definitions, composition playback
- `src/game`: input, waves, nodes, SYNC states, motif memory, session/finale state
- `src/visual`: real-time rendering, particles, audio-reactive camera, finale geometry
- `src/config`: limits, timing, and debug configuration

The active music clock continues through the finale. No separate finale track, noise sweep, or independent sustained ending tone is used.
