import { useState } from 'react'
import { Plus, Search, Trash2, X, Mail, Phone, User } from 'lucide-react'
import Layout from '../components/Layout'
import type { Bill, Customer, Page } from '../types'

interface Props {
  customers: Customer[]
  bills: Bill[]
  onAddCustomer: (customer: Customer) => void
  onDeleteCustomer: (id: number) => void
  onNavigate: (page: Page) => void
  onLogout: () => void
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

interface FormState {
  name: string
  email: string
  phone: string
}

const emptyForm: FormState = { name: '', email: '', phone: '' }

export default function CustomersPage({ customers, bills, onAddCustomer, onDeleteCustomer, onNavigate, onLogout }: Props) {
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [formErrors, setFormErrors] = useState<Partial<FormState>>({})
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  const set = (field: keyof FormState, value: string) => {
    setForm(p => ({ ...p, [field]: value }))
    setFormErrors(p => ({ ...p, [field]: '' }))
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  )

  const validate = () => {
    const errs: Partial<FormState> = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.phone.trim()) errs.phone = 'Phone is required'
    return errs
  }

  const saveCustomer = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    const customer: Customer = {
      id: Date.now(),
      name: form.name,
      email: form.email,
      phone: form.phone,
      totalBills: 0,
      totalAmount: 0,
    }
    onAddCustomer(customer)
    setShowModal(false)
    setForm(emptyForm)
  }

  const getCustomerBills = (name: string) => bills.filter(b => b.customer === name)

  const inputClass = (field: keyof FormState) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
      formErrors[field]
        ? 'border-red-400 ring-2 ring-red-100'
        : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
    }`

  return (
    <Layout currentPage="customers" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
            <p className="text-sm text-slate-500 mt-0.5">{customers.length} total customers</p>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setFormErrors({}); setShowModal(true) }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors w-fit"
          >
            <Plus size={16} />
            Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>

        {/* Desktop table */}
        <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Customer', 'Email', 'Phone', 'Total Bills', 'Total Amount', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">No customers found</td>
                  </tr>
                ) : (
                  filtered.map((c, i) => {
                    const cBills = getCustomerBills(c.name)
                    const billCount = cBills.length || c.totalBills
                    const billAmount = cBills.reduce((s, b) => s + b.amount, 0) || c.totalAmount
                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-slate-50/60 transition-colors ${i < filtered.length - 1 ? 'border-b border-slate-50' : ''}`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700 flex-shrink-0">
                              {c.name.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-900">{c.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-600">{c.email}</td>
                        <td className="px-5 py-3.5 text-sm text-slate-500">{c.phone}</td>
                        <td className="px-5 py-3.5 text-sm font-medium text-slate-900 tabular-nums">{billCount}</td>
                        <td className="px-5 py-3.5 text-sm font-semibold text-slate-900 tabular-nums">{fmt(billAmount)}</td>
                        <td className="px-5 py-3.5">
                          {deleteConfirm === c.id ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => { onDeleteCustomer(c.id); setDeleteConfirm(null) }}
                                className="text-xs font-medium text-red-600 hover:text-red-700 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(c.id)}
                              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete customer"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <span className="text-xs text-slate-400">{filtered.length} customer{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-400">
              No customers found
            </div>
          ) : (
            filtered.map(c => {
              const cBills = getCustomerBills(c.name)
              const billCount = cBills.length || c.totalBills
              const billAmount = cBills.reduce((s, b) => s + b.amount, 0) || c.totalAmount
              return (
                <div key={c.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Mail size={11} className="text-slate-400" />
                          <p className="text-xs text-slate-500">{c.email}</p>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteConfirm(deleteConfirm === c.id ? null : c.id)}
                      className="p-1.5 text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-50 grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xs text-slate-400">Phone</p>
                      <p className="text-xs font-medium text-slate-700 mt-0.5">{c.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Bills</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{billCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Amount</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{fmt(billAmount)}</p>
                    </div>
                  </div>
                  {deleteConfirm === c.id && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => { onDeleteCustomer(c.id); setDeleteConfirm(null) }}
                        className="flex-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 py-2 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="flex-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Add Customer</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User size={14} className="text-slate-400" />
                  Full name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Acme Corporation"
                  className={inputClass('name')}
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-500">{formErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  Email address *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="billing@company.com"
                  className={inputClass('email')}
                />
                {formErrors.email && <p className="mt-1 text-xs text-red-500">{formErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  Phone number *
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className={inputClass('phone')}
                />
                {formErrors.phone && <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveCustomer}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Add Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
