import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-form-field',
  standalone: true,
  imports: [NgIf],
  template: `
    <label class="flex flex-col gap-2 text-sm text-slate-700" [attr.for]="for">
      <span *ngIf="label" class="font-medium">
        {{ label }}
        <span *ngIf="required" class="text-red-500">*</span>
      </span>
      <ng-content />
      <span *ngIf="hint && !errorMessage" class="text-xs font-normal text-slate-500">{{ hint }}</span>
      <span *ngIf="errorMessage" class="text-xs font-normal text-red-600">{{ errorMessage }}</span>
    </label>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormFieldComponent {
  @Input() label?: string;
  @Input() hint?: string;
  @Input() error?: string | string[] | null;
  @Input() required = false;
  @Input() for?: string;

  get errorMessage(): string | null {
    if (!this.error) {
      return null;
    }

    return Array.isArray(this.error) ? this.error[0] ?? null : this.error;
  }
}
