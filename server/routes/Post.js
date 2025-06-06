const express = require("express");
const router = express.Router();
const Post = require("../models/post");

// Get all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new post
router.post("/", async (req, res) => {
  const { name, position, content, image } = req.body;
  if (!content || !name) return res.status(400).json({ message: "Content and name required" });

  try {
    const newPost = new Post({
      name,
      position,
      content,
      image,
      views: Math.floor(Math.random() * 1000),
      likes: 0,
      liked: false,
      comments: [],
      shares: 0,
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle like for a post
router.patch("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.liked = !post.liked;
    post.likes = post.liked ? post.likes + 1 : Math.max(post.likes - 1, 0);

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add comment
router.patch("/:id/comment", async (req, res) => {
  const { name, text } = req.body;
  if (!text || !name) return res.status(400).json({ message: "Comment text and name required" });

  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ name, text });
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Toggle save post
router.patch("/:id/save", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.saved = !post.saved;
    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
