'use client';

interface Props {
  isReady: boolean;
  message: string;
}

export default function StartInterview({ isReady, message }: Props) {
  return (
    <section className="flex flex-col items-end">
      <button
        onClick={() => alert('Interview Started!')}
        disabled={!isReady}
        className={`w-32 h-12 px-4.5 py-2 rounded-full text-sm flex items-center justify-between ${
          isReady ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Start Interview
      </button>
      <p className="text-sm text-gray-500 mt-2">{message}</p>
    </section>
  );
}