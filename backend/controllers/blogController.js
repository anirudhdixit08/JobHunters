import Blog from "../models/blogModel.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createBlog = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      content,
      author,
      category,
      tags,
      readTime,
      status,
    } = req.body;

    if (!title || !excerpt || !content || !author) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (Title, Excerpt, Content, Author).",
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Blog photo is required.",
      });
    }
    const tagsArray = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "")
      : [];

    let photoUrl = "";
    const photoLocalPath = req.file?.path;

    if (photoLocalPath) {
      const uploadResult = await uploadOnCloudinary(photoLocalPath);

      if (uploadResult && uploadResult.secure_url) {
        photoUrl = uploadResult.secure_url;
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to upload blog photo to cloud.",
        });
      }
    }

    const newBlog = await Blog.create({
      title,
      excerpt,
      content,
      author,
      category,
      readTime,
      status,
      tags: tagsArray,
      photo: photoUrl,
    });

    res.status(201).json({
      success: true,
      message: "Blog posted successfully!",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Error in createBlog:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while creating blog.",
      error: error.message,
    });
  }
};

export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found." });
    }

    const { tags, ...updateData } = req.body;

    if (tags) {
      updateData.tags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
    }

    Object.assign(blog, updateData);

    if (req.file) {
      const photoLocalPath = req.file.path;
      const uploadResult = await uploadOnCloudinary(photoLocalPath);

      if (uploadResult && uploadResult.secure_url) {
        blog.photo = uploadResult.secure_url;
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to upload new blog photo.",
        });
      }
    }

    const updatedBlog = await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog updated successfully!",
      blog: updatedBlog,
    });
  } catch (error) {
    console.error("Error in updateBlog:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while updating blog.",
      error: error.message,
    });
  }
};

export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found." });
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully!",
    });
  } catch (error) {
    console.error("Error in deleteBlog:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while deleting blog.",
      error: error.message,
    });
  }
};

export const getAllBlogs = async (req, res) => {
  try {
    const { keyword, category, status } = req.query;

    const query = {};

    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } },
        { tags: { $regex: keyword, $options: "i" } },
      ];
    }

    if (category && category !== "Any") {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    const blogs = await Blog.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
    });
  } catch (error) {
    console.error("Error in getAllBlogs:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching blogs.",
      error: error.message,
    });
  }
};

export const getSingleBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res
        .status(404)
        .json({ success: false, message: "Blog not found." });
    }

    res.status(200).json({
      success: true,
      blog,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
