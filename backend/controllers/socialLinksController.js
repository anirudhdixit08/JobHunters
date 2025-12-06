import SocialLinks from "../models/socialLinksModel";

export const updateSocialLinks = async (req, res) => {
  try {
    const {
      whatsapp,
      telegram,
      facebook,
      instagram,
      linkedin,
      twitter,
      youtube,
    } = req.body;

    let links = await SocialLinks.findOne();

    if (links) {
      links.whatsapp = whatsapp;
      links.telegram = telegram;
      links.facebook = facebook;
      links.instagram = instagram;
      links.linkedin = linkedin;
      links.twitter = twitter;
      links.youtube = youtube;

      await links.save();

      return res.status(200).json({
        success: true,
        message: "Social links updated successfully!",
        links,
      });
    } else {
      const newLinks = await SocialLinks.create({
        whatsapp,
        telegram,
        facebook,
        instagram,
        linkedin,
        twitter,
        youtube,
      });

      return res.status(201).json({
        success: true,
        message: "Social links set up successfully!",
        links: newLinks,
      });
    }
  } catch (error) {
    console.error("Error in updateSocialLinks:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while updating links.",
      error: error.message,
    });
  }
};

export const getSocialLinks = async (req, res) => {
  try {
    const links = await SocialLinks.findOne();

    if (!links) {
      return res.status(200).json({
        success: true,
        links: {
          whatsapp: "",
          telegram: "",
          facebook: "",
          instagram: "",
          linkedin: "",
          twitter: "",
        },
      });
    }

    res.status(200).json({
      success: true,
      links,
    });
  } catch (error) {
    console.error("Error in getSocialLinks:", error);
    res.status(500).json({
      success: false,
      message: "Server Error fetching links.",
      error: error.message,
    });
  }
};
