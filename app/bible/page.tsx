import { createClient } from '@/utils/supabase/client'; // Assuming this exists based on other API routes
import { useEffect, useState } from 'react';

// This is a simplified example. In a real app, you'd fetch actual Bible content.
// For the purpose of this task, I'll simulate a verse.

export default function BiblePage() {
  const [currentVerse, setCurrentVerse] = useState<string>('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate fetching a verse. In a real app, this would come from your DB.
  useEffect(() => {
    // This is a placeholder. You would fetch actual Bible content here.
    // For offline capability, this content would ideally be loaded from IndexedDB
    // if available, or fetched from the network and then stored.
    setCurrentVerse("In the beginning God created the heavens and the earth. Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.");
  }, []);

  const handleTextToSpeech = async () => {
    if (!currentVerse) {
      setError("No text to convert to speech.");
      return;
    }

    setIsLoadingAudio(true);
    setError(null);
    setAudioUrl(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: currentVerse }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      // Create a blob URL from the audio stream
      const audioBlob = await response.blob();
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

    } catch (err: any) {
      console.error('Error generating TTS:', err);
      setError(err.message || 'An unknown error occurred during TTS generation.');
    } finally {
      setIsLoadingAudio(false);
    }
  };

  // Placeholder for offline download functionality
  const handleDownloadForOffline = async () => {
    // This function would trigger a download of Bible chapters/books
    // from an API endpoint (e.g., /api/bible-sync) and store them
    // in client-side storage like IndexedDB.
    // For example:
    // const response = await fetch('/api/bible-sync?chapter=Genesis_1');
    // const data = await response.json();
    // await storeInIndexedDB('bible_content', 'Genesis_1', data);
    alert('Download for offline initiated (conceptual).');
    console.log('Offline download logic would go here, fetching from /api/bible-sync and storing locally.');
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-4xl font-bold mb-8">Bible Reader</h1>

      <div className="w-full max-w-2xl p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Current Verse:</h2>
        <p className="text-lg mb-6">{currentVerse || 'Loading verse...'}</p>

        <div className="flex space-x-4 mb-4">
          <button
            onClick={handleTextToSpeech}
            disabled={isLoadingAudio || !currentVerse}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingAudio ? 'Generating Audio...' : 'Read Aloud (ElevenLabs)'}
          </button>

          <button
            onClick={handleDownloadForOffline}
            className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Download for Offline
          </button>
        </div>


        {audioUrl && (
          <div className="mt-4">
            <audio controls src={audioUrl} className="w-full">
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}

        {/* Further UI for navigation, chapter selection, etc. would go here */}
      </div>
    </div>
  );
}
