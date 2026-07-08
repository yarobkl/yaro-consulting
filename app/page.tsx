import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="home-page page-shell">
      <section className="home-card">
        <p className="eyebrow">Yaro Consulting</p>
        <h1>Solutions digitales, automatisations business et agents IA.</h1>
        <p>
          Une agence pensée pour aider les entrepreneurs et entreprises à structurer leur présence digitale, gagner du temps et mieux gérer leurs prospects.
        </p>
        <Link href="/assistant">Tester Yaro Business Assistant</Link>
      </section>
    </main>
  );
}
