'use client';

interface Props {
  isReady: boolean;
  message: string;
}

export default function StartInterview({ isReady, message }: Props) {
  return (
    <section>
      <button
        onClick={() => alert('Interview Started!')}
        disabled={!isReady}
        className={`w-full max-w-md px-4 py-2 text-white rounded ${
          isReady ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Start Interview
      </button>
      <p className="text-sm text-gray-500 mt-2">{message}</p>
    </section>
  );
}
