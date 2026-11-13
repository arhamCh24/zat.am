// Presentation-only enhancement for sign-in and sign-up password inputs.
// Does not interact with Firebase authentication or form submission.
document.querySelectorAll("[data-password-toggle]").forEach((button) => {
  const input = document.getElementById(button.dataset.passwordToggle);
  if (!input) return;
  button.addEventListener("click", () => {
    const showing = input.type === "password";
    input.type = showing ? "text" : "password";
    button.textContent = showing ? "Hide" : "Show";
    button.setAttribute("aria-pressed", String(showing));
    button.setAttribute(
      "aria-label",
      showing ? "Hide password" : "Show password",
    );
    input.focus({ preventScroll: true });
  });
});
