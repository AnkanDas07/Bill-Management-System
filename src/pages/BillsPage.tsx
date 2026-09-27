import { useState } from 'react'
import { Plus, Search, Trash2, X, ChevronDown } from 'lucide-react'
import Layout from '../components/Layout'
import type { Bill, BillStatus, Customer, LineItem, Page } from '../types'

interface Props {
  bills: Bill[]
  customers: Customer[]
  onAddBill: (bill: Bill) => void
  onDeleteBill: (id: string) => void
  onUpdateBillStatus: (id: string, status: Bill['status']) => void
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

const STATUSES: (BillStatus | 'All')[] = ['All', 'Paid', 'Pending', 'Overdue']

const emptyLine = (): LineItem => ({ id: crypto.randomUUID(), description: '', quantity: 1, price: 0 })

interface FormState {
  customerName: string
  invoiceNumber: string
  date: string
  notes: string
  items: LineItem[]
}

export default function BillsPage({ bills, customers, onAddBill, onDeleteBill, onUpdateBillStatus, onNavigate, onLogout }: Props) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<BillStatus | 'All'>('All')
  const [showModal, setShowModal] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null)

  const nextInvoice = `INV-${String(bills.length + 1).padStart(3, '0')}`
  const today = new Date().toISOString().split('T')[0]

  const [form, setForm] = useState<FormState>({
    customerName: '',
    invoiceNumber: nextInvoice,
    date: today,
    notes: '',
    items: [emptyLine()],
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const grandTotal = form.items.reduce((s, i) => s + i.quantity * i.price, 0)

  const filtered = bills.filter(b => {
    const matchesSearch =
      b.customer.toLowerCase().includes(search.toLowerCase()) ||
      b.invoiceNumber.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const openModal = () => {
    setForm({ customerName: '', invoiceNumber: nextInvoice, date: today, notes: '', items: [emptyLine()] })
    setFormErrors({})
    setShowModal(true)
  }

  const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
    setForm(p => ({
      ...p,
      items: p.items.map(it => it.id === id ? { ...it, [field]: value } : it),
    }))
  }

  const addItem = () => setForm(p => ({ ...p, items: [...p.items, emptyLine()] }))

  const removeItem = (id: string) => {
    if (form.items.length === 1) return
    setForm(p => ({ ...p, items: p.items.filter(it => it.id !== id) }))
  }

  const validateForm = () => {
    const errs: Record<string, string> = {}
    if (!form.customerName.trim()) errs.customerName = 'Customer name is required'
    if (!form.invoiceNumber.trim()) errs.invoiceNumber = 'Invoice number is required'
    if (!form.date) errs.date = 'Date is required'
    if (form.items.every(it => !it.description.trim())) errs.items = 'Add at least one item'
    return errs
  }

  const saveBill = () => {
    const errs = validateForm()
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return }
    const bill: Bill = {
      id: crypto.randomUUID(),
      invoiceNumber: form.invoiceNumber,
      customer: form.customerName,
      date: form.date,
      amount: grandTotal,
      status: 'Pending',
    }
    onAddBill(bill)
    setShowModal(false)
  }

  return (
    <Layout currentPage="bills" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Bills</h1>
            <p className="text-sm text-slate-500 mt-0.5">{bills.length} total invoices</p>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors w-fit"
          >
            <Plus size={16} />
            Add New Bill
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer or invoice…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
              className="appearance-none pl-3.5 pr-8 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all"
            >
              {STATUSES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['Bill ID', 'Customer', 'Date', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-400">
                      No bills found
                    </td>
                  </tr>
                ) : (
                  filtered.map((b, i) => (
                    <tr
                      key={b.id}
                      className={`hover:bg-slate-50/60 transition-colors ${i < filtered.length - 1 ? 'border-b border-slate-50' : ''}`}
                    >
                      <td className="px-5 py-3.5 text-sm font-medium text-blue-600">{b.invoiceNumber}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-800">{b.customer}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-500">{fmtDate(b.date)}</td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-slate-900 tabular-nums">{fmt(b.amount)}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={b.status} /></td>
                      <td className="px-5 py-3.5">
                        {editingStatusId === b.id ? (
                          <div className="flex items-center gap-2">
                            <select
                              value={b.status}
                              onChange={(e) => {
                                onUpdateBillStatus(b.id, e.target.value as Bill['status'])
                                setEditingStatusId(null)
                              }}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="Paid">Paid</option>
                              <option value="Pending">Pending</option>
                              <option value="Overdue">Overdue</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setEditingStatusId(b.id)}
                              className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                            >
                              Edit Status
                            </button>
                            {deleteConfirm === b.id ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => { onDeleteBill(b.id); setDeleteConfirm(null) }}
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
                                onClick={() => setDeleteConfirm(b.id)}
                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete bill"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-xs text-slate-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
              <span className="text-xs font-medium text-slate-600">
                Total: {fmt(filtered.reduce((s, b) => s + b.amount, 0))}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Create Bill Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-semibold text-slate-900">Create New Bill</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Customer Name *</label>
                  <input
                    type="text"
                    value={form.customerName}
                    onChange={e => { setForm(p => ({ ...p, customerName: e.target.value })); setFormErrors(p => ({ ...p, customerName: '' })) }}
                    placeholder="e.g. Acme Corporation"
                    list="customer-list"
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all ${formErrors.customerName ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`}
                  />
                  <datalist id="customer-list">
                    {customers.map(c => <option key={c.id} value={c.name} />)}
                  </datalist>
                  {formErrors.customerName && <p className="mt-1 text-xs text-red-500">{formErrors.customerName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Invoice Number *</label>
                  <input
                    type="text"
                    value={form.invoiceNumber}
                    onChange={e => setForm(p => ({ ...p, invoiceNumber: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Date *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Line items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-slate-700">Items *</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Plus size={14} />
                    Add item
                  </button>
                </div>

                {formErrors.items && <p className="mb-2 text-xs text-red-500">{formErrors.items}</p>}

                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 px-2">
                    <span className="col-span-5 text-xs text-slate-400 font-medium">Description</span>
                    <span className="col-span-2 text-xs text-slate-400 font-medium text-center">Qty</span>
                    <span className="col-span-3 text-xs text-slate-400 font-medium">Unit Price</span>
                    <span className="col-span-2 text-xs text-slate-400 font-medium text-right">Total</span>
                  </div>
                  {form.items.map(item => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        className="col-span-5 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="Service or product"
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                      />
                      <input
                        type="number"
                        min={1}
                        className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm text-center outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                      />
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        className="col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        placeholder="0.00"
                        value={item.price || ''}
                        onChange={e => updateItem(item.id, 'price', Number(e.target.value))}
                      />
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        <span className="text-sm font-medium text-slate-700 tabular-nums">
                          {fmt(item.quantity * item.price)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={form.items.length === 1}
                          className="p-1 text-slate-300 hover:text-red-400 disabled:opacity-30 transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block mb-1">Grand Total</span>
                    <span className="text-xl font-bold text-slate-900 tabular-nums">{fmt(grandTotal)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Optional payment terms or additional notes…"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveBill}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Save Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
