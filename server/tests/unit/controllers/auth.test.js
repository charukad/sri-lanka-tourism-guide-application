const { login, register } = require("../../../src/controllers/auth");
const User = require("../../../src/models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const httpMocks = require("node-mocks-http");

// Mock dependencies
jest.mock("../../../src/models/User");
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("Auth Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("login", () => {
    it("should return 400 if email is missing", async () => {
      req.body = { password: "password123" };
      await login(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty("message");
    });

    it("should return 400 if password is missing", async () => {
      req.body = { email: "test@example.com" };
      await login(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty("message");
    });

    it("should return 404 if user is not found", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      User.findOne.mockResolvedValue(null);

      await login(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty("message", "User not found");
    });

    it("should return 401 if password is incorrect", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      User.findOne.mockResolvedValue({
        _id: "1",
        email: "test@example.com",
        password: "hashedPassword",
      });
      bcrypt.compare.mockResolvedValue(false);

      await login(req, res, next);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword"
      );
      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "Invalid credentials"
      );
    });

    it("should return token if login is successful", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      const user = {
        _id: "1",
        email: "test@example.com",
        password: "hashedPassword",
        user_type: "tourist",
      };
      User.findOne.mockResolvedValue(user);
      bcrypt.compare.mockResolvedValue(true);
      jwt.sign.mockReturnValue("test-token");

      await login(req, res, next);

      expect(jwt.sign).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData().token).toBe("test-token");
      expect(res._getJSONData().user).toHaveProperty(
        "email",
        "test@example.com"
      );
      expect(res._getJSONData().user).not.toHaveProperty("password");
    });

    it("should call next with error if exception occurs", async () => {
      req.body = { email: "test@example.com", password: "password123" };
      const error = new Error("Test error");
      User.findOne.mockRejectedValue(error);

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("register", () => {
    it("should return 400 if email is missing", async () => {
      req.body = {
        username: "testuser",
        password: "password123",
        user_type: "tourist",
      };
      await register(req, res, next);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty("message");
    });

    it("should return 400 if user already exists", async () => {
      req.body = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        user_type: "tourist",
      };
      User.findOne.mockResolvedValue({ email: "test@example.com" });

      await register(req, res, next);

      expect(User.findOne).toHaveBeenCalledWith({ email: "test@example.com" });
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty(
        "message",
        "User already exists"
      );
    });

    it("should create a new user and return token", async () => {
      req.body = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        user_type: "tourist",
      };
      User.findOne.mockResolvedValue(null);
      bcrypt.genSalt.mockResolvedValue("salt");
      bcrypt.hash.mockResolvedValue("hashedPassword");

      const savedUser = {
        _id: "1",
        username: "testuser",
        email: "test@example.com",
        user_type: "tourist",
        save: jest.fn().mockResolvedValue(true),
      };

      User.mockImplementation(() => savedUser);
      jwt.sign.mockReturnValue("test-token");

      await register(req, res, next);

      expect(User).toHaveBeenCalledWith({
        username: "testuser",
        email: "test@example.com",
        password: "hashedPassword",
        user_type: "tourist",
      });

      expect(savedUser.save).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.statusCode).toBe(201);
      expect(res._getJSONData().token).toBe("test-token");
    });

    it("should call next with error if exception occurs", async () => {
      req.body = {
        username: "testuser",
        email: "test@example.com",
        password: "password123",
        user_type: "tourist",
      };
      const error = new Error("Test error");
      User.findOne.mockRejectedValue(error);

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
