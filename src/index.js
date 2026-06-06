#!/usr/bin/env node
/**
 * @koding-net/lottie-to-webp
 *
 * Convert a Lottie JSON animation to animated WebP.
 * Uses Puppeteer to render frames, img2webp (preferred) or ffmpeg for encoding.
 *
 * CLI:  npx lottie-to-webp input.json output.webp [--fps 15] [--width 480]
 * API:  const { convertToWebp } = require('@koding-net/lottie-to-webp')
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const os   = require('os');
const { execFileSync, execSync } = require('child_process');
const { renderFrames } = require('./render');

/**
 * Convert a Lottie JSON file to animated WebP.
 *
 * Animated WebP supports full RGBA (transparency), has better compression
 * than GIF, and is supported by all modern browsers.
 *
 * @param {object} options
 * @param {string} options.input    Path to the Lottie JSON file
 * @param {string} options.output   Path for the output WebP
 * @param {number} [options.fps=15]     Frame rate
 * @param {number} [options.width=480]  Output width in px
 * @param {number} [options.height]     Output height in px (default: same as width)
 * @param {number} [options.quality=80] Encoding quality 1–100
 */
async function convertToWebp({ input, output, fps = 15, width = 480, height, quality = 80 } = {}) {
  if (!input)  throw new Error('input is required');
  if (!output) throw new Error('output is required');

  const h = height ?? width;
  const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lottie-webp-'));

  try {
    const manifest = await renderFrames({ inputPath: input, outputDir: workDir, fps, width, height: h });

    const frames = fs
      .readdirSync(path.join(workDir, 'frames'))
      .filter(f => f.endsWith('.png'))
      .sort()
      .map(f => path.join(workDir, 'frames', f));

    if (frames.length === 0) throw new Error('No frames were rendered.');

    const delayMs = Math.round(1000 / manifest.fps);
    const img2webp = findBin('img2webp');

    if (img2webp) {
      // img2webp (from libwebp tools) — best quality
      const cmd = [img2webp, '-lossy', '-q', String(quality)];
      for (const frame of frames) {
        cmd.push('-d', String(delayMs), frame);
      }
      cmd.push('-o', output);
      execFileSync(cmd[0], cmd.slice(1), { stdio: 'pipe' });
    } else {
      // ffmpeg fallback
      const ffmpeg = requireBin('ffmpeg', 'Install ffmpeg: https://ffmpeg.org/download.html');
      execFileSync(ffmpeg, [
        '-y',
        '-framerate', String(manifest.fps),
        '-i', path.join(workDir, 'frames', 'frame-%06d.png'),
        '-vcodec', 'webp',
        '-loop', '0',
        '-q:v', String(quality),
        output,
      ], { stdio: 'pipe' });
    }

    return { output, frames: manifest.totalFrames, fps: manifest.fps, width, height: h };
  } finally {
    fs.rmSync(workDir, { recursive: true, force: true });
  }
}

function findBin(name) {
  try { return execSync(`which ${name} 2>/dev/null`).toString().trim() || null; } catch { return null; }
}

function requireBin(name, hint) {
  const p = findBin(name);
  if (!p) throw new Error(`${name} not found. ${hint}`);
  return p;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const flags = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) { flags[args[i].slice(2)] = args[++i]; }
    else { positional.push(args[i]); }
  }
  const [input, output = input?.replace(/\.json$/i, '.webp')] = positional;
  if (!input) {
    console.error('Usage: lottie-to-webp <input.json> [output.webp] [--fps 15] [--width 480] [--quality 80]');
    process.exit(1);
  }
  convertToWebp({ input, output, fps: Number(flags.fps ?? 15), width: Number(flags.width ?? 480), height: flags.height ? Number(flags.height) : undefined, quality: Number(flags.quality ?? 80) })
    .then(r => console.log(`✓ WebP saved to ${r.output} (${r.frames} frames at ${r.fps}fps)`))
    .catch(e => { console.error(`✗ ${e.message}`); process.exit(1); });
}

module.exports = { convertToWebp };
