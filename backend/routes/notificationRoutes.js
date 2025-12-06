import express from "express";
import {
  createNotification,
  getAllNotifications,
  updateNotification,
  deleteNotification,
} from "../controllers/notificationController.js";
import { isAuthorised } from "../middleware/authMiddleware.js";

const notificationRouter = express.Router();

notificationRouter.get("/getall", getAllNotifications);

notificationRouter.post("/post", isAuthorised, createNotification);
notificationRouter.put(
  "/update/:notificationId",
  isAuthorised,
  updateNotification
);
notificationRouter.delete(
  "/delete/:notificationId",
  isAuthorised,
  deleteNotification
);

export default notificationRouter;
