// Language and script utilities for Sanscript-based transliteration
// This module does **not** translate meanings; it only changes the script
// used to display Sanskrit text.

import Sanscript from "sanscript";
import { getCurrentUserProfile, checkAuth } from "./auth-api.js";

// Mapping from short per-user codes to Sanscript scheme names.
// You and your manager can expand this mapping later.
// "sa" = Sanskrit in Devanagari script (default for games)
// "en" = Sanskrit in Latin letters (Harvard-Kyoto romanization)
export const LANG_SCHEMES = {
  sa: "devanagari",
  en: "hk",
};

export const DEFAULT_USER_LANG_CODE = "sa";
export const DEFAULT_SCHEME = LANG_SCHEMES[DEFAULT_USER_LANG_CODE];

// Given a piece of Sanskrit text and the user's preferred scheme,
// return the text in the appropriate script.
export const transliterateForUser = (text, {
  fromScheme = DEFAULT_SCHEME,
  toScheme,
} = {}) => {
  if (!text || !fromScheme || !toScheme || fromScheme === toScheme) {
    return text;
  }

  return Sanscript.t(text, fromScheme, toScheme);
};

// Load the current user's language settings from Firestore, with safe defaults.
export const loadUserLanguageSettings = async () => {
  // Ensure we have a logged-in user; if not, caller can decide what to do.
  await checkAuth();

  const profile = await getCurrentUserProfile();
  if (!profile) {
    return {
      langCode: DEFAULT_USER_LANG_CODE,
      bilingualEnabled: false,
      scheme: DEFAULT_SCHEME,
    };
  }

  const langCode = profile.langCode || DEFAULT_USER_LANG_CODE;
  const bilingualEnabled = !!profile.bilingualEnabled;
  const scheme = LANG_SCHEMES[langCode] || DEFAULT_SCHEME;

  return { langCode, bilingualEnabled, scheme };
};

// Simple helper for game pages: transliterate all elements that have
// a data-sanskrit attribute. The attribute value is treated as the
// canonical source text in the default scheme.
//
// Example HTML:
//   <span data-sanskrit="dharmakSetre kurukSetre"></span>
//
// Games can call this once on load to apply the user's settings.
export const applyUserLanguageToPage = async () => {
  const { bilingualEnabled, scheme } = await loadUserLanguageSettings();

  // If the user has not enabled the bilingual toggle, keep the default.
  if (!bilingualEnabled) return;

  const elements = document.querySelectorAll("[data-sanskrit]");

  elements.forEach((el) => {
    const sourceText = el.getAttribute("data-sanskrit") || el.textContent;
    if (!sourceText) return;

    const output = transliterateForUser(sourceText, {
      fromScheme: "hk", // in this prototype we store source in Harvard-Kyoto
      toScheme: scheme,
    });

    el.textContent = output;
  });
};
