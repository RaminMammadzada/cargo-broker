import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { provideTranslateTesting } from '../../../testing/translate-testing.module';

import { StepDefinition, StepperComponent } from './stepper.component';

describe('StepperComponent', () => {
  let fixture: ComponentFixture<StepperComponent>;
  let component: StepperComponent;

  const steps: StepDefinition[] = [
    { id: 'order', labelKey: 'nav.steps.order', route: '/order' },
    { id: 'delivery', labelKey: 'nav.steps.delivery', route: '/delivery' },
    { id: 'review', labelKey: 'nav.steps.review', route: '/review' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StepperComponent, RouterTestingModule, provideTranslateTesting()]
    }).compileComponents();

    fixture = TestBed.createComponent(StepperComponent);
    component = fixture.componentInstance;
    component.steps = steps;
  });

  it('marks previous steps as complete and the current step as active', () => {
    component.currentStepId = 'delivery';
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('a');
    expect(items.length).toBe(3);
    expect(items[0].className).toContain('bg-primary-50');
    expect(items[1].className).toContain('bg-white');
    expect(items[2].className).toContain('hover:bg-slate-100');
    expect(items[1].getAttribute('aria-current')).toBe('step');
  });

  it('renders the index badge and checkmark for completed steps', () => {
    component.currentStepId = 'review';
    fixture.detectChanges();

    const badges = fixture.nativeElement.querySelectorAll('span.rounded-full');
    expect(badges[0].textContent?.trim()).toBe('✓');
    expect(badges[1].textContent?.trim()).toBe('✓');
    expect(badges[2].textContent?.trim()).toBe('3');
  });

  it('falls back to upcoming status when the current step is unknown', () => {
    component.currentStepId = 'unknown';
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('a');
    items.forEach((item: HTMLAnchorElement) => {
      expect(item.className).toContain('hover:bg-slate-100');
    });
  });
});
