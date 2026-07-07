import { Resend } from 'resend';
import type { Lead } from '@/types/lead';

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

function leadToText(lead: Lead) {
  return [
    'Nouveau prospect — Yaro Consulting',
    '',
    `Niveau de priorité : ${lead.priorityLevel ?? 'à qualifier'}`,
    `Solution recommandée : ${lead.recommendedSolution ?? 'à confirmer'}`,
    '',
    lead.rawSummary ?? 'Aucune fiche détaillée transmise.',
  ].join('\n');
}

export async function saveLead(lead: Lead) {
  const enrichedLead: Lead = {
    ...lead,
    createdAt: lead.createdAt ?? new Date().toISOString(),
  };

  console.info('[Yaro Business Assistant] Nouveau prospect', enrichedLead);

  const resend = getResendClient();
  const to = process.env.YARO_CONTACT_EMAIL;
  const from = process.env.YARO_EMAIL_FROM ?? 'Yaro Consulting <onboarding@resend.dev>';

  if (!resend || !to) {
    return {
      saved: true,
      emailed: false,
      reason: 'RESEND_API_KEY ou YARO_CONTACT_EMAIL non configuré.',
    };
  }

  await resend.emails.send({
    from,
    to,
    subject: 'Nouveau prospect qualifié — Yaro Business Assistant',
    text: leadToText(enrichedLead),
  });

  return {
    saved: true,
    emailed: true,
  };
}
