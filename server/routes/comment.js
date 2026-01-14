const express = require("express");
const router = express.Router();
const { createComment, getComments } = require("../controllers/comment");
const auth = require("../middleware/auth");

router.post("/", auth, createComment);
router.get("/:requestId", auth, getComments);

module.exports = router;
