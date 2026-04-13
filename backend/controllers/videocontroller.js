import Video from "../models/video.js";
import path from "path";
import { extractFrames } from "../utils/frameExtractor.js";
import { analyzeFrames } from "../utils/analyzeFrames.js";

// ================== UPLOAD VIDEO ==================
export const uploadVideo = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Save video in DB
    const video = await Video.create({
      filename: file.filename,
      status: "processing",
      progress: 0,
      sensitivity: "pending",
    });

    console.log("✅ Video saved to DB:", video._id);

    const io = req.app.get("io");

    // Start processing
    processVideo(video._id, io);

    res.json({
      message: "Upload successful",
      videoId: video._id.toString(),
    });
  } catch (err) {
    console.error("🔥 UPLOAD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

// ================== PROCESS VIDEO ==================
const processVideo = async (videoId, io) => {
  console.log("🚀 processVideo started");

  let progress = 0;
  let result = "safe";
  let confidence = 0.5;

  const interval = setInterval(async () => {
    try {
      progress += 20;

      console.log(`📊 Progress: ${progress}`);

      // Emit progress
      io.emit("progress", {
        progress,
        videoId: videoId.toString(),
      });

      await Video.findByIdAndUpdate(videoId, { progress });

      // ================== WHEN DONE ==================
      if (progress >= 100) {
        clearInterval(interval);

        let result = "safe";

        try {
          const video = await Video.findById(videoId);

          if (!video) {
            console.log("❌ Video not found");
            return;
          }

          const videoPath = path.join("uploads", video.filename);

          console.log("🔥 Step 1: Extracting frames...");
          io.to(videoId.toString()).emit("stage", "Extracting Frames");
          const framesFolder = await extractFrames(videoPath);

          console.log("🔥 Step 2: Analyzing frames...");
          io.to(videoId.toString()).emit("stage", "Analyzing Content");

          let confidence = 0;
          
          const analysis = await analyzeFrames(framesFolder);

          if (typeof analysis === "string") {
            result = analysis;
            confidence = 0; // safer default
          } else {
            result = analysis?.label || "safe";
            confidence = analysis?.confidence || 0;
          }

          console.log("🔥 Step 3: Analysis done:", result);
        } catch (err) {
          console.error("🔥 ANALYSIS ERROR:", err);
          console.log("Fallback → SAFE");
        }

        // Update DB
        io.to(videoId.toString()).emit("stage", "Finalizing");
        await Video.findByIdAndUpdate(videoId, {
          status: "completed",
          sensitivity: result,
          progress: 100,
        });

        console.log("✅ Processing completed:", result);

        // ✅ IMPORTANT FIX → delay emit
        setTimeout(() => {
          io.emit("completed", {
            result,
            confidence,
            videoId: videoId.toString(),
          });

          console.log("🚀 COMPLETED EVENT SENT");
        }, 500);
      }
    } catch (error) {
      console.error("🔥 PROCESSING ERROR:", error);
    }
  }, 1000);

};

export const deleteVideo = async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);

    res.json({ message: "Video deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { status, sensitivity } = req.body;

    const updatedVideo = await Video.findByIdAndUpdate(
      req.params.id,
      {
        status,
        sensitivity,
      },
      { new: true }
    );

    res.json(updatedVideo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};