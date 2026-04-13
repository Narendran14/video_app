import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); 

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import videoroutes from "./routes/videoroutes.js";
import http from "http";
import { Server } from "socket.io";


const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("joinRoom", (videoId) => {
    socket.join(videoId);
    console.log(`📦 Joined room: ${videoId}`);
  });
});

// make io accessible globally
app.set("io", io);

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});

// Middleware
app.use(express.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));

//Routes AFTER middleware
app.use("/api/auth", authRoutes);
app.use("/api/videos",videoroutes);


// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));


