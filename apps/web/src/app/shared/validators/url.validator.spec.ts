import { FormControl } from '@angular/forms';

import { urlValidator } from './url.validator';

describe('urlValidator', () => {
  it('accepts empty values', () => {
    const control = new FormControl('');
    const validator = urlValidator();

    expect(validator(control)).toBeNull();
  });

  it('validates http and https urls by default', () => {
    const control = new FormControl('https://example.com/item');
    const validator = urlValidator();

    expect(validator(control)).toBeNull();
  });

  it('rejects invalid formats', () => {
    const control = new FormControl('example dot com');
    const validator = urlValidator();

    expect(validator(control)).toEqual({ url: { reason: 'format' } });
  });

  it('rejects urls with unsupported protocols', () => {
    const control = new FormControl('ftp://example.com/file');
    const validator = urlValidator();

    expect(validator(control)).toEqual({ url: { reason: 'protocol' } });
  });

  it('supports custom protocols', () => {
    const control = new FormControl('ftp://example.com/file');
    const validator = urlValidator({ protocols: ['ftp'] });

    expect(validator(control)).toBeNull();
  });

  it('rejects non-string values', () => {
    const control = new FormControl(42 as unknown as string);
    const validator = urlValidator();

    expect(validator(control)).toEqual({ url: { reason: 'type' } });
  });
});
