import { loadFont } from "@remotion/fonts";
import { staticFile } from "remotion";

// Bangers (SIL Open Font License) is bundled in public/fonts so renders work offline.
export const comicFont = "Bangers";

loadFont({
  family: comicFont,
  url: staticFile("fonts/Bangers.woff2"),
  weight: "400",
});
