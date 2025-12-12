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
// import { ProcessfilesComponent } from './features/processfiles/processfiles.component';

export const appRoutes: Routes = [
  // Dashboard routes
  { path: 'dashboard', component: DashboardComponent },
  // Patient routes
  { path: '', redirectTo: '/authentication/login', pathMatch: 'full' },


  // { path: 'processfiles', component: ProcessfilesComponent },

  //Processed Files Routes
  // {
  //   path: 'processfiles',
  //   loadChildren: () =>
  //     import('./features/processfiles/processfiles.routes').then((m) => m.ProcessFilesRoutes),
  // },

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

  // Patient routes
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'patients', component: PatientsComponent },
  { path: 'patients/new', component: PatientFormComponent },
  { path: 'patients/:id', component: PatientDetailComponent },
  { path: 'patients/:id/edit', component: PatientFormComponent },

  // Appointments routes
  { path: 'appointments', component: AppointmentsComponent },
  { path: 'appointments/new', component: AppointmentFormComponent },
  { path: 'appointments/:id', component: AppointmentDetailComponent },
  { path: 'appointments/:id/edit', component: AppointmentFormComponent },

  // Billing routes
  //{ path: 'billing/new', component: PaymentFormComponent },
  { path: 'billing', component: InvoicesComponent },
  { path: 'billing/new', component: InvoiceFormComponent },
  { path: 'billing/:id', component: InvoiceDetailComponent },
  { path: 'billing/:id/edit', component: InvoiceFormComponent },
  { path: 'billing/:id/payment', component: PaymentFormComponent },
  { path: 'billing/detail/:id', component: InvoiceDetailComponent },


  // Department routes
  { path: 'departments', component: DepartmentsComponent },
  { path: 'departments/new', component: DepartmentFormComponent },
  { path: 'departments/:id/edit', component: DepartmentFormComponent },

  // Doctor routes
  { path: 'doctors', component: DoctorsComponent },
  { path: 'doctors/new', component: DoctorFormComponent },
  { path: 'doctors/:id/edit', component: DoctorFormComponent },

  // Medicine routes
  { path: 'medicines', component: MedicinesComponent },
  { path: 'medicines/new', component: MedicineFormComponent },
  { path: 'medicines/:id/edit', component: MedicineFormComponent },

  // Medicine Category routes
  { path: 'medicine-category', component: MedicineCategoryComponent },
  { path: 'medicine-category/new', component: MedicineCategoryFormComponent },
  { path: 'medicine-category/:id/edit', component: MedicineCategoryFormComponent },


  // Procedure routes
  { path: 'procedures', component: ProceduresComponent },
  { path: 'procedures/new', component: ProcedureFormComponent },
  { path: 'procedures/:id/edit', component: ProcedureFormComponent },




  { path: 'my-profile', component: MyProfileComponent },
  { path: 'user-management', component: UserManagementComponent },
  { path: 'settings', component: SystemSettingsComponent },

  //  {
  //       path: '',
  //       redirectTo: '/authentication/login',
  //       pathMatch: 'full',
  //     },

  //  { path: '**', redirectTo: '/dashboard' } // fallback
];
