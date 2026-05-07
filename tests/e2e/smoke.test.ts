import { test, expect } from "@playwright/test";

test.describe("Marketing pages", () => {
  test("home page loads with hero content", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Marigold|Ananya|Wedding/i);
    await expect(page.locator("body")).toBeVisible();
  });

  test("home page has no broken console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const critical = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("404") && !e.includes("sentry"),
    );
    expect(critical).toHaveLength(0);
  });
});

test.describe("Auth pages", () => {
  test("sign in page renders", async ({ page }) => {
    await page.goto("/auth/signin");
    await expect(page.locator("body")).toBeVisible();
  });

  test("sign up page renders", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Public shopping pages", () => {
  test("vendors listing loads", async ({ page }) => {
    const res = await page.goto("/shopping");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("creators listing loads", async ({ page }) => {
    const res = await page.goto("/shopping/creators");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });

  test("drops listing loads", async ({ page }) => {
    const res = await page.goto("/shopping/drops");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Community pages", () => {
  test("community page loads", async ({ page }) => {
    const res = await page.goto("/community");
    expect(res?.status()).toBeLessThan(500);
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("API health", () => {
  test("vendors API returns 200", async ({ request }) => {
    const res = await request.get("/api/vendors?limit=1");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("vendors");
  });

  test("creators API returns 200", async ({ request }) => {
    const res = await request.get("/api/creators?limit=1");
    expect(res.status()).toBe(200);
  });

  test("rate limit on rsvp submit returns 422 for bad payload", async ({ request }) => {
    const res = await request.post("/api/rsvp/submit", {
      data: {},
      headers: { "Content-Type": "application/json" },
    });
    expect([400, 422]).toContain(res.status());
  });

  test("bookings POST rejects unauthenticated", async ({ request }) => {
    const res = await request.post("/api/bookings", {
      data: { serviceId: "00000000-0000-0000-0000-000000000000", coupleNote: "test" },
      headers: { "Content-Type": "application/json" },
    });
    expect(res.status()).toBe(401);
  });

  test("studio brand-system rejects unauthenticated", async ({ request }) => {
    const res = await request.get("/api/studio/brand-system?weddingId=test");
    expect(res.status()).toBe(401);
  });
});

test.describe("Security headers", () => {
  test("home page has X-Frame-Options DENY", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
  });

  test("home page has X-Content-Type-Options nosniff", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("home page has Content-Security-Policy", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["content-security-policy"]).toBeTruthy();
  });
});

test.describe("404 handling", () => {
  test("unknown route returns 404 page", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist-xyz");
    expect(res?.status()).toBe(404);
    await expect(page.locator("body")).toBeVisible();
  });
});
