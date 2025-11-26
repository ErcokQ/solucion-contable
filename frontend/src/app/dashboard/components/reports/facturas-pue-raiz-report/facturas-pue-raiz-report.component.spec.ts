import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturasPueRaizReportComponent } from './facturas-pue-raiz-report.component';

describe('FacturasPueRaizReport', () => {
  let component: FacturasPueRaizReportComponent;
  let fixture: ComponentFixture<FacturasPueRaizReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FacturasPueRaizReportComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FacturasPueRaizReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
