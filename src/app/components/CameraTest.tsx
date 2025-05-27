'use client';

import { useRef, useState } from 'react';

interface Props {
  onCameraStatusChange: (isOn: boolean) => void;
}

export default function CameraTest({ onCameraStatusChange }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOn, setIsOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCamera = async () => {
    if (!isOn) {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsOn(true);
        setError(null);
        onCameraStatusChange(true);
      } catch (err: any) {
        console.error('Camera error:', err);
        setError('Camera access failed or denied.');
        onCameraStatusChange(false);
      }
    } else {
      stream?.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
      setStream(null);
      setIsOn(false);
      setError(null);
      onCameraStatusChange(false);
    }
  };

  return (
    <section>
  <h2 className="text-xl font-semibold mb-2">1. Camera Test</h2>

  {error && <p className="text-red-600 mb-2">{error}</p>}  {/* Add margin bottom here if needed */}
  
  <video
    ref={videoRef}
    autoPlay
    playsInline
    className="w-80 h-60 rounded border object-cover mb-6"
  />

  <button
    onClick={toggleCamera}
    className={`mb-2 px-4 py-2 text-white rounded ${isOn ? 'bg-red-600' : 'bg-green-600'}`}
  >
    {isOn ? 'Stop Camera' : 'Start Camera'}
  </button>


    </section>
  );
}
