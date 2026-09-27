import type { Bill, Customer } from '../types'

export const initialBills: Bill[] = [
  { id: '1', invoiceNumber: 'INV-001', customer: 'Acme Corporation', date: '2026-09-01', amount: 2500.00, status: 'Paid' },
  { id: '2', invoiceNumber: 'INV-002', customer: 'TechStart Inc', date: '2026-09-05', amount: 1200.00, status: 'Pending' },
  { id: '3', invoiceNumber: 'INV-003', customer: 'Global Solutions Ltd', date: '2026-08-20', amount: 3400.00, status: 'Overdue' },
  { id: '4', invoiceNumber: 'INV-004', customer: 'Metro Services Group', date: '2026-09-10', amount: 850.00, status: 'Paid' },
  { id: '5', invoiceNumber: 'INV-005', customer: 'Sunrise Retail Co', date: '2026-09-15', amount: 1750.00, status: 'Pending' },
  { id: '6', invoiceNumber: 'INV-006', customer: 'Harbor Logistics LLC', date: '2026-08-25', amount: 4200.00, status: 'Overdue' },
  { id: '7', invoiceNumber: 'INV-007', customer: 'Peak Industries', date: '2026-09-20', amount: 960.00, status: 'Paid' },
  { id: '8', invoiceNumber: 'INV-008', customer: 'Coastal Design Studio', date: '2026-09-22', amount: 1380.00, status: 'Pending' },
  { id: '9', invoiceNumber: 'INV-009', customer: 'Northside Medical', date: '2026-09-12', amount: 5600.00, status: 'Paid' },
  { id: '10', invoiceNumber: 'INV-010', customer: 'BlueSky Consulting', date: '2026-08-15', amount: 2100.00, status: 'Overdue' },
]

export const initialCustomers: Customer[] = [
  { id: 1, name: 'Acme Corporation', email: 'billing@acmecorp.com', phone: '+1 (555) 100-2000', totalBills: 5, totalAmount: 12500 },
  { id: 2, name: 'TechStart Inc', email: 'accounts@techstart.io', phone: '+1 (555) 201-3000', totalBills: 3, totalAmount: 6200 },
  { id: 3, name: 'Global Solutions Ltd', email: 'finance@globalsol.com', phone: '+1 (555) 302-4000', totalBills: 7, totalAmount: 18900 },
  { id: 4, name: 'Metro Services Group', email: 'pay@metroservices.net', phone: '+1 (555) 403-5000', totalBills: 2, totalAmount: 3200 },
  { id: 5, name: 'Sunrise Retail Co', email: 'billing@sunriseretail.co', phone: '+1 (555) 504-6000', totalBills: 4, totalAmount: 8750 },
  { id: 6, name: 'Harbor Logistics LLC', email: 'ap@harborlogistics.com', phone: '+1 (555) 605-7000', totalBills: 6, totalAmount: 22400 },
  { id: 7, name: 'Peak Industries', email: 'invoices@peakindustries.com', phone: '+1 (555) 706-8000', totalBills: 3, totalAmount: 7200 },
  { id: 8, name: 'Coastal Design Studio', email: 'hello@coastaldesign.com', phone: '+1 (555) 807-9000', totalBills: 2, totalAmount: 4100 },
  { id: 9, name: 'Northside Medical', email: 'billing@northsidemedical.org', phone: '+1 (555) 908-1000', totalBills: 4, totalAmount: 18200 },
  { id: 10, name: 'BlueSky Consulting', email: 'admin@blueskyconsulting.com', phone: '+1 (555) 109-2000', totalBills: 2, totalAmount: 5400 },
]

export const revenueData = [
  { month: 'Apr', revenue: 14200, bills: 12 },
  { month: 'May', revenue: 18500, bills: 15 },
  { month: 'Jun', revenue: 16300, bills: 14 },
  { month: 'Jul', revenue: 22100, bills: 18 },
  { month: 'Aug', revenue: 19800, bills: 16 },
  { month: 'Sep', revenue: 24600, bills: 20 },
]
