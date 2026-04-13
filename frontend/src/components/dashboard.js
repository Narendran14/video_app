import React, { useEffect, useState } from "react";
import axios from "axios";
import "../App.css";

function Dashboard({ setIsLoggedIn }) {
  const [videos, setVideos] = useState([]);
  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/videos", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setVideos(data);
    } catch (err) {
      console.error("Error fetching videos:", err);
    }
  };
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const role = localStorage.getItem("role");

  // 🔔 TOAST
  const showToast = (msg) => {
    const toast = document.createElement("div");
    toast.innerText = msg;

    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "#222",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: "8px",
      zIndex: 9999,
    });

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2000);
  };

  // 📡 FETCH VIDEOS
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/videos");
        setVideos(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // 🗑 DELETE WITH ANIMATION + UNDO
  const handleDelete = async (id) => {
    try {
      setDeletingId(id);

      setTimeout(async () => {
        await axios.delete(`http://localhost:5000/api/videos/${id}`);

        const deletedVideo = videos.find((v) => v._id === id);
        setLastDeleted(deletedVideo);

        setVideos((prev) => prev.filter((video) => video._id !== id));

        showToast("Deleted! Click undo ⏪");
      }, 300);
    } catch (err) {
      console.error(err);
      showToast("Delete failed ❌");
    }
  };

  // 🔁 UNDO DELETE
  const handleUndo = () => {
    if (lastDeleted) {
      setVideos((prev) => [lastDeleted, ...prev]);
      setLastDeleted(null);
      showToast("Restored ✅");
    }
  };

  // 🔓 LOGOUT
  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const handleReanalyze = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await fetch(`http://localhost:5000/api/videos/reanalyze/${id}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("Re-analysis started!");

      // refresh videos
      fetchVideos();

      setSelectedVideo(null);
    } catch (err) {
      console.error(err);
      alert("Error re-analyzing video");
    }
  };

  return (
    <div className="dashboard">
      {/* 🔥 NAVBAR */}
      <div className="navbar">
        <h2>🎬 Video Dashboard</h2>

        <div className="nav-right">
          {/* 🔁 UNDO BUTTON ALWAYS VISIBLE */}
          <button
            className="nav-btn"
            onClick={handleUndo}
            disabled={!lastDeleted}
            style={{ opacity: lastDeleted ? 1 : 0.5 }}
          >
            Undo
          </button>

          <span>{role}</span>

          <button className="nav-btn" onClick={logout}>
            Logout
          </button>

          <button
            className="nav-btn"
            onClick={() => (window.location.href = "/upload")}
          >
            Upload
          </button>
        </div>
      </div>

      {/* 🎬 CONTENT */}
      <div className="container">
        {/* 🔥 LOADING SKELETON */}
        {loading ? (
          <div className="video-grid">
            {[...Array(6)].map((_, i) => (
              <div className="card skeleton" key={i}></div>
            ))}
          </div>
        ) : (
          <div className="video-grid">
            {videos.map((video, index) => (
              <div
                key={video._id}
                className={`card ${deletingId === video._id ? "fade-out" : ""}`}
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <video
                  src={`http://localhost:5000/uploads/${video.filename}`}
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => e.target.play()}
                  onMouseLeave={(e) => {
                    e.target.pause();
                    e.target.currentTime = 0;
                  }}
                  onClick={() => setSelectedVideo(video)}
                  style={{
                    width: "100%",
                    borderRadius: "10px",
                    cursor: "pointer",
                    objectFit: "cover",
                    filter:
                      video.sensitivity === "flagged" ? "blur(12px)" : "none",
                  }}
                />

                <div className="info">
                  {/* 🔥 STATUS BADGE */}
                  <span
                    className={`badge ${
                      video.sensitivity === "flagged"
                        ? "badge-danger"
                        : "badge-safe"
                    }`}
                  >
                    {video.sensitivity === "flagged" ? "⚠ FLAGGED" : "✅ SAFE"}
                  </span>
              
                </div>

                {role === "admin" && (
                  <>
                    <button
                      className="edit-btn"
                      onClick={() => setSelectedVideo(video)}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(video._id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            ))}
            {selectedVideo && (
              <div className="modal" onClick={() => setSelectedVideo(null)}>
                <div
                  className="modal-content"
                  onClick={(e) => e.stopPropagation()} // 🔥 prevents closing when clicking inside
                >
                  {/* ✅ CLOSE BUTTON FIRST (IMPORTANT) */}
                  <button
                    className="close-btn"
                    onClick={() => setSelectedVideo(null)}
                  >
                    ✖
                  </button>

                  {/* ✅ VIDEO AFTER BUTTON */}
                  <video
                    src={`http://localhost:5000/uploads/${selectedVideo.filename}`}
                    controls
                    autoPlay
                    style={{
                      width: "100vw",
                      height: "100vh",
                      objectFit: "contain",
                      borderRadius: "0px",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
