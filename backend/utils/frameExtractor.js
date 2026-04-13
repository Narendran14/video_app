import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "ffprobe-static";

// 🔥 IMPORTANT FIX
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath.path);

export const extractFrames = (videoPath) => {
  return new Promise((resolve, reject) => {
    const outputDir = "./frames";

    ffmpeg(videoPath)
      .outputOptions(["-vf", "fps=1","-q:v", "2"]) // 👈 important for frame extraction
      .output(`${outputDir}/frame-%03d.png`)
      .on("start", (cmd) => {
        console.log("FFMPEG START:", cmd);
      })
      .on("end", () => {
        console.log("Frames extracted successfully ✅");
        resolve(outputDir);
      })
      .on("error", (err) => {
        console.log("FFMPEG ERROR:", err.message);
        reject(err);
      })
      .run();
  });
};