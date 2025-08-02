import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvaReportComponent } from './iva-report.component';

describe('IvaReportComponent', () => {
  let component: IvaReportComponent;
  let fixture: ComponentFixture<IvaReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IvaReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvaReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
