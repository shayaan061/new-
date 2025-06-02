'use client';

import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { useRef, useState } from 'react';

const MicSwitch = styled(Switch)(() => ({
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
        backgroundImage: "url('/mic-on.png')",
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
      left: '0px',
      top: '0px',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'contain',
      backgroundImage: "url('/mic-off.png')",
    },
  },
  '& .MuiSwitch-track': {
    borderRadius: 10,
    backgroundColor: '#ccc',
    opacity: 1,
  },
}));

interface Props {
  onMicStatusChange: (isOn: boolean) => void;
  onError?: (message: string | null) => void;
}

export default function MicTest({ onMicStatusChange, onError }: Props) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOn, setIsOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const setAndReportError = (msg: string) => {
    setError(msg);
    onError?.(msg);
    onMicStatusChange(false);
    setIsOn(false);
    setLevel(0);
    setShowOverlay(false);
  };

  const startMicTest = async () => {
    try {
      setError(null);
      onError?.(null);
      setShowOverlay(true);

      const getMediaPromise = navigator.mediaDevices.getUserMedia({ audio: true });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 10000)
      );

      const mediaStream = await Promise.race([getMediaPromise, timeoutPromise]);

      const audioCtx = new AudioContext();
      await audioCtx.resume();

      const source = audioCtx.createMediaStreamSource(mediaStream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;

      source.connect(analyser);

      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;

      const bufferLength = analyser.fftSize;
      const timeData = new Float32Array(bufferLength);
      let maxDb = -Infinity;

      const update = () => {
        analyser.getFloatTimeDomainData(timeData);
        const rms = Math.sqrt(timeData.reduce((sum, val) => sum + val * val, 0) / bufferLength);
        const decibels = 20 * Math.log10(rms || 0.00001);
        maxDb = Math.max(maxDb, decibels);

        const normalized = Math.max(0, Math.min(1, (decibels + 60) / 60));
        const percentage = normalized * 100;
        setLevel(prev => prev * 0.7 + percentage * 0.3);

        animationRef.current = requestAnimationFrame(update);
      };

      animationRef.current = requestAnimationFrame(update);

      setStream(mediaStream);
      setIsOn(true);
      onMicStatusChange(true);

      setTimeout(() => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        analyser.disconnect();
        source.disconnect();
        mediaStream.getTracks().forEach(track => track.stop());
        audioCtx.close();
        setShowOverlay(false);

        if (maxDb < -40) {
          setAndReportError(`Microphone input too quiet. Max level was ${maxDb.toFixed(1)} dB. Minimum required is -40 dB.`);
        }
      }, 8000);
    } catch (err: any) {
      if (err.message === 'timeout') {
        setAndReportError('Microphone permission prompt timed out. Please allow access.');
        return;
      }

      let message = 'An error occurred while accessing the microphone.';
      if (err.name === 'NotAllowedError') {
        message = 'Permission to access the microphone was denied.';
      } else if (err.name === 'NotFoundError') {
        message = 'No microphone device found.';
      } else if (err.name === 'NotReadableError') {
        message = 'Microphone is already in use by another application.';
      }
      setAndReportError(message);
    }
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    if (checked && !isOn) {
      startMicTest();
    }
  };

  return (
    <section className="mb-4 relative">
      <div className="flex items-center space-x-4 mb-2">
        <div className="w-45 h-12 px-4 py-2 rounded-full text-sm flex items-center justify-between bg-blue-600 text-white">
          <span className="ml-3">Microphone</span>
          <MicSwitch checked={isOn} onChange={handleSwitchChange} />
        </div>
      </div>

      {showOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-black bg-opacity-90 text-white px-12 py-10 rounded-xl shadow-xl text-center w-[450px] pointer-events-auto space-y-6">
            <h2 className="text-3xl font-bold">READ THIS OUT LOUD</h2>
            <p className="text-xl">Hello, mic test 123</p>
            <div className="h-6 bg-gray-300 rounded overflow-hidden mt-4">
              <div
                className="h-6 bg-green-500 rounded transition-all duration-100"
                style={{ width: `${Math.min(level, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
