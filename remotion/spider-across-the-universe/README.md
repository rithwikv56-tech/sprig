# Spider Across The Universe (Remotion)

A 25-second comic-book multiverse animation made with [Remotion](https://www.remotion.dev/):
a masked spider-hero web-swings through five halftone dimensions, tears through glitching
portals between them, and ends on a leap of faith.

```bash
npm install
npm run studio   # preview and scrub in the browser
npm run render   # writes out/spider-across-the-universe.mp4 (1280x720, 30fps)
```

- `src/Video.tsx` – the timeline: title, dimensions + portals, ending
- `src/Scene.tsx` – one dimension: pendulum swing, speed lines, captions, THWIP!
- `src/CityLayers.tsx` – halftone sky and parallax skyline
- `src/Hero.tsx` – the hero, drawn in SVG
- `src/Effects.tsx` – glitch slices, portal, print texture
- `src/constants.ts` – timing and the color palette of each dimension

The soundtrack (`public/audio/soundtrack.mp3`) is synthesized from scratch by
`scripts/make_soundtrack.py` and timed to the frames: a 90 BPM beat with two beats per swing,
a "thwip" on every web, risers and impacts on the portals, and a quiet fall into the end card.
Run `python3 scripts/make_soundtrack.py` (needs numpy and ffmpeg) after changing the timing.

The Bangers font is bundled in `public/fonts` (SIL Open Font License), so rendering needs no network.
