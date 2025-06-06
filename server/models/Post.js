const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  name: String,
  text: String,
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: String,
  content: { type: String, required: true },
  image: String,
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  liked: { type: Boolean, default: false },
  comments: [commentSchema],
  shares: { type: Number, default: 0 },
  saved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", postSchema);
