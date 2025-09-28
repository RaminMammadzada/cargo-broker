import { FormArray, FormControl, FormGroup } from '@angular/forms';

import { uniqueLinksValidator } from './unique-links.validator';

describe('uniqueLinksValidator', () => {
  function createControl(values: string[]): FormArray {
    return new FormArray(
      values.map(
        (value) =>
          new FormGroup({
            url: new FormControl(value)
          })
      ),
      { validators: [uniqueLinksValidator()] }
    );
  }

  it('allows unique urls', () => {
    const control = createControl(['https://example.com/a', 'https://example.com/b']);

    expect(control.valid).toBe(true);
    expect(control.errors).toBeNull();
  });

  it('flags duplicate urls ignoring formatting', () => {
    const control = createControl(['https://example.com/a', ' https://example.com/a ']);

    expect(control.valid).toBe(false);
    expect(control.errors).toEqual({ uniqueLinks: { indices: [[0, 1]] } });
    expect(control.at(0).get('url')?.hasError('duplicateLink')).toBe(true);
    expect(control.at(1).get('url')?.hasError('duplicateLink')).toBe(true);
  });

  it('clears duplicate errors when resolved', () => {
    const control = createControl(['https://example.com/a', 'https://example.com/a']);

    control.at(1).setValue({ url: 'https://example.com/b' });
    control.updateValueAndValidity();

    expect(control.valid).toBe(true);
    expect(control.errors).toBeNull();
    expect(control.at(0).get('url')?.hasError('duplicateLink')).toBe(false);
    expect(control.at(1).get('url')?.hasError('duplicateLink')).toBe(false);
  });

  it('ignores empty urls', () => {
    const control = createControl(['https://example.com/a', '']);

    expect(control.valid).toBe(true);
    expect(control.errors).toBeNull();
  });
});
