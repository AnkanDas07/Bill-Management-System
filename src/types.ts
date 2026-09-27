export type Page = 'login' | 'register' | 'dashboard' | 'bills' | 'customers'

export type BillStatus = 'Paid' | 'Pending' | 'Overdue'

export interface Bill {
  id: string
  invoiceNumber: string
  customer: string
  date: string
  amount: number
  status: BillStatus
}

export interface Customer {
  id: number
  name: string
  email: string
  phone: string
  totalBills: number
  totalAmount: number
}

export interface LineItem {
  id: string
  description: string
  quantity: number
  price: number
}
