'use client';

import { useRef, useState } from 'react';

interface Props {
  onMicStatusChange: (isOn: boolean) => void;
  onError?: (message: string | null) => void;
}

export default function MicrophoneTest({ onMicStatusChange, onError }: Props) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOn, setIsOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [level, setLevel] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  const toggleMic = async () => {
    if (!isOn) {
      try {
        setError(null);
        onError?.(null);

        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new AudioContext();
        await audioCtx.resume();

        const source = audioCtx.createMediaStreamSource(mediaStream);

        // Add gain node to control playback volume
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 10; // Normal volume

        // Create analyser node for visualizer
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;

        // Connect nodes
        source.connect(gainNode);
        gainNode.connect(audioCtx.destination); // Audio playback
        source.connect(analyser); // Visualizer

        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const update = () => {
          if (!analyserRef.current) return;

          analyserRef.current.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;

          // Boost quiet input more aggressively using exponential scaling
const normalized = avg / 255;
const boosted = Math.min(Math.pow(normalized, 0.5) * 120, 100); // 0.5 = more sensitive to low input
setLevel(prev => prev * 0.7 + boosted * 0.3); // slightly faster smoothing


          animationRef.current = requestAnimationFrame(update);
        };

        animationRef.current = requestAnimationFrame(update);

        setStream(mediaStream);
        setIsOn(true);
        onMicStatusChange(true);
      } catch (err: any) {
        let message = 'An error occurred while accessing the microphone.';
        if (err.name === 'NotAllowedError') {
          message = 'Permission to access the microphone was denied.';
        } else if (err.name === 'NotFoundError') {
          message = 'No microphone device found.';
        } else if (err.name === 'NotReadableError') {
          message = 'Microphone is already in use by another application.';
        }
        console.error('Mic error:', err);
        setError(message);
        onError?.(message);
        onMicStatusChange(false);
      }
    } else {
      stream?.getTracks().forEach(track => track.stop());
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setStream(null);
      setIsOn(false);
      setError(null);
      onError?.(null);
      onMicStatusChange(false);
    }
  };

  return (
    <section className="mb-4">
      <button
        onClick={toggleMic}
        className={`mb-2 px-4 py-2 text-white rounded ${
          isOn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isOn ? 'Stop Microphone' : 'Start Microphone'}
      </button>
{isOn && (
  <>
    <div className="h-6 bg-gray-300 rounded mb-2" style={{ width: '150px' }}>
      <div
        className="h-6 bg-green-500 rounded transition-all duration-100"
        style={{ width: `${Math.min(level, 100)}%` }}
      />
    </div>
    <p className="text-sm text-gray-500">
      You should hear your 
      <br></br>voice and see the green
      <br></br> bar react.
    </p>
  </>
)}

      {error && <p className="text-red-600 mb-2">{error}</p>}



    </section>
  );
}
