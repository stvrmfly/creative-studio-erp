"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    /* storage may be unavailable — the in-page switch still works */
  }
}

/**
 * Reflects and flips the theme. Initial value is resolved before paint by the
 * inline script in layout.tsx; this just mirrors it. `theme` is null until
 * mounted so callers can avoid hydration mismatches.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light");
  }, []);

  const set = (t: Theme) => {
    applyTheme(t);
    setTheme(t);
  };

  return { theme, setTheme: set, toggle: () => set(theme === "dark" ? "light" : "dark") };
}
