'use client';

import { useState } from 'react';
import { ChatAssistant } from './ChatAssistant';

export function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-claude-accent focus:ring-opacity-50"
        aria-label="Ouvrir l'assistant"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}

        {/* Badge de notification (optionnel) */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-claude-success rounded-full animate-pulse"></span>
        )}
      </button>

      {/* Chat Assistant */}
      <ChatAssistant isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
