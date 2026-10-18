import React, { useId } from "react";
import { AbsoluteFill, interpolate, spring } from "remotion";
import { City } from "./CityLayers";
import { DIMENSIONS, FPS, HEIGHT, WIDTH, hash } from "./constants";
import { comicFont } from "./fonts";

const SplitText: React.FC<{ text: string; size: number; frame: number; color: string; spread: number }> = ({
  text,
  size,
  frame,
  color,
  spread,
}) => {
  const j = (hash(Math.floor(frame / 2)) - 0.5) * spread;
  const base: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: comicFont,
    fontSize: size,
    letterSpacing: 8,
  };
  return (
    <div style={{ position: "relative", width: WIDTH, height: size * 1.1 }}>
      <div style={{ ...base, color: "#ff1f5a", transform: `translate(${-spread - j}px, ${j / 2}px)`, opacity: 0.85 }}>{text}</div>
      <div style={{ ...base, color: "#00e5ff", transform: `translate(${spread + j}px, ${-j / 2}px)`, opacity: 0.85 }}>{text}</div>
      <div style={{ ...base, color, WebkitTextStroke: "6px #000", paintOrder: "stroke fill" }}>{text}</div>
    </div>
  );
};

export const Title: React.FC<{ frame: number }> = ({ frame }) => {
  const uid = useId().replace(/:/g, "");
  const dim = DIMENSIONS[Math.floor(frame / 8) % DIMENSIONS.length];
  const pop = spring({ frame: frame - 4, fps: FPS, config: { damping: 9, stiffness: 140 } });
  const sub = spring({ frame: frame - 24, fps: FPS, config: { damping: 14 } });
  const zoom = interpolate(frame, [0, 84], [1.15, 1]);

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
        <svg width={WIDTH} height={HEIGHT}>
          <City dim={dim} uid={uid} cam={frame * 6} />
        </svg>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.75) 100%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ transform: `scale(${pop}) rotate(-3deg)` }}>
          <SplitText text="SPIDER" size={260} frame={frame} color="#ffffff" spread={9} />
        </div>
        <div
          style={{
            marginTop: 10,
            transform: `translateX(${(1 - sub) * -1400}px) rotate(-3deg)`,
            background: "#ffd60a",
            border: "6px solid #000",
            boxShadow: "10px 10px 0 #000",
            padding: "4px 34px 0",
            fontFamily: comicFont,
            fontSize: 72,
            color: "#000",
            letterSpacing: 4,
          }}
        >
          ACROSS THE UNIVERSE
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
