export class PhoneValidator {
  private static instance: PhoneValidator
  private storageKey = "team_mulila_phone_attempts"

  static getInstance(): PhoneValidator {
    if (!PhoneValidator.instance) {
      PhoneValidator.instance = new PhoneValidator()
    }
    return PhoneValidator.instance
  }

  trackPhoneAttempt(phone: string): {
    allowed: boolean
    remainingAttempts: number
    waitTime: number
  } {
    const now = Date.now()
    const attempts = this.getPhoneAttempts(phone)

    // Filter attempts from last 1 hour (60 minutes)
    const recentAttempts = attempts.filter(t => now - t < 3600000) // 1 hour window

    console.log(`📱 Phone ${phone} - Attempts in last hour: ${recentAttempts.length}/5`)

    // Allow 5 attempts per hour
    if (recentAttempts.length >= 5) {
      const oldestAttempt = Math.min(...recentAttempts)
      const waitTime = 3600000 - (now - oldestAttempt)
      const waitMinutes = Math.ceil(waitTime / 60000)
      console.log(`⏰ Rate limit exceeded. Wait ${waitMinutes} minutes`)
      return {
        allowed: false,
        remainingAttempts: 0,
        waitTime: waitMinutes // Return minutes
      }
    }

    // Add new attempt
    recentAttempts.push(now)
    this.savePhoneAttempts(phone, recentAttempts)

    return {
      allowed: true,
      remainingAttempts: 5 - recentAttempts.length,
      waitTime: 0
    }
  }

  // Reset attempts for a phone number (useful after successful verification)
  resetPhoneAttempts(phone: string): void {
    console.log(`🔄 Resetting phone attempts for: ${phone}`)
    localStorage.removeItem(`${this.storageKey}_${phone}`)
  }

  // Clear all attempts (for debugging)
  clearAllAttempts(): void {
    console.log("🗑️ Clearing all phone attempts")
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(this.storageKey)) {
        localStorage.removeItem(key)
      }
    })
  }

  private getPhoneAttempts(phone: string): number[] {
    const stored = localStorage.getItem(`${this.storageKey}_${phone}`)
    if (stored) {
      try {
        const attempts = JSON.parse(stored)
        // Ensure it's an array
        if (Array.isArray(attempts)) {
          return attempts
        }
      } catch (e) {
        console.error("Error parsing phone attempts:", e)
      }
    }
    return []
  }

  private savePhoneAttempts(phone: string, attempts: number[]): void {
    // Keep only last 10 attempts to prevent storage bloat
    const trimmedAttempts = attempts.slice(-10)
    localStorage.setItem(`${this.storageKey}_${phone}`, JSON.stringify(trimmedAttempts))
  }

  isValidKenyanPhone(phone: string): boolean {
    const cleanPhone = phone.replace(/\s/g, '')
    const patterns = [
      /^(07|01|02)[0-9]{8}$/,
      /^254[0-9]{9}$/,
      /^\+254[0-9]{9}$/
    ]
    return patterns.some(pattern => pattern.test(cleanPhone))
  }

  formatPhoneNumber(phone: string): string {
    let clean = phone.replace(/\s/g, '')
    if (clean.startsWith('0')) {
      clean = '254' + clean.substring(1)
    } else if (clean.startsWith('+')) {
      clean = clean.substring(1)
    }
    return clean
  }
}
