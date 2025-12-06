import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      minlength: [3, "First name must be at least 3 characters long"],
      maxlength: [30, "First name cannot exceed 30 characters"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      minlength: [3, "Last name must be at least 3 characters long"],
      maxlength: [30, "Last name cannot exceed 30 characters"],
      trim: true,
    },
    emailId: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      immutable: true,
      validate: {
        validator: validator.isEmail,
        message: "Please enter a valid email address",
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      validate: {
        validator: (value) => validator.isMobilePhone(value),
        message: "Please enter a valid phone number",
      },
    },
    role: {
      type: String,
      enum: ["admin"],
      default: "admin",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
      validate: {
        validator: (value) =>
          validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          }),
        message:
          "Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol.",
      },
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
