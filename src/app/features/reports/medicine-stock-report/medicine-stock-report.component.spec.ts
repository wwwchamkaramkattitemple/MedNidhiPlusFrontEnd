import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MedicineStockReportComponent } from './medicine-stock-report.component';

describe('MedicineStockReportComponent', () => {
  let component: MedicineStockReportComponent;
  let fixture: ComponentFixture<MedicineStockReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineStockReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MedicineStockReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
