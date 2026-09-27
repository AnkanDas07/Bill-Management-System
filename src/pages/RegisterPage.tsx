import { useState } from 'react'
import { Eye, EyeOff, Zap } from 'lucide-react'
import type { Page } from '../types'

interface RegisterPageProps {
  onNavigate: (page: Page) => void
  onRegister: (input: {
    fullName: string
    companyName: string
    email: string
    phone: string
    password: string
  }) => void
}

export default function RegisterPage({ onNavigate, onRegister }: RegisterPageProps) {
  const [form, setForm] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (field: string, value: string | boolean) => {
    setForm(p => ({ ...p, [field]: value }))
    setErrors(p => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.fullName.trim()) errs.fullName = 'Full name is required'
    if (!form.companyName.trim()) errs.companyName = 'Business name is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.phone) errs.phone = 'Phone number is required'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters'
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    if (!form.agreeTerms) errs.agreeTerms = 'You must agree to the Terms & Conditions'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    try {
      await onRegister({
        fullName: form.fullName.trim(),
        companyName: form.companyName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      })
      onNavigate('login')
    } catch (error) {
      setErrors({
        email: error instanceof Error ? error.message : 'Unable to create account.',
      })
    }
  }

  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
      errors[field]
        ? 'border-red-400 ring-2 ring-red-100'
        : 'border-slate-200 focus:border-[#2f6f7b] focus:ring-2 focus:ring-[#dfeef1]'
    }`

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 bg-[#2f6f7b] rounded-lg flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">BillFlow</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h1>
            <p className="text-sm text-slate-500">Get started with BillFlow for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => set('fullName', e.target.value)}
                  placeholder="Jane Davis"
                  className={inputClass('fullName')}
                />
                {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Business / Company</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={e => set('companyName', e.target.value)}
                  placeholder="Acme Corp"
                  className={inputClass('companyName')}
                />
                {errors.companyName && <p className="mt-1 text-xs text-red-500">{errors.companyName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="you@company.com"
                className={inputClass('email')}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className={inputClass('phone')}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min. 8 characters"
                    className={`${inputClass('password')} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Re-enter password"
                    className={`${inputClass('confirmPassword')} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.agreeTerms}
                  onChange={e => set('agreeTerms', e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-slate-300 accent-[#2f6f7b] cursor-pointer flex-shrink-0"
                />
                <span className="text-sm text-slate-600">
                  I agree to the{' '}
                  <button type="button" className="text-[#2f6f7b] hover:text-[#214f5b] font-medium">Terms & Conditions</button>
                  {' '}and{' '}
                  <button type="button" className="text-[#2f6f7b] hover:text-[#214f5b] font-medium">Privacy Policy</button>
                </span>
              </label>
              {errors.agreeTerms && <p className="mt-1 text-xs text-red-500">{errors.agreeTerms}</p>}
            </div>

            <button
              type="submit"
              className="w-full bg-[#2f6f7b] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#214f5b] active:bg-[#173d4d] transition-colors mt-2"
            >
              Create Account
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-[#2f6f7b] hover:text-[#214f5b] font-semibold transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}
