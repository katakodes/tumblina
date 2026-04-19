import Vibrant from "node-vibrant";
import { nearestColorBucket, rgbToHsl } from "@/lib/color/taxonomy";

export type PaletteResult = {
  dominantColorHex: string;
  dominantColorName: string;
  paletteHexes: string[];
  paletteNames: string[];
  paletteSwatches: Array<{
    hex: string;
    name: string;
    population: number;
    weight: number;
  }>;
  brightnessScore: number;
  saturationScore: number;
};

function normalizeHex(hex: string) {
  return hex.toLowerCase();
}

export async function analyzeImageUrl(url: string): Promise<PaletteResult> {
  const palette = await Vibrant.from(url).getPalette();
  const swatches = Object.values(palette)
    .filter(Boolean)
    .sort((a, b) => (b?.population ?? 0) - (a?.population ?? 0));

  const hexes = swatches.map((swatch) => normalizeHex(swatch!.hex)).slice(0, 6);
  const dominant = hexes[0] ?? "#777672";
  const rgb = swatches[0]?.rgb.map((channel) => Math.round(channel)) as [number, number, number] | undefined;
  const [, saturation, lightness] = rgbToHsl(rgb ?? [119, 118, 114]);
  const totalPopulation = swatches.reduce((sum, swatch) => sum + (swatch?.population ?? 0), 0) || 1;
  const paletteSwatches = swatches.slice(0, 6).map((swatch) => {
    const hex = normalizeHex(swatch!.hex);
    const population = swatch!.population ?? 0;
    return {
      hex,
      name: nearestColorBucket(hex),
      population,
      weight: population / totalPopulation
    };
  });

  return {
    dominantColorHex: dominant,
    dominantColorName: nearestColorBucket(dominant),
    paletteHexes: hexes,
    paletteNames: [...new Set(paletteSwatches.map((swatch) => swatch.name))],
    paletteSwatches,
    brightnessScore: lightness / 100,
    saturationScore: saturation / 100
  };
}
