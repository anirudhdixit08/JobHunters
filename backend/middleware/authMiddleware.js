import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { redisClient } from "../config/redis.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Unauthenticated : Invalid token");
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (verifyError) {
      throw new Error("Unauthenticated : Invalid token");
    }
    const { emailId } = payload;
    if (!emailId) {
      throw new Error("Unauthenticated : Invalid token");
    }

    const result = await User.findOne({ emailId });

    if (!result) {
      throw new Error("User does not exist");
    }

    const isBlocked = await redisClient.exists(`token:${token}`);
    // console.log("is blocked in redis : "+isBlocked);
    if (isBlocked) {
      console.log("Token found in redis blocked list");
      throw new Error("Invalid token!");
    }

    req.result = result;

    next();
  } catch (error) {
    res.status(401).send("Error : " + error);
  }
};

export const isAuthorised = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Unauthenticated : Invalid token");
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (verifyError) {
      throw new Error("Unauthenticated : Invalid token");
    }
    const { emailId, role } = payload;
    if (!emailId) {
      throw new Error("Unauthenticated : Invalid token");
    }

    const result = await User.findOne({ emailId });

    if (!result) {
      throw new Error("User does not exist");
    }

    const isBlocked = await redisClient.exists(`token:${token}`);
    // console.log("is blocked in redis : "+isBlocked);
    if (isBlocked) {
      console.log("Token found in redis blocked list");
      throw new Error("Invalid token!");
    }
    if (payload.role != "admin") {
      throw new Error("Not Authorised!");
    }

    req.result = result;

    next();
  } catch (error) {
    res.status(403).send("Error : " + error);
  }
};
