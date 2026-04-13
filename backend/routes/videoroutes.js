import express from "express";
import upload from "../middleware/upload.js";
import {
  uploadVideo,
  deleteVideo,
  updateVideo,
} from "../controllers/videocontroller.js";
import Video from "../models/video.js";
import authMiddleware, { checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/upload",
  authMiddleware,
  checkRole(["user", "admin"]),
  upload.single("video"),
  uploadVideo,
);
router.delete("/:id", deleteVideo);
router.put("/:id", updateVideo);

router.get("/", async (req, res) => {
  const videos = await Video.find().sort({ createdAt: -1 });
  res.json(videos);
});

router.get("/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    res.json(video);
  } catch (error) {
    console.error("GET VIDEO ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reanalyze/:id", async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    video.status = "processing";
    await video.save();

    // call your analyze logic again
    analyzeVideo(video.filename);

    res.json({ message: "Re-analysis started" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
