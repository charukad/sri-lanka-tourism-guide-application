describe("Login Flow", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it("should show login screen", async () => {
    await expect(element(by.text("Login"))).toBeVisible();
    await expect(element(by.text("Sign Up"))).toBeVisible();
  });

  it("should show validation errors on empty submission", async () => {
    await element(by.text("Login")).tap();

    await expect(element(by.text("Please enter your email"))).toBeVisible();
    await expect(element(by.text("Please enter your password"))).toBeVisible();
  });

  it("should login successfully with valid credentials", async () => {
    // Mock successful login response
    await device.setURLBlacklist([".*/api/auth/login"]);

    // Enter credentials
    await element(by.id("email-input")).typeText("test@example.com");
    await element(by.id("password-input")).typeText("password123");
    await element(by.text("Login")).tap();

    // Wait for dashboard to appear
    await waitFor(element(by.text("Explore")))
      .toBeVisible()
      .withTimeout(2000);

    // Verify successful navigation to dashboard
    await expect(element(by.text("Explore"))).toBeVisible();
    await expect(element(by.text("Itineraries"))).toBeVisible();
  });

  it("should show error message on invalid credentials", async () => {
    // Mock failed login response
    await device.setURLBlacklist([]);

    // Enter credentials
    await element(by.id("email-input")).typeText("test@example.com");
    await element(by.id("password-input")).typeText("wrongpassword");
    await element(by.text("Login")).tap();

    // Verify error message
    await expect(element(by.text("Invalid credentials"))).toBeVisible();
  });

  it("should navigate to signup screen", async () => {
    await element(by.text("Sign Up")).tap();

    // Verify navigation to signup screen
    await expect(element(by.text("Create Account"))).toBeVisible();
  });
});
