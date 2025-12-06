import Job from "../models/jobModel.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const postJob = async (req, res) => {
  try {
    const {
      title,
      companyName,
      location,
      salary,
      description,
      tags,
      category,
      jobType,
      experienceLevel,
      qualification,
      sarkariResources,
      applicationDeadline,
      applicationLink,
      contactEmail,
      isFeatured,
    } = req.body;

    if (!title || !companyName || !location || !description || !salary) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (Title, Company, Location, Description, Salary).",
      });
    }
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Company logo is required.",
      });
    }

    const tagsArray = tags
      ? tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== "")
      : [];

    let logoUrl = "";
    const logoLocalPath = req.file?.path;
    if (logoLocalPath) {
      const uploadResult = await uploadOnCloudinary(req.file.path);

      if (uploadResult && uploadResult.secure_url) {
        logoUrl = uploadResult.secure_url;
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile photo. Please try again.",
        });
      }
    }

    const newJob = await Job.create({
      title,
      companyName,
      location,
      salary,
      description,
      tags: tagsArray,
      category,
      jobType,
      experienceLevel,
      qualification,
      sarkariResources,
      applicationDeadline,
      applicationLink,
      contactEmail,
      isFeatured,
      postedBy: req.result._id,
      logo: logoUrl,
    });

    res.status(201).json({
      success: true,
      message: "Job posted successfully!",
      job: newJob,
    });
  } catch (error) {
    console.error("Error in postJob:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while posting job.",
      error: error.message,
    });
  }
};

export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found." });
    }

    const { tags, ...updateData } = req.body;

    if (tags) {
      updateData.tags = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "");
    }

    const updatedJob = await Job.findByIdAndUpdate(jobId, updateData, {
      new: true,
      runValidators: true,
    });

    const logoLocalPath = req.file?.path;
    if (logoLocalPath) {
      const uploadResult = await uploadOnCloudinary(req.file.path);

      if (uploadResult && uploadResult.secure_url) {
        updatedJob.logo = uploadResult.secure_url;
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to upload profile photo. Please try again.",
        });
      }
    }

    await updatedJob.save();

    res.status(200).json({
      success: true,
      message: "Job updated successfully!",
      job: updatedJob,
    });
  } catch (error) {
    console.error("Error in updateJob:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while updating job.",
      error: error.message,
    });
  }
};

export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await Job.findById(jobId);
    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found." });
    }

    await Job.findByIdAndDelete(jobId);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully!",
    });
  } catch (error) {
    console.error("Error in deleteJob:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while deleting job.",
      error: error.message,
    });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const { keyword, location, category, jobType } = req.query;

    const query = { status: "Active" };
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: "i" } }, // Case-insensitive regex
        { companyName: { $regex: keyword, $options: "i" } },
        { tags: { $regex: keyword, $options: "i" } },
      ];
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }
    if (category && category !== "Any") {
      query.category = category;
    }

    if (jobType && jobType !== "Any") {
      query.jobType = jobType;
    }

    const jobs = await Job.find(query).sort({ isFeatured: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Error in getAllJobs:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching jobs.",
      error: error.message,
    });
  }
};

export const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId).populate(
      "postedBy",
      "firstName lastName emailId"
    );

    if (!job) {
      return res
        .status(404)
        .json({ success: false, message: "Job not found." });
    }

    res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
