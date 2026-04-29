import QuizGameClient from '@/components/quiz/QuizGameClient';
import React from 'react';

// This is a server component that renders the client-side quiz game.
// It can fetch initial data or settings if needed before passing them to the client component.
const QuizPage: React.FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
      {/* The QuizGameClient handles its own responsive layout */}
      <QuizGameClient />
    </main>
  );
};

export default QuizPage;
