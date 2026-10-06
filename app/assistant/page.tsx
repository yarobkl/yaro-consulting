import { YaroAssistantChat } from '@/components/yaro-assistant/chat';
import './styles.css';

export default function AssistantPage() {
  return (
    <main className="assistant-page">
      <section className="assistant-hero page-shell">
        <div className="assistant-copy">
          <p className="eyebrow">Yaro Consulting</p>
          <h1>Clarifiez votre projet avec Yaro Business Assistant.</h1>
          <p>
            Un assistant IA commercial conçu pour comprendre votre besoin, identifier vos priorités et vous orienter vers la solution digitale la plus adaptée.
          </p>
          <div className="hero-actions">
            <a href="#assistant">Démarrer l’analyse</a>
            <span>Site premium, automatisation business ou agent IA sur mesure.</span>
          </div>
        </div>

        <div className="offer-panel">
          <p>Offres recommandées</p>
          <ul>
            <li>Présence digitale premium — à partir de 850 €</li>
            <li>Système business digital — à partir de 1 700 €</li>
            <li>Agent IA sur mesure — sur devis</li>
            <li>Maintenance — à partir de 99,99 €/mois</li>
          </ul>
        </div>
      </section>

      <section id="assistant" className="page-shell assistant-section">
        <YaroAssistantChat />
      </section>
    </main>
  );
}
