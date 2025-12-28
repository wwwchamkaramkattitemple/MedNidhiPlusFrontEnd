import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MaterialModule } from '../../../material.module';
import { ReportsService, DailyCollectionReport } from '../../../../services/reports.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, DateAdapter } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import moment from 'moment';

export const MY_DATE_FORMATS = {
  parse: { dateInput: 'DD/MM/YYYY' },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-daily-collection-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
  templateUrl: './daily-collection-report.component.html',
  styleUrls: ['./daily-collection-report.component.scss']
})
export class DailyCollectionReportComponent implements OnInit {

  displayedColumns: string[] = [
    'date',
    'cash',
    'card',
    'upi',
    'other',
    'total'
  ];

  dataSource = new MatTableDataSource<DailyCollectionReport>([]);
  isLoading = false;
  disableExport = true;
  filterForm!: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private reportsService: ReportsService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    this.filterForm = this.fb.group({
      fromDate: [firstDay],
      toDate: [today]
    });

    this.loadReport();
  }

  loadReport(): void {
    const { fromDate, toDate } = this.filterForm.value;

    this.isLoading = true;

    this.reportsService.getDailyCollection(
      this.formatDateOnly(fromDate),
      this.formatDateOnly(toDate)
    ).subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.updateExportState();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  updateExportState(): void {
  this.disableExport = this.dataSource.data.length === 0;
}

  filterreports(): void {
    this.loadReport();
  }

  resetFilters(): void {
    const today = new Date();
    this.filterForm.patchValue({
      fromDate: new Date(today.getFullYear(), today.getMonth(), 1),
      toDate: today
    });
    this.loadReport();
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  // formatDate(date: Date, endOfDay = false): string {
  //   return endOfDay
  //     ? moment(date).endOf('day').toISOString()
  //     : moment(date).startOf('day').toISOString();
  // }
  formatDateOnly(date: Date): string {
  return moment(date).format('YYYY-MM-DD');
}


  exportExcel(): void {
  const { fromDate, toDate } = this.filterForm.value;

  this.reportsService
    .downloadDailyCollectionExcel(
      this.formatDateOnly(fromDate),
      this.formatDateOnly(toDate)
    )
    .subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `DailyCollection_${this.formatDateOnly(fromDate)}_${this.formatDateOnly(toDate)}.xlsx`;
        document.body.appendChild(a);
        a.click();

        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      },
      error: () => {
        alert('Unable to export Excel');
      }
    });
}


  printReport(): void {
  const { fromDate, toDate } = this.filterForm.value;

  this.reportsService.downloadDailyCollectionPdf(
      this.formatDateOnly(fromDate),
      this.formatDateOnly(toDate)
    )
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);

          const iframe = document.createElement('iframe');
          iframe.style.position = 'fixed';
          iframe.style.right = '0';
          iframe.style.bottom = '0';
          iframe.style.width = '0';
          iframe.style.height = '0';
          iframe.style.border = '0';
          iframe.src = url;

          document.body.appendChild(iframe);

          iframe.onload = () => {
            setTimeout(() => {
              const win = iframe.contentWindow;
              if (!win) {
                alert('Print window blocked');
                return;
              }
              win.focus();
              win.print();

              URL.revokeObjectURL(url);
            }, 500);
          };
        },
        error: (err) => {
          console.error(err);
          alert('Unable to load  PDF');
        }
      });
}

}
