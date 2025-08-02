import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CfdiReportsComponent } from './reports.component';

describe('ReportsComponentTs', () => {
  let component: CfdiReportsComponent;
  let fixture: ComponentFixture<CfdiReportsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CfdiReportsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CfdiReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
