import { useState } from 'react'
import { initialBills, initialCustomers } from './data/sampleData'
import type { Page, Bill, Customer } from './types'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import BillsPage from './pages/BillsPage'
import CustomersPage from './pages/CustomersPage'

export default function App() {
  const [page, setPage] = useState<Page>('login')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [bills, setBills] = useState<Bill[]>(initialBills)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)

  const navigate = (p: Page) => setPage(p)

  const handleLogin = () => {
    setIsLoggedIn(true)
    setPage('dashboard')
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setPage('login')
  }

  const addBill = (bill: Bill) => setBills(prev => [bill, ...prev])
  const deleteBill = (id: string) => setBills(prev => prev.filter(b => b.id !== id))

  const addCustomer = (customer: Customer) => setCustomers(prev => [...prev, customer])
  const deleteCustomer = (id: number) => setCustomers(prev => prev.filter(c => c.id !== id))

  if (!isLoggedIn) {
    if (page === 'register') return <RegisterPage onNavigate={navigate} />
    return <LoginPage onLogin={handleLogin} onNavigate={navigate} />
  }

  return (
    <>
      {page === 'dashboard' && (
        <DashboardPage bills={bills} onNavigate={navigate} onLogout={handleLogout} />
      )}
      {page === 'bills' && (
        <BillsPage
          bills={bills}
          customers={customers}
          onAddBill={addBill}
          onDeleteBill={deleteBill}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
      {page === 'customers' && (
        <CustomersPage
          customers={customers}
          bills={bills}
          onAddCustomer={addCustomer}
          onDeleteCustomer={deleteCustomer}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}
