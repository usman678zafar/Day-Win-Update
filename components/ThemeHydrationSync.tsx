"use client";

import { applyStoredTheme } from "@/lib/theme";
import { useLayoutEffect } from "react";

/**
 * React rewrites `<html class>` on hydration and drops `dark` from the inline
 * script. Re-apply from localStorage / system before paint.
 */
export function ThemeHydrationSync() {
  useLayoutEffect(() => {
    applyStoredTheme();
  }, []);
  return null;
}
