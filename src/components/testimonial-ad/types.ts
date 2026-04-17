export type AdFormat = "1x1" | "9x16";

export interface AccentTheme {
  name: string;
  color: string;
  glowColor: string;
  gradientColor: string;
}

export const ACCENT_THEMES: AccentTheme[] = [
  {
    name: "Indigo",
    color: "#6366F1",
    glowColor: "rgba(99, 102, 241, 0.4)",
    gradientColor: "rgba(99, 102, 241, 0.15)",
  },
  {
    name: "Amber",
    color: "#F59E0B",
    glowColor: "rgba(245, 158, 11, 0.4)",
    gradientColor: "rgba(245, 158, 11, 0.15)",
  },
  {
    name: "Emerald",
    color: "#10B981",
    glowColor: "rgba(16, 185, 129, 0.4)",
    gradientColor: "rgba(16, 185, 129, 0.15)",
  },
  {
    name: "Rose",
    color: "#F43F5E",
    glowColor: "rgba(244, 63, 94, 0.4)",
    gradientColor: "rgba(244, 63, 94, 0.15)",
  },
  {
    name: "Cyan",
    color: "#06B6D4",
    glowColor: "rgba(6, 182, 212, 0.4)",
    gradientColor: "rgba(6, 182, 212, 0.15)",
  },
];

export interface TestimonialData {
  quote: string;
  clientName: string;
  clientRole: string;
  badgeText: string;
  logoText: string;
  logoImage: string | null;
  avatarImage: string | null;
  rating: number;
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
  rating: 5,
};
