export class DeviceFingerprint {
  private static instance: DeviceFingerprint
  private fingerprint: string | null = null

  static getInstance(): DeviceFingerprint {
    if (!DeviceFingerprint.instance) {
      DeviceFingerprint.instance = new DeviceFingerprint()
    }
    return DeviceFingerprint.instance
  }

  async generateFingerprint(): Promise<string> {
    if (this.fingerprint) return this.fingerprint

    const components = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      timezoneOffset: new Date().getTimezoneOffset(),
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      deviceMemory: (navigator as any).deviceMemory || 'unknown',
      touchSupport: 'ontouchstart' in window,
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      plugins: Array.from(navigator.plugins || []).map(p => p.name).join(','),
      canvas: await this.getCanvasFingerprint(),
      webgl: this.getWebGLFingerprint()
    }

    const fingerprint = await this.hashString(JSON.stringify(components))
    this.fingerprint = fingerprint
    return fingerprint
  }

  private async getCanvasFingerprint(): Promise<string> {
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    if (!ctx) return 'no-canvas'

    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(0, 0, 100, 50)
    ctx.fillStyle = '#069'
    ctx.fillText('Team Mulila', 2, 15)

    return canvas.toDataURL()
  }

  private getWebGLFingerprint(): string {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null
    const experimentalGl = canvas.getContext('experimental-webgl') as WebGLRenderingContext | null
    const context = gl || experimentalGl

    if (!context) return 'no-webgl'

    const debugInfo = context.getExtension('WEBGL_debug_renderer_info')
    if (debugInfo) {
      const vendor = context.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      const renderer = context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      return `${vendor}~${renderer}`
    }
    return 'no-debug-info'
  }

  private async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  getDeviceId(): string {
    return localStorage.getItem('team_mulila_device_id') || this.generateDeviceId()
  }

  private generateDeviceId(): string {
    const id = Math.random().toString(36).substring(2) + Date.now().toString(36)
    localStorage.setItem('team_mulila_device_id', id)
    return id
  }
}
