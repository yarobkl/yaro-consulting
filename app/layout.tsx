import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Yaro Consulting | Agents IA et automatisation business',
  description: 'Solutions digitales, automatisations business et agents IA pour entrepreneurs et entreprises.',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
