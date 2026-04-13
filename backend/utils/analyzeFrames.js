import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";
import fs from "fs";
import path from "path";
import { createCanvas, loadImage } from "canvas";

// Load model once (global)
let model;

const loadModel = async () => {
  if (!model) {
    await tf.ready();
    model = await nsfwjs.load();
    console.log("NSFW Model Loaded ");
  }
};

// Main function
export const analyzeFrames = async (framesDir) => {
  let unsafeCount = 0;
  try {
    await loadModel();

    const files = fs.readdirSync(framesDir);
    let flagged = false;

    for (const file of files) {
      const filePath = path.join(framesDir, file);

      // ✅ LOAD IMAGE (THIS IS THE IMPORTANT FIX)
      const img = await loadImage(filePath);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(img, 0, 0);

      const imageTensor = tf.browser.fromPixels(canvas);

      // 🔍 Analyze
      const predictions = await model.classify(imageTensor);

      console.log(`📸 Frame: ${file}`);
      console.log(predictions);

      const drawing =
        predictions.find((p) => p.className === "Drawing")?.probability || 0;

      if (drawing > 0.6) {
        console.log(" Skipping drawing-heavy frame");
        imageTensor.dispose(); // clean memory before skip
        continue;
      }

      imageTensor.dispose();

      // 🔥 Improved Detection Logic

      const porn =
        predictions.find((p) => p.className === "Porn")?.probability || 0;
      const hentai =
        predictions.find((p) => p.className === "Hentai")?.probability || 0;
      const sexy =
        predictions.find((p) => p.className === "Sexy")?.probability || 0;

      // Count unsafe frames instead of immediate flag
      // 🔥 STRICT detection (reduce false positives)

      if (porn > 0.85 || sexy > 0.9 || hentai > 0.9) {
        unsafeCount++;
        console.log("⚠️ Strong unsafe frame detected");
      }
    }
    if (unsafeCount >= 4) {
      console.log("🚨 Final Result: FLAGGED");
      return "flagged";
    }

    console.log("✅ Final Result: SAFE");
    return {
      label: result > 0.7 ? "flagged" : "safe",
      confidence: result,
    };
  } catch (error) {
    console.error("Frame analysis error:", error.message);
    return "safe";
  }
};
