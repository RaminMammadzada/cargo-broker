import { InjectionToken } from '@angular/core';

export interface AppConfig {
  apiBaseUrl: string;
}

function resolveConfig(): AppConfig {
  if (typeof window !== 'undefined') {
    const globalConfig = (window as unknown as { __APP_CONFIG__?: Partial<AppConfig> })?.__APP_CONFIG__;
    if (globalConfig?.apiBaseUrl) {
      return { apiBaseUrl: globalConfig.apiBaseUrl };
    }
  }

  return { apiBaseUrl: '/api' };
}

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG');
export const DEFAULT_APP_CONFIG = resolveConfig();
