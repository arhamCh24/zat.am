// login.js
import { login } from "../api/auth-api.js";

const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("signin-email");
const passwordInput = document.getElementById("signin-password");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  try {
    const userCredential = await login(email, password);
    const user = userCredential.user;

    message.innerHTML = "Login successful! Redirecting...";
    message.style.color = "green";

    // ✅ Redirect to preferences.html after login
    setTimeout(() => {
      window.location.href = "preferences.html";
    }, 1000);
  } catch (error) {
    console.error(error);
    message.innerHTML = error.message;
    message.style.color = "red";
  }
});
