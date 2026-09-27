import { FileText, Clock, CheckCircle, TrendingUp, Plus } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import Layout from '../components/Layout'
import { revenueData } from '../data/sampleData'
import type { Bill, Page } from '../types'

interface Props {
  bills: Bill[]
  onNavigate: (page: Page) => void
  onLogout: () => void
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Paid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
    Overdue: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] ?? ''}`}>
      {status}
    </span>
  )
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export default function DashboardPage({ bills, onNavigate, onLogout }: Props) {
  const total = bills.length
  const pending = bills.filter(b => b.status === 'Pending').length
  const paid = bills.filter(b => b.status === 'Paid').length
  const overdue = bills.filter(b => b.status === 'Overdue').length
  const revenue = bills.filter(b => b.status === 'Paid').reduce((s, b) => s + b.amount, 0)
  const outstanding = bills.filter(b => b.status !== 'Paid').reduce((s, b) => s + b.amount, 0)

  const stats = [
    {
      label: 'Total Bills',
      value: total,
      icon: FileText,
      iconBg: 'bg-blue-500',
      note: 'All invoices',
    },
    {
      label: 'Pending',
      value: pending,
      icon: Clock,
      iconBg: 'bg-amber-500',
      note: 'Awaiting payment',
    },
    {
      label: 'Paid',
      value: paid,
      icon: CheckCircle,
      iconBg: 'bg-emerald-500',
      note: 'Fully settled',
    },
    {
      label: 'Total Revenue',
      value: fmt(revenue),
      icon: TrendingUp,
      iconBg: 'bg-violet-500',
      note: 'From paid invoices',
    },
  ]

  const recentBills = bills.slice(0, 6)

  return (
    <Layout currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Your workspace is ready. Add your first bill or customer to start tracking activity.
            </p>
          </div>
          <button
            onClick={() => onNavigate('bills')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors w-fit"
          >
            <Plus size={16} />
            Create New Bill
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-medium text-slate-500">{s.label}</p>
                  <div className={`${s.iconBg} p-2 rounded-lg`}>
                    <Icon size={15} className="text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900 tabular-nums">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.note}</p>
              </div>
            )
          })}
        </div>

        {/* Chart + Bill Status */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-slate-900">Revenue Overview</h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                Last 6 months
              </span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData} margin={{ left: 0, right: 4, top: 4, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`}
                  width={44}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
                    fontSize: '12px',
                  }}
                  formatter={(v) => [fmt(Number(v)), 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2563EB"
                  strokeWidth={2}
                  fill="url(#grad)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bill status */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-900 mb-5">Bill Status</h2>
            <div className="space-y-5">
              {[
                { label: 'Paid', count: paid, pct: total ? Math.round((paid / total) * 100) : 0, bar: 'bg-emerald-500' },
                { label: 'Pending', count: pending, pct: total ? Math.round((pending / total) * 100) : 0, bar: 'bg-amber-500' },
                { label: 'Overdue', count: overdue, pct: total ? Math.round((overdue / total) * 100) : 0, bar: 'bg-red-500' },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.count} <span className="text-xs font-normal text-slate-400">({item.pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div
                      className={`${item.bar} h-1.5 rounded-full transition-all`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100">
              <p className="text-xs text-slate-400 mb-1">Total outstanding</p>
              <p className="text-xl font-bold text-slate-900">{fmt(outstanding)}</p>
            </div>
          </div>
        </div>

        {/* Recent bills */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Recent Bills</h2>
            <button
              onClick={() => onNavigate('bills')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Invoice', 'Customer', 'Date', 'Amount', 'Status'].map(h => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentBills.map((b, i) => (
                  <tr
                    key={b.id}
                    className={`hover:bg-slate-50/60 transition-colors ${i < recentBills.length - 1 ? 'border-b border-slate-50' : ''}`}
                  >
                    <td className="px-6 py-3.5 text-sm font-medium text-slate-900">{b.invoiceNumber}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-600">{b.customer}</td>
                    <td className="px-6 py-3.5 text-sm text-slate-500">{fmtDate(b.date)}</td>
                    <td className="px-6 py-3.5 text-sm font-semibold text-slate-900 tabular-nums">{fmt(b.amount)}</td>
                    <td className="px-6 py-3.5"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
