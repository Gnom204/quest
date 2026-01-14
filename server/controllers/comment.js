const Comment = require("../models/Comment");
const User = require("../models/User");
const Request = require("../models/Request");
const { sendEmail } = require("../utils/email");

const createComment = async (req, res) => {
  try {
    const { requestId, text } = req.body;
    const userId = req.user;

    // Check if user is quest
    const user = await User.findById(userId);
    if (!user || user.role !== "quest") {
      return res
        .status(403)
        .json({ message: "Access denied. Only quest users can add comments." });
    }

    // Check if request exists
    const request = await Request.findById(requestId).populate(
      "selectedQuest",
      "title"
    );
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Create comment
    const comment = new Comment({
      request: requestId,
      author: userId,
      text,
    });

    await comment.save();

    // Send email to request creator (non-blocking)
    const creator = await User.findById(request.from);
    if (creator && creator.email) {
      const questTitle = request.selectedQuest
        ? request.selectedQuest.title
        : "Неизвестный квест";
      const subject = "Новый комментарий к вашей заявке";
      const emailText = `К вашей заявке "${questTitle}" добавлен новый комментарий от ${
        user.name
      }:\n\n${text}\n\nДата: ${new Date().toLocaleString("ru-RU")}`;
      sendEmail(creator.email, subject, emailText).catch((err) =>
        console.error("Email send error:", err)
      );
    }

    res.status(201).json({ comment });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getComments = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user;

    // Check if user is quest or operator
    const user = await User.findById(userId);
    if (!user || (user.role !== "quest" && user.role !== "operator")) {
      return res.status(403).json({
        message: "Access denied. Only quest and operator can view comments.",
      });
    }

    const comments = await Comment.find({ request: requestId })
      .populate("author", "name email")
      .sort({ createdAt: 1 });

    res.json({ comments });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createComment, getComments };
