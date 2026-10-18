import React from "react";
import { Dimension, HEIGHT, WIDTH, hash } from "./constants";

// Sky gradient with Ben-Day halftone dots that grow toward the horizon.
export const Sky: React.FC<{ dim: Dimension; uid: string; cam: number }> = ({ dim, uid, cam }) => {
  const bands = 8;
  const moonX = 980 - cam * 0.04;
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dim.skyTop} />
          <stop offset="1" stopColor={dim.skyBottom} />
        </linearGradient>
        {Array.from({ length: bands }, (_, i) => (
          <pattern key={i} id={`${uid}-dots-${i}`} width={18} height={18} patternUnits="userSpaceOnUse">
            <circle cx={4.5} cy={4.5} r={0.8 + i * 0.75} fill={dim.dots} />
            <circle cx={13.5} cy={13.5} r={0.8 + i * 0.75} fill={dim.dots} />
          </pattern>
        ))}
        <pattern id={`${uid}-moondots`} width={12} height={12} patternUnits="userSpaceOnUse">
          <circle cx={3} cy={3} r={2.6} fill={dim.skyTop} opacity={0.55} />
          <circle cx={9} cy={9} r={2.6} fill={dim.skyTop} opacity={0.55} />
        </pattern>
      </defs>
      <rect width={WIDTH} height={HEIGHT} fill={`url(#${uid}-sky)`} />
      {Array.from({ length: bands }, (_, i) => {
        const y = 140 + i * 60;
        return <rect key={i} x={0} y={y} width={WIDTH} height={i === bands - 1 ? HEIGHT - y : 60} fill={`url(#${uid}-dots-${i})`} />;
      })}
      <circle cx={moonX} cy={170} r={110} fill={dim.moon} />
      <circle cx={moonX} cy={170} r={110} fill={`url(#${uid}-moondots)`} />
      {dim.rain &&
        Array.from({ length: 70 }, (_, i) => {
          const x = ((hash(i) * WIDTH * 1.3 + cam * 0.5) % (WIDTH + 200)) - 100;
          const y = (hash(i * 7) * HEIGHT + cam * 2.2) % HEIGHT;
          return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 46} stroke="#495057" strokeWidth={2} opacity={0.6} />;
        })}
    </g>
  );
};

type SkylineProps = {
  cam: number;
  factor: number;
  width: number;
  minH: number;
  maxH: number;
  color: string;
  seed: number;
  windows?: string;
  misprint?: string;
  details?: boolean;
};

// One parallax layer of buildings. Each building is generated from its index,
// so the city is endless and identical no matter which frame is rendered.
export const Skyline: React.FC<SkylineProps> = ({
  cam,
  factor,
  width,
  minH,
  maxH,
  color,
  seed,
  windows,
  misprint,
  details,
}) => {
  const offset = cam * factor;
  const first = Math.floor(offset / width) - 1;
  const count = Math.ceil(WIDTH / width) + 3;
  const buildings: React.ReactNode[] = [];

  for (let n = 0; n < count; n++) {
    const i = first + n;
    if (hash(i * 1.7 + seed + 3) < 0.1) continue; // empty lot
    const bw = width - 14 - Math.floor(hash(i * 2.3 + seed) * 30);
    const h = minH + hash(i * 3.1 + seed) * (maxH - minH);
    const x = i * width - offset;
    const top = HEIGHT - h;
    buildings.push(
      <g key={i}>
        {misprint && <rect x={x + 7} y={top - 4} width={bw} height={h + 4} fill={misprint} opacity={0.55} />}
        <rect x={x} y={top} width={bw} height={h} fill={color} />
        {details && hash(i * 9 + seed) > 0.6 && (
          <g fill={color}>
            <rect x={x + bw * 0.3} y={top - 46} width={44} height={32} rx={6} />
            <rect x={x + bw * 0.3 + 6} y={top - 14} width={5} height={14} />
            <rect x={x + bw * 0.3 + 33} y={top - 14} width={5} height={14} />
          </g>
        )}
        {details && hash(i * 4 + seed) > 0.75 && (
          <g>
            <rect x={x + bw * 0.75} y={top - 70} width={4} height={70} fill={color} />
            <circle cx={x + bw * 0.75 + 2} cy={top - 72} r={5} fill={misprint ?? color} />
          </g>
        )}
        {windows &&
          Array.from({ length: Math.floor((bw - 24) / 26) }, (_, c) =>
            Array.from({ length: Math.floor((h - 30) / 34) }, (_, r) =>
              hash(i * 13 + c * 7.1 + r * 3.7 + seed) > 0.45 ? (
                <rect key={`${c}-${r}`} x={x + 16 + c * 26} y={top + 22 + r * 34} width={13} height={18} fill={windows} />
              ) : null
            )
          )}
      </g>
    );
  }
  return <g>{buildings}</g>;
};

export const City: React.FC<{ dim: Dimension; uid: string; cam: number }> = ({ dim, uid, cam }) => (
  <g>
    <Sky dim={dim} uid={uid} cam={cam} />
    <Skyline cam={cam} factor={0.2} width={90} minH={240} maxH={440} color={dim.far} seed={11} />
    <Skyline cam={cam} factor={0.5} width={140} minH={170} maxH={360} color={dim.mid} seed={23} windows={dim.windows + "55"} />
    <Skyline cam={cam} factor={1} width={220} minH={110} maxH={300} color={dim.near} seed={37} windows={dim.windows} misprint={dim.misprint} details />
  </g>
);
