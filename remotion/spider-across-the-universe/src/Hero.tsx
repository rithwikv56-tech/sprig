import React from "react";

type HeroProps = {
  suit: string;
  accent: string;
  eyes: string;
  // When set, the whole hero is drawn in this one color (used for the
  // red / cyan chromatic-aberration copies).
  tint?: string;
};

const OUTLINE = "#000000";

const Limb: React.FC<{ d: string; width: number; color: string; outline: string }> = ({
  d,
  width,
  color,
  outline,
}) => (
  <>
    <path d={d} stroke={outline} strokeWidth={width + 8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={color} strokeWidth={width} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </>
);

// A masked spider-hero hanging from a web. The hand holding the web is the
// origin (0, 0); the body hangs down along +y, facing right.
export const Hero: React.FC<HeroProps> = ({ suit, accent, eyes, tint }) => {
  const s = tint ?? suit;
  const a = tint ?? accent;
  const e = tint ?? eyes;
  const o = tint ?? OUTLINE;

  return (
    <g>
      {/* back leg */}
      <Limb d="M -22 130 L -42 166 L -72 176" width={20} color={s} outline={o} />
      <Limb d="M -60 174 L -78 178" width={20} color={a} outline={o} />
      {/* back arm */}
      <Limb d="M -26 72 L -52 98 L -64 126" width={15} color={s} outline={o} />
      {/* web arm */}
      <Limb d="M 0 0 L -4 30 L -10 64" width={16} color={s} outline={o} />
      <circle cx={0} cy={2} r={11} fill={a} stroke={o} strokeWidth={5} />
      {/* torso */}
      <path
        d="M -38 64 Q -12 50 12 64 L 4 128 Q -18 140 -36 128 Z"
        fill={s}
        stroke={o}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      {/* chest emblem */}
      {!tint && (
        <g transform="translate(-14 92)">
          <ellipse rx={5} ry={8} fill={a} />
          <circle cy={-9} r={3.5} fill={a} />
          {[-1, 1].map((side) => (
            <g key={side} stroke={a} strokeWidth={2.5} fill="none" strokeLinecap="round">
              <path d={`M 0 -4 L ${side * 9} -12 L ${side * 12} -20`} />
              <path d={`M 0 -1 L ${side * 11} -4 L ${side * 15} -10`} />
              <path d={`M 0 3 L ${side * 11} 6 L ${side * 15} 14`} />
              <path d={`M 0 6 L ${side * 8} 13 L ${side * 10} 22`} />
            </g>
          ))}
        </g>
      )}
      {/* belt */}
      <path d="M -34 120 Q -16 128 4 120" stroke={a} strokeWidth={6} fill="none" />
      {/* head */}
      <ellipse cx={-24} cy={38} rx={24} ry={27} fill={s} stroke={o} strokeWidth={6} />
      {!tint && (
        <g stroke={a} strokeWidth={1.6} fill="none" opacity={0.85}>
          <path d="M -24 12 Q -30 38 -24 64" />
          <path d="M -46 30 Q -24 36 -2 30" />
          <path d="M -46 48 Q -24 54 -2 48" />
          <path d="M -40 18 Q -24 40 -8 60" />
          <path d="M -8 18 Q -24 40 -40 60" />
        </g>
      )}
      {/* big angular comic-book eyes */}
      <path d="M -28 28 Q -14 22 -3 31 Q -10 46 -26 42 Z" fill={e} stroke={o} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -47 30 Q -40 27 -35 31 Q -37 42 -46 40 Z" fill={e} stroke={o} strokeWidth={4} strokeLinejoin="round" />
      {/* front arm, firing a web */}
      <Limb d="M 6 70 L 38 92 L 66 84" width={15} color={s} outline={o} />
      <circle cx={68} cy={84} r={10} fill={a} stroke={o} strokeWidth={5} />
      {/* front leg, knee up */}
      <Limb d="M -10 126 L 30 146 L 22 184" width={20} color={s} outline={o} />
      <Limb d="M 23 176 L 21 192" width={20} color={a} outline={o} />
    </g>
  );
};
