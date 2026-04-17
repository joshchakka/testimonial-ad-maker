import { Star } from "lucide-react";
import type { AccentTheme } from "./types";

interface StarRatingProps {
  rating: number;
  accentTheme: AccentTheme;
  onRatingChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  accentTheme,
  onRatingChange,
}: StarRatingProps) {
  return <></>;
}
