import express from "express";
import upload from "../middleware/multerMiddleware.js";
import {
  postJob,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";
import { isAuthorised } from "../middleware/authMiddleware.js";

const jobRouter = express.Router();

jobRouter.get("/getall", getAllJobs);
jobRouter.get("/get/:jobId", getJobById);

jobRouter.post("/post", isAuthorised, upload.single("logo"), postJob);
jobRouter.put("/update/:jobId", isAuthorised, upload.single("logo"), updateJob);
jobRouter.delete("/delete/:jobId", isAuthorised, deleteJob);

export default jobRouter;
