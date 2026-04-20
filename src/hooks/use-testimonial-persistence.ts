import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { AccentTheme, AdFormat, BackgroundMode, TestimonialData } from "@/components/testimonial-ad/types";
import { ACCENT_THEMES, DEFAULT_TESTIMONIAL } from "@/components/testimonial-ad/types";

export interface TestimonialRecord {
  id: string;
  data: TestimonialData;
  format: AdFormat;
  accentTheme: AccentTheme;
  backgroundMode: BackgroundMode;
}

interface UseTestimonialPersistenceReturn {
  /** All saved testimonials */
  testimonials: TestimonialRecord[];
  /** The currently active testimonial ID */
  activeId: string | null;
  /** Whether we're loading from the DB */
  isLoading: boolean;
  /** Whether a save is in progress */
  isSaving: boolean;
  /** Save or update the current testimonial */
  save: (
    data: TestimonialData,
    format: AdFormat,
    accentTheme: AccentTheme,
    backgroundMode: BackgroundMode
  ) => Promise<void>;
  /** Load a specific testimonial by ID */
  loadById: (id: string) => Promise<TestimonialRecord | null>;
  /** Create a new blank testimonial */
  createNew: () => Promise<string | null>;
  /** Delete a testimonial */
  deleteById: (id: string) => Promise<void>;
  /** Set the active testimonial */
  setActiveId: (id: string | null) => void;
}

function toRecord(row: any): TestimonialRecord {
  return {
    id: row.id,
    data: {
      quote: row.quote,
      clientName: row.client_name,
      clientRole: row.client_role,
      badgeText: row.badge_text,
      logoText: row.logo_text,
      logoImage: row.logo_image,
      avatarImage: row.avatar_image,
      appScreenshot: row.app_screenshot,
      rating: row.rating,
      quoteFontSize: row.quote_font_size,
    },
    format: row.format as AdFormat,
    accentTheme:
      ACCENT_THEMES.find((t) => t.name === row.accent_theme_name) ?? ACCENT_THEMES[0],
    backgroundMode: row.background_mode as BackgroundMode,
  };
}

export function useTestimonialPersistence(): UseTestimonialPersistenceReturn {
  const [testimonials, setTestimonials] = useState<TestimonialRecord[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load all testimonials on mount
  useEffect(() => {
    async function fetchAll() {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Failed to load testimonials:", error);
        setIsLoading(false);
        return;
      }

      const records = (data ?? []).map(toRecord);
      setTestimonials(records);

      // Auto-select the most recent one, or create a new one if none exist
      if (records.length > 0) {
        setActiveId(records[0].id);
      }
      setIsLoading(false);
    }

    fetchAll();
  }, []);

  const save = useCallback(
    async (
      testimonialData: TestimonialData,
      format: AdFormat,
      accentTheme: AccentTheme,
      backgroundMode: BackgroundMode
    ) => {
      if (!activeId) return;

      // Debounce: clear any pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        setIsSaving(true);
        const { error } = await supabase
          .from("testimonials")
          .update({
            quote: testimonialData.quote,
            client_name: testimonialData.clientName,
            client_role: testimonialData.clientRole,
            badge_text: testimonialData.badgeText,
            logo_text: testimonialData.logoText,
            logo_image: testimonialData.logoImage,
            avatar_image: testimonialData.avatarImage,
            app_screenshot: testimonialData.appScreenshot,
            rating: testimonialData.rating,
            quote_font_size: testimonialData.quoteFontSize,
            format,
            accent_theme_name: accentTheme.name,
            background_mode: backgroundMode,
            updated_at: new Date().toISOString(),
          })
          .eq("id", activeId);

        if (error) {
          console.error("Failed to save testimonial:", error);
        } else {
          // Update local state
          setTestimonials((prev) =>
            prev.map((t) =>
              t.id === activeId
                ? { ...t, data: testimonialData, format, accentTheme, backgroundMode }
                : t
            )
          );
        }
        setIsSaving(false);
      }, 800); // 800ms debounce
    },
    [activeId]
  );

  const loadById = useCallback(async (id: string): Promise<TestimonialRecord | null> => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      console.error("Failed to load testimonial:", error);
      return null;
    }

    return toRecord(data);
  }, []);

  const createNew = useCallback(async (): Promise<string | null> => {
    const defaults = DEFAULT_TESTIMONIAL;
    const { data, error } = await supabase
      .from("testimonials")
      .insert({
        quote: defaults.quote,
        client_name: defaults.clientName,
        client_role: defaults.clientRole,
        badge_text: defaults.badgeText,
        logo_text: defaults.logoText,
        logo_image: defaults.logoImage,
        avatar_image: defaults.avatarImage,
        app_screenshot: defaults.appScreenshot,
        rating: defaults.rating,
        quote_font_size: defaults.quoteFontSize,
        format: "1x1",
        accent_theme_name: ACCENT_THEMES[0].name,
        background_mode: "dark",
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Failed to create testimonial:", error);
      return null;
    }

    const record = toRecord(data);
    setTestimonials((prev) => [record, ...prev]);
    setActiveId(record.id);
    return record.id;
  }, []);

  const deleteById = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("testimonials").delete().eq("id", id);

      if (error) {
        console.error("Failed to delete testimonial:", error);
        return;
      }

      setTestimonials((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (activeId === id) {
          setActiveId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
    },
    [activeId]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    testimonials,
    activeId,
    isLoading,
    isSaving,
    save,
    loadById,
    createNew,
    deleteById,
    setActiveId,
  };
}
