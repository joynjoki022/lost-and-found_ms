/**
 * IP Service - Multiple methods to get client IP address
 * Uses free IP APIs with fallback mechanisms
 */

interface IPResponse {
  ip: string;
  success: boolean;
  source?: string;
}

class IPService {
  private static instance: IPService;
  private cachedIp: string | null = null;
  private readonly IP_APIS = [
    'https://api.ipify.org?format=json',
    'https://api.my-ip.io/ip.json',
    'https://ipapi.co/json/',
    'https://ipinfo.io/json',
    'https://api.ip.sb/jsonip',
    'https://icanhazip.com'
  ];

  private constructor() { }

  static getInstance(): IPService {
    if (!IPService.instance) {
      IPService.instance = new IPService();
    }
    return IPService.instance;
  }

  /**
   * Get client IP address with caching
   */
  async getClientIP(): Promise<string> {
    // Return cached IP if available
    if (this.cachedIp) {
      return this.cachedIp;
    }

    // Try multiple IP APIs
    const ip = await this.fetchIPFromMultipleSources();

    // Cache the IP
    this.cachedIp = ip;

    return ip;
  }

  /**
   * Try multiple IP APIs and return the first successful one
   */
  private async fetchIPFromMultipleSources(): Promise<string> {
    for (const apiUrl of this.IP_APIS) {
      try {
        const ip = await this.fetchIP(apiUrl);
        if (ip) {
          console.log(`IP fetched successfully from: ${apiUrl}`);
          return ip;
        }
      } catch (error) {
        console.warn(`Failed to fetch IP from ${apiUrl}:`, error);
        continue;
      }
    }

    // Return fallback if all APIs fail
    console.warn('All IP APIs failed, using fallback');
    return 'unknown';
  }

  /**
   * Fetch IP from a specific API
   */
  private async fetchIP(apiUrl: string): Promise<string | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');

      // Handle different response formats
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return this.extractIPFromJSON(data);
      } else {
        // Handle plain text response (like icanhazip.com)
        const text = await response.text();
        const ipMatch = text.match(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/);
        return ipMatch ? ipMatch[0] : null;
      }
    } catch (error) {
      console.error(`Error fetching IP from ${apiUrl}:`, error);
      return null;
    }
  }

  /**
   * Extract IP address from various JSON response formats
   */
  private extractIPFromJSON(data: any): string | null {
    // Common IP field names across different APIs
    const ipFields = ['ip', 'ip_address', 'ipAddress', 'query', 'origin', 'ipv4'];

    for (const field of ipFields) {
      if (data[field] && typeof data[field] === 'string') {
        const ip = data[field];
        // Validate IP format
        if (this.isValidIP(ip)) {
          return ip;
        }
      }
    }

    // Try to find any field that looks like an IP
    for (const key in data) {
      if (typeof data[key] === 'string' && this.isValidIP(data[key])) {
        return data[key];
      }
    }

    return null;
  }

  /**
   * Validate IP address format
   */
  private isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Clear cached IP (useful for testing)
   */
  clearCache(): void {
    this.cachedIp = null;
  }

  /**
   * Get IP with additional details (country, city, etc.)
   */
  async getIPDetails(): Promise<{
    ip: string;
    country?: string;
    city?: string;
    region?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }> {
    try {
      const response = await fetch('https://ipapi.co/json/');
      if (response.ok) {
        const data = await response.json();
        this.cachedIp = data.ip;
        return {
          ip: data.ip,
          country: data.country_name,
          city: data.city,
          region: data.region,
          latitude: data.latitude,
          longitude: data.longitude,
          timezone: data.timezone
        };
      }
    } catch (error) {
      console.error('Error fetching IP details:', error);
    }

    // Fallback to just IP
    const ip = await this.getClientIP();
    return { ip };
  }
}

// Export singleton instance
export const ipService = IPService.getInstance();

// Export convenience functions
export const getClientIP = () => ipService.getClientIP();
export const getIPDetails = () => ipService.getIPDetails();
