import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepartmentRevenueReportComponent } from './department-revenue-report.component';

describe('DepartmentRevenueReportComponent', () => {
  let component: DepartmentRevenueReportComponent;
  let fixture: ComponentFixture<DepartmentRevenueReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DepartmentRevenueReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DepartmentRevenueReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
