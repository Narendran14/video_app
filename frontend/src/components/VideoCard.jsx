import { useState } from 'react';
import ProgressBar from './ProgressBar';

export default function VideoCard({ video }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
        <p className="text-sm text-gray-500">Uploaded on {formatDate(video.createdAt)}</p>

        {video.status === 'processing' ? (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Processing: {video.processingProgress}%</p>
            <ProgressBar percent={video.processingProgress} />
          </div>
        ) : (
          <div className="mt-4">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {isPlaying ? 'Hide Player' : 'Watch Video'}
            </button>
          </div>
        )}
      </div>

      {isPlaying && video.status === 'complete' && (
        <div className="p-4 bg-black">
          <video
            src={`http://localhost:4000/api/videos/stream/${video._id}`}
            controls
            className="w-full"
            style={{ maxHeight: '300px' }}
          />
        </div>
      )}
    </div>
  );
}
