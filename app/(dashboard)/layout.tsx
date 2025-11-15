'use client';

import { Sidebar } from '@/components/Sidebar'
import { ChatButton } from '@/components/chat/ChatButton'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { UserMenu } from '@/components/auth/UserMenu'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-claude-bg">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          {/* Barre de navigation supérieure */}
          <div className="sticky top-0 z-10 bg-claude-surface/95 backdrop-blur-sm border-b border-claude-border">
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex-1" />
              <UserMenu />
            </div>
          </div>

          {/* Contenu principal */}
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 lg:pl-16">
            {children}
          </div>
        </main>
        <ChatButton />
      </div>
    </AuthGuard>
  )
}
