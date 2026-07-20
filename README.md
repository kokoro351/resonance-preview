# RESONANCE

タップで生まれる点と波が8分音符の電子音楽に共鳴し、転調フィナーレ、ホワイトアウト、静寂、一粒への再誕までを一続きで体験する、スマートフォン優先のデジタル玩具です。

Issue #3の `resonance_prototype_v16.html` を体験設計の基準に、Vanilla TypeScript、Canvas 2D、Web Audio API、Viteで整理しています。外部音源は使用していません。

## 起動

Node.js 20.19以上（または22.12以上）を用意してください。

```sh
npm install
npm run dev
```

同一LAN内の端末では、Viteが表示するNetwork URLへアクセスできます。音声はブラウザ制約により中央の一粒を最初にタップした時点で始まります。

```sh
npm run typecheck
npm run build
npm run preview
```

## デバッグ

- `?debug=1`: 状態パネルと強制フィナーレボタン
- `?track=3`: 初期トラック（1〜5）
- `?energy=760`: 初期エネルギー
- `?threshold=100`: 臨界値
- `?sync=95`: SYNC判定幅の調整用値
- `?finaleSteps=44`: 転調後の8分音符数（既定44 = 約5.5小節）

例: `http://localhost:5173/?debug=1&energy=760`
視覚調整用クエリ:

- `waveOpacity`, `waveWidth`, `waveLife`
- `contactParticles`, `syncParticles`
- `beatPulse`, `cameraZoom`, `cameraRotation`
- `flowAt`, `tranceAt`, `resonanceAt`
- `finaleGather`, `finaleStructure`, `finaleExpand`
- `mainLines`, `structureLines`, `echoLines`

例: `?debug=1&waveOpacity=.6&beatPulse=.025&cameraZoom=.015`

## スマートフォン用公開プレビュー（Vercel）

GitHub Pages確認URL: `https://kokoro351.github.io/resonance-preview/`

`main` ブランチへのpush時に `.github/workflows/deploy-pages.yml` が自動でビルド・公開します。

`vercel.json` を同梱しています。GitHubへpush後、Vercel Dashboardで **Add New → Project** から対象リポジトリをImportすると、Framework PresetはViteとして自動認識されます。Build Commandは `npm run build`、Output Directoryは `dist` です。Deploy後に発行される `https://...vercel.app` は外出先のAndroid Chrome / iPhone Safariから確認できます。

CLIを使う場合:

```sh
npm install -g vercel
vercel login
vercel
vercel --prod
```

確認用途のため `noindex, nofollow` と `robots.txt` を設定しています。ただしURLを知る人は閲覧できます。アクセス制限が必要な場合はVercelのDeployment Protectionを有効にしてください。

## 実装構成

- `src/audio`: 5曲の定義、音楽クロック、Web Audioシンセ
- `src/game`: 点・波・粒子、SYNC/連続SYNC、状態遷移、フィナーレ
- `src/visual`: 通常描画と楽曲別の全面フィナーレ模様
- `src/config`: 上限値・タイミング・デバッグ設定

点10、波20、粒子220を上限とし、派生波は1世代、同一点にはクールダウン、1フレームの波あたり共鳴2件までに制限しています。フィナーレではBGMを停止・再起動せず、同じ8分音符クロック上で転調・音域上昇・レイヤー追加を行います。独立したフィナーレ単音やホワイトノイズは鳴らしません。
