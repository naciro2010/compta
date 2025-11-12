'use client'

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
import { useT } from '@/lib/i18n/translations'
import { LanguageSelector } from '@/components/LanguageSelector'

export default function HomePage() {
  const { t } = useT()

  return (
    <div className="min-h-screen bg-claude-bg">
      {/* Header */}
      <header className="border-b border-claude-border bg-claude-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-claude-accent rounded-lg flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-claude-text">{t('home.brand')}</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-sm text-claude-text-muted hover:text-claude-text transition-colors hidden md:block">
              {t('home.nav.features')}
            </a>
            <a href="#pricing" className="text-sm text-claude-text-muted hover:text-claude-text transition-colors hidden md:block">
              {t('home.nav.pricing')}
            </a>
            <div className="hidden md:block">
              <LanguageSelector />
            </div>
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg transition-colors flex items-center gap-2"
            >
              {t('home.nav.start')}
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
              🇲🇦 {t('home.tagline')}
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-claude-text leading-tight">
              {t('home.hero.title')}
              <span className="text-claude-accent block mt-2">
                {t('home.hero.titleAccent')}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-claude-text-muted max-w-3xl mx-auto leading-relaxed">
              {t('home.hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-claude-accent hover:bg-claude-accent-hover text-white rounded-lg transition-all flex items-center gap-2 text-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full sm:w-auto justify-center"
              >
                {t('home.hero.cta.try')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#pricing"
                className="px-8 py-4 bg-claude-surface border border-claude-border hover:border-claude-accent text-claude-text rounded-lg transition-all flex items-center gap-2 text-lg font-medium w-full sm:w-auto justify-center"
              >
                {t('home.hero.cta.pricing')}
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16 max-w-4xl mx-auto">
              <StatCard number="100%" label={t('home.stats.compliance')} />
              <StatCard number={t('home.stats.languages')} label={t('home.stats.languagesDesc')} />
              <StatCard number="Multi" label={t('home.stats.multiCompany')} />
              <StatCard number="Cloud" label={t('home.stats.cloud')} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20 bg-claude-surface/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-claude-text mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-lg text-claude-text-muted max-w-2xl mx-auto">
                {t('home.features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <FeatureCard
                icon={<FileText className="w-6 h-6" />}
                title={t('feature.invoicing.title')}
                description={t('feature.invoicing.desc')}
                highlights={[t('feature.invoicing.h1'), t('feature.invoicing.h2'), t('feature.invoicing.h3')]}
              />
              <FeatureCard
                icon={<Receipt className="w-6 h-6" />}
                title={t('feature.vat.title')}
                description={t('feature.vat.desc')}
                highlights={[t('feature.vat.h1'), t('feature.vat.h2'), t('feature.vat.h3')]}
              />
              <FeatureCard
                icon={<Calculator className="w-6 h-6" />}
                title={t('feature.accounting.title')}
                description={t('feature.accounting.desc')}
                highlights={[t('feature.accounting.h1'), t('feature.accounting.h2'), t('feature.accounting.h3')]}
              />
              <FeatureCard
                icon={<BarChart3 className="w-6 h-6" />}
                title={t('feature.dashboard.title')}
                description={t('feature.dashboard.desc')}
                highlights={[t('feature.dashboard.h1'), t('feature.dashboard.h2'), t('feature.dashboard.h3')]}
              />
              <FeatureCard
                icon={<Users className="w-6 h-6" />}
                title={t('feature.payroll.title')}
                description={t('feature.payroll.desc')}
                highlights={[t('feature.payroll.h1'), t('feature.payroll.h2'), t('feature.payroll.h3')]}
              />
              <FeatureCard
                icon={<Building className="w-6 h-6" />}
                title={t('feature.multiCompany.title')}
                description={t('feature.multiCompany.desc')}
                highlights={[t('feature.multiCompany.h1'), t('feature.multiCompany.h2'), t('feature.multiCompany.h3')]}
              />
              <FeatureCard
                icon={<Globe className="w-6 h-6" />}
                title={t('feature.sales.title')}
                description={t('feature.sales.desc')}
                highlights={[t('feature.sales.h1'), t('feature.sales.h2'), t('feature.sales.h3')]}
              />
              <FeatureCard
                icon={<FileCheck className="w-6 h-6" />}
                title={t('feature.statements.title')}
                description={t('feature.statements.desc')}
                highlights={[t('feature.statements.h1'), t('feature.statements.h2'), t('feature.statements.h3')]}
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6" />}
                title={t('feature.security.title')}
                description={t('feature.security.desc')}
                highlights={[t('feature.security.h1'), t('feature.security.h2'), t('feature.security.h3')]}
              />
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-claude-text mb-4">
                {t('home.benefits.title')}
              </h2>
              <p className="text-lg text-claude-text-muted max-w-2xl mx-auto">
                {t('home.benefits.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <BenefitCard
                icon={<Clock className="w-8 h-8" />}
                title={t('benefit.time.title')}
                description={t('benefit.time.desc')}
              />
              <BenefitCard
                icon={<DollarSign className="w-8 h-8" />}
                title={t('benefit.cost.title')}
                description={t('benefit.cost.desc')}
              />
              <BenefitCard
                icon={<Zap className="w-8 h-8" />}
                title={t('benefit.simplicity.title')}
                description={t('benefit.simplicity.desc')}
              />
              <BenefitCard
                icon={<TrendingUp className="w-8 h-8" />}
                title={t('benefit.growth.title')}
                description={t('benefit.growth.desc')}
              />
              <BenefitCard
                icon={<Shield className="w-8 h-8" />}
                title={t('benefit.compliance.title')}
                description={t('benefit.compliance.desc')}
              />
              <BenefitCard
                icon={<Download className="w-8 h-8" />}
                title={t('benefit.exports.title')}
                description={t('benefit.exports.desc')}
              />
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-6 py-20 bg-claude-surface/30">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-claude-text mb-4">
                {t('home.pricing.title')}
              </h2>
              <p className="text-lg text-claude-text-muted max-w-2xl mx-auto">
                {t('home.pricing.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Starter Plan */}
              <PricingCard
                name={t('pricing.starter.name')}
                price={t('pricing.starter.price')}
                period=""
                description={t('pricing.starter.desc')}
                features={[
                  t('pricing.starter.f1'),
                  t('pricing.starter.f2'),
                  t('pricing.starter.f3'),
                  t('pricing.starter.f4'),
                  t('pricing.starter.f5'),
                  t('pricing.starter.f6'),
                ]}
                cta={t('pricing.starter.cta')}
                highlighted={false}
              />

              {/* Professional Plan */}
              <PricingCard
                name={t('pricing.pro.name')}
                price={t('pricing.pro.price')}
                period={t('pricing.pro.period')}
                description={t('pricing.pro.desc')}
                features={[
                  t('pricing.pro.f1'),
                  t('pricing.pro.f2'),
                  t('pricing.pro.f3'),
                  t('pricing.pro.f4'),
                  t('pricing.pro.f5'),
                  t('pricing.pro.f6'),
                  t('pricing.pro.f7'),
                  t('pricing.pro.f8'),
                ]}
                cta={t('pricing.pro.cta')}
                highlighted={true}
                badge={t('pricing.pro.badge')}
              />

              {/* Enterprise Plan */}
              <PricingCard
                name={t('pricing.enterprise.name')}
                price={t('pricing.enterprise.price')}
                period=""
                description={t('pricing.enterprise.desc')}
                features={[
                  t('pricing.enterprise.f1'),
                  t('pricing.enterprise.f2'),
                  t('pricing.enterprise.f3'),
                  t('pricing.enterprise.f4'),
                  t('pricing.enterprise.f5'),
                  t('pricing.enterprise.f6'),
                  t('pricing.enterprise.f7'),
                  t('pricing.enterprise.f8'),
                ]}
                cta={t('pricing.enterprise.cta')}
                highlighted={false}
              />
            </div>

            <div className="text-center mt-12">
              <p className="text-sm text-claude-text-muted">
                {t('home.pricing.note')}
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-claude-accent to-claude-accent-hover rounded-2xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t('home.cta.title')}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {t('home.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-white text-claude-accent hover:bg-gray-100 rounded-lg transition-all flex items-center gap-2 text-lg font-medium shadow-lg w-full sm:w-auto justify-center"
              >
                {t('home.cta.button1')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href="#pricing"
                className="px-8 py-4 bg-transparent border-2 border-white text-white hover:bg-white/10 rounded-lg transition-all flex items-center gap-2 text-lg font-medium w-full sm:w-auto justify-center"
              >
                {t('home.cta.button2')}
              </a>
            </div>
            <div className="flex items-center justify-center gap-6 mt-8 text-sm opacity-75">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{t('home.cta.feature1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{t('home.cta.feature2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{t('home.cta.feature3')}</span>
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
                <span className="text-lg font-semibold text-claude-text">{t('home.brand')}</span>
              </div>
              <p className="text-sm text-claude-text-muted">
                {t('footer.tagline')}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-claude-text mb-4">{t('footer.product')}</h4>
              <ul className="space-y-2 text-sm text-claude-text-muted">
                <li><a href="#features" className="hover:text-claude-accent transition-colors">{t('footer.product.features')}</a></li>
                <li><a href="#pricing" className="hover:text-claude-accent transition-colors">{t('footer.product.pricing')}</a></li>
                <li><Link href="/dashboard" className="hover:text-claude-accent transition-colors">{t('footer.product.demo')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-claude-text mb-4">{t('footer.resources')}</h4>
              <ul className="space-y-2 text-sm text-claude-text-muted">
                <li><Link href="/guide" className="hover:text-claude-accent transition-colors">{t('footer.resources.guide')}</Link></li>
                <li><a href="#" className="hover:text-claude-accent transition-colors">{t('footer.resources.docs')}</a></li>
                <li><a href="#" className="hover:text-claude-accent transition-colors">{t('footer.resources.support')}</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-claude-text mb-4">{t('footer.company')}</h4>
              <ul className="space-y-2 text-sm text-claude-text-muted">
                <li><a href="#" className="hover:text-claude-accent transition-colors">{t('footer.company.about')}</a></li>
                <li><a href="#" className="hover:text-claude-accent transition-colors">{t('footer.company.contact')}</a></li>
                <li><a href="#" className="hover:text-claude-accent transition-colors">{t('footer.company.terms')}</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-claude-border pt-8 text-center text-sm text-claude-text-subtle">
            <p>© 2024 {t('home.brand')} — {t('footer.copyright')}</p>
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
  badge,
}: {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  cta: string
  highlighted: boolean
  badge?: string
}) {
  return (
    <div
      className={`relative bg-claude-surface border rounded-2xl p-8 ${
        highlighted
          ? 'border-claude-accent shadow-xl scale-105'
          : 'border-claude-border'
      }`}
    >
      {highlighted && badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="bg-claude-accent text-white text-sm font-medium px-4 py-1 rounded-full">
            ⭐ {badge}
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
