const { getGuides, getGuideById } = require("../../../src/controllers/guides");
const Guide = require("../../../src/models/Guide");
const httpMocks = require("node-mocks-http");

// Mock dependencies
jest.mock("../../../src/models/Guide");

describe("Guide Controller", () => {
  let req, res, next;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();

    // Mock Guide.find().populate().limit().skip().sort()
    Guide.find.mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([]),
    });

    Guide.countDocuments.mockResolvedValue(0);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getGuides", () => {
    it("should get all guides with default pagination", async () => {
      await getGuides(req, res, next);

      expect(Guide.find).toHaveBeenCalled();
      expect(Guide.countDocuments).toHaveBeenCalled();
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty("success", true);
      expect(res._getJSONData()).toHaveProperty("count", 0);
      expect(res._getJSONData()).toHaveProperty("data");
    });

    it("should filter guides by expertise", async () => {
      req.query = { expertise: "hiking" };

      await getGuides(req, res, next);

      expect(Guide.find).toHaveBeenCalledWith(
        expect.objectContaining({
          expertise: { $regex: "hiking", $options: "i" },
        })
      );
    });

    it("should filter guides by languages", async () => {
      req.query = { languages: "english,spanish" };

      await getGuides(req, res, next);

      expect(Guide.find).toHaveBeenCalledWith(
        expect.objectContaining({
          languages: { $in: ["english", "spanish"] },
        })
      );
    });

    it("should filter guides by rating", async () => {
      req.query = { rating: "4" };

      await getGuides(req, res, next);

      expect(Guide.find).toHaveBeenCalledWith(
        expect.objectContaining({
          rating: { $gte: 4 },
        })
      );
    });

    it("should apply pagination correctly", async () => {
      req.query = { page: "2", limit: "5" };

      const mockFindChain = {
        populate: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue([]),
      };

      Guide.find.mockReturnValue(mockFindChain);

      await getGuides(req, res, next);

      expect(mockFindChain.skip).toHaveBeenCalledWith(5);
      expect(mockFindChain.limit).toHaveBeenCalledWith(5);
    });

    it("should call next with error if exception occurs", async () => {
      const error = new Error("Test error");
      Guide.find.mockImplementation(() => {
        throw error;
      });

      await getGuides(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getGuideById", () => {
    it("should return 404 if guide is not found", async () => {
      req.params = { id: "1" };
      Guide.findById.mockResolvedValue(null);

      await getGuideById(req, res, next);

      expect(Guide.findById).toHaveBeenCalledWith("1");
      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty("message", "Guide not found");
    });

    it("should return guide if found", async () => {
      req.params = { id: "1" };
      const mockGuide = {
        _id: "1",
        user: {
          _id: "2",
          username: "guide1",
          email: "guide1@example.com",
        },
        expertise: "hiking",
        languages: ["english", "sinhala"],
        rating: 4.5,
      };

      Guide.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockGuide),
      });

      await getGuideById(req, res, next);

      expect(Guide.findById).toHaveBeenCalledWith("1");
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toHaveProperty("success", true);
      expect(res._getJSONData()).toHaveProperty("data", mockGuide);
    });

    it("should return 404 for invalid ObjectId", async () => {
      req.params = { id: "invalid-id" };
      const error = new Error("Invalid ID");
      error.kind = "ObjectId";

      Guide.findById.mockRejectedValue(error);

      await getGuideById(req, res, next);

      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toHaveProperty("message", "Guide not found");
    });

    it("should call next with error for other exceptions", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");

      Guide.findById.mockRejectedValue(error);

      await getGuideById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
