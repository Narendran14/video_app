import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import ProgressBar from "./ProgressBar";

export default function UploadForm({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Use filename without extension as default title
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  async function handleUpload(formData) {
    setUploading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/api/videos/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (evt) => {
          const percent = Math.round((evt.loaded * 100) / evt.total);
          setProgress(percent);
        }
      });

      onUploaded(response.data.data.video);
      setTitle("");
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Please try again.");
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video file");
      return;
    }
    if (!title.trim()) {
      setError("Please enter a title for the video");
      return;
    }

    const formData = new FormData();
    formData.append("video", file);
    formData.append("title", title.trim());
    handleUpload(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-sm">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Video Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter video title"
          disabled={uploading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Video File</label>
        <div className="mt-1 flex items-center gap-4">
          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
            <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              {file ? "Change File" : "Select File"}
            </span>
            <input
              type="file"
              accept="video/*"
              onChange={handleFile}
              className="sr-only"
              disabled={uploading}
            />
          </label>
          {file && (
            <span className="text-sm text-gray-500">
              Selected: {file.name}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">Uploading...</span>
            <span className="text-blue-600 font-medium">{progress}%</span>
          </div>
          <ProgressBar percent={progress} />
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={uploading || !file}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? "Uploading..." : "Upload Video"}
        </button>
      </div>
    </form>
  );
}
