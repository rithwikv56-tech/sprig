import React from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { Hero } from "./Hero";
import { DIMENSIONS, FPS, HEIGHT, WIDTH, hash } from "./constants";
import { comicFont } from "./fonts";

// "Leap of faith": the hero free-falls head first past streaks from every
// dimension, then the comic closes on a TO BE CONTINUED panel.
export const Ending: React.FC<{ frame: number }> = ({ frame }) => {
  const dim = DIMENSIONS[0];
  const fallEnd = 86;
  const twos = Math.floor(frame / 2) * 2;

  if (frame >= fallEnd) {
    const f = frame - fallEnd;
    const pop = spring({ frame: f - 6, fps: FPS, config: { damping: 10 } });
    const flash = interpolate(f, [0, 6], [1, 0], { extrapolateRight: "clamp" });
    const j = f < 14 ? (hash(f) - 0.5) * 16 : 0;
    return (
      <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <AbsoluteFill
          style={{
            backgroundImage: "radial-gradient(#3c096c 2px, transparent 2.5px)",
            backgroundSize: "16px 16px",
            opacity: 0.7,
          }}
        />
        <div
          style={{
            transform: `scale(${pop}) rotate(-2deg) translateX(${j}px)`,
            background: "#ffd60a",
            border: "7px solid #000",
            boxShadow: `${12 + j}px 12px 0 #ff1f5a, ${-12 - j}px -12px 0 #00e5ff`,
            padding: "10px 48px 2px",
            fontFamily: comicFont,
            fontSize: 110,
            color: "#000",
            letterSpacing: 4,
          }}
        >
          TO BE CONTINUED...
        </div>
        <div
          style={{
            marginTop: 50,
            opacity: interpolate(f, [18, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            fontFamily: comicFont,
            fontSize: 40,
            letterSpacing: 10,
            color: "#fff",
          }}
        >
          SPIDER : ACROSS THE UNIVERSE
        </div>
        <AbsoluteFill style={{ background: "#fff", opacity: flash }} />
      </AbsoluteFill>
    );
  }

  const spin = 180 + twos * 1.6;
  const scale = interpolate(frame, [0, fallEnd], [1.3, 2.1]);
  const streaks = Array.from({ length: 46 }, (_, i) => {
    const color = DIMENSIONS[i % DIMENSIONS.length].windows;
    const x = hash(i * 3.7) * WIDTH;
    const len = 120 + hash(i * 1.3) * 380;
    const speed = 30 + hash(i * 5.1) * 50;
    const y = HEIGHT + 400 - ((hash(i * 9.2) * 1600 + frame * speed) % (HEIGHT + 900));
    return <rect key={i} x={x} y={y} width={3 + hash(i) * 7} height={len} fill={color} opacity={0.85} />;
  });
  const words = interpolate(frame, [20, 32, 64, 74], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #240046 0%, #03045e 45%, #000 100%)" }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(157,78,221,0.6) 2px, transparent 2.5px)",
          backgroundSize: "18px 18px",
        }}
      />
      <svg width={WIDTH} height={HEIGHT}>
        {streaks}
        <g transform={`translate(${WIDTH / 2 + Math.sin(twos / 9) * 30} ${HEIGHT / 2 - 40}) rotate(${spin}) scale(${scale}) translate(10 -100)`}>
          <g transform="translate(-6 0)" opacity={0.75}>
            <Hero suit={dim.suit} accent={dim.accent} eyes={dim.eyes} tint="#ff1f5a" />
          </g>
          <g transform="translate(6 0)" opacity={0.75}>
            <Hero suit={dim.suit} accent={dim.accent} eyes={dim.eyes} tint="#00e5ff" />
          </g>
          <Hero suit={dim.suit} accent={dim.accent} eyes={dim.eyes} />
        </g>
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 60 }}>
        <div
          style={{
            opacity: words,
            fontFamily: comicFont,
            fontSize: 64,
            color: "#fff",
            WebkitTextStroke: "3px #000",
            letterSpacing: 6,
            transform: "rotate(-2deg)",
          }}
        >
          IT'S A LEAP OF FAITH.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
