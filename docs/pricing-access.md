# Espace tarifaire privé Yaro Consulting

Branche de préparation : aucune mise en production avant configuration et tests.

## Fonctionnement
- /tarifs.html : formulaire public, sans tarifs dans le HTML.
- POST /api/tarifs : contrôle du code côté serveur, limite de tentatives en base, session HttpOnly Secure SameSite=Strict.
- GET /api/tarifs : vérification de la signature ET de l'expiration/révocation en base.
- POST /api/admin/create-pricing-code : création d'un code aléatoire unique, valable 24 heures, autorisée uniquement par clé API administrateur.
- Aucun code d'accès n'est inscrit dans le dépôt ni envoyé au navigateur avant création.

## Mise en service
1. Créer ou choisir un projet Supabase dédié, puis exécuter sql/yaro-pricing.sql.
2. Configurer dans Vercel (Production, Preview) : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, YARO_CODE_PEPPER (secret aléatoire >= 32 octets), YARO_SESSION_SECRET (autre secret >= 32 octets), YARO_ADMIN_API_KEY (autre secret >= 32 octets). Ne jamais placer ces valeurs dans GitHub ou un fichier public.
3. Déployer et vérifier que /api/tarifs renvoie 401 sans code.
4. Créer un code par POST /api/admin/create-pricing-code avec Authorization: Bearer <clé admin> et JSON {"prospect":"Nom prospect"}.
5. Tester un code valide, un code faux, un code révoqué, une expiration et la limitation de tentatives.
6. Ajouter au site principal un lien discret vers /tarifs.html après validation de l'expérience.

## Sécurité
Les tarifs sont renvoyés uniquement par l'API après vérification. Les codes sont stockés sous forme HMAC. La session n'est valable que jusqu'à l'expiration du code. Le catalogue reste un prix de référence commercial, non un devis. Les prix peuvent toujours être copiés par un prospect autorisé.

Attention : pour générer des codes depuis ChatGPT, un connecteur autorisé à appeler cette API sera nécessaire ; ne jamais communiquer la clé admin dans la conversation.
