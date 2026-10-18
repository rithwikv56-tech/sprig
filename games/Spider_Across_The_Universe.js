/*
@title: Spider Across The Universe
@description: A comic-book style animation inspired by multiverse spider movies. A masked spider-hero web-swings through a halftone city, then rips through glitching portals into new dimensions, each with its own colors, skyline and suit. Press D to jump to the next dimension, A to go back.
@author: rithwikv56-tech
@tags: ['animation']
@addedOn: 2026-10-18
*/

// The whole screen is drawn into our own 160x128 pixel buffer every frame,
// then sliced into 80 16x16 tiles that are pushed to the legend + map.
const W = 160;
const H = 128;
const FRAME_MS = 70;

const DIM_FRAMES = 110; // how long we stay in one dimension
const PORTAL_FRAMES = 18; // length of the portal / glitch transition

const dims = [
  { name: "NEON BROOKLYN", sky: "H", dot: "5", far: "5", near: "0", win: "6", suit: "0", acc: "3", eye: "2", web: "2", line: "8" },
  { name: "PASTEL CITY", sky: "8", dot: "2", far: "7", near: "5", win: "8", suit: "2", acc: "8", eye: "7", web: "2", line: "2" },
  { name: "MANGO METRO", sky: "6", dot: "9", far: "9", near: "3", win: "6", suit: "5", acc: "3", eye: "2", web: "2", line: "3" },
  { name: "NEO CITY 2099", sky: "5", dot: "7", far: "H", near: "0", win: "7", suit: "5", acc: "3", eye: "3", web: "7", line: "7" },
  { name: "COMIC NOIR", sky: "2", dot: "1", far: "1", near: "0", win: "2", suit: "0", acc: "L", eye: "2", web: "0", line: "0" },
];

// Swinging pose. Pivot (the hand holding the web) is at column 6, row 0.
// o = outline, m = suit, a = accent / web pattern, e = eyes
const HERO = [
  "......oo....",
  "......mo....",
  "......mo....",
  "..oooomo....",
  ".ommmmmo....",
  ".meeommo....",
  ".oeeomao....",
  "..ooommmoo..",
  "..mamammmmo.",
  "..maamam.mo.",
  "..mamamm..o.",
  "..ommmmo....",
  "..mmo.mmo...",
  ".mmo...mmo..",
  ".oo.....mm..",
  "........oo..",
];
const PIVOT_X = 6;
const SCALE = 2;

const buf = new Array(W * H).fill("0");
const nextBuf = new Array(W * H).fill("0");

let frame = 0;
let dimIndex = 0;
let dimFrame = 0;
let cam = 0;

function hash(n) {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
}

function put(out, x, y, c) {
  x = Math.round(x);
  y = Math.round(y);
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  out[y * W + x] = c;
}

function line(out, x0, y0, x1, y1, c) {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= steps; i++) {
    put(out, x0 + (x1 - x0) * i / steps, y0 + (y1 - y0) * i / steps, c);
  }
}

function rect(out, x0, y0, w, h, c) {
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) put(out, x, y, c);
}

// Where the hero is at a given camera position.
// The hero swings pendulum-style from anchors spaced along the skyline.
const ROPE = 58;
const SWING = 0.9;
const SPAN = 2 * ROPE * Math.sin(SWING);

function heroState(camX) {
  const s = camX / SPAN;
  const k = Math.floor(s);
  const p = s - k;
  const theta = -SWING * Math.cos(Math.PI * p);
  const anchorX = 60 + SPAN / 2 - SPAN * p; // anchor in screen space
  const anchorY = -8;
  return {
    p,
    swing: k,
    theta,
    anchorX,
    anchorY,
    x: anchorX + ROPE * Math.sin(theta),
    y: anchorY + ROPE * Math.cos(theta),
  };
}

function drawSky(out, d) {
  // Ben-Day halftone dots that grow toward the bottom of the screen
  for (let y = 0; y < H; y++) {
    const r = 0.7 + 2.5 * (y / H);
    const row = Math.floor(y / 6);
    for (let x = 0; x < W; x++) {
      const ox = (x + (row % 2) * 3) % 6 - 2.5;
      const oy = (y % 6) - 2.5;
      out[y * W + x] = ox * ox + oy * oy < r * r ? d.dot : d.sky;
    }
  }
}

function drawCity(out, d, camX, seed) {
  // far skyline (slow parallax)
  for (let x = 0; x < W; x++) {
    const fx = x + camX * 0.35;
    const col = Math.floor(fx / 14);
    const h = 34 + hash(col + seed) * 40;
    const antenna = hash(col * 5 + seed) > 0.8 && Math.floor(fx) % 14 === 7;
    const top = H - h - (antenna ? 8 : 0);
    for (let y = Math.max(0, Math.floor(top)); y < H; y++) {
      if (y < H - h && !antenna) continue;
      out[y * W + x] = d.far;
    }
  }

  // near buildings with lit windows (full-speed parallax)
  for (let x = 0; x < W; x++) {
    const nx = Math.floor(x + camX);
    const col = Math.floor(nx / 24);
    const lx = ((nx % 24) + 24) % 24;
    if (lx < 2) continue; // alley between buildings
    if (hash(col * 1.7 + seed + 3) < 0.12) continue; // empty lot
    const h = 18 + Math.floor(hash(col * 3.1 + seed) * 42);
    const top = H - h;
    for (let y = top; y < H; y++) {
      const ly = y - top;
      let c = d.near;
      if (ly === 0 || lx === 2 || lx === 23) c = d.near;
      else if (lx >= 5 && lx <= 21 && (lx - 5) % 4 < 2 && ly >= 4 && (ly - 4) % 6 < 3) {
        const lit = hash(col * 7 + Math.floor((lx - 5) / 4) * 13 + Math.floor((ly - 4) / 6) * 31 + seed);
        if (lit > 0.45) c = d.win;
      }
      out[y * W + x] = c;
    }
    // water tower on some roofs
    if (hash(col * 9 + seed) > 0.7 && lx >= 8 && lx <= 16) {
      rect(out, x, top - 7, 1, 5, d.near);
      if (lx === 8 || lx === 16) rect(out, x, top - 2, 1, 2, d.near);
    }
  }
}

function drawSpeedLines(out, d, hero) {
  for (let i = 0; i < 7; i++) {
    const y = Math.round(hero.y + (hash(i + frame * 0.13) - 0.3) * 30);
    const len = 12 + Math.floor(hash(i * 3 + frame) * 26);
    const x1 = Math.round(hero.x - 10 - hash(i * 7) * 10);
    line(out, x1 - len, y, x1, y, d.line);
  }
}

function drawHero(out, d, hero, tint) {
  const c = { o: "0", m: d.suit, a: d.acc, e: d.eye };
  // rotate the sprite so the body follows the web line
  const cos = Math.cos(hero.theta);
  const sin = Math.sin(hero.theta);
  const px = hero.x;
  const py = hero.y;
  for (let dy = -12; dy <= 40; dy++) {
    for (let dx = -36; dx <= 36; dx++) {
      const u = Math.floor((dx * cos - dy * sin) / SCALE + 0.5) + PIVOT_X;
      const v = Math.floor((dx * sin + dy * cos) / SCALE);
      if (v < 0 || v >= HERO.length || u < 0 || u >= HERO[0].length) continue;
      const k = HERO[v][u];
      if (k === ".") continue;
      put(out, px + dx, py + dy, tint || c[k]);
    }
  }
}

function drawWeb(out, d, hero) {
  line(out, hero.anchorX, hero.anchorY, hero.x, hero.y, d.web);
  line(out, hero.anchorX + 1, hero.anchorY, hero.x + 1, hero.y, d.web);
}

function renderScene(out, d, seed, glitchHero) {
  const hero = heroState(cam);
  drawSky(out, d);
  drawCity(out, d, cam, seed);
  drawSpeedLines(out, d, hero);
  drawWeb(out, d, hero);
  if (glitchHero) {
    // chromatic aberration, like a hero who doesn't belong in this dimension
    drawHero(out, d, { ...hero, x: hero.x - 3 }, "3");
    drawHero(out, d, { ...hero, x: hero.x + 3 }, "7");
  }
  drawHero(out, d, hero);
  return hero;
}

function portal(out, other, cx, cy, radius) {
  const ring = ["3", "7", "8", "6"];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const wobble = Math.sin(Math.atan2(dy, dx) * 6 + frame * 0.8) * 3;
      const r = radius + wobble;
      if (dist < r - 4) out[y * W + x] = other[y * W + x];
      else if (dist < r) {
        const a = Math.floor((Math.atan2(dy, dx) + Math.PI) * 4 + frame) % ring.length;
        out[y * W + x] = ring[(a + ring.length) % ring.length];
      }
    }
  }
}

function glitchRows(out, amount) {
  // slice-and-shift glitch bands
  const bands = Math.floor(amount * 8);
  for (let b = 0; b < bands; b++) {
    const y0 = Math.floor(hash(b * 17 + frame) * H);
    const h = 2 + Math.floor(hash(b * 5 + frame * 3) * 6);
    const shift = Math.floor((hash(b * 11 + frame * 7) - 0.5) * 30 * amount);
    const tint = hash(b + frame) > 0.5 ? "3" : "7";
    for (let y = y0; y < Math.min(H, y0 + h); y++) {
      const row = out.slice(y * W, y * W + W);
      for (let x = 0; x < W; x++) {
        const src = row[(x - shift + W) % W];
        out[y * W + x] = x % 3 === 0 ? tint : src;
      }
    }
  }
}

function caption(text, cx, cy, fill) {
  // comic caption box drawn in pixels; the text itself goes on top via addText
  const x0 = cx * 8 - 3;
  const y0 = cy * 8 - 3;
  rect(buf, x0 - 1, y0 - 1, text.length * 8 + 8, 16, "0");
  rect(buf, x0, y0, text.length * 8 + 6, 14, fill);
}

function present() {
  const legend = [];
  let m = "";
  for (let ty = 0; ty < 8; ty++) {
    for (let tx = 0; tx < 10; tx++) {
      const ch = String.fromCharCode(47 + tx + ty * 10);
      let bmp = "";
      for (let y = 0; y < 16; y++) {
        const start = (ty * 16 + y) * W + tx * 16;
        bmp += buf.slice(start, start + 16).join("") + "\n";
      }
      legend.push([ch, bitmap`${bmp}`]);
      m += ch;
    }
    m += "\n";
  }
  setLegend(...legend);
  setMap(map`${m}`);
}

function tick() {
  const d = dims[dimIndex];
  const nextIdx = (dimIndex + 1) % dims.length;
  const transitionAt = DIM_FRAMES - PORTAL_FRAMES;
  const inPortal = dimFrame >= transitionAt;
  const randomGlitch = hash(frame * 0.37) > 0.94;

  const hero = renderScene(buf, d, dimIndex * 101, inPortal || randomGlitch);

  if (inPortal) {
    const t = (dimFrame - transitionAt) / PORTAL_FRAMES;
    renderScene(nextBuf, dims[nextIdx], nextIdx * 101, true);
    portal(buf, nextBuf, hero.x, hero.y + 14, t * t * 220);
    glitchRows(buf, Math.sin(t * Math.PI));
  } else if (randomGlitch) {
    glitchRows(buf, 0.4);
  }

  clearText();

  // title card on the very first pass
  if (frame < 50) {
    caption("SPIDER", 7, 4, "3");
    caption("ACROSS THE UNIVERSE", 0, 6, "6");
    addText("SPIDER", { x: 7, y: 4, color: "2" });
    addText("ACROSS THE UNIVERSE", { x: 0, y: 6, color: "0" });
  } else if (dimFrame < 40) {
    caption(d.name, 1, 1, "6");
    addText(d.name, { x: 1, y: 1, color: "0" });
  }

  // comic sound effect each time a new web line is fired
  if (hero.p < 0.12 && !inPortal) {
    const tx = Math.max(0, Math.min(14, Math.round(hero.anchorX / 8) - 2));
    addText("THWIP!", { x: tx, y: 2, color: hash(hero.swing) > 0.5 ? "3" : "2" });
  }
  if (inPortal && dimFrame - transitionAt < 8) {
    addText("KRZZT!", { x: 12, y: 13, color: "6" });
  }

  present();

  frame++;
  cam += 4;
  dimFrame++;
  if (dimFrame >= DIM_FRAMES) {
    dimFrame = 0;
    dimIndex = nextIdx;
  }
}

onInput("d", () => {
  // jump straight into the portal
  if (dimFrame < DIM_FRAMES - PORTAL_FRAMES) dimFrame = DIM_FRAMES - PORTAL_FRAMES;
});

onInput("a", () => {
  dimIndex = (dimIndex + dims.length - 1) % dims.length;
  dimFrame = 0;
});

function loop() {
  tick();
  setTimeout(loop, FRAME_MS);
}

loop();
