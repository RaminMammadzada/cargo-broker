import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  OnDestroy,
  QueryList
} from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <section
      class="rounded-2xl border border-slate-200 bg-white shadow-sm"
      [attr.role]="role"
      [attr.aria-label]="ariaLabel"
      [attr.aria-labelledby]="ariaLabelledBy"
    >
      <header *ngIf="title || description" class="border-b border-slate-200 px-6 py-4">
        <div class="flex flex-col gap-1">
          <h2 *ngIf="title" class="text-lg font-semibold text-slate-900">
            {{ title }}
          </h2>
          <p *ngIf="description" class="text-sm text-slate-600">
            {{ description }}
          </p>
        </div>
      </header>
      <div class="px-6 py-6" [ngClass]="contentClass">
        <ng-content />
      </div>
      <footer *ngIf="hasFooter" class="border-t border-slate-200 px-6 py-4">
        <ng-content select="[card-footer]" />
      </footer>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardComponent implements AfterContentInit, OnDestroy {
  @Input() title?: string;
  @Input() description?: string;
  @Input() padding: 'none' | 'sm' | 'md' = 'md';
  @Input() role: string | null = 'region';
  @Input() ariaLabel?: string;
  @Input() ariaLabelledBy?: string;

  @ContentChildren('*', { descendants: true, read: ElementRef })
  private readonly projectedElements!: QueryList<ElementRef<HTMLElement>>;

  hasFooter = false;

  private subscription?: Subscription;

  ngAfterContentInit(): void {
    this.evaluateFooter();
    this.subscription = this.projectedElements.changes.subscribe(() => this.evaluateFooter());
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get contentClass(): string {
    switch (this.padding) {
      case 'none':
        return 'px-0 py-0';
      case 'sm':
        return 'px-4 py-4';
      case 'md':
      default:
        return '';
    }
  }

  private evaluateFooter(): void {
    this.hasFooter = this.projectedElements.some((element) => element.nativeElement.hasAttribute('card-footer'));
  }
}
