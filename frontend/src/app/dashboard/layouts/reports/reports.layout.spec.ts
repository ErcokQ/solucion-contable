import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsLayoutComponent } from './reports.layout';

describe('ReportsLayout', () => {
  let component: ReportsLayoutComponent;
  let fixture: ComponentFixture<ReportsLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportsLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
