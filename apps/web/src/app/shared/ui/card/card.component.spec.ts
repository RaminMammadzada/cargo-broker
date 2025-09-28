import { Component, ElementRef, Input, QueryList } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgIf } from '@angular/common';
import { Subject } from 'rxjs';

import { CardComponent } from './card.component';

@Component({
  standalone: true,
  imports: [CardComponent, NgIf],
  template: `
    <app-card [title]="title" [description]="description" [padding]="padding">
      <div class="body">Body content</div>
    </app-card>
  `
})
class CardHostComponent {
  @Input() title?: string;
  @Input() description?: string;
  @Input() padding: 'none' | 'sm' | 'md' = 'md';
}

describe('CardComponent', () => {
  let fixture: ComponentFixture<CardHostComponent>;
  let host: CardHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardHostComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(CardHostComponent);
    host = fixture.componentInstance;
  });

  it('renders the title and description header when provided', () => {
    host.title = 'Section title';
    host.description = 'Helpful description';

    fixture.detectChanges();

    const header = fixture.nativeElement.querySelector('header');
    expect(header).toBeTruthy();
    expect(header.textContent).toContain('Section title');
    expect(header.textContent).toContain('Helpful description');
    const section = fixture.nativeElement.querySelector('section');
    expect(section.getAttribute('role')).toBe('region');
  });

  it('applies padding modifiers to the content wrapper', () => {
    host.padding = 'sm';
    fixture.detectChanges();

    const content = fixture.nativeElement.querySelector('section > div');
    expect(content.className).toContain('px-4 py-4');

    host.padding = 'none';
    fixture.detectChanges();

    expect(content.className).toContain('px-0 py-0');
  });

  it('updates hasFooter when projected content changes', () => {
    const componentFixture = TestBed.createComponent(CardComponent);
    const component = componentFixture.componentInstance;

    const nativeElement = document.createElement('div');
    nativeElement.setAttribute('card-footer', '');
    const element = new ElementRef(nativeElement);
    const elements = [element];
    const changesSubject = new Subject<QueryList<ElementRef<HTMLElement>>>();
    const queryList = {
      some: (predicate: (el: ElementRef<HTMLElement>) => boolean) => elements.some(predicate),
      changes: changesSubject.asObservable()
    } as unknown as QueryList<ElementRef<HTMLElement>>;

    const componentWithProjection = component as unknown as {
      projectedElements: QueryList<ElementRef<HTMLElement>>;
    };
    componentWithProjection.projectedElements = queryList;

    component.ngAfterContentInit();
    expect(component.hasFooter).toBeTrue();

    nativeElement.removeAttribute('card-footer');
    changesSubject.next(queryList);

    expect(component.hasFooter).toBeFalse();
    component.ngOnDestroy();
  });
});
