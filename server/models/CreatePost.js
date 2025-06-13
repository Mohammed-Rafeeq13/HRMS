// models/CreatePost.js
const mongoose = require("mongoose");

const createPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  mediaURL: {
    type: String,
    required: false,
  },
  mediaType: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

createPostSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model("CreatePost", createPostSchema);
