import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass],
  template: `
    <button
      [attr.type]="type"
      [disabled]="disabled"
      class="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      [ngClass]="[variantClass, sizeClass, disabled ? 'opacity-70 cursor-not-allowed' : 'shadow-sm hover:shadow']"
      [attr.aria-label]="ariaLabel"
    >
      <ng-content />
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() ariaLabel?: string;

  get variantClass(): string {
    switch (this.variant) {
      case 'secondary':
        return 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus-visible:outline-slate-200';
      case 'ghost':
        return 'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:outline-slate-300';
      case 'primary':
      default:
        return 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-300';
    }
  }

  get sizeClass(): string {
    switch (this.size) {
      case 'sm':
        return 'px-3 py-1.5 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      case 'md':
      default:
        return 'px-4 py-2 text-sm';
    }
  }
}
