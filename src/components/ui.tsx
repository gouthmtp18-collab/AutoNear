// ============================================================
// AutoNear — Reusable UI Components
// ============================================================

import React, { forwardRef, InputHTMLAttributes, ReactNode } from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle, Loader2 } from 'lucide-react'

// ---- FormField ----

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  error?: string
  hint?: string
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, id, error, hint, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-[#F5F5F5]">
        {label}
        {props.required && <span className="text-[#737373] ml-1">*</span>}
      </label>
      <input
        ref={ref}
        id={id}
        {...props}
        className={`w-full bg-[#111111] text-[#F5F5F5] border rounded-lg px-3.5 py-2.5 text-sm
          placeholder-[#737373] transition-colors focus:outline-none focus:border-[#F5F5F5]
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-[#f87171]' : 'border-[#303030]'}
        `}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={!!error}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="flex items-center gap-1.5 text-xs text-[#f87171]">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-xs text-[#737373]">{hint}</p>
      )}
    </div>
  )
)
FormField.displayName = 'FormField'

// ---- Alert ----

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

const alertConfig: Record<AlertVariant, { icon: ReactNode; classes: string }> = {
  info: {
    icon: <Info className="w-4 h-4 flex-shrink-0" />,
    classes: 'bg-[#111111] border-[#303030] text-[#A3A3A3]',
  },
  success: {
    icon: <CheckCircle className="w-4 h-4 flex-shrink-0" />,
    classes: 'bg-[#0d1f0f] border-[#1a3a1e] text-[#86efac]',
  },
  warning: {
    icon: <AlertTriangle className="w-4 h-4 flex-shrink-0" />,
    classes: 'bg-[#1f1500] border-[#3d2800] text-[#fcd34d]',
  },
  error: {
    icon: <AlertCircle className="w-4 h-4 flex-shrink-0" />,
    classes: 'bg-[#1f0a0a] border-[#3d1212] text-[#fca5a5]',
  },
}

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: ReactNode
  className?: string
}

export function Alert({ variant = 'info', title, children, className = '' }: AlertProps) {
  const { icon, classes } = alertConfig[variant]
  return (
    <div
      role={variant === 'error' ? 'alert' : undefined}
      className={`flex gap-3 p-4 rounded-xl border text-sm ${classes} ${className}`}
    >
      {icon}
      <div>
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  )
}

// ---- Button ----

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const buttonVariants: Record<string, string> = {
  primary: 'bg-[#F5F5F5] text-[#090909] hover:bg-white disabled:bg-[#303030] disabled:text-[#737373]',
  secondary: 'bg-[#202020] text-[#F5F5F5] border border-[#303030] hover:bg-[#2a2a2a] hover:border-[#3a3a3a]',
  ghost: 'text-[#A3A3A3] hover:text-[#F5F5F5] hover:bg-[#171717]',
  danger: 'bg-[#7f1d1d] text-[#fca5a5] border border-[#991b1b] hover:bg-[#991b1b]',
}

const buttonSizes: Record<string, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium rounded-lg
        transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed
        ${buttonVariants[variant]} ${buttonSizes[size]} ${className}
      `}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
}

// ---- Spinner ----

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <Loader2
      className={`animate-spin text-[#737373] ${className}`}
      aria-label="Loading"
    />
  )
}

// ---- Card ----

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-[#171717] border border-[#303030] rounded-xl p-4 ${
        onClick ? 'cursor-pointer hover:border-[#3a3a3a] transition-colors' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

// ---- Badge ----

type BadgeVariant = 'default' | 'online' | 'offline' | 'pending' | 'approved' | 'rejected' | 'suspended'

const badgeStyles: Record<BadgeVariant, string> = {
  default: 'bg-[#202020] text-[#A3A3A3] border-[#303030]',
  online: 'bg-[#0d1f0f] text-[#86efac] border-[#1a3a1e]',
  offline: 'bg-[#202020] text-[#737373] border-[#303030]',
  pending: 'bg-[#1f1500] text-[#fcd34d] border-[#3d2800]',
  approved: 'bg-[#0d1f0f] text-[#86efac] border-[#1a3a1e]',
  rejected: 'bg-[#1f0a0a] text-[#fca5a5] border-[#3d1212]',
  suspended: 'bg-[#1f0d00] text-[#fdba74] border-[#3d2000]',
}

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  dot?: boolean
}

export function Badge({ variant = 'default', children, dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium border rounded-full ${badgeStyles[variant]}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'online' || variant === 'approved' ? 'bg-[#4ade80] animate-pulse' :
            variant === 'pending' ? 'bg-[#fbbf24] animate-pulse' :
            variant === 'rejected' ? 'bg-[#f87171]' :
            variant === 'suspended' ? 'bg-[#f97316]' :
            'bg-[#737373]'
          }`}
        />
      )}
      {children}
    </span>
  )
}

// ---- Page Layout ----

export function PageLayout({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <main className={`flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in ${className}`}>
      {children}
    </main>
  )
}

// ---- Section Heading ----

export function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-[#F5F5F5]">{title}</h2>
      {subtitle && <p className="text-sm text-[#737373] mt-1">{subtitle}</p>}
    </div>
  )
}

// ---- ConfigWarning ----

export function ConfigWarning() {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <Alert variant="warning" title="Firebase Not Configured">
        <p className="text-xs">
          Fill in your <code className="font-mono bg-[#202020] px-1 rounded">.env</code> file
          with real Firebase credentials. The app will not function until configured.
        </p>
      </Alert>
    </div>
  )
}
