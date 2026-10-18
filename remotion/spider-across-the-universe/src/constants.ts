export const WIDTH = 1280;
export const HEIGHT = 720;
export const FPS = 30;

export const TITLE_FRAMES = 84;
export const DIM_FRAMES = 108;
export const PORTAL_FRAMES = 22;
export const ENDING_FRAMES = 135;

export type Dimension = {
  id: string;
  name: string;
  skyTop: string;
  skyBottom: string;
  dots: string;
  moon: string;
  far: string;
  mid: string;
  near: string;
  windows: string;
  misprint: string;
  suit: string;
  accent: string;
  eyes: string;
  web: string;
  streaks: string;
  sfx: string;
  rain?: boolean;
};

export const DIMENSIONS: Dimension[] = [
  {
    id: "01",
    name: "NEON BROOKLYN",
    skyTop: "#14002e",
    skyBottom: "#5a189a",
    dots: "#9d4edd",
    moon: "#ff2e63",
    far: "#3c096c",
    mid: "#240046",
    near: "#0b0019",
    windows: "#ffd60a",
    misprint: "#ff2e63",
    suit: "#141414",
    accent: "#e5383b",
    eyes: "#ffffff",
    web: "#ffffff",
    streaks: "#ff8fab",
    sfx: "#ffd60a",
  },
  {
    id: "65",
    name: "PASTEL CITY",
    skyTop: "#ffafcc",
    skyBottom: "#ffc8dd",
    dots: "#ffffff",
    moon: "#a2d2ff",
    far: "#bde0fe",
    mid: "#cdb4db",
    near: "#5e60ce",
    windows: "#ffc8dd",
    misprint: "#48cae4",
    suit: "#f8f9fa",
    accent: "#ff5d8f",
    eyes: "#48cae4",
    web: "#ffffff",
    streaks: "#ffffff",
    sfx: "#5e60ce",
  },
  {
    id: "50101",
    name: "MANGO METRO",
    skyTop: "#ffbe0b",
    skyBottom: "#ff9e00",
    dots: "#fb5607",
    moon: "#ff006e",
    far: "#ff5400",
    mid: "#d00000",
    near: "#6a040f",
    windows: "#ffea00",
    misprint: "#3a86ff",
    suit: "#3a86ff",
    accent: "#d00000",
    eyes: "#ffffff",
    web: "#ffffff",
    streaks: "#fff3b0",
    sfx: "#3a86ff",
  },
  {
    id: "2099",
    name: "NEO CITY 2099",
    skyTop: "#000814",
    skyBottom: "#03045e",
    dots: "#0077b6",
    moon: "#00f5d4",
    far: "#023e8a",
    mid: "#001d3d",
    near: "#000308",
    windows: "#00f5d4",
    misprint: "#f72585",
    suit: "#0d1b2a",
    accent: "#ef233c",
    eyes: "#ef233c",
    web: "#00f5d4",
    streaks: "#4cc9f0",
    sfx: "#f72585",
  },
  {
    id: "90214",
    name: "COMIC NOIR",
    skyTop: "#dee2e6",
    skyBottom: "#f8f9fa",
    dots: "#adb5bd",
    moon: "#ffffff",
    far: "#6c757d",
    mid: "#343a40",
    near: "#000000",
    windows: "#f8f9fa",
    misprint: "#6c757d",
    suit: "#000000",
    accent: "#495057",
    eyes: "#ffffff",
    web: "#000000",
    streaks: "#000000",
    sfx: "#000000",
    rain: true,
  },
];

export const hash = (n: number) => {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};
