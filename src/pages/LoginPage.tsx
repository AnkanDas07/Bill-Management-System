import { useState } from 'react'
import { Eye, EyeOff, Zap, CheckCircle2, TrendingUp, Shield } from 'lucide-react'
import type { Page } from '../types'

interface LoginPageProps {
  onLogin: (email: string, password: string) => void
  onNavigate: (page: Page) => void
}

export default function LoginPage({ onLogin, onNavigate }: LoginPageProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})

  const validate = () => {
    const errs: typeof errors = {}
    if (!email) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Enter a valid email'
    if (!password) errs.password = 'Password is required'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    try {
      await onLogin(email, password)
    } catch (error) {
      setErrors({ form: error instanceof Error ? error.message : 'Invalid email or password.' })
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#2f6f7b] rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">BillFlow</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-7">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
                placeholder="enter your email"
                className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                  errors.email
                    ? 'border-red-400 ring-2 ring-red-100'
                    : 'border-slate-200 focus:border-[#2f6f7b] focus:ring-2 focus:ring-[#dfeef1]'
                }`}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: undefined })) }}
                  placeholder="Enter your password"
                  className={`w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
                    errors.password
                      ? 'border-red-400 ring-2 ring-red-100'
                      : 'border-slate-200 focus:border-[#2f6f7b] focus:ring-2 focus:ring-[#dfeef1]'
                  }`}
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
              {errors.form && <p className="mt-2 text-xs text-red-500">{errors.form}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#2f6f7b] accent-[#2f6f7b] cursor-pointer"
                />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-sm text-[#2f6f7b] hover:text-[#214f5b] font-medium transition-colors">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2f6f7b] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#214f5b] active:bg-[#173d4d] transition-colors mt-2"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-[#2f6f7b] hover:text-[#214f5b] font-semibold transition-colors"
            >
              Create account
            </button>
          </p>

        </div>
      </div>

      {/* Right — Brand panel */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#173d4d] via-[#214f5b] to-[#2f6f7b] flex-col items-center justify-center p-12 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -left-16 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 right-1/4 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-10 left-1/4 w-24 h-24 rounded-full bg-white/10" />

        <div className="relative z-10 max-w-sm text-center">
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Zap size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-white">BillFlow</span>
          </div>

          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Manage bills with confidence
          </h2>
          <p className="text-blue-100 text-base mb-10">
            The simplest way to track invoices, manage customers, and stay on top of your cash flow.
          </p>

          <div className="space-y-4 text-left">
            {[
              { icon: CheckCircle2, text: 'Track invoices and payment status in real time' },
              { icon: TrendingUp, text: 'Visualize revenue trends with clear charts' },
              { icon: Shield, text: 'Keep your customer data safe and organized' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={13} className="text-white" />
                </div>
                <p className="text-blue-100 text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-white/20">
            <p className="text-blue-200 text-xs">
              Trusted by 2,400+ small businesses worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
