// import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideRouter } from '@angular/router';

// import { routes } from './app.routes';
// import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

// export const appConfig: ApplicationConfig = {
//   providers: [provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes), provideClientHydration(withEventReplay())]
// };

// import {ApplicationConfig,provideZoneChangeDetection,importProvidersFrom} from '@angular/core';
// import {
  
//   provideHttpClient,
//   withInterceptorsFromDi,
// } from '@angular/common/http';
// import { routes } from './app.routes';
// import {
//   provideRouter,
//   withComponentInputBinding,
//   withInMemoryScrolling,
// } from '@angular/router';
// import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
// import { provideClientHydration } from '@angular/platform-browser';


// // import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
// // import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// // // icons
// // import { TablerIconsModule } from 'angular-tabler-icons';
// // import * as TablerIcons from 'angular-tabler-icons/icons';

// // // perfect scrollbar
// // import { NgScrollbarModule } from 'ngx-scrollbar';

// //Import all material modules
// import { MaterialModule } from './material.module';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { BillingModule } from './features/billing/billing.module';
// import { SharedModule } from './shared/shared.module';


// // export function HttpLoaderFactory(http: HttpClient): any {
// //   return new TranslateHttpLoader(http, './assets/i18n/', '.json');
// // }


// export const appConfig: ApplicationConfig = {
//   providers: [
//     provideZoneChangeDetection({ eventCoalescing: true }),
//     provideRouter(
//       routes,
//       withInMemoryScrolling({
//         scrollPositionRestoration: 'enabled',
//         anchorScrolling: 'enabled',
//       }),
//       withComponentInputBinding()
//     ),
//     provideHttpClient(withInterceptorsFromDi()),
//     provideClientHydration(),
//     provideAnimationsAsync(),
//     importProvidersFrom(
//       FormsModule,
//       ReactiveFormsModule,
//       MaterialModule,
//       BillingModule,
//       SharedModule
//       // TablerIconsModule.pick(TablerIcons),
//       // NgScrollbarModule,
//       // TranslateModule.forRoot({
//       //   loader: {
//       //     provide: TranslateLoader,
//       //     useFactory: HttpLoaderFactory,
//       //     deps: [HttpClient],
//       //   }, 
//       // })
//     ), provideAnimationsAsync(),
    
//   ],


// };

import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideClientHydration } from '@angular/platform-browser';
import { appRoutes } from './app.routes';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { BillingModule } from './features/billing/billing.module';
import { SharedModule } from './shared/shared.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      appRoutes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withComponentInputBinding()
    ),
    provideHttpClient(withInterceptorsFromDi()),
    provideClientHydration(),
    provideAnimationsAsync(),
    importProvidersFrom(
      FormsModule,
      ReactiveFormsModule,
      MaterialModule,
      BillingModule,
      SharedModule
    ),
  ],
};


