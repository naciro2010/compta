'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { MapPin, Mail, Phone, Clock, MessageCircle } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-3xl font-bold text-claude-text">Contactez-nous</h1>
        <p className="text-claude-text-muted mt-2">
          Notre équipe est à votre disposition pour répondre à vos questions
        </p>
      </header>

      {/* Informations de contact principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Adresse */}
        <Card className="hover:border-blue-500 transition-colors">
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <MapPin className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Adresse</h3>
                <p className="text-sm text-gray-400 mt-2">
                  Hay Riad<br />
                  Rabat, Maroc
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Email */}
        <Card className="hover:border-green-500 transition-colors">
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Mail className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Email</h3>
                <a
                  href="mailto:support@mizanpro.ma"
                  className="text-sm text-blue-400 hover:text-blue-300 mt-2 block"
                >
                  support@mizanpro.ma
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Téléphone */}
        <Card className="hover:border-purple-500 transition-colors">
          <div className="p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Phone className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Téléphone</h3>
                <a
                  href="tel:+212537686868"
                  className="text-sm text-blue-400 hover:text-blue-300 mt-2 block"
                >
                  +212 537-68-68-68
                </a>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Horaires et support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Horaires d'ouverture */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-400" />
              <CardTitle>Horaires d'ouverture</CardTitle>
            </div>
            <CardDescription>Disponibilité de notre équipe support</CardDescription>
          </CardHeader>
          <div className="space-y-3 px-6 pb-6">
            <div className="flex justify-between items-center py-2 border-b border-claude-border">
              <span className="text-claude-text-muted">Lundi - Vendredi</span>
              <span className="text-claude-text font-medium">9h00 - 18h00</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-claude-border">
              <span className="text-claude-text-muted">Samedi</span>
              <span className="text-claude-text font-medium">9h00 - 13h00</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-claude-text-muted">Dimanche</span>
              <span className="text-red-400 font-medium">Fermé</span>
            </div>
          </div>
        </Card>

        {/* Support en ligne */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-green-400" />
              <CardTitle>Support en ligne</CardTitle>
            </div>
            <CardDescription>Assistance immédiate via notre chatbot</CardDescription>
          </CardHeader>
          <div className="px-6 pb-6">
            <p className="text-claude-text-muted mb-4">
              Notre assistant intelligent est disponible 24h/24 et 7j/7 pour répondre à vos questions sur l'utilisation de MizanPro et la comptabilité marocaine.
            </p>
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-sm text-blue-300">
                💡 Cliquez sur l'icône de chat en bas à droite pour démarrer une conversation
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Informations supplémentaires */}
      <Card>
        <CardHeader>
          <CardTitle>Informations supplémentaires</CardTitle>
          <CardDescription>Détails sur notre service</CardDescription>
        </CardHeader>
        <div className="px-6 pb-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-medium mb-2">Support technique</h4>
              <p className="text-claude-text-muted text-sm">
                Pour toute question technique ou assistance avec l'application, contactez-nous par email à{' '}
                <a href="mailto:support@mizanpro.ma" className="text-blue-400 hover:text-blue-300">
                  support@mizanpro.ma
                </a>
                {' '}ou utilisez notre chatbot intelligent pour une réponse immédiate.
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Questions commerciales</h4>
              <p className="text-claude-text-muted text-sm">
                Pour les demandes de devis, informations tarifaires ou partenariats, appelez-nous au{' '}
                <a href="tel:+212537686868" className="text-blue-400 hover:text-blue-300">
                  +212 537-68-68-68
                </a>
                {' '}ou envoyez un email à{' '}
                <a href="mailto:contact@mizanpro.ma" className="text-blue-400 hover:text-blue-300">
                  contact@mizanpro.ma
                </a>
              </p>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Localisation</h4>
              <p className="text-claude-text-muted text-sm">
                Nos bureaux sont situés à Hay Riad, Rabat, au cœur du quartier des affaires.
                Nous accueillons les visites sur rendez-vous uniquement.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
