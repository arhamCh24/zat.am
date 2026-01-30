// preferences.js
import { auth } from "../api/firebase-config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { db } from "../api/firebase-config.js";
import {
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// DOM elements
const form = document.getElementById("preferences-form");
const languageSelect = document.getElementById("language");
const countrySelect = document.getElementById("country");
const provinceSelect = document.getElementById("province");
const otherCountryInput = document.getElementById("other-country");
const skipBtn = document.getElementById("skip-btn");
const message = document.getElementById("message");

// ✅ Handle preferences submission
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const language = languageSelect.value;
  const country = countrySelect.value;
  const province = provinceSelect.value;
  const otherCountry = otherCountryInput.value.trim();

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const userRef = doc(db, "users", user.uid);

    // Build preferences object
    const preferences = {
      language: language,
      country: country === "other" ? otherCountry : country,
    };

    if (country === "usa" || country === "canada") {
      preferences.province = province;
    }

    try {
      await updateDoc(userRef, preferences);
      window.location.href = "index24.html";
    } catch (error) {
      console.error("Error saving preferences:", error);
      message.textContent = "Failed to save preferences. Try again.";
      message.style.color = "red";
    }
  });
});

// ✅ Handle Skip button
skipBtn.addEventListener("click", () => {
  window.location.href = "index24.html";
});
