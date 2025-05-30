'use client';

import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { useState, useRef, useEffect } from 'react';

const CamSwitch = styled(Switch)(() => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: "url('/cam-on.png')",
      },
      '& + .MuiSwitch-track': {
        backgroundColor: '#4caf50',
        opacity: 1,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#f1f1f1',
    width: 32,
    height: 32,
    position: 'relative',
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'contain',
      backgroundImage: "url('/cam-off.png')",
    },
  },
  '& .MuiSwitch-track': {
    borderRadius: 20 / 2,
    backgroundColor: '#ccc',
    opacity: 1,
  },
}));

interface Props {
  onCameraStatusChange: (isOn: boolean) => void;
  onStreamChange: (stream: MediaStream | null) => void;
  onError?: (message: string | null) => void;
}

export default function CameraTest({ onCameraStatusChange, onStreamChange, onError }: Props) {
  const [isOn, setIsOn] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const turnOnCamera = async () => {
    try {
      onError?.(null);

      const constraints: MediaStreamConstraints = {
        video: {
          width: { min: 640 },
          height: { min: 480 },
          frameRate: { min: 24 },
        },
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      const videoTrack = mediaStream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();

      const actualWidth = settings.width ?? 0;
      const actualHeight = settings.height ?? 0;
      const actualFps = settings.frameRate ?? 0;

      if (actualWidth < 480 || actualHeight < 480 || actualFps < 24) {
        const qualityMessage = `Camera quality too low. Got ${actualWidth}x${actualHeight} at ${actualFps} FPS. Minimum is 480x480 @ 24 FPS.`;
        videoTrack.stop();
        streamRef.current = null;
        onStreamChange(null);
        onCameraStatusChange(false);
        setIsOn(false);
        onError?.(qualityMessage);
        return;
      }

      streamRef.current = mediaStream;
      onStreamChange(mediaStream);
      onCameraStatusChange(true);
      setIsOn(true);
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
      streamRef.current = null;
      onStreamChange(null);
      onCameraStatusChange(false);
      setIsOn(false);
      onError?.(message);
    }
  };

  // Prevent camera from being turned off manually
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked && !isOn) {
      turnOnCamera();
    } else if (!checked && isOn) {
      // Prevent turning camera off via toggle
      return;
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
return (
  <section className="mb-4 relative">
    <div className="flex items-center space-x-4 mb-2">
      <div className="w-52 h-12 px-4 py-2 rounded-full text-sm flex items-center justify-between bg-blue-600 text-white">
        <span className="ml-2">Camera</span>
        <CamSwitch checked={isOn} onChange={handleSwitchChange} />
      </div>
    </div>
  </section>
);

}
