// ============================================================
// AutoNear — Form Validation Utilities
// ============================================================

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateFullName(name: string): ValidationResult {
  const trimmed = name.trim()
  if (!trimmed) return { valid: false, error: 'Full name is required.' }
  if (trimmed.length < 2) return { valid: false, error: 'Name must be at least 2 characters.' }
  if (trimmed.length > 80) return { valid: false, error: 'Name must be 80 characters or fewer.' }
  if (!/^[a-zA-Z\s'-]+$/.test(trimmed))
    return { valid: false, error: 'Name may only contain letters, spaces, hyphens, and apostrophes.' }
  return { valid: true }
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim().toLowerCase()
  if (!trimmed) return { valid: false, error: 'Email address is required.' }
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!pattern.test(trimmed)) return { valid: false, error: 'Please enter a valid email address.' }
  return { valid: true }
}

export function validatePhone(phone: string): ValidationResult {
  const trimmed = phone.trim().replace(/\s+/g, '')
  if (!trimmed) return { valid: false, error: 'Phone number is required.' }
  // Allow 10-digit Indian mobile numbers, optionally prefixed with +91
  const pattern = /^(\+91)?[6-9]\d{9}$/
  if (!pattern.test(trimmed))
    return {
      valid: false,
      error: 'Enter a valid 10-digit Indian mobile number (optionally prefixed with +91).',
    }
  return { valid: true }
}

export function validateVehicleRegNumber(reg: string): ValidationResult {
  const trimmed = reg.trim().toUpperCase().replace(/\s+/g, '')
  if (!trimmed) return { valid: false, error: 'Vehicle registration number is required.' }
  // Indian vehicle registration: e.g., MH12AB1234, KA05EF4567
  const pattern = /^[A-Z]{2}[0-9]{2}[A-Z]{1,3}[0-9]{1,4}$/
  if (!pattern.test(trimmed))
    return {
      valid: false,
      error:
        'Enter a valid Indian vehicle registration number (e.g., MH12AB1234).',
    }
  return { valid: true }
}

export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, error: 'Password is required.' }
  if (password.length < 8) return { valid: false, error: 'Password must be at least 8 characters.' }
  if (!/[A-Z]/.test(password))
    return { valid: false, error: 'Password must contain at least one uppercase letter.' }
  if (!/[0-9]/.test(password))
    return { valid: false, error: 'Password must contain at least one number.' }
  return { valid: true }
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string
): ValidationResult {
  if (!confirmation) return { valid: false, error: 'Please confirm your password.' }
  if (password !== confirmation) return { valid: false, error: 'Passwords do not match.' }
  return { valid: true }
}
