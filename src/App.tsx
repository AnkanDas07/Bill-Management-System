import { useEffect, useState } from 'react'
import type { Page, Bill, Customer } from './types'
import { getStoredUser, loginUser, logoutUser, registerUser } from './auth'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BillsPage from './pages/BillsPage'
import CustomersPage from './pages/CustomersPage'

async function makeUserScopedRequest<T>(endpoint: string, body: Record<string, unknown>, userId: string | null): Promise<T> {
  const response = await fetch(`http://localhost:5000/api${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(userId ? { 'x-user-id': userId } : {}),
    },
    body: JSON.stringify({ ...body, ...(userId ? { userId } : {}) }),
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.')
  }

  return data as T
}

const normalizeBill = (bill: any): Bill => ({
  id: String(bill.id ?? crypto.randomUUID()),
  invoiceNumber: bill.invoiceNumber ?? bill.invoice_number ?? 'N/A',
  customer: bill.customer ?? bill.customer_name ?? 'Unknown customer',
  date: bill.date ?? bill.bill_date ?? new Date().toISOString().split('T')[0],
  amount: Number(bill.amount ?? 0),
  status: (bill.status === 'Paid' || bill.status === 'Pending' || bill.status === 'Overdue')
    ? bill.status
    : 'Pending',
})

const normalizeCustomer = (customer: any): Customer => ({
  id: Number(customer.id ?? 0),
  name: customer.name ?? '',
  email: customer.email ?? '',
  phone: customer.phone ?? '',
  totalBills: Number(customer.total_bills ?? customer.totalBills ?? 0),
  totalAmount: Number(customer.total_amount ?? customer.totalAmount ?? 0),
})

export default function App() {
  const storedUser = getStoredUser()
  const [page, setPage] = useState<Page>(() => (storedUser ? 'dashboard' : 'login'))
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(storedUser))
  const [bills, setBills] = useState<Bill[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  const navigate = (p: Page) => setPage(p)

  const loadUserData = async (userId: string | null) => {
    if (!userId) {
      setBills([])
      setCustomers([])
      return
    }

    try {
      const [billResponse, customerResponse] = await Promise.all([
        fetch(`http://localhost:5000/api/bills`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
        }),
        fetch(`http://localhost:5000/api/customers`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
        }),
      ])

      const billData = billResponse.ok ? await billResponse.json() : []
      const customerData = customerResponse.ok ? await customerResponse.json() : []

      setBills(Array.isArray(billData) ? billData.map(normalizeBill) : [])
      setCustomers(Array.isArray(customerData) ? customerData.map(normalizeCustomer) : [])
    } catch {
      setBills([])
      setCustomers([])
    }
  }

  useEffect(() => {
    const user = getStoredUser()
    if (user?.id) {
      void loadUserData(user.id)
    }
  }, [])

  const handleLogin = async (email: string, password: string) => {
    const user = await loginUser(email, password)
    setIsLoggedIn(Boolean(user))
    await loadUserData(user?.id ?? null)
    setPage('dashboard')
  }

  const handleRegister = async (input: {
    fullName: string
    companyName: string
    email: string
    phone: string
    password: string
  }) => {
    await registerUser(input)
    setPage('login')
  }

  const handleLogout = () => {
    logoutUser()
    setBills([])
    setCustomers([])
    setIsLoggedIn(false)
    setPage('login')
  }

  const addBill = async (bill: Bill) => {
    const userId = storedUser?.id ?? null
    if (!userId) return

    try {
      await makeUserScopedRequest('/bills', {
        invoiceNumber: bill.invoiceNumber,
        customerName: bill.customer,
        date: bill.date,
        amount: bill.amount,
        status: bill.status,
        notes: '',
      }, userId)
    } catch {
      // keep local UI state working even if backend sync fails
    }

    setBills(prev => [bill, ...prev])
  }

  const deleteBill = (id: string) => setBills(prev => prev.filter(b => b.id !== id))
  const updateBillStatus = async (id: string, status: Bill['status']) => {
    const userId = storedUser?.id ?? null
    if (userId) {
      try {
        await fetch(`http://localhost:5000/api/bills/${id}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': userId,
          },
          body: JSON.stringify({ status }),
        })
      } catch {
        // silently continue on backend sync failure
      }
    }

    setBills(prev => prev.map(b => b.id === id ? { ...b, status } : b))
  }

  const addCustomer = async (customer: Customer) => {
    const userId = storedUser?.id ?? null
    if (!userId) return

    try {
      await makeUserScopedRequest('/customers', {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
      }, userId)
    } catch {
      // keep local UI state working even if backend sync fails
    }

    setCustomers(prev => [...prev, customer])
  }

  const deleteCustomer = (id: number) => setCustomers(prev => prev.filter(c => c.id !== id))

  if (!isLoggedIn) {
    if (page === 'register') return <RegisterPage onNavigate={navigate} onRegister={handleRegister} />
    return <LoginPage onLogin={handleLogin} onNavigate={navigate} />
  }

  if (page === 'dashboard') {
    return <DashboardPage bills={bills} onNavigate={navigate} onLogout={handleLogout} />
  }

  if (page === 'bills') {
    return (
      <BillsPage
        bills={bills}
        customers={customers}
        onAddBill={addBill}
        onDeleteBill={deleteBill}
        onUpdateBillStatus={updateBillStatus}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
    )
  }

  if (page === 'customers') {
    return (
      <CustomersPage
        customers={customers}
        bills={bills}
        onAddCustomer={addCustomer}
        onDeleteCustomer={deleteCustomer}
        onNavigate={navigate}
        onLogout={handleLogout}
      />
    )
  }

  return <DashboardPage bills={bills} onNavigate={navigate} onLogout={handleLogout} />
}
