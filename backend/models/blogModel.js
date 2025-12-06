import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, "Blog excerpt is required"],
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
    },
    readTime: {
      type: String,
      default: "5 min read",
    },
    photo: {
      type: String,
      required: true, 
    },
    category: {
      type: String,
      default: "General",
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Published", "Draft"],
      default: "Published",
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

blogSchema.index({ title: "text", tags: "text" });

const Blog = mongoose.model("Blog", blogSchema);

export default Blog;
