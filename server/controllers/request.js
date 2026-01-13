const Request = require("../models/Request");
const User = require("../models/User");
const Quest = require("../models/Quest");
const { sendEmail } = require("../utils/email");

const createRequest = async (req, res) => {
  try {
    const { selectedQuest, text, questDate, questTime, metroBranch } = req.body;
    const userId = req.user;

    // Check if user is operator
    let user;
    try {
      user = await User.findById(userId);
    } catch (err) {
      console.error("Error finding user:", err);
      return res.status(401).json({ message: "Invalid user" });
    }
    if (!user || user.role !== "operator") {
      return res.status(403).json({
        message: "Access denied. Only operators can create requests.",
      });
    }

    // Validate quest exists and is active
    let quest;
    try {
      quest = await Quest.findById(selectedQuest);
    } catch (err) {
      console.error("Error finding quest:", err);
      return res.status(400).json({ message: "Invalid quest selected" });
    }
    if (!quest || !quest.isActive) {
      return res.status(400).json({ message: "Invalid quest selected" });
    }

    // Create request
    const request = new Request({
      from: userId,
      text,
      selectedQuest,
      questDate: new Date(questDate),
      questTime,
      metroBranch,
    });

    await request.save();

    // Send email to all quest users
    try {
      const questUsers = await User.find({ role: "quest" });
      const subject = "Новая заявка на квест";
      const emailText = `Новая заявка на квест "${quest.title}" от оператора ${
        user.name
      }.\nДата: ${new Date(questDate).toLocaleDateString(
        "ru-RU"
      )}\nВремя: ${questTime}\nСтанция метро: ${metroBranch}\nТекст: ${text}`;

      for (const questUser of questUsers) {
        await sendEmail(questUser.email, subject, emailText);
      }
    } catch (emailError) {
      console.error("Error sending emails:", emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({ request });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getRequests = async (req, res) => {
  try {
    const userId = req.user;
    console.log("getRequests called by userId:", userId);

    // Check if user is quest or admin
    let user;
    try {
      user = await User.findById(userId);
    } catch (err) {
      console.error("Error finding user:", err);
      return res.status(401).json({ message: "Invalid user" });
    }
    console.log("User found:", user);
    if (
      !user ||
      (user.role !== "quest" &&
        user.role !== "admin" &&
        user.role !== "operator")
    ) {
      console.log("Access denied for role:", user?.role);
      return res.status(403).json({
        message:
          "Access denied. Only quest, admin and operator can view requests.",
      });
    }

    console.log("Fetching requests...");
    let requests;
    try {
      requests = await Request.find({})
        .populate("from", "name email")
        .populate("selectedQuest", "title description photos")
        .sort({ questDate: 1 });
    } catch (err) {
      console.error("Error fetching requests:", err);
      return res.status(500).json({ message: "Error fetching requests" });
    }
    console.log("Requests fetched:", requests.length);

    res.json({ requests });
  } catch (error) {
    console.error("Error in getRequests:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user;

    // Check if user is quest or admin
    let user;
    try {
      user = await User.findById(userId);
    } catch (err) {
      console.error("Error finding user:", err);
      return res.status(401).json({ message: "Invalid user" });
    }
    if (!user || user.role !== "operator") {
      return res.status(403).json({
        message: "Access denied. Only operators can update request status.",
      });
    }

    let request;
    try {
      request = await Request.findById(id);
    } catch (err) {
      console.error("Error finding request:", err);
      return res.status(404).json({ message: "Request not found" });
    }
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;
    await request.save();

    res.json({ request });
  } catch (error) {
    console.error("Error in updateRequestStatus:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createRequest, getRequests, updateRequestStatus };
