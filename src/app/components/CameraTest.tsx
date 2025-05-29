'use client';

import { useState, useRef } from 'react';

interface Props {
  onCameraStatusChange: (isOn: boolean) => void;
  onStreamChange: (stream: MediaStream | null) => void;
  showOnlyButton?: boolean;
  onError?: (message: string | null) => void;
}

export default function CameraTest({ onCameraStatusChange, onStreamChange, showOnlyButton, onError }: Props) {
  const [isOn, setIsOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const toggleCamera = async () => {
    if (!isOn) {
      try {
        setError(null);
        onError?.(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = mediaStream;
        onStreamChange(mediaStream);
        setIsOn(true);
        onCameraStatusChange(true);
      } catch (err: any) {
        let message = 'An error occurred while accessing the camera.';
        if (err.name === 'NotAllowedError') {
          message = 'Permission to access the camera was denied.';
        } else if (err.name === 'NotFoundError') {
          message = 'No camera device found.';
        } else if (err.name === 'NotReadableError') {
          message = 'Camera is already in use by another application.';
        }
        console.error('Camera error:', err);
        setError(message);
        onError?.(message);
        streamRef.current = null;
        onStreamChange(null);
        setIsOn(false);
        onCameraStatusChange(false);
      }
    } else {
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      onStreamChange(null);
      setIsOn(false);
      onCameraStatusChange(false);
      setError(null);
      onError?.(null);
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={toggleCamera}
        className={`px-4 py-2 text-white rounded ${
          isOn ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isOn ? 'Camera ✔️' : 'Camera'}
      </button>
      {/* Removed inline error display */}
    </div>
  );
}
