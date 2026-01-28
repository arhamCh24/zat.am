const countrySelect = document.getElementById("country");
const provinceGroup = document.getElementById("province-group");
const provinceSelect = document.getElementById("province");
const otherCountryGroup = document.getElementById("other-country-group");
const otherCountryInput = document.getElementById("other-country");
const locationForm = document.getElementById("location-form");
const message = document.getElementById("message");
const skipBtn = document.getElementById("skip-btn");

const provinces = {
  usa: [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana",
    "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
    "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada",
    "New Hampshire", "New Jersey", "New Mexico", "New York",
    "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon",
    "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
    "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
    "West Virginia", "Wisconsin", "Wyoming"
  ],
  canada: [
    "Alberta", "British Columbia", "Manitoba", "New Brunswick",
    "Newfoundland and Labrador", "Nova Scotia", "Ontario", "Prince Edward Island",
    "Quebec", "Saskatchewan", "Northwest Territories", "Nunavut", "Yukon"
  ]
};

// Handle country change
countrySelect.addEventListener("change", () => {
  const selected = countrySelect.value;

  if (selected === "usa" || selected === "canada") {
    provinceGroup.classList.remove("hidden");
    otherCountryGroup.classList.add("hidden");

    provinceSelect.innerHTML = provinces[selected]
      .map(p => `<option value="${p}">${p}</option>`)
      .join("");
  } else if (selected === "other") {
    provinceGroup.classList.add("hidden");
    otherCountryGroup.classList.remove("hidden");
  } else {
    provinceGroup.classList.add("hidden");
    otherCountryGroup.classList.add("hidden");
  }
});

// Submit handler
locationForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const selectedCountry = countrySelect.value;

  if (!selectedCountry) {
    showMessage("Please select a country.", "red");
    return;
  }

  if (selectedCountry === "other") {
    const otherName = otherCountryInput.value.trim();
    if (!otherName) {
      showMessage("Please enter your country name.", "red");
      return;
    }
    showMessage(`Country saved: ${otherName}`, "green");
  } else {
    const province = provinceSelect.value;
    showMessage(`Country: ${selectedCountry.toUpperCase()}, Province/State: ${province}`, "green");
  }

  setTimeout(() => {
    redirectToFinal();
  }, 1500);
});

// Skip handler
skipBtn.addEventListener("click", () => {
  showMessage("Continuing...", "green");
  setTimeout(() => {
    redirectToFinal();
  }, 1000);
});

// Helper functions
function showMessage(text, color) {
  message.innerText = text;
  message.style.color = color;
}

function redirectToFinal() {
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirect") || "../index24.html";
  window.location.href = decodeURIComponent(redirectUrl);
}
