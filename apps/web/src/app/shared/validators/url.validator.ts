import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export interface UrlValidatorOptions {
  protocols?: string[];
}

const DEFAULT_PROTOCOLS = ['http', 'https'];

function normalizeProtocols(protocols?: string[]): string[] {
  return (protocols?.length ? protocols : DEFAULT_PROTOCOLS).map((protocol) =>
    protocol.replace(/:$/, '').toLowerCase()
  );
}

function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

export function urlValidator(options: UrlValidatorOptions = {}): ValidatorFn {
  const protocols = normalizeProtocols(options.protocols);

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (isEmptyValue(value)) {
      return null;
    }

    if (typeof value !== 'string') {
      return { url: { reason: 'type' } };
    }

    const trimmed = value.trim();

    try {
      const parsed = new URL(trimmed);
      const protocol = parsed.protocol.replace(/:$/, '').toLowerCase();

      if (!protocols.includes(protocol)) {
        return { url: { reason: 'protocol' } };
      }

      if (!parsed.hostname) {
        return { url: { reason: 'hostname' } };
      }

      return null;
    } catch {
      return { url: { reason: 'format' } };
    }
  };
}
