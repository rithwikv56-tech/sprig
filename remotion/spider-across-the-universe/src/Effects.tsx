import React from "react";
import { AbsoluteFill } from "remotion";
import { HEIGHT, WIDTH, hash } from "./constants";

// Re-renders the scene inside horizontal slices that are shifted and tinted,
// like a dimension tearing apart.
export const Glitch: React.FC<{ amount: number; frame: number; render: () => React.ReactNode }> = ({
  amount,
  frame,
  render,
}) => {
  const bands = Math.round(amount * 7);
  return (
    <AbsoluteFill>
      {render()}
      {Array.from({ length: bands }, (_, b) => {
        const seed = b * 17 + Math.floor(frame / 2) * 3.3;
        const y = hash(seed) * HEIGHT;
        const h = 10 + hash(seed * 1.9) * 70;
        const shift = (hash(seed * 2.7) - 0.5) * 160 * amount;
        const tint = hash(seed * 4.1) > 0.5 ? "#ff1f5a" : "#00e5ff";
        return (
          <AbsoluteFill key={b} style={{ clipPath: `inset(${y}px 0 ${Math.max(0, HEIGHT - y - h)}px 0)` }}>
            <AbsoluteFill style={{ transform: `translateX(${shift}px)` }}>{render()}</AbsoluteFill>
            <AbsoluteFill style={{ background: tint, mixBlendMode: "screen", opacity: 0.45 }} />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};

// A ragged, rainbow-edged hole into another dimension.
export const Portal: React.FC<{ cx: number; cy: number; radius: number; frame: number; inside: React.ReactNode }> = ({
  cx,
  cy,
  radius,
  frame,
  inside,
}) => {
  const points = 48;
  const shape = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * Math.PI * 2;
    const r = radius * (1 + (hash(i * 3.3 + Math.floor(frame / 2)) - 0.5) * 0.18);
    return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
  }).join(" ");
  const polygon = shape
    .split(" ")
    .map((p) => p.split(",").map((v) => `${v}px`).join(" "))
    .join(", ");
  const colors = ["#ff1f5a", "#00e5ff", "#ffd60a", "#f72585"];

  return (
    <>
      <AbsoluteFill style={{ clipPath: `polygon(${polygon})` }}>{inside}</AbsoluteFill>
      <AbsoluteFill>
        <svg width={WIDTH} height={HEIGHT}>
          {colors.map((c, i) => (
            <polygon
              key={c}
              points={shape}
              fill="none"
              stroke={c}
              strokeWidth={14 - i * 2}
              strokeDasharray={`${60 + i * 25} ${40 + i * 15}`}
              strokeDashoffset={frame * (12 + i * 6) * (i % 2 ? -1 : 1)}
              strokeLinejoin="round"
            />
          ))}
        </svg>
      </AbsoluteFill>
    </>
  );
};

// Faint full-frame print dots, to make everything feel like a comic page.
export const PrintTexture: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage: "radial-gradient(rgba(0,0,0,0.22) 1.2px, transparent 1.6px)",
      backgroundSize: "7px 7px",
      mixBlendMode: "multiply",
      opacity: 0.5,
      pointerEvents: "none",
    }}
  />
);
