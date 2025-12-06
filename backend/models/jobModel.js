import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    companyName: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    logo: {
      type: String,
      required: [true, "Company logo is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    salary: {
      type: String,
      required: [true, "Salary range is required"],
    },
    category: {
      type: String,
      enum: [
        "Govt Jobs",
        "Work From Office",
        "IT & Software",
        "Banking",
        "Teaching",
        "Defense / Police",
        "Railway",
        "Work From Home",
        "Fresher Jobs",
        "BPO / Customer Support",
      ],
      required: true,
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Remote", "Internship"],
      default: "Full-time",
    },
    experienceLevel: {
      type: String,
      enum: [
        "Fresher",
        "0-1 Years",
        "1-3 Years",
        "3-5 Years",
        "5+ Years",
        "10+ Years",
      ],
      default: "Fresher",
    },
    qualification: {
      type: String,
      enum: [
        "10th Pass",
        "12th Pass",
        "Diploma",
        "Graduate",
        "Post Graduate",
        "B.Tech / B.E",
        "MBA",
        "PhD",
        "Any",
      ],
      default: "Any",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    tags: {
      type: [String], // Frontend will send comma-separated string, Backend handles conversion
      default: [],
    },

    sarkariResources: {
      notificationUrl: { type: String },
      syllabusUrl: { type: String },
      examDate: { type: Date },
    },

    applicationDeadline: {
      type: Date,
    },
    applicationLink: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Rejected", "Expired"],
      default: "Active",
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

jobSchema.index({ title: "text", companyName: "text", tags: "text" });

const Job = mongoose.model("Job", jobSchema);

export default Job;
