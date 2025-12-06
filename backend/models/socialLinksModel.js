import mongoose from "mongoose";

const socialLinksSchema = new mongoose.Schema(
  {
    whatsapp: { type: String, trim: true, default: "" },
    telegram: { type: String, trim: true, default: "" },
    facebook: { type: String, trim: true, default: "" },
    instagram: { type: String, trim: true, default: "" },
    linkedin: { type: String, trim: true, default: "" },
    twitter: { type: String, trim: true, default: "" },
    youtube: { type: String, trim: true, default: "" }, // for future !!
  },
  {
    timestamps: true,
  }
);

const SocialLinks = mongoose.model("SocialLinks", socialLinksSchema);

export default SocialLinks;
