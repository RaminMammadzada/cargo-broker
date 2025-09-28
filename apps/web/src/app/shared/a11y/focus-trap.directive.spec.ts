import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FocusTrapDirective } from './focus-trap.directive';

@Component({
  standalone: true,
  imports: [FocusTrapDirective],
  template: `
    <div appFocusTrap [appFocusTrapAutoFocus]="autoFocus">
      <button type="button" class="first">First</button>
      <button type="button" class="middle">Middle</button>
      <button type="button" class="last">Last</button>
    </div>
  `
})
class FocusTrapHostComponent {
  autoFocus = true;
}

describe('FocusTrapDirective', () => {
  let fixture: ComponentFixture<FocusTrapHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FocusTrapHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(FocusTrapHostComponent);
    fixture.detectChanges();
  });

  it('focuses the first focusable element when initialised with autoFocus', async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    const firstButton = fixture.nativeElement.querySelector('button.first');
    expect(document.activeElement).toBe(firstButton);
  });

  it('loops focus within the host when tabbing forward from the last element', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    );
    buttons[2].focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    buttons[2].dispatchEvent(event);

    expect(document.activeElement).toBe(buttons[0]);
  });

  it('loops focus within the host when shift+tabbing from the first element', () => {
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('button')
    );
    buttons[0].focus();

    const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true });
    buttons[0].dispatchEvent(event);

    expect(document.activeElement).toBe(buttons[2]);
  });
});
