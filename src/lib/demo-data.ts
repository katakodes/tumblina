import type { PostCardData } from "@/components/post/post-card";

export const demoPosts: PostCardData[] = [
  {
    id: "1",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    blogName: "fieldnotes",
    caption: "Collected afternoon light, old stone, green edges, and the kind of quiet that belongs in a reference folder.",
    tags: ["garden", "green", "archive", "texture"],
    dominantColorHex: "#5f7a54",
    dominantColorName: "sage",
    postUrl: "https://tumblr.com"
  },
  {
    id: "2",
    imageUrl: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?auto=format&fit=crop&w=900&q=80",
    blogName: "paperrooms",
    caption: "A desk with warm paper, negative space, and a soft reference palette for late winter layouts.",
    tags: ["workspace", "cream", "paper", "design"],
    dominantColorHex: "#efe3c7",
    dominantColorName: "cream",
    postUrl: "https://tumblr.com"
  },
  {
    id: "3",
    imageUrl: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=80",
    blogName: "night-index",
    caption: "Deep blue atmosphere for moodboarding nocturne posts and future header treatments.",
    tags: ["blue", "sky", "night", "mood"],
    dominantColorHex: "#1f3454",
    dominantColorName: "navy",
    postUrl: "https://tumblr.com"
  },
  {
    id: "4",
    imageUrl: "https://images.unsplash.com/photo-1504198453319-5ce911bafcde?auto=format&fit=crop&w=900&q=80",
    blogName: "small-museum",
    caption: "Petal color study with pink, burgundy, and a soft edge for visual tagging tests.",
    tags: ["flowers", "pink", "burgundy", "reference"],
    dominantColorHex: "#d984a5",
    dominantColorName: "pink",
    postUrl: "https://tumblr.com"
  }
];

export const months = [
  { key: "2026-04", label: "April 2026", count: 38 },
  { key: "2026-03", label: "March 2026", count: 52 },
  { key: "2026-02", label: "February 2026", count: 29 },
  { key: "2025-12", label: "December 2025", count: 76 },
  { key: "2025-09", label: "September 2025", count: 44 }
];
