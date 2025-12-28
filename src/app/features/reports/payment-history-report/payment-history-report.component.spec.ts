import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentHistoryReportComponent } from './payment-history-report.component';

describe('PaymentHistoryReportComponent', () => {
  let component: PaymentHistoryReportComponent;
  let fixture: ComponentFixture<PaymentHistoryReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentHistoryReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentHistoryReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
