export type AdFormat = "1x1" | "9x16" | "16x9";
export type BackgroundMode = "dark" | "light";
export type VerticalLayoutVariant = "image-top" | "quote-top";

export interface AccentTheme {
  name: string;
  color: string;
  glowColor: string;
  gradientColor: string;
}

export const ACCENT_THEMES: AccentTheme[] = [
  {
    name: "Purple",
    color: "#CD9DFA",
    glowColor: "rgba(205, 157, 250, 0.4)",
    gradientColor: "rgba(205, 157, 250, 0.15)",
  },
  {
    name: "Green",
    color: "#75D9A6",
    glowColor: "rgba(117, 217, 166, 0.4)",
    gradientColor: "rgba(117, 217, 166, 0.15)",
  },
  {
    name: "Blue",
    color: "#67CFFD",
    glowColor: "rgba(103, 207, 253, 0.4)",
    gradientColor: "rgba(103, 207, 253, 0.15)",
  },
  {
    name: "Mustard",
    color: "#FFD55F",
    glowColor: "rgba(255, 213, 95, 0.4)",
    gradientColor: "rgba(255, 213, 95, 0.15)",
  },
  {
    name: "Salmon",
    color: "#FF898C",
    glowColor: "rgba(255, 137, 140, 0.4)",
    gradientColor: "rgba(255, 137, 140, 0.15)",
  },
];

export interface PerFormatSizes {
  "1x1": number;
  "16x9": number;
  "9x16": number;
}

export interface TestimonialData {
  quote: string;
  clientName: string;
  clientRole: string;
  badgeText: string;
  logoText: string;
  logoImage: string | null;
  avatarImage: string | null;
  appScreenshot: string | null;
  rating: number;
  quoteFontSize: PerFormatSizes;
  borderThickness: PerFormatSizes;
}

export const DEFAULT_TESTIMONIAL: TestimonialData = {
  quote:
    "They didn't just build our platform — they architected our entire technical vision. The team's ability to translate complex requirements into elegant solutions is unmatched.",
  clientName: "Sarah Chen",
  clientRole: "CTO, JustLiv",
  badgeText: "Client Story",
  logoText: "DEVCRAFT",
  logoImage: "/images/Logomark - White.png",
  avatarImage: null,
  appScreenshot: null,
  rating: 5,
  quoteFontSize: { "1x1": 24, "16x9": 32, "9x16": 32 },
  borderThickness: { "1x1": 2, "16x9": 2, "9x16": 2 },
};
