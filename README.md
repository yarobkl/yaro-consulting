# Yaro Consulting

Application Next.js pour Yaro Consulting avec une première version de Yaro Business Assistant.

## Fonctionnalités

- Page d’accueil premium
- Page `/assistant`
- Interface chat pour qualifier les prospects
- Route API `/api/yaro-assistant`
- Prompt système dédié à Yaro Consulting
- Génération d’une fiche prospect
- Détection simple du niveau de priorité
- Envoi email optionnel via Resend

## Variables d’environnement

Créer les variables suivantes dans Vercel :

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
RESEND_API_KEY=
YARO_CONTACT_EMAIL=
YARO_EMAIL_FROM=Yaro Consulting <onboarding@resend.dev>
```

`OPENAI_API_KEY` est obligatoire pour que l’agent réponde.

`RESEND_API_KEY`, `YARO_CONTACT_EMAIL` et `YARO_EMAIL_FROM` sont nécessaires uniquement pour recevoir les fiches prospects par email.

## Lancer en local

```bash
npm install
npm run dev
```

Ouvrir ensuite :

```txt
http://localhost:3000/assistant
```

## Déploiement

Déployer la branche `feature/yaro-business-assistant` sur Vercel, puis ajouter les variables d’environnement dans les paramètres du projet.
