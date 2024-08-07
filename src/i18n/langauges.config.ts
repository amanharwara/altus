export const languages = ["en", "es", "hi", "it", "pt-br", "de", "tr", "fr"] as const;
export type Language = (typeof languages)[number];
export const fallbackLanguage = "en";
