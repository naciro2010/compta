import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  FileText,
  Receipt,
  Calculator,
  Check,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Building,
  Clock,
  DollarSign,
  FileCheck,
  Download,
  ChevronRight,
  Star
} from 'lucide-react'

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
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-claude-text-muted hover:text-claude-text transition-colors hidden md:block">
              Fonctionnalités
            </a>
            <a href="#pricing" className="text-sm text-claude-text-muted hover:text-claude-text transition-colors hidden md:block">
              Tarifs
            </a>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg transition-colors flex items-center gap-2"
            >
              Démarrer
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-20 md:py-28">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <div className="inline-block px-4 py-1.5 bg-claude-surface border border-claude-border rounded-full text-sm text-claude-text-muted mb-4">
              🇲🇦 Conforme au Plan Comptable Marocain (CGNC)
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-claude-text leading-tight">
              La comptabilité marocaine
              <span className="text-claude-accent block mt-2">
                moderne et intelligente
              </span>
            </h1>

            <p className="text-lg md:text-xl text-claude-text-muted max-w-3xl mx-auto leading-relaxed">
              CGNC Flow transforme votre gestion comptable avec une solution complète,
              intuitive et 100% conforme aux normes marocaines. Facturation bilingue, TVA,
              paie CNSS et analytique multi-sociétés.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg transition-all flex items-center gap-2 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto justify-center"
              >
                Essayer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#pricing"
                className="px-8 py-4 bg-claude-surface border border-claude-border hover:border-claude-accent text-claude-text rounded-lg transition-all flex items-center gap-2 text-lg font-medium w-full sm:w-auto justify-center"
              >
                Voir les tarifs
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
              <StatCard number="100%" label="Conforme CGNC" />
              <StatCard number="2 langues" label="FR/AR bilingue" />
              <StatCard number="Multi" label="Sociétés" />
              <StatCard number="Cloud" label="Accessible partout" />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20 bg-claude-surface/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-claude-text mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-lg text-claude-text-muted max-w-2xl mx-auto">
                Une suite complète d'outils pour gérer votre comptabilité efficacement
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<FileText className="w-6 h-6" />}
                title="Facturation intelligente"
                description="Créez devis, bons de commande et factures en quelques clics. Numérotation automatique et envoi par email."
                highlights={["Devis → Facture", "Bilingue FR/AR", "PDF automatique"]}
              />
              <FeatureCard
                icon={<Receipt className="w-6 h-6" />}
                title="Gestion TVA & Fiscalité"
                description="Calcul automatique de la TVA multi-taux (20%, 14%, 10%, 7%). Export SIMPL prêt pour vos déclarations."
                highlights={["Multi-taux TVA", "Export SIMPL", "Déclarations"]}
              />
              <FeatureCard
                icon={<Calculator className="w-6 h-6" />}
                title="Plan comptable CGNC"
                description="Plan comptable marocain complet et personnalisable. Classe 1 à 8 incluses avec écritures automatiques."
                highlights={["Classe 1-8", "Personnalisable", "Écritures auto"]}
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6" />}
                title="Tableaux de bord"
                description="Visualisez vos performances en temps réel. KPIs, graphiques et analyses pour piloter votre activité."
                highlights={["KPIs temps réel", "Graphiques", "Analytics"]}
              />
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title="Paie & CNSS"
                description="Calcul automatique de la paie avec cotisations CNSS. Bulletins de paie et déclarations conformes."
                highlights={["Calcul CNSS", "Bulletins paie", "Conformité"]}
              />
              <FeatureCard
                icon={<Building className="w-6 h-6" />}
                title="Multi-sociétés"
                description="Gérez plusieurs entreprises depuis un seul compte. Consolidation et reporting multi-entités."
                highlights={["Multi-entités", "Consolidation", "Reporting"]}
              />
              <FeatureCard
                icon={<Globe className="w-6 h-6" />}
                title="Ventes & Achats"
                description="Module complet pour gérer vos ventes et achats. Suivi des fournisseurs et clients, paiements, échéances."
                highlights={["Suivi complet", "Échéancier", "Paiements"]}
              />
              <FeatureCard
                icon={<FileCheck className="w-6 h-6" />}
                title="États financiers"
                description="Générez bilan, compte de résultat et annexes automatiquement. Export Excel et PDF."
                highlights={["Bilan", "CPC", "Export Excel/PDF"]}
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title="Sécurisé & Fiable"
                description="Vos données sont sécurisées et sauvegardées automatiquement. Architecture moderne et performante."
                highlights={["Données sécurisées", "Backup auto", "Performance"]}
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-claude-text mb-4">
                Pourquoi choisir CGNC Flow ?
              </h2>
              <p className="text-lg text-claude-text-muted max-w-2xl mx-auto">
                Des avantages concrets pour votre entreprise
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <BenefitCard
                icon={<Clock className="w-8 h-8" />}
                title="Gagnez du temps"
                description="Automatisez vos tâches comptables répétitives et concentrez-vous sur votre cœur de métier. Jusqu'à 70% de temps gagné sur la saisie."
              />
              <BenefitCard
                icon={<DollarSign className="w-8 h-8" />}
                title="Réduisez vos coûts"
                description="Solution accessible sans frais de licence élevés. Pas besoin d'expert-comptable pour les opérations courantes."
              />
              <BenefitCard
                icon={<Zap className="w-8 h-8" />}
                title="Simplicité d'utilisation"
                description="Interface moderne et intuitive. Prenez en main l'application en quelques minutes, même sans être comptable."
              />
              <BenefitCard
                icon={<TrendingUp className="w-8 h-8" />}
                title="Pilotez votre croissance"
                description="Tableaux de bord et indicateurs pour prendre les bonnes décisions. Visualisez votre performance en temps réel."
              />
              <BenefitCard
                icon={<Shield className="w-8 h-8" />}
                title="100% Conforme"
                description="Respecte totalement le plan comptable marocain (CGNC) et les normes fiscales en vigueur."
              />
              <BenefitCard
                icon={<Download className="w-8 h-8" />}
                title="Exports flexibles"
                description="Exportez vos données en Excel, PDF ou CSV pour les partager avec votre comptable ou administration."
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-6 py-20 bg-claude-surface/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-claude-text mb-4">
                Tarifs simples et transparents
              </h2>
              <p className="text-lg text-claude-text-muted max-w-2xl mx-auto">
                Choisissez l'offre adaptée à la taille de votre entreprise
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <PricingCard
                name="Starter"
                price="Gratuit"
                period=""
                description="Parfait pour démarrer et tester toutes les fonctionnalités"
                features={[
                  "1 société",
                  "50 factures/mois",
                  "Plan comptable CGNC",
                  "TVA multi-taux",
                  "États financiers",
                  "Support email",
                ]}
                cta="Commencer gratuitement"
                highlighted={false}
              />

              {/* Professional Plan */}
              <PricingCard
                name="Professionnel"
                price="299 DH"
                period="/mois"
                description="Pour les petites et moyennes entreprises en croissance"
                features={[
                  "3 sociétés",
                  "Factures illimitées",
                  "Toutes fonctionnalités Starter",
                  "Module Paie & CNSS",
                  "Multi-utilisateurs (5)",
                  "Export SIMPL",
                  "Analytique avancée",
                  "Support prioritaire",
                ]}
                cta="Essayer 30 jours gratuits"
                highlighted={true}
              />

              {/* Enterprise Plan */}
              <PricingCard
                name="Entreprise"
                price="Sur mesure"
                period=""
                description="Solution complète pour grandes entreprises et cabinets"
                features={[
                  "Sociétés illimitées",
                  "Toutes fonctionnalités Pro",
                  "Multi-utilisateurs illimité",
                  "API & Intégrations",
                  "Formation personnalisée",
                  "Support dédié 24/7",
                  "Hébergement dédié",
                  "SLA garanti",
                ]}
                cta="Contactez-nous"
                highlighted={false}
              />
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-claude-text-muted">
                💳 Paiement sécurisé • ✓ Sans engagement • 🔄 Annulation à tout moment
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-claude-accent to-claude-accent-hover rounded-2xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à transformer votre comptabilité ?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Rejoignez les entreprises marocaines qui font confiance à CGNC Flow
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-claude-accent hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2 text-lg font-medium shadow-lg w-full sm:w-auto justify-center"
              >
                Démarrer gratuitement
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#pricing"
                className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-2 text-lg font-medium w-full sm:w-auto justify-center"
              >
                Comparer les offres
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm opacity-75">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Essai gratuit</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Sans carte bancaire</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Configuration en 5 min</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-claude-border bg-claude-surface/50">
        <div className="container mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-claude-accent rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-claude-text">CGNC Flow</span>
              </div>
              <p className="text-sm text-claude-text-muted">
                Comptabilité marocaine moderne, simple et conforme CGNC.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-claude-text mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-claude-text-muted">
                <li><a href="#features" className="hover:text-claude-accent transition-colors">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-claude-accent transition-colors">Tarifs</a></li>
                <li><Link href="/dashboard" className="hover:text-claude-accent transition-colors">Démo</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-claude-text mb-4">Ressources</h4>
              <ul className="space-y-2 text-sm text-claude-text-muted">
                <li><Link href="/guide" className="hover:text-claude-accent transition-colors">Guide</Link></li>
                <li><a href="#" className="hover:text-claude-accent transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-claude-accent transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-claude-text mb-4">Entreprise</h4>
              <ul className="space-y-2 text-sm text-claude-text-muted">
                <li><a href="#" className="hover:text-claude-accent transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-claude-accent transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-claude-accent transition-colors">Conditions</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-claude-border pt-8 text-center text-sm text-claude-text-subtle">
            <p>© 2024 CGNC Flow — Solution de comptabilité pour entreprises marocaines</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Components
function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl md:text-3xl font-bold text-claude-accent mb-1">{number}</div>
      <div className="text-sm text-claude-text-muted">{label}</div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  highlights
}: {
  icon: React.ReactNode
  title: string
  description: string
  highlights: string[]
}) {
  return (
    <div className="bg-claude-surface border border-claude-border rounded-xl p-6 hover:border-claude-accent transition-all hover:shadow-lg">
      <div className="w-12 h-12 bg-claude-accent/10 rounded-lg flex items-center justify-center text-claude-accent mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-claude-text mb-2">{title}</h3>
      <p className="text-sm text-claude-text-muted mb-4">{description}</p>
      <div className="flex flex-wrap gap-2">
        {highlights.map((highlight) => (
          <span
            key={highlight}
            className="text-xs px-2 py-1 bg-claude-bg border border-claude-border rounded text-claude-text-muted"
          >
            {highlight}
          </span>
        ))}
      </div>
    </div>
  )
}

function BenefitCard({
  icon,
  title,
  description
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="flex gap-4 bg-claude-surface border border-claude-border rounded-xl p-6 hover:border-claude-accent transition-all">
      <div className="flex-shrink-0 w-14 h-14 bg-claude-accent/10 rounded-lg flex items-center justify-center text-claude-accent">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-semibold text-claude-text mb-2">{title}</h3>
        <p className="text-sm text-claude-text-muted">{description}</p>
      </div>
    </div>
  )
}

function PricingCard({
  name,
  price,
  period,
  description,
  features,
  cta,
  highlighted,
}: {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  highlighted: boolean
}) {
  return (
    <div
      className={`relative bg-claude-surface border rounded-2xl p-8 ${
        highlighted
          ? 'border-claude-accent shadow-xl scale-105'
          : 'border-claude-border'
      }`}
    >
      {highlighted && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-claude-accent text-white text-sm font-medium px-4 py-1 rounded-full">
            ⭐ Plus populaire
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-claude-text mb-2">{name}</h3>
        <p className="text-sm text-claude-text-muted mb-4">{description}</p>
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-4xl font-bold text-claude-text">{price}</span>
          {period && <span className="text-claude-text-muted">{period}</span>}
        </div>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm">
            <Check className="w-5 h-5 text-claude-accent flex-shrink-0 mt-0.5" />
            <span className="text-claude-text-muted">{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href="/dashboard"
        className={`block w-full text-center px-6 py-3 rounded-lg transition-all font-medium ${
          highlighted
            ? 'bg-claude-accent hover:bg-claude-accent-hover text-white shadow-lg'
            : 'bg-claude-bg border border-claude-border hover:border-claude-accent text-claude-text'
        }`}
      >
        {cta}
      </Link>
    </div>
  )
}
