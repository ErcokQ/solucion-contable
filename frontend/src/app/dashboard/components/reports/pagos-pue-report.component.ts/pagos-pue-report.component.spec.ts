import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosPueReportComponent } from './pagos-pue-report.component.js';

describe('PagosPueReportComponentTs', () => {
  let component: PagosPueReportComponent;
  let fixture: ComponentFixture<PagosPueReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosPueReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PagosPueReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
