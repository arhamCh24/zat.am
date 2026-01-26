import { loadUserLanguageSettings } from "../api/lang-settings.js";

// This demo assumes the source text is stored in Harvard-Kyoto ("hk") and
// uses Sanscript via lang-settings.js to render it in the user's preferred
// scheme when the bilingual toggle is enabled.

const demoTextEl = document.getElementById("demo-text");
const demoStatusEl = document.getElementById("demo-status");

const init = async () => {
  if (!demoTextEl || !demoStatusEl) return;

  try {
    const { langCode, bilingualEnabled, scheme } =
      await loadUserLanguageSettings();

    const sourceText =
      demoTextEl.getAttribute("data-sanskrit") || demoTextEl.textContent;

    if (!sourceText) return;

    let rendered = sourceText;
    let statusMessage = "Using default Devanagari script (no bilingual toggle).";

    if (bilingualEnabled) {
      // lang-settings.applyUserLanguageToPage uses the same logic, but here
      // we do it inline for a focused demo.
      const { transliterateForUser } = await import("../api/lang-settings.js");
      rendered = transliterateForUser(sourceText, {
        fromScheme: "hk",
        toScheme: scheme,
      });

      statusMessage = `Bilingual ON. langCode = "${langCode}", scheme = "${scheme}".`;
    }

    demoTextEl.textContent = rendered;
    demoStatusEl.textContent = statusMessage;
  } catch (error) {
    console.error("Failed to load language settings for demo", error);
    demoStatusEl.textContent =
      "Could not load your language settings. Are you logged in?";
  }
};

init();
