/** Client-only theme helpers (localStorage + `html.dark` for Tailwind `dark:`). */
export const THEME_STORAGE_KEY = "day-win-theme";

export type ThemeMode = "light" | "dark";

export function getResolvedThemeMode(): ThemeMode {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const useDark =
      stored === "dark" ||
      (stored !== "light" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    return useDark ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyThemeMode(mode: ThemeMode) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  } catch {
    /* ignore (private mode, etc.) */
  }
  const content = mode === "dark" ? "#262626" : "#fafaf9";
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((el) => el.setAttribute("content", content));
}

export function applyStoredTheme() {
  applyThemeMode(getResolvedThemeMode());
}
