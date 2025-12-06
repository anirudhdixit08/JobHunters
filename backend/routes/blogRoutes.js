import express from "express";
import {
  createBlog,
  getAllBlogs,
  getSingleBlog,
  updateBlog,
  deleteBlog,
} from "../controllers/blogController.js";

import upload from "../middleware/multerMiddleware.js";
import { isAuthorised } from "../middleware/authMiddleware.js";

const blogRouter = express.Router();

blogRouter.get("/getall", getAllBlogs);
blogRouter.get("/get/:blogId", getSingleBlog);

blogRouter.post("/post", isAuthorised, upload.single("photo"), createBlog);
blogRouter.put(
  "/update/:blogId",
  isAuthorised,
  upload.single("photo"),
  updateBlog
);
blogRouter.delete("/delete/:blogId", isAuthorised, deleteBlog);

export default blogRouter;
