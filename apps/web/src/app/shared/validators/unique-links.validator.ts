import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

interface UniqueLinksValidatorOptions {
  key?: string;
}

type ArrayControl = AbstractControl & {
  value: unknown;
  controls?: AbstractControl[];
};

function normaliseUrl(value: string): string {
  try {
    return new URL(value).toString();
  } catch {
    return value.trim().toLowerCase();
  }
}

export function uniqueLinksValidator(options: UniqueLinksValidatorOptions = {}): ValidatorFn {
  const key = options.key ?? 'url';

  return (control: ArrayControl): ValidationErrors | null => {
    const value = control.value;

    if (!Array.isArray(value)) {
      return null;
    }

    const seen = new Map<string, number[]>();

    value.forEach((item, index) => {
      if (!item || typeof item !== 'object') {
        return;
      }

      const candidate = (item as Record<string, unknown>)[key];

      if (typeof candidate !== 'string' || candidate.trim() === '') {
        return;
      }

      const normalised = normaliseUrl(candidate);
      const entries = seen.get(normalised) ?? [];
      entries.push(index);
      seen.set(normalised, entries);
    });

    const duplicates = Array.from(seen.values()).filter((indices) => indices.length > 1);

    if (!duplicates.length) {
      if (control.controls) {
        control.controls.forEach((child) => {
          const target = typeof child.get === 'function' ? child.get(key) : null;
          if (target?.hasError('duplicateLink')) {
            const errors = { ...(target.errors ?? {}) };
            delete errors['duplicateLink'];
            target.setErrors(Object.keys(errors).length ? errors : null);
          }
        });
      }

      return null;
    }

    if (control.controls) {
      duplicates.forEach((indices) => {
        indices.forEach((index) => {
          const child = control.controls?.[index];
          if (!child || typeof child.get !== 'function') {
            return;
          }

          const target = child.get(key);
          if (!target) {
            return;
          }

          const existingErrors = target.errors ?? {};
          target.setErrors({ ...existingErrors, duplicateLink: true });
        });
      });
    }

    return {
      uniqueLinks: {
        indices: duplicates
      }
    };
  };
}
