import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalesRfcReportComponent } from './totales-rfc-report.component';

describe('TotalesRfcReportComponent', () => {
  let component: TotalesRfcReportComponent;
  let fixture: ComponentFixture<TotalesRfcReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalesRfcReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TotalesRfcReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
