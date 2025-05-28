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
}

export default function NetworkTest({ onNetworkStats, showOnlyButton }: Props) {
  const [stats, setStats] = useState<NetworkStats | null>(null);

  const test = async () => {
    const res = await fetch('/api/network');
    const data = await res.json();
    setStats(data);
    onNetworkStats(data);
  };

  if (showOnlyButton) {
    return (
      <button
        onClick={test}
        className="mb-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Run Network Test
      </button>
    );
  }

  return (
    <section>
      <h1 className="text-3xl font-bold mb-6">Network Test</h1>
      <h2 className="text-xl font-semibold mb-2">3. Network Test</h2>
      <button
        onClick={test}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Run Network Test
      </button>
      {stats && (
        <div className="mt-4 space-y-1">
          <p><strong>Download:</strong> {stats.download} Mbps</p>
          <p><strong>Upload:</strong> {stats.upload} Mbps</p>
          <p><strong>Ping:</strong> {stats.ping} ms</p>
        </div>
      )}
    </section>
  );
}
