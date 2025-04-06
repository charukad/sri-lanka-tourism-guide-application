const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Post = require("../../models/Post");
const Comment = require("../../models/Comment");
const mongoose = require("mongoose");

// @route   GET api/comments/post/:postId
// @desc    Get all comments for a post
// @access  Public
router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate("user", ["name", "avatar"]);

    res.json(comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/comments
// @desc    Create a comment
// @access  Private
router.post("/", auth, async (req, res) => {
  try {
    const { postId, content } = req.body;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Create new comment
    const newComment = new Comment({
      post: postId,
      user: req.user.id,
      content,
    });

    const comment = await newComment.save();
    await comment.populate("user", ["name", "avatar"]);

    // Update comment count on post
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    res.json(comment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    // Check user owns the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    // Remove comment and update post
    await comment.remove();

    // Update comment count on post
    const post = await Post.findById(comment.post);
    if (post) {
      post.commentCount = Math.max(0, (post.commentCount || 1) - 1);
      await post.save();
    }

    res.json({ msg: "Comment removed" });
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Comment not found" });
    }

    res.status(500).send("Server Error");
  }
});

// @route   PUT api/comments/like/:id
// @desc    Like a comment
// @access  Private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    // Check if the comment has already been liked by this user
    if (comment.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Comment already liked" });
    }

    comment.likes.unshift({ user: req.user.id });
    await comment.save();

    res.json(comment.likes);
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Comment not found" });
    }

    res.status(500).send("Server Error");
  }
});

// @route   PUT api/comments/unlike/:id
// @desc    Unlike a comment
// @access  Private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ msg: "Comment not found" });
    }

    // Check if the comment has been liked by this user
    if (!comment.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: "Comment has not yet been liked" });
    }

    // Remove the like
    comment.likes = comment.likes.filter(
      (like) => like.user.toString() !== req.user.id
    );

    await comment.save();

    res.json(comment.likes);
  } catch (err) {
    console.error(err.message);

    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Comment not found" });
    }

    res.status(500).send("Server Error");
  }
});

module.exports = router;
