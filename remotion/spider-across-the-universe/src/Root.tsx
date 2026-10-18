import { Composition } from "remotion";
import { SpiderAcrossTheUniverse, TOTAL_FRAMES } from "./Video";
import { FPS, HEIGHT, WIDTH } from "./constants";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SpiderAcrossTheUniverse"
      component={SpiderAcrossTheUniverse}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
