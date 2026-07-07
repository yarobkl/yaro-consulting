'use client';

import { useState } from 'react';
import { INITIAL_ASSISTANT_MESSAGE } from '@/lib/prompts/yaro-business-assistant';
import type { ChatMessage } from '@/types/lead';

export function YaroAssistantChat() {
  const [messages] = useState<ChatMessage[]>([
    { role: 'assistant', content: INITIAL_ASSISTANT_MESSAGE },
  ]);

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
          <div className={`message-row ${message.role}`} key={index}>
            <article className="message-bubble">
              {message.content.split('\n').map((line, lineIndex) => (
                <p key={lineIndex}>{line || ' '}</p>
              ))}
            </article>
          </div>
        ))}
      </div>
    </section>
  );
}
