import { LayoutDashboard, FileText, Users, LogOut, Zap, X } from 'lucide-react'
import type { Page } from '../types'

interface SidebarProps {
  currentPage: Page
  onNavigate: (page: Page) => void
  onLogout: () => void
  onClose?: () => void
}

const navItems = [
  { page: 'dashboard' as Page, label: 'Dashboard', icon: LayoutDashboard },
  { page: 'bills' as Page, label: 'Bills', icon: FileText },
  { page: 'customers' as Page, label: 'Customers', icon: Users },
]

export default function Sidebar({ currentPage, onNavigate, onLogout, onClose }: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-[#122833] text-white">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/10">
        <div className="w-8 h-8 bg-[#2f6f7b] rounded-lg flex items-center justify-center flex-shrink-0">
          <Zap size={15} className="text-white" />
        </div>
        <span className="text-lg font-semibold tracking-tight">BillFlow</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto text-slate-400 hover:text-white transition-colors lg:hidden"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="px-3 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">Menu</p>
        {navItems.map(({ page, label, icon: Icon }) => {
          const active = currentPage === page
          return (
            <button
              key={page}
              onClick={() => { onNavigate(page); onClose?.() }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-[#2f6f7b] text-white shadow-sm'
                  : 'text-slate-400 hover:bg-[#1d3442] hover:text-white'
              }`}
            >
              <Icon size={17} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="px-3 pb-5 border-t border-white/10 pt-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-[#1d3442] hover:text-white transition-colors"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </div>
  )
}
