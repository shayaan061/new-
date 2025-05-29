'use client';

import { useState } from 'react';

interface NetworkStats {
  download: string;
  upload: string;
  ping: string;
}

interface Props {
  onNetworkStats: (stats: NetworkStats) => void;
  showOnlyButton?: boolean;
  onError?: (message: string | null) => void;
}

export default function NetworkTest({ onNetworkStats, showOnlyButton, onError }: Props) {
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  const test = async () => {
    try {
      setError(null);
      onError?.(null);

      const res = await fetch('/api/network');
      if (!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();

      setStats(data);
      onNetworkStats(data);
    } catch (err) {
      console.error('Network test error:', err);
      const message = 'Failed to run network test. Please try again.';
      setError(message);
      onError?.(message);
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={test}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Run Network Test
      </button>
      {!showOnlyButton && stats && (
        <div className="mt-2 text-sm">
          <p>Download: {stats.download} Mbps</p>
          <p>Upload: {stats.upload} Mbps</p>
          <p>Ping: {stats.ping} ms</p>
        </div>
      )}
      {/* Removed inline error display */}
    </div>
  );
}

