// src/pages/LiveStream.jsx
import React, { useRef, useEffect, useState } from 'react';

const LiveStream = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      // Clean up stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startStream = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setIsStreaming(true);
    } catch (err) {
      setError('Failed to access camera and microphone. Please check your permissions.');
      console.error('Error accessing media devices:', err);
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsStreaming(false);
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Live Stream</h1>
        <p className="text-gray-600 mt-2">Stream matches live from your device</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Streaming Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Camera Feed</h2>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="bg-black rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                {isStreaming ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-white text-center">
                    <p className="text-lg mb-4">Camera feed will appear here</p>
                    <button
                      onClick={startStream}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700"
                    >
                      Start Streaming
                    </button>
                  </div>
                )}
              </div>

              {isStreaming && (
                <div className="mt-4 flex justify-center space-x-4">
                  <button
                    onClick={stopStream}
                    className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                  >
                    Stop Streaming
                  </button>
                  <button
                    onClick={startStream}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Restart Stream
                  </button>
                </div>
              )}
            </div>

            {/* Stream Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Streaming Instructions</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Allow camera and microphone permissions when prompted</li>
                <li>• Ensure good lighting for better video quality</li>
                <li>• Use a stable internet connection</li>
                <li>• Position your device to capture the entire cricket field</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stream Controls and Info */}
        <div className="space-y-6">
          {/* Stream Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Stream Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className={`font-semibold ${
                  isStreaming ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {isStreaming ? 'Live' : 'Offline'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Viewers:</span>
                <span className="font-semibold">0</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="font-semibold">00:00:00</span>
              </div>
            </div>
          </div>

          {/* Streaming Tips */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Streaming Tips</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Use a tripod for stable video</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Connect to WiFi for better quality</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Keep device charged or plugged in</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500">✓</span>
                <span>Test audio levels before going live</span>
              </div>
            </div>
          </div>

          {/* Upcoming Matches */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Upcoming Streams</h3>
            <div className="space-y-3">
              <div className="border-l-4 border-indigo-500 pl-4 py-2">
                <p className="font-medium">Match 15: Team A vs Team B</p>
                <p className="text-sm text-gray-500">Today, 3:00 PM</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <p className="font-medium">Match 16: Team C vs Team D</p>
                <p className="text-sm text-gray-500">Tomorrow, 2:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveStream;