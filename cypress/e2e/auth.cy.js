//Getting to the Main page
describe("Auth - smoke", () => {
  it("loads the app entry page", () => {
    cy.visit("/index24.html");
    cy.get('[data-cy="main-title"]').should('be.visible');
  });
});

/** 
//Clicking the login Button
describe("Auth navigation", () => {
  it("navigates to login page from main page", () => {
    cy.visit("/index24.html");

    cy.get('[data-cy="login-btn"]').should("be.visible");

    cy.get('[data-cy="login-btn"]').click();

    cy.url().should("include", "/auth/login.html");
  });
});
*/

//Clicking the signup Button
describe("Auth navigation", () => {
  it("navigates to signup page from main page", () => {
    cy.visit("/index24.html");

    cy.get('[data-cy="signup-btn"]').should("be.visible");

    cy.get('[data-cy="signup-btn"]').click();

    cy.url().should("include", "/auth/signup.html");
  });
});

//Creating a user
describe("Signup flow", () => {
  it("creates a new account successfully", () => {
    cy.visit("/auth/signup.html");

    const timestamp = Date.now();
    const email = `testuser_${new Date().toISOString().replace(/[:.]/g, "-")}@example.com`;
    const password = "TestPass123!";

    cy.get('[data-cy="signup-name"]').type("Cypress Test User");
    cy.get('[data-cy="signup-email"]').type(email);
    cy.get('[data-cy="signup-password"]').type(password);
    cy.get('[data-cy="signup-cpassword"]').type(password);

    cy.get('[data-cy="create-btn"]').click();

    cy.get('[data-cy="message"]', { timeout: 10000 })
      .should("be.visible")
      .and("not.contain", "error");
  });
});

describe("Game navigation after login", () => {
  it("logs in and opens the vishwa game (bp26)", () => {
    // Step 1: Login
    cy.visit("/auth/login.html");

    cy.get('[data-cy="signin-email"]').type("testuser_1@example.com");
    cy.get('[data-cy="signin-password"]').type("TestPass123!");
    cy.get('[data-cy="signin-btn"]').click();

    // Step 2: Ensure we are redirected to main page
    cy.url({ timeout: 10000 }).should("include", "/index24.html");

    // Step 3: Wait for games to render (important – dynamic content)
    cy.get('[data-cy="game-bp26"]', { timeout: 10000 })
      .should("be.visible");

    // Step 4: Click the vishwa game
    cy.get('[data-cy="game-link-bp26"]', { timeout: 10000 })
      .should("be.visible")
      .invoke("removeAttr", "target")   
      .click();

    // Step 5: Assert navigation to the game
    cy.url({ timeout: 10000 }).should("include", "/bp26/");
  });
});
