import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListCfdiComponent } from './list-cfdi.component';

describe('ListCfdiTs', () => {
  let component: ListCfdiComponent;
  let fixture: ComponentFixture<ListCfdiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListCfdiComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListCfdiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
