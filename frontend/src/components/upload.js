import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import "../App.css";
import { useNavigate } from "react-router-dom";

const socket = io("http://localhost:5000");
socket.on("connect", () => {
  console.log("✅ Connected to socket:", socket.id);
});

function Upload() {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  const [video, setVideo] = useState(null);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState("");
  const [confidence, setConfidence] = useState(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState("");
  const [videoId, setVideoId] = useState(null);
  const [loading, setLoading] = useState(false);
  const videoIdRef = useRef(null);

  const goToDashboard = () => {
    navigate("/dashboard");
  };

  useEffect(() => {
    videoIdRef.current = videoId;
  }, [videoId]);

  useEffect(() => {
    socket.on("joinRoom", (data) => {
      console.log("🎯 JOIN ROOM:", data.videoId);
      setVideoId(data.videoId);
    });
  });

  // ✅ SOCKET LISTENERS
  useEffect(() => {
    socket.onAny((event, ...args) => {
      console.log("📡 EVENT:", event, args);
    });

    socket.on("progress", (data) => {
      console.log("📊 PROGRESS RECEIVED:", data);
      console.log("PROGRESS:", data);
      setProgress(Number(data.progress));
    });

    socket.on("completed", (data) => {
      setResult(data.result);
      setConfidence(data.confidence);
      setLoading(false);
      setStatus("Completed");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500); // 🔥 redirect after 1.5 sec
    });

    socket.on("stage", (msg) => {
      console.log("📌 Stage:", msg);
      setStage(msg);
    });

    return () => {
      socket.off("progress");
      socket.off("completed");
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    console.log("TOKEN:", token); // debug

    if (!token) {
      alert("Please login first");
      navigate("/login");
    }
  }, []);

  // ✅ UPLOAD FUNCTION
  const handleUpload = async () => {
    if (!video) {
      setResult(null);
      setConfidence(null);
      setProgress(0);
      setStatus("Please select a video");
      return;
    }

    const formData = new FormData();
    formData.append("video", video);

    try {
      setProgress(0);
      setResult(null);
      setLoading(true);

      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/videos/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            
          },
        },
      );
      socket.emit("joinRoom", res.data.videoId);

      // 🚀 No polling needed anymore
      setStatus("Processing...");
    } catch (err) {
      console.error(err);
      setStatus("Upload failed");
    }
  };
  if (result && video) {
    return (
      <div className="container">
        <video
          controls
          autoPlay
          style={{
            width: "80%",
            borderRadius: "12px",
            boxShadow: "0 0 20px black",
          }}
          src={URL.createObjectURL(video)}
        />

        <div style={{ marginTop: "15px" }}>
          <h2>{result === "safe" ? "✅ SAFE" : "🚨 FLAGGED"}</h2>
          <p>Confidence: {(confidence * 100).toFixed(2)}%</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{
        padding: "20px",
        color: "white",
        marginTop: "0px", // ✅ force top
        alignItems: "flex-start",
      }}
    >
      {/* 🔼 TOP BAR */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 0,
          marginBottom: "20px",
          width: "100%", // 🔥 ADD THIS LINE
        }}
      >
        <button
          onClick={goToDashboard}
          style={{
            padding: "8px 14px",
            background: "#ff3b3b",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ← Back to Dashboard
        </button>

        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{
            padding: "8px 14px",
            background: "#ff3b3b",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center", // 🔥 CENTER CONTENT
          justifyContent: "center",
          width: "100%",
        }}
      >
        {/* 🎬 TITLE */}
        <h2 className="title">🎬 Video Content Analyzer</h2>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            maxWidth: "500px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          {/* 📦 UPLOAD BOX */}
          <div className="upload-box">
            {/* DRAG DROP */}
            <div
              onDrop={(e) => {
                e.preventDefault();
                setVideo(e.dataTransfer.files[0]);
              }}
              onDragOver={(e) => e.preventDefault()}
              style={{
                border: "2px dashed gray",
                padding: "20px",
                marginBottom: "10px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div className="drop-zone">Drag & Drop Video Here</div>
            </div>

            {/* FILE INPUT */}
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideo(e.target.files[0])}
            />

            <br />
            <br />

            {/* 🚫 ROLE BLOCK */}
            {role === "editor" ? (
              <p style={{ color: "red" }}>🚫 Editors cannot upload videos</p>
            ) : (
              <button
                onClick={handleUpload}
                style={{
                  padding: "8px 14px",
                  background: "#ff3b3b",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Upload Video
              </button>
            )}

            <br />
            <br />

            {/* 📊 STATUS */}
            <p>Status: {status}</p>

            <p style={{ color: "#00c6ff" }}>⚙ {stage || "Waiting..."}</p>

            {/* 📈 PROGRESS */}
            <p style={{ fontWeight: "bold", fontSize: "18px" }}>
              {Math.round(progress)}%
            </p>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: progress + "%" }}
              ></div>
            </div>

            {/* 🔄 PROCESSING */}
            {status === "Processing..." && (
              <div style={{ marginTop: "15px" }}>
                <div className="spinner"></div>
                <p>Analyzing video...</p>
              </div>
            )}

            {/* ✅ RESULT */}
            {status === "completed" && result && (
              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  borderRadius: "8px",
                  background: result === "safe" ? "#1e7e34" : "#c82333",
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                {result === "safe" ? "✅ SAFE CONTENT" : "🚨 FLAGGED CONTENT"}
              </div>
            )}

            {/* 🎯 CONFIDENCE */}
            <p style={{ marginTop: "10px", color: "#00c6ff" }}>
              Confidence: {(confidence * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Upload;
