import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject
} from '@angular/core';

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([type="hidden"]):not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(',');

@Directive({
  selector: '[appFocusTrap]',
  standalone: true
})
export class FocusTrapDirective implements AfterViewInit, OnChanges, OnDestroy {
  private readonly element = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  private mutationObserver?: MutationObserver;
  private focusableElements: HTMLElement[] = [];
  private keydownHandler?: (event: KeyboardEvent) => void;

  private _active = true;

  @Input('appFocusTrap')
  set active(value: boolean | string | null | undefined) {
    this._active = value !== false && value !== 'false';
    if (this._active) {
      this.zone.runOutsideAngular(() => setTimeout(() => this.focusInitial(), 0));
    }
  }

  get active(): boolean {
    return this._active;
  }

  @Input() appFocusTrapAutoFocus = false;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.keydownHandler = (event: KeyboardEvent) => this.handleKeydown(event);
      this.element.nativeElement.addEventListener('keydown', this.keydownHandler!, true);
    });

    this.observeDom();
    this.refreshFocusable();
    this.focusInitial();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appFocusTrapAutoFocus']) {
      this.focusInitial();
    }
  }

  ngOnDestroy(): void {
    if (this.keydownHandler) {
      this.element.nativeElement.removeEventListener('keydown', this.keydownHandler, true);
    }
    this.mutationObserver?.disconnect();
  }

  private observeDom(): void {
    this.mutationObserver = new MutationObserver(() => this.refreshFocusable());
    this.mutationObserver.observe(this.element.nativeElement, {
      childList: true,
      subtree: true,
      attributes: true
    });
  }

  private refreshFocusable(): void {
    const nodes = Array.from(
      this.element.nativeElement.querySelectorAll(FOCUSABLE_SELECTORS) as NodeListOf<HTMLElement>
    );
    this.focusableElements = nodes.filter(
      (el: HTMLElement) => !el.hasAttribute('disabled') && this.isVisible(el)
    );
    if (this.active && !this.focusableElements.length) {
      this.ensureHostFocusable();
    }
  }

  private ensureHostFocusable(): void {
    const host = this.element.nativeElement;
    if (!host.hasAttribute('tabindex')) {
      host.setAttribute('tabindex', '-1');
      this.cdr.markForCheck();
    }
  }

  private focusInitial(): void {
    if (!this.active || !this.appFocusTrapAutoFocus) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        const [first] = this.getFocusableElements();
        if (first) {
          first.focus();
        } else {
          this.ensureHostFocusable();
          this.element.nativeElement.focus();
        }
      }, 0);
    });
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (!this.active || event.key !== 'Tab') {
      return;
    }

    const focusable = this.getFocusableElements();
    if (!focusable.length) {
      event.preventDefault();
      this.ensureHostFocusable();
      this.element.nativeElement.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement as HTMLElement | null;

    if (event.shiftKey) {
      if (current === first || !this.element.nativeElement.contains(current)) {
        event.preventDefault();
        last.focus();
      }
      return;
    }

    if (current === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(): HTMLElement[] {
    return this.focusableElements.filter((el) =>
      this.element.nativeElement.contains(el) && !el.hasAttribute('disabled')
    );
  }

  private isVisible(element: HTMLElement): boolean {
    return element.offsetWidth > 0 || element.offsetHeight > 0 || element.getClientRects().length > 0;
  }
}
