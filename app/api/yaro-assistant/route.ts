import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { YARO_BUSINESS_ASSISTANT_PROMPT } from '@/lib/prompts/yaro-business-assistant';
import { saveLead } from '@/lib/leads/save-lead';
import type { ChatMessage, Lead, PriorityLevel } from '@/types/lead';

export const runtime = 'nodejs';

type AssistantRequestBody = {
  messages?: ChatMessage[];
};

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY est manquante.');
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

function isValidMessage(message: unknown): message is ChatMessage {
  if (!message || typeof message !== 'object') return false;
  const candidate = message as ChatMessage;
  return (candidate.role === 'user' || candidate.role === 'assistant') && typeof candidate.content === 'string' && candidate.content.trim().length > 0;
}

function extractPriority(text: string): PriorityLevel | undefined {
  const normalized = text.toLowerCase();
  if (normalized.includes('niveau de priorité : chaud') || normalized.includes('priorité élevée')) return 'chaud';
  if (normalized.includes('niveau de priorité : tiède') || normalized.includes('niveau de priorité : tiede') || normalized.includes('priorité moyenne')) return 'tiede';
  if (normalized.includes('niveau de priorité : froid') || normalized.includes('priorité faible')) return 'froid';
  return undefined;
}

function extractOffer(text: string) {
  const normalized = text.toLowerCase();
  if (normalized.includes('présence digitale premium') || normalized.includes('presence digitale premium')) return 'presence_digitale_premium' as const;
  if (normalized.includes('système business digital') || normalized.includes('systeme business digital')) return 'systeme_business_digital' as const;
  if (normalized.includes('agent ia sur mesure')) return 'agent_ia_sur_mesure' as const;
  if (normalized.includes('maintenance')) return 'maintenance_optimisation' as const;
  return 'diagnostic' as const;
}

function shouldSaveLead(text: string) {
  const normalized = text.toLowerCase();
  return normalized.includes('fiche prospect') && normalized.includes('yaro consulting') && normalized.includes('oui');
}

function formatMessages(messages: ChatMessage[]) {
  return messages.map((message) => `${message.role}: ${message.content}`).join('\n\n');
}

async function getAssistantText(messages: ChatMessage[]) {
  const client = getOpenAIClient();
  const model = process.env.OPENAI_MODEL ?? 'gpt-4.1-mini';

  const response = await client.responses.create({
    model,
    instructions: YARO_BUSINESS_ASSISTANT_PROMPT,
    input: formatMessages(messages),
    temperature: 0.4,
  });

  const output = response as unknown as { output_text?: string };
  return output.output_text ?? 'Je n’ai pas pu générer de réponse. Pouvez-vous reformuler votre demande ?';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as AssistantRequestBody;
    const messages = Array.isArray(body.messages) ? body.messages.filter(isValidMessage) : [];

    if (messages.length === 0) return NextResponse.json({ error: 'Aucun message valide transmis.' }, { status: 400 });

    const assistantMessage = await getAssistantText(messages);
    let leadStatus: Awaited<ReturnType<typeof saveLead>> | null = null;

    if (shouldSaveLead(assistantMessage)) {
      const lead: Lead = {
        rawSummary: assistantMessage,
        priorityLevel: extractPriority(assistantMessage),
        recommendedOffer: extractOffer(assistantMessage),
        recommendedSolution: extractOffer(assistantMessage),
        consentToContact: true,
      };
      leadStatus = await saveLead(lead);
    }

    return NextResponse.json({ message: assistantMessage, leadStatus });
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'Erreur inconnue.';
    return NextResponse.json({ error: 'Yaro Business Assistant est momentanément indisponible.', detail }, { status: 500 });
  }
}
