import React, { useId } from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { City } from "./CityLayers";
import { Hero } from "./Hero";
import { Dimension, HEIGHT, TITLE_FRAMES, WIDTH, hash } from "./constants";
import { comicFont } from "./fonts";

// Pendulum swing: anchors sit above the screen and the hero swings from one
// to the next while the city scrolls past.
const ROPE = 340;
const SWING = 0.85;
const SPAN = 2 * ROPE * Math.sin(SWING);
const FRAMES_PER_SWING = 40;
export const SPEED = SPAN / FRAMES_PER_SWING;
const HERO_X = 520;
const ANCHOR_Y = -80;

export const camAt = (frame: number) => (frame - TITLE_FRAMES) * SPEED;

export const heroAt = (frame: number) => {
  // Characters animate "on twos" (every other frame) while the camera stays
  // smooth, which gives that stop-motion comic feel.
  const camX = camAt(Math.floor(frame / 2) * 2);
  const s = camX / SPAN;
  const k = Math.floor(s);
  const p = s - k;
  const theta = -SWING * Math.cos(Math.PI * p);
  const anchorX = HERO_X + SPAN / 2 - SPAN * p;
  return {
    p,
    swing: k,
    theta,
    anchorX,
    anchorY: ANCHOR_Y,
    x: anchorX + ROPE * Math.sin(theta),
    y: ANCHOR_Y + ROPE * Math.cos(theta),
  };
};

export const Scene: React.FC<{ dim: Dimension; frame: number; aberration?: number; showText?: boolean; dimFrame?: number }> = ({
  dim,
  frame,
  aberration = 5,
  showText = true,
  dimFrame = 999,
}) => {
  const uid = useId().replace(/:/g, "");
  const cam = camAt(frame);
  const hero = heroAt(frame);
  const deg = (-hero.theta * 180) / Math.PI;
  const swingFrame = hero.p * FRAMES_PER_SWING;
  const jitter = (hash(Math.floor(frame / 2)) - 0.5) * 3;

  const streaks = Array.from({ length: 9 }, (_, i) => {
    const seed = i + Math.floor(frame / 2) * 0.17;
    const y = hero.y + 40 + (hash(seed) - 0.4) * 260;
    const len = 80 + hash(seed * 3) * 260;
    const x1 = hero.x - 90 - hash(i * 7) * 80;
    return <line key={i} x1={x1 - len} y1={y} x2={x1} y2={y} stroke={dim.streaks} strokeWidth={2 + hash(seed * 5) * 5} strokeLinecap="round" opacity={0.8} />;
  });

  const captionX = interpolate(dimFrame, [0, 10, 58, 66], [-520, 40, 40, -520], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const thwipScale = interpolate(swingFrame, [0, 3, 6, 13, 16], [0, 1.35, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
        <City dim={dim} uid={uid} cam={cam} />
        {streaks}
        <line x1={hero.anchorX} y1={hero.anchorY} x2={hero.x} y2={hero.y} stroke={dim.web} strokeWidth={4} />
        <g transform={`translate(${hero.x} ${hero.y}) rotate(${deg}) scale(1.15)`}>
          <g transform={`translate(${-aberration - jitter} 0)`} opacity={0.75}>
            <Hero suit={dim.suit} accent={dim.accent} eyes={dim.eyes} tint="#ff1f5a" />
          </g>
          <g transform={`translate(${aberration + jitter} 0)`} opacity={0.75}>
            <Hero suit={dim.suit} accent={dim.accent} eyes={dim.eyes} tint="#00e5ff" />
          </g>
          <Hero suit={dim.suit} accent={dim.accent} eyes={dim.eyes} />
        </g>
      </svg>
      {showText && (
        <>
          <div
            style={{
              position: "absolute",
              left: captionX,
              top: 36,
              background: "#ffd60a",
              border: "5px solid #000",
              boxShadow: "8px 8px 0 #000",
              padding: "6px 22px 2px",
              fontFamily: comicFont,
              color: "#000",
              transform: "rotate(-2deg)",
            }}
          >
            <div style={{ fontSize: 26, letterSpacing: 2 }}>EARTH-{dim.id}</div>
            <div style={{ fontSize: 54, lineHeight: 1 }}>{dim.name}</div>
          </div>
          {thwipScale > 0 && (
            <div
              style={{
                position: "absolute",
                left: Math.min(WIDTH - 280, Math.max(20, hero.anchorX - 40)),
                top: 70,
                fontFamily: comicFont,
                fontSize: 96,
                color: dim.sfx,
                WebkitTextStroke: "4px #000",
                textShadow: "6px 6px 0 #fff",
                transform: `scale(${thwipScale}) rotate(-10deg)`,
              }}
            >
              THWIP!
            </div>
          )}
        </>
      )}
    </AbsoluteFill>
  );
};
