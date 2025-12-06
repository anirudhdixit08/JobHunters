import express from "express";
import {
  getSocialLinks,
  updateSocialLinks,
} from "../controllers/socialLinkController.js";
import { isAuthorised } from "../middleware/authMiddleware.js";

const socialLinksRouter = express.Router();

socialLinksRouter.get("/get", getSocialLinks);

socialLinksRouter.post("/update", isAuthorised, updateSocialLinks);

export default socialLinksRouter;
