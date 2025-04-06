const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const User = require("../../models/User");
const Comment = require("../../models/Comment");
const mongoose = require("mongoose");
const cloudinary = require("../../config/cloudinary");
const multer = require("multer");

// Setup multer for image uploads
const upload = multer({ storage: multer.memoryStorage() });

// @route   GET api/posts
// @desc    Get all posts
// @access  Public
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["name", "avatar"])
      .populate("location", ["name", "latitude", "longitude"]);

    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   GET api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", ["name", "avatar"])
      .populate("location", ["name", "latitude", "longitude"]);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.status(500).send("Server Error");
  }
});

// @route   POST api/posts
// @desc    Create a post
// @access  Private
router.post("/", [auth, upload.array("images", 5)], async (req, res) => {
  try {
    const { content, location, tags } = req.body;

    // Process images if they exist
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      // Upload images to Cloudinary
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${file.buffer.toString("base64")}`,
          { folder: "tourism-guide/posts" }
        );
        imageUrls.push(result.secure_url);
      }
    }

    // Create new post
    const newPost = new Post({
      user: req.user.id,
      content,
      images: imageUrls,
      location: location ? mongoose.Types.ObjectId(location) : null,
      tags: tags ? JSON.parse(tags) : [],
    });

    const post = await newPost.save();

    // Populate user and location data
    await post
      .populate("user", ["name", "avatar"])
      .populate("location", ["name", "latitude", "longitude"]);

    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check user owns the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Delete post and any associated comments
    await Promise.all([post.remove(), Comment.deleteMany({ post: post._id })]);

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.status(500).send("Server Error");
  }
});

// @route   PUT api/posts/like/:id
// @desc    Like a post
// @access  Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check if the post has already been liked by this user
    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.status(500).send("Server Error");
  }
});

// @route   PUT api/posts/unlike/:id
// @desc    Unlike a post
// @access  Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check if the post has been liked by this user
    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Post has not yet been liked" });
    }

    // Remove the like
    post.likes = post.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.status(500).send("Server Error");
  }
});

// @route   GET api/posts/user/:userId
// @desc    Get posts by user ID
// @access  Public
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user", ["name", "avatar"])
      .populate("location", ["name", "latitude", "longitude"]);

    res.json(posts);
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(500).send("Server Error");
  }
});

module.exports = router;
