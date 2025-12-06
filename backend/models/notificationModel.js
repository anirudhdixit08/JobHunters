import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Notification title is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Admit Card", "Result", "Job", "Syllabus", "Answer Key", "Other"],
      required: [true, "Notification type is required"],
    },
    link: {
      type: String,
      required: [true, "Link URL is required"],
      trim: true,
    },
    isNew: {
      type: Boolean,
      default: true,
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString("en-GB"),
    },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
