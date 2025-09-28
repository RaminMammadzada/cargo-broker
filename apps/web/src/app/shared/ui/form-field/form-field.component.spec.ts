import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { FormFieldComponent } from './form-field.component';

@Component({
  standalone: true,
  imports: [FormFieldComponent, ReactiveFormsModule],
  template: `
    <app-form-field
      [label]="label"
      [hint]="hint"
      [error]="error"
      [required]="required"
      [for]="fieldId"
    >
      <input [formControl]="control" [id]="fieldId" />
    </app-form-field>
  `
})
class FormFieldHostComponent {
  label = 'Label';
  hint = 'Helpful hint';
  error: string | string[] | null = null;
  required = false;
  fieldId = 'field';
  control = new FormControl('');
}

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<FormFieldHostComponent>;
  let host: FormFieldHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('associates the label with the projected control', () => {
    const label = fixture.nativeElement.querySelector('label');
    const input = fixture.nativeElement.querySelector('input');

    expect(label.getAttribute('for')).toBe('field');
    expect(input.getAttribute('id')).toBe('field');
    expect(label.textContent).toContain('Label');
    expect(label.textContent?.includes('*')).toBeFalse();
  });

  it('shows required indicator when requested', () => {
    host.required = true;
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('label');
    expect(label.textContent?.includes('*')).toBeTrue();
  });

  it('renders hint text when no error is present', () => {
    const hint = fixture.nativeElement.querySelector('span.text-slate-500');
    expect(hint?.textContent).toContain('Helpful hint');
  });

  it('renders the first error message when provided as an array', () => {
    host.error = ['First error', 'Second error'];
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('span.text-red-600');
    expect(error.textContent).toContain('First error');
    const hint = fixture.nativeElement.querySelector('span.text-slate-500');
    expect(hint).toBeNull();
  });

  it('renders the error string directly when provided', () => {
    host.error = 'Single error';
    fixture.detectChanges();

    const error = fixture.nativeElement.querySelector('span.text-red-600');
    expect(error.textContent).toContain('Single error');
  });
});
