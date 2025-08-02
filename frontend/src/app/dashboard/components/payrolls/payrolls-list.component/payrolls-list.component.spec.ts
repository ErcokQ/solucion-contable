import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PayrollsListComponent } from './payrolls-list.component';

describe('PayrollsListComponent', () => {
  let component: PayrollsListComponent;
  let fixture: ComponentFixture<PayrollsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayrollsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PayrollsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
