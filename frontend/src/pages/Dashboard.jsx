import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UploadForm from '../components/UploadForm';
import VideoCard from '../components/VideoCard';
import Navbar from '../components/Navbar';
import { useSocket } from '../hooks/useSocket';

export default function Dashboard() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Initialize socket connection
  const socket = useSocket();

  // Fetch videos from API
  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:4000/api/videos', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError('Failed to fetch videos');
      }
    } catch (err) {
      setError('Network error while fetching videos');
      console.error('Fetch videos error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [navigate]);

  // Listen for real-time progress updates
  useEffect(() => {
    if (socket) {
      socket.on('video-progress', (data) => {
        setVideos(prevVideos =>
          prevVideos.map(video =>
            video._id === data.videoId
              ? { ...video, processingProgress: data.progress, status: data.status, sensitivity: data.sensitivity }
              : video
          )
        );
      });

      socket.on('video-complete', (data) => {
        setVideos(prevVideos =>
          prevVideos.map(video =>
            video._id === data.videoId
              ? { ...video, status: 'complete', processingProgress: 100, sensitivity: data.sensitivity }
              : video
          )
        );
      });
    }

    return () => {
      if (socket) {
        socket.off('video-progress');
        socket.off('video-complete');
      }
    };
  }, [socket]);

  const handleVideoUpload = (newVideo) => {
    setVideos(prev => [newVideo, ...prev]);
    // Trigger processing (this would be handled by the backend)
    if (socket) {
      socket.emit('start-processing', { videoId: newVideo._id });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Upload and manage your video processing tasks</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload New Video</h2>
          <UploadForm onVideoUpload={handleVideoUpload} />
        </div>

        {/* Videos Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Videos</h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No videos</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by uploading your first video.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
