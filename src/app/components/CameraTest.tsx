'use client';

import { useState, useRef } from 'react';

interface Props {
  onCameraStatusChange: (isOn: boolean) => void;
  onStreamChange: (stream: MediaStream | null) => void;
  showOnlyButton?: boolean;
}

export default function CameraTest({ onCameraStatusChange, onStreamChange, showOnlyButton }: Props) {
  const [isOn, setIsOn] = useState(false);
  // Store the current stream to stop tracks later
  const streamRef = useRef<MediaStream | null>(null);

  const toggleCamera = async () => {
    if (!isOn) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = mediaStream;
        onStreamChange(mediaStream);
        setIsOn(true);
        onCameraStatusChange(true);
      } catch (err) {
        console.error('Camera error:', err);
        streamRef.current = null;
        onStreamChange(null);
        setIsOn(false);
        onCameraStatusChange(false);
      }
    } else {
      // Stop all tracks to properly turn off the camera
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      onStreamChange(null);
      setIsOn(false);
      onCameraStatusChange(false);
    }
  };

  return (
    <button
      onClick={toggleCamera}
      className={`mb-2 px-4 py-2 text-white rounded ${
        isOn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
      }`}
    >
      {isOn ? 'Stop Camera' : 'Start Camera'}
    </button>
  );
}
