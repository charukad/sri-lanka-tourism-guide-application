// server/tests/unit/controllers/auth.test.js
const { login } = require("../../../src/controllers/auth");
const User = require("../../../src/models/User");
const mongoose = require("mongoose");
const httpMocks = require("node-mocks-http");

jest.mock("../../../src/models/User");

describe("Auth Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();
  });

  describe("login", () => {
    it("should return 400 if email is missing", async () => {
      req.body = { password: "password123" };
      await login(req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toHaveProperty("message");
    });

    // More test cases
  });
});
