"use client";

import { useLangStore } from "@/store/langStore";
import { translations } from "@/lib/i18n";

/**
 * Returns the full translation object for the current language.
 * Usage:  const t = useT();  then  t.nav.home  etc.
 *
 * For strings with {placeholders}, use the t() helper:
 *   t("unlock.unlockFor", { price: 45 })  →  "Unlock for 45 cr"
 */
export function useT() {
  const lang = useLangStore((s) => s.lang);
  return translations[lang];
}

/**
 * Interpolates {key} placeholders in a translation string.
 * Example: interpolate("Hello {name}", { name: "Luna" }) → "Hello Luna"
 */
export function interpolate(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
}
