import Notification from "../models/notificationModel.js";

export const createNotification = async (req, res) => {
  try {
    const { title, type, link, isNew, date } = req.body;

    if (!title || !type || !link) {
      return res.status(400).json({
        success: false,
        message: "Please provide Title, Type, and Link.",
      });
    }

    const newNotification = await Notification.create({
      title,
      type,
      link,
      isNew: isNew !== undefined ? isNew : true,
      date: date || new Date().toLocaleDateString("en-GB"),
    });

    res.status(201).json({
      success: true,
      message: "Notification added to ticker!",
      notification: newNotification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllNotifications = async (req, res) => {
  try {
    const { keyword, type } = req.query;

    const query = {};

    if (keyword) {
      query.title = { $regex: keyword, $options: "i" };
    }

    if (type && type !== "Any") {
      query.type = type;
    }

    const notifications = await Notification.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error("Error in getAllNotifications:", error);
    res.status(500).json({
      success: false,
      message: "Server Error while fetching notifications.",
      error: error.message,
    });
  }
};

export const updateNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const { title, type, link, isNew } = req.body;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      {
        title,
        type,
        link,
        isNew,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Notification updated successfully",
      notification: updatedNotification,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found" });
    }

    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({ success: true, message: "Notification removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
