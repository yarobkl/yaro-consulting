import type { Lead } from '@/types/lead';

export async function saveLead(lead: Lead) {
  const savedLead: Lead = {
    ...lead,
    createdAt: lead.createdAt ?? new Date().toISOString(),
  };

  console.info('[Yaro Business Assistant] Lead saved', savedLead);

  return {
    saved: true,
    emailed: false,
  };
}
