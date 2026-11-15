// Audit léger, sans dépendance, pour le site vitrine statique Yaro Consulting.
// Usage : node validate-site.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'editorial.css'), 'utf8');
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };

// Scripts embarqués et données structurées.
let jsCount = 0;
for (const match of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
  try {
    if (match[1].includes('application/ld+json')) JSON.parse(match[2]);
    else if (match[2].trim()) { new Function(match[2]); jsCount++; }
  } catch (error) {
    errors.push(`Script embarqué invalide : ${error.message}`);
  }
}

// Liens ancrés, identifiants et ressources statiques.
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
check(ids.length === new Set(ids).size, 'Identifiants HTML dupliqués');
for (const [, anchor] of html.matchAll(/href="#([^"]+)"/g)) {
  if (anchor) check(ids.includes(anchor), `Ancre absente : #${anchor}`);
}
for (const [, filename] of html.matchAll(/(?:src|href)="((?:images\/|editorial\.css)[^"]+)"/g)) {
  check(fs.existsSync(path.join(root, filename.split(/[?#]/, 1)[0])), `Ressource absente : ${filename}`);
}
for (const match of html.matchAll(/<img\b[^>]*>/g)) {
  check(/\balt="/.test(match[0]), 'Image sans attribut alt');
  check(/\bwidth="/.test(match[0]) && /\bheight="/.test(match[0]), 'Image sans dimensions');
}

// Ordre de lecture validé : l'activité est expliquée avant ses réalisations.
const sections = ['vision', 'expertises', 'solutions', 'methode', 'realisations', 'propos', 'pourquoi', 'diagnostic', 'contact'];
let previous = -1;
for (const id of sections) {
  const position = html.indexOf(`id="${id}"`);
  check(position > previous, `Section manquante ou hors ordre : #${id}`);
  previous = position;
}
check(!html.includes('class="marquee-section"'), 'Défilement infini conservé');
check(!html.includes('requestAnimationFrame('), 'Boucle JavaScript permanente détectée');
check(html.includes('id="heroImg"') && html.includes('fetchpriority="high"'), 'Portrait prioritaire manquant');
check(html.includes('id="diagnosticForm"') && html.includes('id="contactForm"'), 'Formulaires de qualification/contact manquants');

// Traductions de tous les éléments visibles.
const translationStart = html.indexOf('const I18N = ');
const translationEnd = html.indexOf('// Réponses du chatbot par langue', translationStart);
check(translationStart >= 0 && translationEnd > translationStart, 'Dictionnaires de traduction absents');
if (translationStart >= 0 && translationEnd > translationStart) {
  try {
    const dictionary = new Function(html.slice(translationStart, translationEnd) + ';return I18N;')();
    const keys = [...new Set([...html.matchAll(/data-i18n="([^"]+)"/g)].map(m => m[1]))];
    for (const language of ['en', 'es']) {
      for (const key of keys) check(dictionary[language][key] !== undefined, `Traduction ${language} absente : ${key}`);
    }
    console.log(`Traductions vérifiées : ${keys.length} clés × FR / EN / ES`);
  } catch (error) { errors.push(`Dictionnaire invalide : ${error.message}`); }
}

// Syntaxe de base CSS et respect des préférences de mouvement.
let depth = 0;
for (const character of css) {
  if (character === '{') depth++;
  if (character === '}') depth--;
  if (depth < 0) errors.push('Accolade CSS fermante inattendue');
}
check(depth === 0, 'Accolades CSS non équilibrées');
check(css.includes('prefers-reduced-motion: reduce'), 'Option de mouvement réduit absente');

if (errors.length) {
  for (const error of errors) console.error('ÉCHEC —', error);
  process.exitCode = 1;
} else {
  console.log(`OK — ${jsCount} scripts embarqués, ${ids.length} identifiants, ${sections.length} sections, liens et ressources vérifiés.`);
  console.log('Validation statique réussie. Vérification visuelle et parcours navigateur à faire séparément.');
}
