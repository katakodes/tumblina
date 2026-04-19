import { describe, expect, it } from "vitest";
import { colorSimilarity, matchesAnyColor, nearestColorBucket } from "@/lib/color/taxonomy";

describe("color taxonomy", () => {
  it("maps nuanced dark reds", () => {
    expect(["oxblood", "burgundy"]).toContain(nearestColorBucket("#4b1017"));
  });

  it("maps pale neutrals separately", () => {
    expect(["cream", "beige", "tan"]).toContain(nearestColorBucket("#efe3c7"));
  });

  it("matches selected colors across a palette", () => {
    expect(matchesAnyColor(["cream", "sage"], ["sage"])).toBe(true);
    expect(matchesAnyColor(["cream"], ["navy"])).toBe(false);
  });

  it("scores close colors higher than distant colors", () => {
    expect(colorSimilarity("#5f7a54", "#66845f")).toBeGreaterThan(colorSimilarity("#5f7a54", "#c43b37"));
  });
});
