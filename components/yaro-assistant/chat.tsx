'use client';

import { FormEvent, useState } from 'react';
import { INITIAL_ASSISTANT_MESSAGE } from '@/lib/prompts/yaro-business-assistant';
import type { ChatMessage } from '@/types/lead';

type ApiResponse = {
  message?: string;
  error?: string;
};

export function YaroAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: INITIAL_ASSISTANT_MESSAGE },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(content: string) {
    const value = content.trim();
    if (!value || isLoading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: value }];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/yaro-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const data = (await response.json()) as ApiResponse;
      if (!response.ok || data.error) throw new Error(data.error ?? 'Erreur assistant');
      setMessages((current) => [...current, { role: 'assistant', content: data.message ?? 'Pouvez-vous reformuler votre besoin ?' }]);
    } catch {
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: 'Je rencontre une difficulté technique. Vous pouvez réessayer dans quelques instants.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section className="assistant-card">
      <div className="assistant-header">
        <div>
          <p className="eyebrow">Agent IA commercial</p>
          <h2>Yaro Business Assistant</h2>
        </div>
        <span className="status-pill">Disponible</span>
      </div>

      <div className="chat-window">
        {messages.map((message, index) => (
          <div className={`message-row ${message.role}`} key={`${message.role}-${index}`}>
            <article className="message-bubble">
              {message.content.split('\n').map((line, lineIndex) => (
                <p key={`${index}-${lineIndex}`}>{line || ' '}</p>
              ))}
            </article>
          </div>
        ))}
        {isLoading ? <div className="message-row assistant"><article className="message-bubble typing">Analyse en cours...</article></div> : null}
      </div>

      <p className="rgpd-note">Vos informations servent à comprendre votre besoin et préparer une recommandation adaptée. Les coordonnées ne sont enregistrées qu’avec votre accord.</p>

      <form className="composer" onSubmit={handleSubmit}>
        <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Décrivez votre activité ou votre besoin..." rows={2} />
        <button type="submit" disabled={!input.trim() || isLoading}>Envoyer</button>
      </form>
    </section>
  );
}
