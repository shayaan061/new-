'use client';

import { useEffect, useRef, useState } from 'react';
import CameraTest from './components/CameraTest';
import MicrophoneTest from './components/MicrophoneTest';
import NetworkTest from './components/NetworkTest';
import StartInterview from './components/StartInterview';

export default function TestPage() {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [networkStats, setNetworkStats] = useState<{ download: string; upload: string; ping: string } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [cameraStream]);

  const downloadSpeed = parseFloat(networkStats?.download ?? '0');
  const uploadSpeed = parseFloat(networkStats?.upload ?? '0');

  const isReady: boolean =
    !!isCameraOn &&
    !!isMicOn &&
    !!networkStats &&
    downloadSpeed >= 2 &&
    uploadSpeed >= 2;

  const message = !isCameraOn
    ? 'Camera must be turned on.'
    : !isMicOn
    ? 'Microphone must be turned on.'
    : !networkStats
    ? 'Run the network test.'
    : downloadSpeed < 2 || uploadSpeed < 2
    ? 'Network too slow. Requires > 2 Mbps upload/download.'
    : 'All systems go! Ready to start.';

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">System Test</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Instructions sidebar */}
        <aside className="lg:w-1/3 w-full bg-gray-100 border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-2">Instructions</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 text-sm">
            <li>Ensure your camera is working. Click "Start Camera" and check the preview.</li>
            <li>Test your microphone by speaking and observing the green bar activity.</li>
            <li>Run the network test to check if your connection is suitable.</li>
            <li>You need at least 2 Mbps upload and download speeds.</li>
            <li> djbdhjbd </li>
            <li>All tests must pass to enable the "Start Interview" button.</li>
          </ul>
        </aside>

        {/* Main test area */}
        <main className="lg:w-2/3 w-full">
          {/* Header with Start Interview button */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Run Your System Tests</h2>
            <StartInterview isReady={isReady} message={message} />
          </div>

          {/* Always show camera preview video box */}
          <section className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Camera Preview</h3>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-80 h-60 rounded border bg-black object-cover"
            />
          </section>

          {/* Buttons row below the preview */}
          <div className="flex flex-wrap gap-4">
            <CameraTest
              onCameraStatusChange={setIsCameraOn}
              onStreamChange={setCameraStream}
              showOnlyButton
            />
            <MicrophoneTest onMicStatusChange={setIsMicOn}  />
            <NetworkTest onNetworkStats={setNetworkStats} showOnlyButton />
          </div>
        </main>
      </div>
    </div>
  );
}