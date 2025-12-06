import User from "../models/userModel.js";
import Job from "../models/jobModel.js";
import Notification from "../models/notificationModel.js";
import Blog from "../models/blogModel.js";
import { userValidator } from "../utils/validator.js";
import bcrypt, { hash } from "bcrypt";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";
import crypto from "crypto";
import { mailSender } from "../utils/mailSender.js";
import OTP from "../models/otpModel.js";
import otpGenerator from "otp-generator";
import { otpTemplate } from "../mail_templates/emailVerificationTemplate.js";
import { registrationTemplate } from "../mail_templates/registrationConfirmationTemplate.js";

const generateOTP = () => crypto.randomInt(100000, 999999).toString();

export const sendOTP = async (req, res) => {
  try {
    //fetch email from request ki body
    const { emailId } = req.body;
    // console.log(emailId);

    const checkUserPresent = await User.findOne({ emailId });

    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    userValidator(req.body);
    //generate Otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = { emailId, otp };

    const otpBody = await OTP.create(otpPayload);

    const emailTemplate = otpTemplate(otp);

    await mailSender(emailId, "Your OTP Code", emailTemplate);

    //return response successful
    res.status(200).json({
      success: true,
      message: "Otp Sent Succesfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error While Sending OTP",
    });
  }
};

export const register = async (req, res) => {
  try {
    const { firstName, lastName, emailId, password, otp, phoneNumber } =
      req.body;
    if (!firstName || !lastName || !emailId || !password || !otp) {
      return res.status(403).json({
        success: false,
        message: "All fields are required.",
      });
    }
    // console.log(req.body);

    const recentOtp = await OTP.findOne({ emailId }).sort({ createdAt: -1 });
    if (!recentOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP Not Found.",
      });
    } else if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }
    userValidator(req.body);

    req.body.role = "admin";

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    req.body.password = hashedPassword;

    delete req.body.otp;

    const userData = {
      firstName,
      lastName,
      emailId,
      phoneNumber,
      password: hashedPassword,
      role: "admin",
    };
    // will already throw if email is already present in duplicate.
    const user = await User.create(userData);

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: "admin",
    };
    // const token = jwt.sign({ emailId }, process.env.JWT_SECRET_KEY, {
    //   expiresIn: 144 * 60 * 60,
    // });
    // res.cookie("token", token, { maxAge: 144 * 60 * 60 * 1000 });

    try {
      const subject = "Welcome to JobHunters!";
      const body = registrationTemplate(user.firstName, user.role);
      await mailSender(user.emailId, subject, body);
    } catch (emailError) {
      console.error("Welcome email failed to send:", emailError);
    }

    res.status(201).json({
      user: reply,
      message: "Admin Registered Successfully",
    });
  } catch (error) {
    res.status(400).send(`Error : ${error}`);
  }
};

export const adminRegister = async (req, res) => {
  try {
    const { firstName, lastName, userName, emailId, password, phoneNumber } =
      req.body;
    userValidator(req.body);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    req.body.password = hashedPassword;

    req.body.role = "admin";

    // will already throw if email is already present in duplicate.
    const user = await User.create(req.body);

    // const token = jwt.sign({emailId,userName,role:'admin'},process.env.JWT_SECRET_KEY,{expiresIn: 60*60});
    // res.cookie('token',token,{maxAge : 60*60*1000}); // here millisecond parameter
    // console.log(token);

    // here no need to set cookies as another admin will be creating another admin.

    try {
      const subject = "Welcome to JobHunters (Admin)!";
      const body = registrationTemplate(user.firstName, user.role);
      await mailSender(user.emailId, subject, body);
    } catch (emailError) {
      console.error("Admin welcome email failed to send:", emailError);
    }

    res.status(201).send("Admin Registered Successfully");
  } catch (error) {
    res.status(400).send(`Error : ${error}`);
  }
};

export const login = async (req, res) => {
  try {
    let { emailId, password } = req.body;

    // console.log(req.body);
    if (!emailId || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required.",
      });
    }

    const user = await User.findOne({ emailId }).select("+role +password");

    if (!user) {
      throw new Error("User not found!");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!user || !isMatch) throw new Error("Invalid Credentials");

    // console.log(emailId);
    // console.log(userName);
    const role = user.role;
    const token = user
      ? jwt.sign({ emailId, role }, process.env.JWT_SECRET_KEY, {
          expiresIn: 144 * 60 * 60,
        })
      : false;
    // console.log(token);

    const reply = {
      firstName: user.firstName,
      emailId: user.emailId,
      _id: user._id,
      role: user.role,
    };

    res.cookie("token", token, { maxAge: 144 * 60 * 60 * 1000 }); // here millisecond parameter
    res.status(200).json({
      user: reply,
      message: "LogIn Successful !",
    });
  } catch (error) {
    res.status(401).send(`Error : ${error}`);
  }
};

export const logout = async (req, res) => {
  try {
    // console.log("logout called!");
    const { token } = req.cookies;
    if (!token) {
      return res.status(200).send("Already logged out.");
    }
    // console.log(token);
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (verifyError) {
      res.cookie("token", "", { maxAge: 0, httpOnly: true });
      return res.status(200).send("Invalid token, logged out.");
    }
    // console.log(payload);

    await redisClient.set(`token:${token}`, "blocked");
    // await redisClient.get(`token:${token}`);
    await redisClient.expireAt(`token:${token}`, payload.exp);
    res.cookie("token", null, { expireAt: new Date(Date.now()) });
    res.status(200).send("User logged out succesfully!");
  } catch (error) {
    res.status(401).send("Error : ", error);
  }
};

export const deleteProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    await User.findByIdAndDelete(userId);
    await Submission.deleteMany({ userId }); // you could have also done this using post
    res.status(200).send("User Deleted Successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error : " + error);
  }
};

export const getAllAdmins = async (req, res) => {
  try {
    // Find all users with the role 'admin'
    const admins = await User.find({ role: "admin" }).select(
      "firstName lastName emailId"
    );
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching admins",
      error: error.message,
    });
  }
};

export const getProfile = (req, res) => {
  try {
    if (!req.result) {
      return res.status(404).json({ message: "User not found" });
    }

    const userProfile = req.result.toObject();
    delete userProfile.password;
    res.status(200).json(userProfile);
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({ message: "Server error, could not get profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.result._id;
    const { firstName, lastName } = req.body;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const reply = {
      firstName: updatedUser.firstName,
      emailId: updatedUser.emailId,
      lastName: updatedUser.lastName,
      _id: updatedUser._id,
      role: updatedUser.role,
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully!",
      user: reply,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Username is already taken." });
    }
    res
      .status(500)
      .json({ success: false, message: `Error: ${error.message}` });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = req.result;

    if (!oldPassword || !newPassword) {
      throw new Error("Please provide both old and new passwords.");
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new Error("Incorrect current password.");
    }
    if (oldPassword === newPassword) {
      throw new Error("New password cannot be the same as the old password.");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully!",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Could not change password",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { emailId } = req.body;

    if (!emailId) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User is not registered with this email",
      });
    }
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }
    const otpPayload = { emailId, otp };
    await OTP.create(otpPayload);
    const emailBody = otpTemplate(otp);

    await mailSender(emailId, "Reset Your Password -  JobHunters", emailBody);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending OTP",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { emailId, otp, newPassword, confirmPassword } = req.body;

    if (!emailId || !otp || !newPassword || !confirmPassword) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const recentOtp = await OTP.findOne({ emailId }).sort({ createdAt: -1 });

    if (!recentOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired",
      });
    }

    if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();
    await OTP.deleteOne({ _id: recentOtp._id });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while resetting password",
    });
  }
};

export const getAdminDashboardStats = async (req, res) => {
  try {
    const [activeJobs, publishedBlogs, liveNotifications] = await Promise.all([
      Job.countDocuments({ status: "Active" }),

      Blog.countDocuments({ status: "Published" }),

      Notification.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        activeJobs,
        publishedBlogs,
        liveNotifications,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching dashboard stats",
      error: error.message,
    });
  }
};
