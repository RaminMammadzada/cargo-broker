import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent, ButtonSize, ButtonVariant } from './button.component';

@Component({
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <app-button
      [type]="type"
      [variant]="variant"
      [size]="size"
      [disabled]="disabled"
      [ariaLabel]="ariaLabel"
    >
      <span>Label</span>
    </app-button>
  `
})
class ButtonHostComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() ariaLabel?: string;
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonHostComponent>;
  let host: ButtonHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonHostComponent);
    host = fixture.componentInstance;
  });

  function getButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button');
  }

  it('renders a native button element with default attributes', () => {
    fixture.detectChanges();

    const button = getButton();
    expect(button.getAttribute('type')).toBe('button');
    expect(button.className).toContain('bg-primary-600');
    expect(button.className).toContain('px-4 py-2');
  });

  it('applies the provided type and disabled state', () => {
    host.type = 'submit';
    host.disabled = true;
    fixture.detectChanges();

    const button = getButton();
    expect(button.getAttribute('type')).toBe('submit');
    expect(button.disabled).toBeTrue();
    expect(button.className).toContain('cursor-not-allowed');
  });

  it('switches visual variants', () => {
    host.variant = 'secondary';
    fixture.detectChanges();

    let button = getButton();
    expect(button.className).toContain('border-slate-200');

    host.variant = 'ghost';
    fixture.detectChanges();

    button = getButton();
    expect(button.className).toContain('bg-transparent');
  });

  it('switches size styles', () => {
    host.size = 'sm';
    fixture.detectChanges();

    let button = getButton();
    expect(button.className).toContain('px-3 py-1.5');

    host.size = 'lg';
    fixture.detectChanges();

    button = getButton();
    expect(button.className).toContain('px-6 py-3');
  });

  it('forwards accessibility labels to the native button element', () => {
    host.ariaLabel = 'Close notification';
    fixture.detectChanges();

    const button = getButton();
    expect(button.getAttribute('aria-label')).toBe('Close notification');
  });
});
