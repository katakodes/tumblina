export type ColorBucket =
  | "black"
  | "white"
  | "cream"
  | "gray"
  | "silver"
  | "brown"
  | "tan"
  | "beige"
  | "red"
  | "oxblood"
  | "burgundy"
  | "pink"
  | "peach"
  | "orange"
  | "gold"
  | "yellow"
  | "green"
  | "olive"
  | "sage"
  | "forest"
  | "blue"
  | "navy"
  | "sky"
  | "purple"
  | "lavender";

export type NamedColor = {
  name: ColorBucket;
  hex: string;
  hsl: [number, number, number];
};

export type BroadColorBucket =
  | "black"
  | "white"
  | "gray"
  | "brown"
  | "red"
  | "pink"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "purple";

export type BroadNamedColor = {
  name: BroadColorBucket;
  label: string;
  hex: string;
  members: ColorBucket[];
};

export const COLOR_TAXONOMY: NamedColor[] = [
  { name: "black", hex: "#111111", hsl: [0, 0, 7] },
  { name: "white", hex: "#f7f6f2", hsl: [48, 24, 96] },
  { name: "cream", hex: "#efe3c7", hsl: [42, 56, 86] },
  { name: "gray", hex: "#777672", hsl: [48, 2, 46] },
  { name: "silver", hex: "#c8c8c4", hsl: [60, 4, 78] },
  { name: "brown", hex: "#6e4a35", hsl: [22, 35, 32] },
  { name: "tan", hex: "#b99b72", hsl: [35, 34, 59] },
  { name: "beige", hex: "#d8c8ab", hsl: [39, 36, 76] },
  { name: "red", hex: "#c43b37", hsl: [2, 56, 49] },
  { name: "oxblood", hex: "#4b1017", hsl: [353, 65, 18] },
  { name: "burgundy", hex: "#7b263c", hsl: [344, 53, 32] },
  { name: "pink", hex: "#d984a5", hsl: [336, 52, 68] },
  { name: "peach", hex: "#e3a07f", hsl: [20, 64, 69] },
  { name: "orange", hex: "#cf6b32", hsl: [22, 62, 50] },
  { name: "gold", hex: "#c69a32", hsl: [42, 60, 49] },
  { name: "yellow", hex: "#dbc84f", hsl: [52, 65, 58] },
  { name: "green", hex: "#4f8a55", hsl: [126, 27, 43] },
  { name: "olive", hex: "#787a38", hsl: [62, 37, 35] },
  { name: "sage", hex: "#99aa88", hsl: [90, 17, 60] },
  { name: "forest", hex: "#234c35", hsl: [146, 37, 22] },
  { name: "blue", hex: "#326d8f", hsl: [202, 48, 38] },
  { name: "navy", hex: "#1f3454", hsl: [216, 46, 23] },
  { name: "sky", hex: "#93bfd4", hsl: [199, 43, 70] },
  { name: "purple", hex: "#75528f", hsl: [274, 27, 44] },
  { name: "lavender", hex: "#b7a2d1", hsl: [267, 34, 73] }
];

export const BROAD_COLOR_TAXONOMY: BroadNamedColor[] = [
  { name: "black", label: "black", hex: "#111111", members: ["black"] },
  { name: "white", label: "white", hex: "#f7f6f2", members: ["white", "cream"] },
  { name: "gray", label: "gray", hex: "#8b8b86", members: ["gray", "silver"] },
  { name: "brown", label: "brown", hex: "#9d7a55", members: ["brown", "tan", "beige"] },
  { name: "red", label: "red", hex: "#b13a3e", members: ["red", "oxblood", "burgundy"] },
  { name: "pink", label: "pink", hex: "#d984a5", members: ["pink", "peach"] },
  { name: "orange", label: "orange", hex: "#cf6b32", members: ["orange"] },
  { name: "yellow", label: "yellow", hex: "#d4b84c", members: ["yellow", "gold"] },
  { name: "green", label: "green", hex: "#5f7a54", members: ["green", "olive", "sage", "forest"] },
  { name: "blue", label: "blue", hex: "#326d8f", members: ["blue", "navy", "sky"] },
  { name: "purple", label: "purple", hex: "#8062a0", members: ["purple", "lavender"] }
];

export function toBroadColorBucket(color: string): BroadColorBucket | null {
  const normalized = color.toLowerCase();
  const direct = BROAD_COLOR_TAXONOMY.find((bucket) => bucket.name === normalized);
  if (direct) return direct.name;
  return BROAD_COLOR_TAXONOMY.find((bucket) => bucket.members.includes(normalized as ColorBucket))?.name ?? null;
}

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16)
  ];
}

export function rgbToHsl([r, g, b]: [number, number, number]): [number, number, number] {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(lightness * 100)];
  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  const hue =
    max === red
      ? (green - blue) / delta + (green < blue ? 6 : 0)
      : max === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4;
  return [Math.round(hue * 60), Math.round(saturation * 100), Math.round(lightness * 100)];
}

export function nearestColorBucket(hex: string): ColorBucket {
  const [h, s, l] = rgbToHsl(hexToRgb(hex));
  if (l < 11) return "black";
  if (l > 92 && s < 22) return "white";
  if (s < 8 && l > 67) return "silver";
  if (s < 10) return "gray";

  let nearest = COLOR_TAXONOMY[0];
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const candidate of COLOR_TAXONOMY) {
    const [ch, cs, cl] = candidate.hsl;
    const hueDistance = Math.min(Math.abs(h - ch), 360 - Math.abs(h - ch)) / 1.8;
    const saturationDistance = Math.abs(s - cs);
    const lightnessDistance = Math.abs(l - cl) * 1.25;
    const distance = hueDistance + saturationDistance + lightnessDistance;
    if (distance < nearestDistance) {
      nearest = candidate;
      nearestDistance = distance;
    }
  }
  return nearest.name;
}

export function colorSimilarity(a: string, b: string) {
  const [ah, as, al] = rgbToHsl(hexToRgb(a));
  const [bh, bs, bl] = rgbToHsl(hexToRgb(b));
  const hue = Math.min(Math.abs(ah - bh), 360 - Math.abs(ah - bh)) / 180;
  const sat = Math.abs(as - bs) / 100;
  const light = Math.abs(al - bl) / 100;
  return 1 - Math.min(1, hue * 0.45 + sat * 0.25 + light * 0.3);
}

export function matchesAnyColor(paletteNames: string[], selected: string[]) {
  if (selected.length === 0) return true;
  const normalized = new Set(paletteNames.map((item) => item.toLowerCase()));
  return selected.some((color) => {
    const broad = toBroadColorBucket(color);
    if (!broad) return normalized.has(color.toLowerCase());
    const members = BROAD_COLOR_TAXONOMY.find((bucket) => bucket.name === broad)?.members ?? [];
    return normalized.has(broad) || members.some((member) => normalized.has(member));
  });
}

export type WeightedPaletteSwatch = {
  name?: string;
  weight?: number;
};

export function meaningfulPaletteNames(
  paletteSwatches: WeightedPaletteSwatch[],
  fallbackNames: string[],
  options: { minWeight?: number; maxSwatches?: number } = {}
) {
  const minWeight = options.minWeight ?? 0.16;
  const maxSwatches = options.maxSwatches ?? 3;
  const weighted = paletteSwatches
    .filter((swatch): swatch is { name: string; weight: number } => Boolean(swatch.name) && typeof swatch.weight === "number")
    .sort((a, b) => b.weight - a.weight);

  if (!weighted.length) return fallbackNames;

  const meaningful = weighted.filter((swatch, index) => index === 0 || swatch.weight >= minWeight).slice(0, maxSwatches);
  return [...new Set(meaningful.map((swatch) => swatch.name))];
}
