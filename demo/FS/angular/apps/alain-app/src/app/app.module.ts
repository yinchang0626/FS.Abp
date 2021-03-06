import { CoreModule } from '@abp/ng.core';
import { registerLocale } from '@abp/ng.core/locale';
import { IdentityConfigModule } from '@abp/ng.identity/config';
import { SettingManagementConfigModule } from '@abp/ng.setting-management/config';
import { TenantManagementConfigModule } from '@abp/ng.tenant-management/config';
import { EmailingConfigModule } from '@fs-tw/emailing/config';
import { ThemeAlainModule } from '@fs-tw/theme-alain';
import { ThemeSharedModule } from '@abp/ng.theme.shared';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { InspectorModule } from '@ngneat/inspector';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsModule } from '@ngxs/store';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { APP_ROUTE_PROVIDER } from './route.provider';
import { AccountConfigModule } from '@fs-tw/account/config';

const INSPECTION_TOOLS = [
  // NgxsLoggerPluginModule.forRoot({ disabled: true }),
  // InspectorModule.forRoot(),
];

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CoreModule.forRoot({
      environment,
      registerLocaleFn: registerLocale(),
      sendNullsAsQueryParam: false,
      skipGetAppConfiguration: false,
    }),
    ThemeSharedModule.forRoot(),
    IdentityConfigModule.forRoot(),
    TenantManagementConfigModule.forRoot(),
    SettingManagementConfigModule.forRoot(),
    AccountConfigModule.forRoot(),
    EmailingConfigModule.forRoot(),
    NgxsModule.forRoot(),
    ThemeAlainModule.forRoot(),
    ...(environment.production || environment.test ? [] : INSPECTION_TOOLS),
  ],
  providers: [APP_ROUTE_PROVIDER],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
