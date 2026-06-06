# @kodeking/lottie-to-webp

> Convert Lottie JSON animations to **animated WebP** — Node.js CLI + programmatic API

[![npm](https://img.shields.io/npm/v/@kodeking/lottie-to-webp)](https://www.npmjs.com/package/@kodeking/lottie-to-webp)
[![license](https://img.shields.io/npm/l/@kodeking/lottie-to-webp)](LICENSE)

Better than GIF: full RGBA transparency, smaller files, smoother gradients. Uses **img2webp** (preferred) or **ffmpeg** for encoding. Try it live at [iconking.net/tools/lottie-to-webp](https://iconking.net/tools/lottie-to-webp).

---

## Prerequisites

| Tool | Required | Install |
|---|---|---|
| Node.js ≥ 18 | ✅ | — |
| img2webp | Recommended | `brew install webp` / [developers.google.com/speed/webp](https://developers.google.com/speed/webp/download) |
| ffmpeg | Fallback | `brew install ffmpeg` / [ffmpeg.org](https://ffmpeg.org/download.html) |

---

## Install

```bash
npm install -g @kodeking/lottie-to-webp
npx @kodeking/lottie-to-webp input.json output.webp
```

---

## CLI

```bash
lottie-to-webp input.json output.webp [--fps 15] [--width 480] [--quality 80]
```

---

## Programmatic API

```js
const { convertToWebp } = require('@kodeking/lottie-to-webp');

await convertToWebp({
  input:   'animation.json',
  output:  'animation.webp',
  fps:     15,
  width:   480,
  quality: 80,
});
```

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `input` | `string` | required | Path to Lottie JSON |
| `output` | `string` | required | Path for output WebP |
| `fps` | `number` | `15` | Frame rate |
| `width` | `number` | `480` | Width in px |
| `height` | `number` | same as width | Height in px |
| `quality` | `number` | `80` | Encoding quality 1–100 |

---

## WebP vs GIF

| Feature | WebP | GIF |
|---|---|---|
| Max colors | Full RGB | 256 |
| Transparency | Full RGBA | 1-bit (on/off) |
| File size | ~70% smaller | baseline |
| Browser support | All modern browsers | Universal |

---

## License

MIT © [KodeKing](https://github.com/kodeking)

See all tools at [github.com/kodeking/lottie-tools](https://github.com/kodeking/lottie-tools).
