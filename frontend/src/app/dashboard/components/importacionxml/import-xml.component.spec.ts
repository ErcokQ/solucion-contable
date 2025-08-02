import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportXmlComponent } from './import-xml.component';

describe('ImportXmlComponent', () => {
  let component: ImportXmlComponent;
  let fixture: ComponentFixture<ImportXmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportXmlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportXmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
