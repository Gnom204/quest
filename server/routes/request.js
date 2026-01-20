const express = require("express");
const {
  createRequest,
  getRequests,
  updateRequestStatus,
  assignRequest,
  deleteRequest,
} = require("../controllers/request");
const auth = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post("/", createRequest);
router.get("/", getRequests);
router.patch("/:id/status", updateRequestStatus);
router.post("/:id/assign", assignRequest);
router.delete("/:id", deleteRequest);

module.exports = router;
