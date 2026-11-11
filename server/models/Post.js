
const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
      trim: true
    },
    caption: {
      type: String,
      default: ""
    },
    postType: {
      type: String,
      enum: ["Image", "Carousel", "Reel"],
      default: "Image"
    },
    media: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "published"],
      default: "draft"
    },
    scheduledAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", postSchema);
