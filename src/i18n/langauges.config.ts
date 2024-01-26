export const languages = ["en", "es", "hi", "it", "pt", "de"] as const;
export type Language = (typeof languages)[number];
export const fallbackLanguage = "en";
