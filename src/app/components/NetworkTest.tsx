'use client';

import { useState } from 'react';

interface NetworkStats {
  download: string;
  upload: string;
  ping: string;
}

interface Props {
  onNetworkStats: (stats: NetworkStats) => void;
}

export default function NetworkTest({ onNetworkStats }: Props) {
  const [stats, setStats] = useState<NetworkStats | null>(null);

  const test = async () => {
    const res = await fetch('/api/network');
    const data = await res.json();
    setStats(data);
    onNetworkStats(data);
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-2">3. Network Test</h2>
      <button onClick={test} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
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
