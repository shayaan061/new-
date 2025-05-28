'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  onMicStatusChange: (isOn: boolean) => void;
}

export default function MicrophoneTest({ onMicStatusChange }: Props) {
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
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioCtx = new AudioContext();
        await audioCtx.resume();

        const source = audioCtx.createMediaStreamSource(mediaStream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 128;

        // Connect to analyser for visualizer
        // source.connect(analyser);

        // Connect to audio output for live playback
        source.connect(audioCtx.destination);

        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const update = () => {
          analyser.getByteFrequencyData(dataArray);
          const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setLevel(avg);
          animationRef.current = requestAnimationFrame(update);
        };

        animationRef.current = requestAnimationFrame(update);

        setStream(mediaStream);
        setIsOn(true);
        setError(null);
        onMicStatusChange(true);
      } catch (err: any) {
        console.error('Mic error:', err);
        setError('Microphone access failed or denied.');
        onMicStatusChange(false);
      }
    } else {
      // Turn mic off and clean up
      stream?.getTracks().forEach((track) => track.stop());
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setStream(null);
      setIsOn(false);
      setLevel(0);
      setError(null);
      onMicStatusChange(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, []);

  return (
    <section >
      <button
        onClick={toggleMic}
        className={`mb-2 px-4 py-2 text-white rounded ${
          isOn ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isOn ? 'Stop Microphone' : 'Start Microphone'}
      </button>

      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* Visualizer disabled */}
      {/* {isOn && (
        <div className="h-4 w-full bg-gray-300 rounded mb-2">
          <div
            className="h-4 bg-green-500 rounded transition-all duration-100"
            style={{ width: `${Math.min(level, 100)}%` }}
          />
        </div>
      )} */}
    </section>
  );
}

