'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  onMicStatusChange: (isOn: boolean) => void;
  onError?: (message: string | null) => void;
}

export default function MicrophoneTest({ onMicStatusChange, onError }: Props) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isOn, setIsOn] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;

        source.connect(audioCtx.destination);

        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const update = () => {
          analyser.getByteFrequencyData(dataArray);
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
    <div className="mb-4">
      <button
        onClick={toggleMic}
        className={`px-4 py-2 text-white rounded ${
          isOn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isOn ? 'Stop Microphone' : 'Start Microphone'}
      </button>
      {/* Removed inline error display */}
    </div>
  );
}
