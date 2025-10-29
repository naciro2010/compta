'use client';

import { useState, useRef, useEffect } from 'react';
import { searchKnowledge, getSuggestedQuestions, type KnowledgeItem } from '@/data/knowledge-base';
import { Button } from '@/components/ui/Button';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  relatedItems?: KnowledgeItem[];
}

interface ChatAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatAssistant({ isOpen, onClose }: ChatAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Bonjour ! 👋 Je suis votre assistant MizanPro. Je peux vous aider avec l\'utilisation de l\'application et répondre à vos questions sur la comptabilité marocaine. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'usage' | 'legal' | 'tax'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input quand le chat s'ouvre
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputValue.trim();
    if (!messageText) return;

    // Ajoute le message utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simule un délai de réponse pour un effet plus naturel
    setTimeout(() => {
      // Recherche dans la base de connaissances
      const results = searchKnowledge(messageText, 3);

      let responseContent = '';
      const relatedItems: KnowledgeItem[] = [];

      if (results.length > 0) {
        // Utilise la meilleure réponse
        const bestMatch = results[0];
        responseContent = bestMatch.answer;
        relatedItems.push(...results);

        // Ajoute des suggestions si pertinent
        if (results.length > 1) {
          responseContent += '\n\n📚 Vous pourriez aussi être intéressé par :';
          results.slice(1).forEach((item, idx) => {
            responseContent += `\n${idx + 1}. ${item.question}`;
          });
        }
      } else {
        responseContent = 'Je n\'ai pas trouvé de réponse précise à votre question. Voici quelques suggestions qui pourraient vous aider :';
        const suggestions = getSuggestedQuestions();
        suggestions.slice(0, 4).forEach((q, idx) => {
          responseContent += `\n${idx + 1}. ${q}`;
        });
        responseContent += '\n\n💬 Pour une assistance personnalisée, contactez notre support :';
        responseContent += '\n📧 Email: support@mizanpro.ma';
        responseContent += '\n📞 Téléphone: +212 537-68-68-68';
        responseContent += '\n📍 Adresse: Hay Riad, Rabat';
        responseContent += '\n\nN\'hésitez pas à reformuler votre question ou à choisir parmi les suggestions ci-dessus.';
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        relatedItems: relatedItems.length > 0 ? relatedItems : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 500);
  };

  const handleSuggestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const getCategorySuggestions = () => {
    const allSuggestions = getSuggestedQuestions();
    if (selectedCategory === 'all') {
      return allSuggestions.slice(0, 4);
    }
    const filtered = searchKnowledge(selectedCategory === 'usage' ? 'comment' : selectedCategory, 4);
    return filtered.map(item => item.question);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md h-[600px] bg-claude-surface border border-claude-border rounded-lg shadow-2xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-claude-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-claude-accent rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-claude-text">Assistant MizanPro</h3>
              <p className="text-xs text-claude-text-muted">Toujours disponible pour vous aider</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-claude-text-muted hover:text-claude-text transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category Filter */}
        <div className="p-3 border-b border-claude-border">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-claude-accent text-white'
                  : 'bg-claude-bg text-claude-text-muted hover:bg-claude-surface-hover'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setSelectedCategory('usage')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedCategory === 'usage'
                  ? 'bg-claude-accent text-white'
                  : 'bg-claude-bg text-claude-text-muted hover:bg-claude-surface-hover'
              }`}
            >
              Utilisation
            </button>
            <button
              onClick={() => setSelectedCategory('legal')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedCategory === 'legal'
                  ? 'bg-claude-accent text-white'
                  : 'bg-claude-bg text-claude-text-muted hover:bg-claude-surface-hover'
              }`}
            >
              Légal
            </button>
            <button
              onClick={() => setSelectedCategory('tax')}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedCategory === 'tax'
                  ? 'bg-claude-accent text-white'
                  : 'bg-claude-bg text-claude-text-muted hover:bg-claude-surface-hover'
              }`}
            >
              TVA
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-claude-accent text-white'
                    : 'bg-claude-bg text-claude-text border border-claude-border'
                }`}
              >
                <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                {message.relatedItems && message.relatedItems.length > 1 && (
                  <div className="mt-3 space-y-1">
                    {message.relatedItems.slice(1).map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => handleSuggestionClick(item.question)}
                        className="block w-full text-left text-xs text-claude-text-muted hover:text-claude-accent transition-colors py-1"
                      >
                        {idx + 1}. {item.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-claude-bg border border-claude-border rounded-lg p-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-claude-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-claude-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-claude-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {messages.length === 1 && (
            <div className="space-y-2">
              <p className="text-xs text-claude-text-muted font-medium">Questions fréquentes :</p>
              {getCategorySuggestions().map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(question)}
                  className="block w-full text-left p-3 bg-claude-bg hover:bg-claude-surface-hover border border-claude-border rounded-lg text-sm text-claude-text transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-claude-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 px-4 py-2 bg-claude-bg border border-claude-border rounded-lg text-claude-text placeholder-claude-text-subtle focus:outline-none focus:ring-2 focus:ring-claude-accent focus:border-transparent"
            />
            <Button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              size="md"
              className="px-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </form>
          <p className="text-xs text-claude-text-subtle mt-2 text-center">
            Les réponses sont basées sur la réglementation marocaine (CGNC)
          </p>
        </div>
      </div>
    </div>
  );
}
