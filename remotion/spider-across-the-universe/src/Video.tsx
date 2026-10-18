import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Ending } from "./Ending";
import { Glitch, Portal, PrintTexture } from "./Effects";
import { Scene, heroAt } from "./Scene";
import { Title } from "./Title";
import { DIMENSIONS, DIM_FRAMES, ENDING_FRAMES, PORTAL_FRAMES, TITLE_FRAMES } from "./constants";

const SWING_END = TITLE_FRAMES + DIMENSIONS.length * DIM_FRAMES;
export const TOTAL_FRAMES = SWING_END + ENDING_FRAMES;

export const SpiderAcrossTheUniverse: React.FC = () => {
  const frame = useCurrentFrame();

  let content: React.ReactNode;
  if (frame < TITLE_FRAMES) {
    const amount = interpolate(frame, [TITLE_FRAMES - 12, TITLE_FRAMES], [0, 1], { extrapolateLeft: "clamp" });
    content = <Glitch amount={amount} frame={frame} render={() => <Title frame={frame} />} />;
  } else if (frame < SWING_END) {
    const local = frame - TITLE_FRAMES;
    const index = Math.floor(local / DIM_FRAMES);
    const dimFrame = local % DIM_FRAMES;
    const dim = DIMENSIONS[index];
    const portalStart = DIM_FRAMES - PORTAL_FRAMES;

    if (dimFrame < portalStart) {
      // the occasional random flicker, like the hero is out of place
      const flicker = dimFrame > 8 && (frame * 7919) % 53 < 3;
      content = flicker ? (
        <Glitch amount={0.5} frame={frame} render={() => <Scene dim={dim} frame={frame} dimFrame={dimFrame} aberration={16} />} />
      ) : (
        <Scene dim={dim} frame={frame} dimFrame={dimFrame} />
      );
    } else {
      const t = (dimFrame - portalStart) / PORTAL_FRAMES;
      const hero = heroAt(frame);
      const next = DIMENSIONS[index + 1];
      const inside = next ? (
        <Scene dim={next} frame={frame} dimFrame={-1} aberration={14} />
      ) : (
        <Ending frame={0} />
      );
      content = (
        <Glitch
          amount={Math.sin(t * Math.PI)}
          frame={frame}
          render={() => (
            <>
              <Scene dim={dim} frame={frame} dimFrame={dimFrame} aberration={8 + t * 24} />
              <Portal cx={hero.x} cy={hero.y + 110} radius={t * t * 1500} frame={frame} inside={inside} />
            </>
          )}
        />
      );
    }
  } else {
    const local = frame - SWING_END;
    content = local < 10 ? <Glitch amount={1 - local / 10} frame={frame} render={() => <Ending frame={local} />} /> : <Ending frame={local} />;
  }

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {content}
      <PrintTexture />
    </AbsoluteFill>
  );
};
