import { auth } from "/auth/api/firebase-config.js";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  getCurrentUserProfile,
  updateUserLanguageSettings,
} from "/auth/api/auth-api.js";

const loggedOut = document.getElementById("logged-out");
const loggedIn = document.getElementById("logged-in");
const profileBtn = document.getElementById("profile-btn");
const dropdown = document.getElementById("profile-dropdown");
const userEmailDropdown = document.getElementById("user-email-dropdown");
const usernameDisplay = document.getElementById("username");
const dropdownLogout = document.getElementById("dropdown-logout");
const headerLangSelect = document.getElementById("header-language-select");
const headerBilingualToggle = document.getElementById(
  "header-bilingual-toggle"
);
const dropdownLangSelect = document.getElementById("dropdown-language-select");
const dropdownBilingualToggle = document.getElementById(
  "dropdown-bilingual-toggle"
);

// Check if user is logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    loggedOut.classList.add("hidden");
    loggedIn.classList.remove("hidden");

    // Display email
    userEmailDropdown.textContent = user.email;

    // display user firstname or username from email, if username not available
    let displayName;

    if (user.displayName) {
      // Get first name only
      displayName = user.displayName.split(" ")[0];
    } else {
      // Get email username before '@' symbol
      displayName = user.email.split("@")[0];
    }

    usernameDisplay.textContent = `Hi, ${displayName}!`;

    // Load language preferences into header/dropdown controls
    getCurrentUserProfile()
      .then((profile) => {
        if (!profile) return;

        const langCode = profile.langCode || "sa";
        const bilingualEnabled = !!profile.bilingualEnabled;

        if (headerLangSelect) headerLangSelect.value = langCode;
        if (dropdownLangSelect) dropdownLangSelect.value = langCode;

        if (headerBilingualToggle)
          headerBilingualToggle.checked = bilingualEnabled;
        if (dropdownBilingualToggle)
          dropdownBilingualToggle.checked = bilingualEnabled;
      })
      .catch((err) => {
        console.error("Failed to load language settings for navbar", err);
      });
  } else {
    loggedOut.classList.remove("hidden");
    loggedIn.classList.add("hidden");
  }
});

const syncLanguageControlsFromHeader = () => {
  if (headerLangSelect && dropdownLangSelect) {
    dropdownLangSelect.value = headerLangSelect.value;
  }
  if (headerBilingualToggle && dropdownBilingualToggle) {
    dropdownBilingualToggle.checked = headerBilingualToggle.checked;
  }
};

const syncLanguageControlsFromDropdown = () => {
  if (dropdownLangSelect && headerLangSelect) {
    headerLangSelect.value = dropdownLangSelect.value;
  }
  if (dropdownBilingualToggle && headerBilingualToggle) {
    headerBilingualToggle.checked = dropdownBilingualToggle.checked;
  }
};

const saveNavbarLanguageSettings = async () => {
  const langCode = headerLangSelect?.value || dropdownLangSelect?.value;
  const bilingualEnabled =
    headerBilingualToggle?.checked ?? dropdownBilingualToggle?.checked;

  try {
    await updateUserLanguageSettings({
      langCode,
      bilingualEnabled,
    });
  } catch (error) {
    console.error("Failed to save navbar language settings", error);
  }
};

headerLangSelect?.addEventListener("change", () => {
  syncLanguageControlsFromHeader();
  saveNavbarLanguageSettings();
});

headerBilingualToggle?.addEventListener("change", () => {
  syncLanguageControlsFromHeader();
  saveNavbarLanguageSettings();
});

dropdownLangSelect?.addEventListener("change", () => {
  syncLanguageControlsFromDropdown();
  saveNavbarLanguageSettings();
});

dropdownBilingualToggle?.addEventListener("change", () => {
  syncLanguageControlsFromDropdown();
  saveNavbarLanguageSettings();
});

// Toggle dropdown on profile icon click
profileBtn.addEventListener("click", () => {
  dropdown.classList.toggle("hidden");
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!loggedIn.contains(e.target)) {
    dropdown.classList.add("hidden");
  }
});

// Logout
dropdownLogout.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    dropdown.classList.add("hidden");
    alert("Logged out successfully!");
  } catch (error) {
    alert("Error logging out");
    console.error(error);
  }
});
