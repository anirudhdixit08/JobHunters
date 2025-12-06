import express from "express";
import {
  register,
  login,
  logout,
  adminRegister,
  deleteProfile,
  sendOTP,
  getAllAdmins,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/userController.js";
import { isAuthenticated, isAuthorised } from "../middleware/authMiddleware.js";
// import { getDashboardStats, getRecentActivity,
//     getRecentCreatedProblems } from '../controllers/userDashboard.js';

const authRouter = express.Router();

// authRouter.post('/register',register);
authRouter.post("/register", register);

authRouter.post("/login", login);

authRouter.post("/sendotp", sendOTP);

authRouter.post("/logout", logout);

authRouter.post("/admin/register", isAuthorised, adminRegister);

// authRouter.get('/dashboard-stats',isAuthenticated,getDashboardStats);

// authRouter.get('/recent-activity',isAuthenticated,getRecentActivity);

// authRouter.get('/recent-created-problems',isAuthorised, getRecentCreatedProblems);

authRouter.delete("/delete", isAuthorised, deleteProfile);

authRouter.get("/all-admins", isAuthorised, getAllAdmins);

authRouter.get("/check", isAuthorised, (req, res) => {
  // any error will already be handled by isAuthenticated Middleware.

  const reply = {
    firstName: req.result.firstName,
    emailId: req.result.emailId,
    _id: req.result._id,
    role: req.result.role,
  };

  res.status(200).json({
    user: reply,
    message: "Valid User!",
  });
});

authRouter.get("/profile", isAuthorised, getProfile);

authRouter.patch("/update", isAuthorised, updateProfile);

authRouter.post("/change-password", isAuthorised, changePassword);

authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
userRouter.get("/admin/stats", isAuthorised, getAdminDashboardStats);

export default authRouter;
