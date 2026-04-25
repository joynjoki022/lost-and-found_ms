declare module 'client-trace' {
  export interface SecurityReport {
    networkTampering: {
      tampered: boolean;
      tamperedFunctions: string[];
    };
    deviceFingerprint: {
      fingerprint: string;
      components: any;
    };
    proxyDetection: {
      isProxy: boolean;
      details: any;
    };
    scriptInjection: {
      injected: boolean;
      scripts: string[];
    };
    botSignals: {
      signals: any;
    };
  }

  export interface BotDetectionResult {
    botLikely: boolean;
    signals: {
      headless?: boolean;
      automation?: boolean;
      virtualMachine?: boolean;
      debugger?: boolean;
      webdriver?: boolean;
      [key: string]: any;
    };
  }

  export interface NetworkCheckResult {
    tampered: boolean;
    tamperedFunctions: string[];
  }

  export function collectSecurityReport(options: {
    bundleUrl: string;
    pingUrl: string;
    userUniqueId: string;
    secret: string;
  }): Promise<SecurityReport>;

  export function detectBot(): Promise<BotDetectionResult>;

  export function detectNetworkAPITampering(): NetworkCheckResult;
}
