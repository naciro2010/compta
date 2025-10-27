import Link from 'next/link'
import { ArrowRight, BarChart3, FileText, Receipt, Calculator } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-claude-bg">
      {/* Header */}
      <header className="border-b border-claude-border bg-claude-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-claude-accent rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-claude-text">CGNC Flow</span>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg transition-colors flex items-center gap-2"
          >
            Accéder à l'app
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-1.5 bg-claude-surface border border-claude-border rounded-full text-sm text-claude-text-muted mb-6">
              Comptabilité marocaine CGNC
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-claude-text leading-tight">
              Gérez votre comptabilité
              <span className="text-claude-accent"> simplement</span>
            </h1>

            <p className="text-xl text-claude-text-muted max-w-2xl mx-auto">
              Application moderne de comptabilité générale conforme au plan comptable marocain (CGNC).
              Facturation bilingue FR/AR, TVA, paie CNSS et analytique multi-sociétés.
            </p>

            <div className="flex items-center justify-center gap-4 pt-4">
              <Link
                href="/dashboard"
                className="px-6 py-3 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg transition-colors flex items-center gap-2 text-lg font-medium"
              >
                Démarrer maintenant
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Facturation"
              description="Cycle complet de devis à facture avec numérotation automatique"
            />
            <FeatureCard
              icon={<Receipt className="w-6 h-6" />}
              title="TVA & Fiscalité"
              description="Calcul automatique TVA multi-taux et déclarations SIMPL"
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Analytique"
              description="Tableaux de bord et analyses en temps réel"
            />
            <FeatureCard
              icon={<Calculator className="w-6 h-6" />}
              title="Plan CGNC"
              description="Plan comptable marocain complet et personnalisable"
            />
          </div>
        </section>

        {/* Tech Stack Info */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto bg-claude-surface border border-claude-border rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-claude-text mb-4">
              Stack technique moderne
            </h2>
            <p className="text-claude-text-muted mb-6">
              Application construite avec Next.js 14, React, TypeScript et Tailwind CSS.
              Export statique pour un déploiement simple via GitHub Pages ou tout autre hébergeur statique.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Next.js 14', 'React 18', 'TypeScript', 'Tailwind CSS', 'Zustand', 'Static Export'].map((tech) => (
                <span
                  key={tech}
                  className="px-3 py-1 bg-claude-bg border border-claude-border rounded-full text-sm text-claude-text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-claude-border bg-claude-surface/50 mt-24">
        <div className="container mx-auto px-6 py-8 text-center text-sm text-claude-text-subtle">
          <p>CGNC Flow — POC de comptabilité marocaine moderne</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-claude-surface border border-claude-border rounded-xl p-6 hover:border-claude-accent transition-colors">
      <div className="w-12 h-12 bg-claude-accent/10 rounded-lg flex items-center justify-center text-claude-accent mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-claude-text mb-2">{title}</h3>
      <p className="text-sm text-claude-text-muted">{description}</p>
    </div>
  )
}
