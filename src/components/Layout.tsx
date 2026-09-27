import { useState } from 'react'
import { Menu, Zap } from 'lucide-react'
import Sidebar from './Sidebar'
import type { Page } from '../types'

interface LayoutProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  onLogout: () => void
  children: React.ReactNode
}

export default function Layout({ currentPage, onNavigate, onLogout, children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-[#f4f7f9] overflow-hidden">
      <div className="hidden lg:flex w-60 flex-col flex-shrink-0 shadow-sm">
        <Sidebar currentPage={currentPage} onNavigate={onNavigate} onLogout={onLogout} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-60 h-full shadow-2xl">
            <Sidebar
              currentPage={currentPage}
              onNavigate={onNavigate}
              onLogout={onLogout}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#dfe7ee] flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#2f6f7b] rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <span className="font-semibold text-slate-900">BillFlow</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-5 lg:p-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
