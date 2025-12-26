import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { BlankComponent } from './features/blank/blank.component';
import { AuthenticationRoutes } from './features/authentication/authentication.routes';
import { PatientsComponent } from './features/patients/patients.component';
import { PatientFormComponent } from './features/patients/patient-form/patient-form.component';
import { PatientDetailComponent } from './features/patients/patient-detail/patient-detail.component';
import { AppointmentsComponent } from './features/appointments/appointments.component';
import { AppointmentFormComponent } from './features/appointments/appointment-form/appointment-form.component';
import { AppointmentDetailComponent } from './features/appointments/appointment-detail/appointment-detail.component';
import { InvoicesComponent } from './features/billing/invoices/invoices.component';
import { InvoiceFormComponent } from './features/billing/invoice-form/invoice-form.component';
import { InvoiceDetailComponent } from './features/billing/invoice-detail/invoice-detail.component';
import { MyProfileComponent } from './features/user-profile/my-profile/my-profile.component';
import { DepartmentsComponent } from './features/departments/departments.component';
import { DepartmentFormComponent } from './features/departments/department-form/department-form.component';
import { DoctorsComponent } from './features/doctors/doctors.component';
import { DoctorFormComponent } from './features/doctors/doctor-form/doctor-form.component';
import { UserManagementComponent } from './features/user-management/user-management.component';
import { SystemSettingsComponent } from './features/system-settings/system-settings.component';
import { MedicinesComponent } from './features/medicines/medicines.component';
import { MedicineFormComponent } from './features/medicines/medicine-form/medicine-form.component';
import { ProceduresComponent } from './features/procedures/procedures.component';
import { ProcedureFormComponent } from './features/procedures/procedure-form/procedure-form.component';
import { MedicineCategoryComponent } from './features/medicine-category/medicine-category.component';
import { MedicineCategoryFormComponent } from './features/medicine-category/medicine-category-form/medicine-category-form.component';
import { PaymentFormComponent } from './features/billing/payment-form/payment-form.component';
import { AuthGuard } from './features/authentication/auth.guard';

export const appRoutes: Routes = [

  // Redirect root → login
  { path: '', redirectTo: '/authentication/login', pathMatch: 'full' },

  // Authentication (public)
  {
    path: '',
    component: BlankComponent,
    children: [
      {
        path: 'authentication',
        loadChildren: () =>
          import('./features/authentication/authentication.routes').then(
            (m) => m.AuthenticationRoutes
          ),
      },
    ],
  },

  // Dashboard (protected)
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },

  // Patient routes (protected)
  { path: 'patients', component: PatientsComponent, canActivate: [AuthGuard] },
  { path: 'patients/new', component: PatientFormComponent, canActivate: [AuthGuard] },
  { path: 'patients/:id', component: PatientDetailComponent, canActivate: [AuthGuard] },
  { path: 'patients/:id/edit', component: PatientFormComponent, canActivate: [AuthGuard] },

  // Appointments routes
  { path: 'appointments', component: AppointmentsComponent, canActivate: [AuthGuard] },
  { path: 'appointments/new', component: AppointmentFormComponent, canActivate: [AuthGuard] },
  { path: 'appointments/:id', component: AppointmentDetailComponent, canActivate: [AuthGuard] },
  { path: 'appointments/:id/edit', component: AppointmentFormComponent, canActivate: [AuthGuard] },

  // Billing routes
  //{ path: 'billing/new', component: PaymentFormComponent },
  { path: 'billing', component: InvoicesComponent,canActivate: [AuthGuard]  },
  { path: 'billing/new', component: InvoiceFormComponent,canActivate: [AuthGuard]  },
  { path: 'billing/:id', component: InvoiceDetailComponent,canActivate: [AuthGuard]  },
  { path: 'billing/:id/edit', component: InvoiceFormComponent,canActivate: [AuthGuard]  },
  { path: 'billing/:id/payment', component: PaymentFormComponent,canActivate: [AuthGuard]  },
  { path: 'billing/detail/:id', component: InvoiceDetailComponent,canActivate: [AuthGuard]  },


  // Departments
  { path: 'departments', component: DepartmentsComponent, canActivate: [AuthGuard] },
  { path: 'departments/new', component: DepartmentFormComponent, canActivate: [AuthGuard] },
  { path: 'departments/:id/edit', component: DepartmentFormComponent, canActivate: [AuthGuard] },

  // Doctors
  { path: 'doctors', component: DoctorsComponent, canActivate: [AuthGuard] },
  { path: 'doctors/new', component: DoctorFormComponent, canActivate: [AuthGuard] },
  { path: 'doctors/:id/edit', component: DoctorFormComponent, canActivate: [AuthGuard] },

  
  // Medicine Category routes
  { path: 'medicine-category', component: MedicineCategoryComponent, canActivate: [AuthGuard] },
  { path: 'medicine-category/new', component: MedicineCategoryFormComponent, canActivate: [AuthGuard] },
  { path: 'medicine-category/:id/edit', component: MedicineCategoryFormComponent, canActivate: [AuthGuard] },

  // Medicines
  { path: 'medicines', component: MedicinesComponent, canActivate: [AuthGuard] },
  { path: 'medicines/new', component: MedicineFormComponent, canActivate: [AuthGuard] },
  { path: 'medicines/:id/edit', component: MedicineFormComponent, canActivate: [AuthGuard] },

  // Procedures
  { path: 'procedures', component: ProceduresComponent, canActivate: [AuthGuard] },
  { path: 'procedures/new', component: ProcedureFormComponent, canActivate: [AuthGuard] },
  { path: 'procedures/:id/edit', component: ProcedureFormComponent, canActivate: [AuthGuard] },

  // My profile
  { path: 'my-profile', component: MyProfileComponent, canActivate: [AuthGuard] },

  // User management & settings
  { path: 'user-management', component: UserManagementComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SystemSettingsComponent, canActivate: [AuthGuard] },

  // Fallback
  { path: '**', redirectTo: '/authentication/login' }
];