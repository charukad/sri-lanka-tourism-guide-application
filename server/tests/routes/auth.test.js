const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../../src/app");
const User = require("../../../src/models/User");
const { setupDB, teardownDB } = require("../../test-utils/db-setup");

describe("Auth Routes", () => {
  beforeAll(async () => {
    await setupDB();
  });

  afterAll(async () => {
    await teardownDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        user_type: "tourist",
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("username", "testuser");
      expect(res.body.user).toHaveProperty("email", "test@example.com");
      expect(res.body.user).toHaveProperty("user_type", "tourist");
      expect(res.body.user).not.toHaveProperty("password");

      // Verify user was created in database
      const user = await User.findOne({ email: "test@example.com" });
      expect(user).not.toBeNull();
      expect(user.username).toBe("testuser");
    });

    it("should not register a user with an existing email", async () => {
      // Create a user first
      await User.create({
        username: "existinguser",
        email: "existing@example.com",
        password: "hashedpassword",
        user_type: "tourist",
      });

      // Try to register with the same email
      const res = await request(app).post("/api/auth/register").send({
        username: "newuser",
        email: "existing@example.com",
        password: "password123",
        user_type: "tourist",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("message", "User already exists");
    });

    it("should validate required fields", async () => {
      const res = await request(app).post("/api/auth/register").send({
        username: "testuser",
        // Missing email
        password: "password123",
        user_type: "tourist",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Create a test user
      const user = new User({
        username: "loginuser",
        email: "login@example.com",
        user_type: "tourist",
      });

      // Hash password manually for test
      user.password = await user.hashPassword("password123");
      await user.save();
    });

    it("should login a user with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", "login@example.com");
    });

    it("should not login with incorrect password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "login@example.com",
        password: "wrongpassword",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty("message", "Invalid credentials");
    });

    it("should not login non-existent user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "User not found");
    });
  });
});
