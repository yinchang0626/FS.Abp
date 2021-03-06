import { AuthFlowStrategy, RestService, ConfigStateService, AbpApplicationConfigurationService, AUTH_FLOW_STRATEGY, EnvironmentService, SessionStateService, GetProfile, ProfileState, DynamicLayoutComponent, ReplaceableRouteContainerComponent, AuthGuard, SubscriptionService, MultiTenancyService, ChangePassword, UpdateProfile, LazyModuleFactory, CoreModule } from '@abp/ng.core';
import { ToasterService, fadeIn, getPasswordValidators, ThemeSharedModule } from '@abp/ng.theme.shared';
import { ɵɵdefineInjectable, ɵɵinject, INJECTOR, Injectable, Injector, Optional, Inject, Component, NgModule, Input, InjectionToken } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { comparePasswords, NgxValidateCoreModule } from '@ngx-validate/core';
import { Router, RouterModule } from '@angular/router';
import { __awaiter } from 'tslib';
import { HttpHeaders } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { from, throwError } from 'rxjs';
import { tap, switchMap, take, catchError, finalize } from 'rxjs/operators';
import snq from 'snq';
import { Validators, FormBuilder, FormControl } from '@angular/forms';
import { Store } from '@ngxs/store';
import { trigger, transition, useAnimation } from '@angular/animations';

const oAuthStorage = localStorage;
class AuthPasswordFlowStrategy extends AuthFlowStrategy {
    constructor() {
        super(...arguments);
        this.isInternalAuth = true;
    }
    login() {
        const router = this.injector.get(Router);
        router.navigateByUrl('/account/login');
    }
    checkIfInternalAuth() {
        return true;
    }
    logout() {
        const rest = this.injector.get(RestService);
        const configStateService = this.injector.get(ConfigStateService);
        const abpApplicationConfigurationService = this.injector.get(AbpApplicationConfigurationService);
        const issuer = configStateService.getDeep('environment.oAuthConfig.issuer');
        return rest
            .request({
            method: 'GET',
            url: '/api/account/logout',
        }, null, issuer)
            .pipe(tap(() => this.oAuthService.logOut()), switchMap(() => {
            return abpApplicationConfigurationService.get()
                .pipe(tap(x => configStateService.setState(x)));
        }));
    }
    destroy() { }
}

class AuthService {
    constructor(injector, environment, oAuthService, abpApplicationConfigurationService, router, sessionStateService, configStateService, options) {
        this.injector = injector;
        this.environment = environment;
        this.oAuthService = oAuthService;
        this.abpApplicationConfigurationService = abpApplicationConfigurationService;
        this.router = router;
        this.sessionStateService = sessionStateService;
        this.configStateService = configStateService;
        this.options = options;
        this.setStrategy = () => {
            const flow = this.environment.getEnvironment().oAuthConfig.responseType || 'password';
            if (this.flow === flow)
                return;
            if (this.strategy)
                this.strategy.destroy();
            this.flow = flow;
            if (flow === 'password') {
                this.strategy = new AuthPasswordFlowStrategy(this.injector);
            }
            else {
                this.strategy = AUTH_FLOW_STRATEGY.Code(this.injector);
            }
        };
        this.setStrategy();
        this.listenToSetEnvironment();
    }
    initLogin() {
        this.strategy.login();
    }
    get isInternalAuth() {
        return this.strategy.isInternalAuth;
    }
    listenToSetEnvironment() {
        this.environment.createOnUpdateStream(state => state.oAuthConfig).subscribe(this.setStrategy);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.strategy.init();
        });
    }
    logout() {
        return this.strategy.logout();
    }
    login(username, password) {
        const tenant = this.sessionStateService.getTenant();
        return from(this.oAuthService.fetchTokenUsingPasswordFlow(username, password, new HttpHeaders(Object.assign({}, (tenant && tenant.id && { __tenant: tenant.id }))))).pipe(switchMap(() => {
            return this.abpApplicationConfigurationService.get()
                .pipe(tap(x => this.configStateService.setState(x)));
        }), tap(() => {
            const redirectUrl = snq(() => window.history.state.redirectUrl) || (this.options || {}).redirectUrl || '/';
            this.router.navigateByUrl(redirectUrl);
        }), take(1));
    }
}
AuthService.ɵprov = ɵɵdefineInjectable({ factory: function AuthService_Factory() { return new AuthService(ɵɵinject(INJECTOR), ɵɵinject(EnvironmentService), ɵɵinject(OAuthService), ɵɵinject(AbpApplicationConfigurationService), ɵɵinject(Router), ɵɵinject(SessionStateService), ɵɵinject(ConfigStateService), ɵɵinject("ACCOUNT_OPTIONS", 8)); }, token: AuthService, providedIn: "root" });
AuthService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root'
            },] }
];
AuthService.ctorParameters = () => [
    { type: Injector },
    { type: EnvironmentService },
    { type: OAuthService },
    { type: AbpApplicationConfigurationService },
    { type: Router },
    { type: SessionStateService },
    { type: ConfigStateService },
    { type: undefined, decorators: [{ type: Optional }, { type: Inject, args: ['ACCOUNT_OPTIONS',] }] }
];

//import { AuthService, SetRemember, ConfigState } from '@abp/ng.core';
const { maxLength, minLength, required } = Validators;
class LoginComponent {
    constructor(fb, oauthService, store, toasterService, authService, configStateService) {
        this.fb = fb;
        this.oauthService = oauthService;
        this.store = store;
        this.toasterService = toasterService;
        this.authService = authService;
        this.configStateService = configStateService;
        this.isSelfRegistrationEnabled = true;
        this.authWrapperKey = "Account.AuthWrapperComponent" /* AuthWrapper */;
    }
    ngOnInit() {
        this.isSelfRegistrationEnabled =
            (this.configStateService.getSetting('Abp.Account.IsSelfRegistrationEnabled') || '').toLowerCase() !== 'false';
        this.form = this.fb.group({
            username: ['', [required, maxLength(255)]],
            password: ['', [required, maxLength(128)]],
            remember: [false],
        });
    }
    onSubmit() {
        if (this.form.invalid)
            return;
        this.inProgress = true;
        this.authService
            .login(this.form.get('username').value, this.form.get('password').value)
            .pipe(catchError(err => {
            this.toasterService.error(snq(() => err.error.error_description) ||
                snq(() => err.error.error.message, 'AbpAccount::DefaultErrorMessage'), 'Error', { life: 7000 });
            return throwError(err);
        }), finalize(() => (this.inProgress = false)))
            .subscribe(() => {
            //this.store.dispatch(new SetRemember(this.form.get('remember').value));
        });
    }
}
LoginComponent.decorators = [
    { type: Component, args: [{
                selector: 'abp-login',
                template: "<abp-auth-wrapper\r\n  *abpReplaceableTemplate=\"{\r\n    componentKey: authWrapperKey,\r\n    inputs: {\r\n      mainContentRef: { value: mainContentRef },\r\n      cancelContentRef: { value: cancelContentRef }\r\n    }\r\n  }\"\r\n  [mainContentRef]=\"mainContentRef\"\r\n  [cancelContentRef]=\"cancelContentRef\"\r\n>\r\n</abp-auth-wrapper>\r\n<ng-template #mainContentRef>\r\n  <h4>{{ 'AbpAccount::Login' | abpLocalization }}</h4>\r\n  <strong *ngIf=\"isSelfRegistrationEnabled\">\r\n    {{ 'AbpAccount::AreYouANewUser' | abpLocalization }}\r\n    <a class=\"text-decoration-none\" routerLink=\"/account/register\">{{\r\n      'AbpAccount::Register' | abpLocalization\r\n    }}</a>\r\n  </strong>\r\n  <form [formGroup]=\"form\" (ngSubmit)=\"onSubmit()\" validateOnSubmit class=\"mt-4\">\r\n    <div class=\"form-group\">\r\n      <label for=\"login-input-user-name-or-email-address\">{{\r\n        'AbpAccount::UserNameOrEmailAddress' | abpLocalization\r\n      }}</label>\r\n      <input\r\n        class=\"form-control\"\r\n        type=\"text\"\r\n        id=\"login-input-user-name-or-email-address\"\r\n        formControlName=\"username\"\r\n        autocomplete=\"username\"\r\n        autofocus\r\n      />\r\n    </div>\r\n    <div class=\"form-group\">\r\n      <label for=\"login-input-password\">{{ 'AbpAccount::Password' | abpLocalization }}</label>\r\n      <input\r\n        class=\"form-control\"\r\n        type=\"password\"\r\n        id=\"login-input-password\"\r\n        formControlName=\"password\"\r\n        autocomplete=\"current-password\"\r\n      />\r\n    </div>\r\n    <div class=\"form-check\" validationTarget validationStyle>\r\n      <label class=\"form-check-label\" for=\"login-input-remember-me\">\r\n        <input\r\n          class=\"form-check-input\"\r\n          type=\"checkbox\"\r\n          id=\"login-input-remember-me\"\r\n          formControlName=\"remember\"\r\n        />\r\n        {{ 'AbpAccount::RememberMe' | abpLocalization }}\r\n      </label>\r\n    </div>\r\n    <abp-button\r\n      [loading]=\"inProgress\"\r\n      buttonType=\"submit\"\r\n      name=\"Action\"\r\n      buttonClass=\"btn-block btn-lg mt-3 btn btn-primary\"\r\n    >\r\n      {{ 'AbpAccount::Login' | abpLocalization }}\r\n    </abp-button>\r\n  </form>\r\n</ng-template>\r\n<ng-template #cancelContentRef>\r\n  <div class=\"card-footer text-center border-0\">\r\n    <a routerLink=\"/\">\r\n      <button type=\"button\" name=\"Action\" value=\"Cancel\" class=\"px-2 py-0 btn btn-link\">\r\n        {{ 'AbpAccount::Cancel' | abpLocalization }}\r\n      </button>\r\n    </a>\r\n  </div>\r\n</ng-template>\r\n"
            },] }
];
LoginComponent.ctorParameters = () => [
    { type: FormBuilder },
    { type: OAuthService },
    { type: Store },
    { type: ToasterService },
    { type: AuthService },
    { type: ConfigStateService }
];

class ManageProfileComponent {
    constructor(store) {
        this.store = store;
        this.selectedTab = 0;
        this.changePasswordKey = "Account.ChangePasswordComponent" /* ChangePassword */;
        this.personalSettingsKey = "Account.PersonalSettingsComponent" /* PersonalSettings */;
    }
    ngOnInit() {
        this.store.dispatch(new GetProfile()).subscribe(() => {
            this.isProfileLoaded = true;
            if (this.store.selectSnapshot(ProfileState.getProfile).isExternal) {
                this.hideChangePasswordTab = true;
                this.selectedTab = 1;
            }
        });
    }
}
ManageProfileComponent.decorators = [
    { type: Component, args: [{
                selector: 'abp-manage-profile',
                template: "<div id=\"AbpContentToolbar\"></div>\r\n\r\n<div class=\"card border-0 shadow-sm min-h-400\" [abpLoading]=\"!isProfileLoaded\">\r\n  <div class=\"card-body\">\r\n    <div class=\"row\">\r\n      <div class=\"col-12 col-md-3\">\r\n        <ul class=\"nav flex-column nav-pills\" id=\"nav-tab\" role=\"tablist\">\r\n          <li\r\n            *ngIf=\"!hideChangePasswordTab && isProfileLoaded\"\r\n            class=\"nav-item\"\r\n            (click)=\"selectedTab = 0\"\r\n          >\r\n            <a\r\n              class=\"nav-link\"\r\n              [ngClass]=\"{ active: selectedTab === 0 }\"\r\n              role=\"tab\"\r\n              href=\"javascript:void(0)\"\r\n              >{{ 'AbpUi::ChangePassword' | abpLocalization }}</a\r\n            >\r\n          </li>\r\n          <li class=\"nav-item mb-2\" (click)=\"selectedTab = 1\">\r\n            <a\r\n              class=\"nav-link\"\r\n              [ngClass]=\"{ active: selectedTab === 1 }\"\r\n              role=\"tab\"\r\n              href=\"javascript:void(0)\"\r\n              >{{ 'AbpAccount::PersonalSettings' | abpLocalization }}</a\r\n            >\r\n          </li>\r\n        </ul>\r\n      </div>\r\n      <div *ngIf=\"isProfileLoaded\" class=\"col-12 col-md-9\">\r\n        <div class=\"tab-content\" *ngIf=\"selectedTab === 0\" [@fadeIn]>\r\n          <div class=\"tab-pane active\" role=\"tabpanel\">\r\n            <h4>\r\n              {{ 'AbpIdentity::ChangePassword' | abpLocalization }}\r\n              <hr />\r\n            </h4>\r\n            <abp-change-password-form\r\n              *abpReplaceableTemplate=\"{ componentKey: changePasswordKey }\"\r\n            ></abp-change-password-form>\r\n          </div>\r\n        </div>\r\n        <div class=\"tab-content\" *ngIf=\"selectedTab === 1\" [@fadeIn]>\r\n          <div class=\"tab-pane active\" role=\"tabpanel\">\r\n            <h4>\r\n              {{ 'AbpIdentity::PersonalSettings' | abpLocalization }}\r\n              <hr />\r\n            </h4>\r\n            <abp-personal-settings-form\r\n              *abpReplaceableTemplate=\"{ componentKey: personalSettingsKey }\"\r\n            ></abp-personal-settings-form>\r\n          </div>\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n",
                animations: [trigger('fadeIn', [transition(':enter', useAnimation(fadeIn))])],
                styles: [`
      .min-h-400 {
        min-height: 400px;
      }
    `]
            },] }
];
ManageProfileComponent.ctorParameters = () => [
    { type: Store }
];

class AccountService {
    constructor(rest) {
        this.rest = rest;
        this.apiName = 'AbpAccount';
    }
    findTenant(tenantName) {
        const request = {
            method: 'GET',
            url: `/api/abp/multi-tenancy/tenants/by-name/${tenantName}`,
        };
        return this.rest.request(request, { apiName: this.apiName });
    }
    register(body) {
        const request = {
            method: 'POST',
            url: '/api/account/register',
            body,
        };
        return this.rest.request(request, {
            skipHandleError: true,
            apiName: this.apiName,
        });
    }
}
AccountService.ɵprov = ɵɵdefineInjectable({ factory: function AccountService_Factory() { return new AccountService(ɵɵinject(RestService)); }, token: AccountService, providedIn: "root" });
AccountService.decorators = [
    { type: Injectable, args: [{
                providedIn: 'root',
            },] }
];
AccountService.ctorParameters = () => [
    { type: RestService }
];

//import { AuthService, ConfigState } from '@abp/ng.core';
const { maxLength: maxLength$1, required: required$1, email } = Validators;
class RegisterComponent {
    constructor(fb, accountService, oauthService, store, toasterService, authService, injector) {
        this.fb = fb;
        this.accountService = accountService;
        this.oauthService = oauthService;
        this.store = store;
        this.toasterService = toasterService;
        this.authService = authService;
        this.injector = injector;
        this.isSelfRegistrationEnabled = true;
        this.authWrapperKey = "Account.AuthWrapperComponent" /* AuthWrapper */;
    }
    ngOnInit() {
        // this.isSelfRegistrationEnabled =
        //   (
        //     this.store.selectSnapshot(
        //       ConfigState.getSetting('Abp.Account.IsSelfRegistrationEnabled'),
        //     ) || ''
        //   ).toLowerCase() !== 'false';
        // if (!this.isSelfRegistrationEnabled) {
        //   this.toasterService.warn(
        //     {
        //       key: 'AbpAccount::SelfRegistrationDisabledMessage',
        //       defaultValue: 'Self registration is disabled.',
        //     },
        //     null,
        //     { life: 10000 },
        //   );
        //   return;
        // }
        this.form = this.fb.group({
            username: ['', [required$1, maxLength$1(255)]],
            password: ['', [required$1, ...getPasswordValidators(this.injector)]],
            email: ['', [required$1, email]],
        });
    }
    onSubmit() {
        if (this.form.invalid)
            return;
        this.inProgress = true;
        const newUser = {
            userName: this.form.get('username').value,
            password: this.form.get('password').value,
            emailAddress: this.form.get('email').value,
            appName: 'Angular',
        };
        this.accountService
            .register(newUser)
            .pipe(switchMap(() => this.authService.login(newUser.userName, newUser.password)), catchError(err => {
            this.toasterService.error(snq(() => err.error.error_description) ||
                snq(() => err.error.error.message, 'AbpAccount::DefaultErrorMessage'), 'Error', { life: 7000 });
            return throwError(err);
        }), finalize(() => (this.inProgress = false)))
            .subscribe();
    }
}
RegisterComponent.decorators = [
    { type: Component, args: [{
                selector: 'abp-register',
                template: "<abp-auth-wrapper\r\n  *abpReplaceableTemplate=\"{\r\n    componentKey: authWrapperKey,\r\n    inputs: {\r\n      mainContentRef: { value: mainContentRef }\r\n    }\r\n  }\"\r\n  [mainContentRef]=\"mainContentRef\"\r\n>\r\n</abp-auth-wrapper>\r\n<ng-template #mainContentRef>\r\n  <h4>{{ 'AbpAccount::Register' | abpLocalization }}</h4>\r\n  <strong>\r\n    {{ 'AbpAccount::AlreadyRegistered' | abpLocalization }}\r\n    <a class=\"text-decoration-none\" routerLink=\"/account/login\">{{\r\n      'AbpAccount::Login' | abpLocalization\r\n    }}</a>\r\n  </strong>\r\n  <form\r\n    *ngIf=\"isSelfRegistrationEnabled\"\r\n    [formGroup]=\"form\"\r\n    (ngSubmit)=\"onSubmit()\"\r\n    validateOnSubmit\r\n    class=\"mt-4\"\r\n  >\r\n    <div class=\"form-group\">\r\n      <label for=\"input-user-name\">{{ 'AbpAccount::UserName' | abpLocalization }}</label\r\n      ><span> * </span\r\n      ><input\r\n        autofocus\r\n        type=\"text\"\r\n        id=\"input-user-name\"\r\n        class=\"form-control\"\r\n        formControlName=\"username\"\r\n        autocomplete=\"username\"\r\n      />\r\n    </div>\r\n    <div class=\"form-group\">\r\n      <label for=\"input-email-address\">{{ 'AbpAccount::EmailAddress' | abpLocalization }}</label\r\n      ><span> * </span\r\n      ><input type=\"email\" id=\"input-email-address\" class=\"form-control\" formControlName=\"email\" />\r\n    </div>\r\n    <div class=\"form-group\">\r\n      <label for=\"input-password\">{{ 'AbpAccount::Password' | abpLocalization }}</label\r\n      ><span> * </span\r\n      ><input\r\n        type=\"password\"\r\n        id=\"input-password\"\r\n        class=\"form-control\"\r\n        formControlName=\"password\"\r\n        autocomplete=\"current-password\"\r\n      />\r\n    </div>\r\n    <abp-button\r\n      [loading]=\"inProgress\"\r\n      buttonType=\"submit\"\r\n      name=\"Action\"\r\n      buttonClass=\"btn-block btn-lg mt-3 btn btn-primary\"\r\n    >\r\n      {{ 'AbpAccount::Register' | abpLocalization }}\r\n    </abp-button>\r\n  </form>\r\n</ng-template>\r\n"
            },] }
];
RegisterComponent.ctorParameters = () => [
    { type: FormBuilder },
    { type: AccountService },
    { type: OAuthService },
    { type: Store },
    { type: ToasterService },
    { type: AuthService },
    { type: Injector }
];

//import { AuthService } from '@abp/ng.core';
class AuthenticationFlowGuard {
    constructor(authService) {
        this.authService = authService;
    }
    canActivate() {
        if (this.authService.isInternalAuth)
            return true;
        this.authService.initLogin();
        return false;
    }
}
AuthenticationFlowGuard.decorators = [
    { type: Injectable }
];
AuthenticationFlowGuard.ctorParameters = () => [
    { type: AuthService }
];

const ɵ0 = {
    replaceableComponent: {
        key: "Account.LoginComponent" /* Login */,
        defaultComponent: LoginComponent,
    },
}, ɵ1 = {
    replaceableComponent: {
        key: "Account.RegisterComponent" /* Register */,
        defaultComponent: RegisterComponent,
    },
}, ɵ2 = {
    replaceableComponent: {
        key: "Account.ManageProfileComponent" /* ManageProfile */,
        defaultComponent: ManageProfileComponent,
    },
};
const routes = [
    { path: '', pathMatch: 'full', redirectTo: 'login' },
    {
        path: '',
        component: DynamicLayoutComponent,
        children: [
            {
                path: 'login',
                component: ReplaceableRouteContainerComponent,
                canActivate: [AuthenticationFlowGuard],
                data: ɵ0,
            },
            {
                path: 'register',
                component: ReplaceableRouteContainerComponent,
                canActivate: [AuthenticationFlowGuard],
                data: ɵ1,
            },
            {
                path: 'manage-profile',
                component: ReplaceableRouteContainerComponent,
                canActivate: [AuthGuard],
                data: ɵ2,
            },
        ],
    },
];
class AccountRoutingModule {
}
AccountRoutingModule.decorators = [
    { type: NgModule, args: [{
                imports: [RouterModule.forChild(routes)],
                exports: [RouterModule],
            },] }
];

class AuthWrapperComponent {
    constructor(multiTenancy, store, subscription, configStateService) {
        this.multiTenancy = multiTenancy;
        this.store = store;
        this.subscription = subscription;
        this.configStateService = configStateService;
        this.enableLocalLogin = true;
        this.tenantBoxKey = "Account.TenantBoxComponent" /* TenantBox */;
        this.isMultiTenancyEnabled$ = this.configStateService.getDeep$('multiTenancy.isEnabled');
    }
    ngOnInit() {
        this.subscription.addOne(this.configStateService.getSetting$('Abp.Account.EnableLocalLogin'), value => {
            if (value) {
                this.enableLocalLogin = value.toLowerCase() !== 'false';
            }
        });
    }
}
AuthWrapperComponent.decorators = [
    { type: Component, args: [{
                selector: 'abp-auth-wrapper',
                template: "<div class=\"row\">\r\n  <div class=\"mx-auto col col-md-5\">\r\n    <ng-container *ngIf=\"(isMultiTenancyEnabled$ | async) && multiTenancy.isTenantBoxVisible\">\r\n      <abp-tenant-box *abpReplaceableTemplate=\"{ componentKey: tenantBoxKey }\"></abp-tenant-box>\r\n    </ng-container>\r\n\r\n    <div class=\"abp-account-container\">\r\n      <div\r\n        *ngIf=\"enableLocalLogin; else disableLocalLoginTemplate\"\r\n        class=\"card mt-3 shadow-sm rounded\"\r\n      >\r\n        <div class=\"card-body p-5\">\r\n          <ng-content *ngTemplateOutlet=\"mainContentRef\"></ng-content>\r\n        </div>\r\n        <ng-content *ngTemplateOutlet=\"cancelContentRef\"></ng-content>\r\n      </div>\r\n    </div>\r\n  </div>\r\n</div>\r\n\r\n<ng-template #disableLocalLoginTemplate>\r\n  <div class=\"alert alert-warning\">\r\n    <strong>{{ 'AbpAccount::InvalidLoginRequest' | abpLocalization }}</strong>\r\n    {{ 'AbpAccount::ThereAreNoLoginSchemesConfiguredForThisClient' | abpLocalization }}\r\n  </div>\r\n</ng-template>\r\n",
                exportAs: 'abpAuthWrapper',
                providers: [SubscriptionService]
            },] }
];
AuthWrapperComponent.ctorParameters = () => [
    { type: MultiTenancyService },
    { type: Store },
    { type: SubscriptionService },
    { type: ConfigStateService }
];
AuthWrapperComponent.propDecorators = {
    mainContentRef: [{ type: Input }],
    cancelContentRef: [{ type: Input }]
};

const { required: required$2 } = Validators;
const PASSWORD_FIELDS = ['newPassword', 'repeatNewPassword'];
class ChangePasswordComponent {
    constructor(fb, store, toasterService, injector) {
        this.fb = fb;
        this.store = store;
        this.toasterService = toasterService;
        this.injector = injector;
        this.mapErrorsFn = (errors, groupErrors, control) => {
            if (PASSWORD_FIELDS.indexOf(String(control.name)) < 0)
                return errors;
            return errors.concat(groupErrors.filter(({ key }) => key === 'passwordMismatch'));
        };
    }
    ngOnInit() {
        this.hideCurrentPassword = !this.store.selectSnapshot(ProfileState.getProfile).hasPassword;
        const passwordValidations = getPasswordValidators(this.injector);
        this.form = this.fb.group({
            password: ['', required$2],
            newPassword: [
                '',
                {
                    validators: [required$2, ...passwordValidations],
                },
            ],
            repeatNewPassword: [
                '',
                {
                    validators: [required$2, ...passwordValidations],
                },
            ],
        }, {
            validators: [comparePasswords(PASSWORD_FIELDS)],
        });
        if (this.hideCurrentPassword)
            this.form.removeControl('password');
    }
    onSubmit() {
        if (this.form.invalid)
            return;
        this.inProgress = true;
        this.store
            .dispatch(new ChangePassword(Object.assign(Object.assign({}, (!this.hideCurrentPassword && { currentPassword: this.form.get('password').value })), { newPassword: this.form.get('newPassword').value })))
            .pipe(finalize(() => (this.inProgress = false)))
            .subscribe({
            next: () => {
                this.form.reset();
                this.toasterService.success('AbpAccount::PasswordChangedMessage', '', {
                    life: 5000,
                });
                if (this.hideCurrentPassword) {
                    this.hideCurrentPassword = false;
                    this.form.addControl('password', new FormControl('', [required$2]));
                }
            },
            error: err => {
                this.toasterService.error(snq(() => err.error.error.message, 'AbpAccount::DefaultErrorMessage'));
            },
        });
    }
}
ChangePasswordComponent.decorators = [
    { type: Component, args: [{
                selector: 'abp-change-password-form',
                template: "<form [formGroup]=\"form\" (ngSubmit)=\"onSubmit()\" [mapErrorsFn]=\"mapErrorsFn\" validateOnSubmit>\r\n  <div *ngIf=\"!hideCurrentPassword\" class=\"form-group\">\r\n    <label for=\"current-password\">{{\r\n      'AbpIdentity::DisplayName:CurrentPassword' | abpLocalization\r\n    }}</label\r\n    ><span> * </span\r\n    ><input\r\n      type=\"password\"\r\n      id=\"current-password\"\r\n      class=\"form-control\"\r\n      formControlName=\"password\"\r\n      autofocus\r\n      autocomplete=\"current-password\"\r\n    />\r\n  </div>\r\n  <div class=\"form-group\">\r\n    <label for=\"new-password\">{{ 'AbpIdentity::DisplayName:NewPassword' | abpLocalization }}</label\r\n    ><span> * </span\r\n    ><input\r\n      type=\"password\"\r\n      id=\"new-password\"\r\n      class=\"form-control\"\r\n      formControlName=\"newPassword\"\r\n      autocomplete=\"new-password\"\r\n    />\r\n  </div>\r\n  <div class=\"form-group\">\r\n    <label for=\"confirm-new-password\">{{\r\n      'AbpIdentity::DisplayName:NewPasswordConfirm' | abpLocalization\r\n    }}</label\r\n    ><span> * </span\r\n    ><input\r\n      type=\"password\"\r\n      id=\"confirm-new-password\"\r\n      class=\"form-control\"\r\n      formControlName=\"repeatNewPassword\"\r\n      autocomplete=\"new-password\"\r\n    />\r\n  </div>\r\n  <abp-button\r\n    iconClass=\"fa fa-check\"\r\n    buttonClass=\"btn btn-primary color-white\"\r\n    buttonType=\"submit\"\r\n    [loading]=\"inProgress\"\r\n    [disabled]=\"form?.invalid\"\r\n    >{{ 'AbpIdentity::Save' | abpLocalization }}</abp-button\r\n  >\r\n</form>\r\n",
                exportAs: 'abpChangePasswordForm'
            },] }
];
ChangePasswordComponent.ctorParameters = () => [
    { type: FormBuilder },
    { type: Store },
    { type: ToasterService },
    { type: Injector }
];

const { maxLength: maxLength$2, required: required$3, email: email$1 } = Validators;
class PersonalSettingsComponent {
    constructor(fb, store, toasterService) {
        this.fb = fb;
        this.store = store;
        this.toasterService = toasterService;
    }
    ngOnInit() {
        this.buildForm();
    }
    buildForm() {
        const profile = this.store.selectSnapshot(ProfileState.getProfile);
        this.form = this.fb.group({
            userName: [profile.userName, [required$3, maxLength$2(256)]],
            email: [profile.email, [required$3, email$1, maxLength$2(256)]],
            name: [profile.name || '', [maxLength$2(64)]],
            surname: [profile.surname || '', [maxLength$2(64)]],
            phoneNumber: [profile.phoneNumber || '', [maxLength$2(16)]],
        });
    }
    submit() {
        if (this.form.invalid)
            return;
        this.inProgress = true;
        this.store
            .dispatch(new UpdateProfile(this.form.value))
            .pipe(finalize(() => (this.inProgress = false)))
            .subscribe(() => {
            this.toasterService.success('AbpAccount::PersonalSettingsSaved', 'Success', { life: 5000 });
        });
    }
}
PersonalSettingsComponent.decorators = [
    { type: Component, args: [{
                selector: 'abp-personal-settings-form',
                template: "<form validateOnSubmit *ngIf=\"form\" [formGroup]=\"form\" (ngSubmit)=\"submit()\">\r\n  <div class=\"form-group\">\r\n    <label for=\"username\">{{ 'AbpIdentity::DisplayName:UserName' | abpLocalization }}</label\r\n    ><span> * </span\r\n    ><input\r\n      type=\"text\"\r\n      id=\"username\"\r\n      class=\"form-control\"\r\n      formControlName=\"userName\"\r\n      autofocus\r\n      (keydown.space)=\"$event.preventDefault()\"\r\n    />\r\n  </div>\r\n  <div class=\"row\">\r\n    <div class=\"col col-md-6\">\r\n      <div class=\"form-group\">\r\n        <label for=\"name\">{{ 'AbpIdentity::DisplayName:Name' | abpLocalization }}</label\r\n        ><input type=\"text\" id=\"name\" class=\"form-control\" formControlName=\"name\" />\r\n      </div>\r\n    </div>\r\n    <div class=\"col col-md-6\">\r\n      <div class=\"form-group\">\r\n        <label for=\"surname\">{{ 'AbpIdentity::DisplayName:Surname' | abpLocalization }}</label\r\n        ><input type=\"text\" id=\"surname\" class=\"form-control\" formControlName=\"surname\" />\r\n      </div>\r\n    </div>\r\n  </div>\r\n  <div class=\"form-group\">\r\n    <label for=\"email-address\">{{ 'AbpIdentity::DisplayName:Email' | abpLocalization }}</label\r\n    ><span> * </span\r\n    ><input type=\"text\" id=\"email-address\" class=\"form-control\" formControlName=\"email\" />\r\n  </div>\r\n  <div class=\"form-group\">\r\n    <label for=\"phone-number\">{{ 'AbpIdentity::DisplayName:PhoneNumber' | abpLocalization }}</label\r\n    ><input type=\"text\" id=\"phone-number\" class=\"form-control\" formControlName=\"phoneNumber\" />\r\n  </div>\r\n  <abp-button\r\n    buttonType=\"submit\"\r\n    iconClass=\"fa fa-check\"\r\n    buttonClass=\"btn btn-primary color-white\"\r\n    [loading]=\"inProgress\"\r\n    [disabled]=\"form?.invalid\"\r\n  >\r\n    {{ 'AbpIdentity::Save' | abpLocalization }}</abp-button\r\n  >\r\n</form>\r\n",
                exportAs: 'abpPersonalSettingsForm'
            },] }
];
PersonalSettingsComponent.ctorParameters = () => [
    { type: FormBuilder },
    { type: Store },
    { type: ToasterService }
];

// import { ABP, GetAppConfiguration, SessionState, SetTenant } from '@abp/ng.core';
class TenantBoxComponent {
    constructor(toasterService, accountService, sessionStateService, subscriptionService, abpApplicationConfigurationService, configStateService) {
        this.toasterService = toasterService;
        this.accountService = accountService;
        this.sessionStateService = sessionStateService;
        this.subscriptionService = subscriptionService;
        this.abpApplicationConfigurationService = abpApplicationConfigurationService;
        this.configStateService = configStateService;
        this.currentTenant$ = this.sessionStateService.getTenant$();
    }
    onSwitch() {
        const tenant = this.sessionStateService.getTenant(); //this.store.selectSnapshot(SessionState.getTenant);
        this.name = (tenant || {}).name;
        this.isModalVisible = true;
    }
    save() {
        if (!this.name) {
            this.setTenant(null);
            this.isModalVisible = false;
            return;
        }
        this.modalBusy = true;
        this.accountService
            .findTenant(this.name)
            .pipe(finalize(() => (this.modalBusy = false)))
            .subscribe(({ success, tenantId: id, name }) => {
            if (!success) {
                this.showError();
                return;
            }
            this.setTenant({ id, name });
            this.isModalVisible = false;
        });
    }
    setTenant(tenant) {
        this.sessionStateService.setTenant(tenant);
        this.subscriptionService.addOne(this.sessionStateService.getTenant$(), (x) => {
            this.abpApplicationConfigurationService.get().pipe(tap(x => this.configStateService.setState(x))).subscribe();
        });
    }
    showError() {
        this.toasterService.error('AbpUiMultiTenancy::GivenTenantIsNotAvailable', 'AbpUi::Error', {
            messageLocalizationParams: [this.name],
        });
    }
}
TenantBoxComponent.decorators = [
    { type: Component, args: [{
                selector: 'abp-tenant-box',
                template: "<ng-container *ngIf=\"(currentTenant$ | async) || {} as currentTenant\">\r\n  <div class=\"card shadow-sm rounded mb-3\">\r\n    <div class=\"card-body px-5\">\r\n      <div class=\"row\">\r\n        <div class=\"col\">\r\n          <span style=\"font-size: 0.8em;\" class=\"text-uppercase text-muted\">{{\r\n            'AbpUiMultiTenancy::Tenant' | abpLocalization\r\n          }}</span\r\n          ><br />\r\n          <h6 class=\"m-0 d-inline-block\">\r\n            <i>{{ currentTenant.name || ('AbpUiMultiTenancy::NotSelected' | abpLocalization) }}</i>\r\n          </h6>\r\n        </div>\r\n        <div class=\"col-auto\">\r\n          <a\r\n            id=\"AbpTenantSwitchLink\"\r\n            href=\"javascript:void(0);\"\r\n            class=\"btn btn-sm mt-3 btn-outline-primary\"\r\n            (click)=\"onSwitch()\"\r\n            >{{ 'AbpUiMultiTenancy::Switch' | abpLocalization }}</a\r\n          >\r\n        </div>\r\n      </div>\r\n    </div>\r\n  </div>\r\n\r\n  <abp-modal size=\"md\" [(visible)]=\"isModalVisible\" [busy]=\"modalBusy\">\r\n    <ng-template #abpHeader>\r\n      <h5>Switch Tenant</h5>\r\n    </ng-template>\r\n    <ng-template #abpBody>\r\n      <form (ngSubmit)=\"save()\">\r\n        <div class=\"mt-2\">\r\n          <div class=\"form-group\">\r\n            <label for=\"name\">{{ 'AbpUiMultiTenancy::Name' | abpLocalization }}</label>\r\n            <input\r\n              [(ngModel)]=\"name\"\r\n              type=\"text\"\r\n              id=\"name\"\r\n              name=\"tenant\"\r\n              class=\"form-control\"\r\n              autofocus\r\n            />\r\n          </div>\r\n          <p>{{ 'AbpUiMultiTenancy::SwitchTenantHint' | abpLocalization }}</p>\r\n        </div>\r\n      </form>\r\n    </ng-template>\r\n    <ng-template #abpFooter>\r\n      <button #abpClose type=\"button\" class=\"btn btn-secondary\">\r\n        {{ 'AbpTenantManagement::Cancel' | abpLocalization }}\r\n      </button>\r\n      <abp-button\r\n        type=\"abp-button\"\r\n        iconClass=\"fa fa-check\"\r\n        (click)=\"save()\"\r\n        [disabled]=\"currentTenant?.name === name\"\r\n      >\r\n        <span>{{ 'AbpTenantManagement::Save' | abpLocalization }}</span>\r\n      </abp-button>\r\n    </ng-template>\r\n  </abp-modal>\r\n</ng-container>\r\n"
            },] }
];
TenantBoxComponent.ctorParameters = () => [
    { type: ToasterService },
    { type: AccountService },
    { type: SessionStateService },
    { type: SubscriptionService },
    { type: AbpApplicationConfigurationService },
    { type: ConfigStateService }
];

const ACCOUNT_OPTIONS = new InjectionToken('ACCOUNT_OPTIONS');

function accountOptionsFactory(options) {
    return Object.assign({ redirectUrl: '/' }, options);
}

class ManageProfileGuard {
    constructor(environmentService) {
        this.environmentService = environmentService;
    }
    canActivate(_, __) {
        const env = this.environmentService.getEnvironment();
        if (env.oAuthConfig.responseType === 'code') {
            window.location.href = `${env.oAuthConfig.issuer}/Account/Manage?returnUrl=${window.location.href}`;
            return false;
        }
        else {
            return true;
        }
    }
}
ManageProfileGuard.decorators = [
    { type: Injectable }
];
ManageProfileGuard.ctorParameters = () => [
    { type: EnvironmentService }
];

class AccountModule {
    static forChild(options) {
        return {
            ngModule: AccountModule,
            providers: [
                AuthenticationFlowGuard,
                ManageProfileGuard,
                { provide: ACCOUNT_OPTIONS, useValue: options },
                {
                    provide: 'ACCOUNT_OPTIONS',
                    useFactory: accountOptionsFactory,
                    deps: [ACCOUNT_OPTIONS],
                },
            ],
        };
    }
    static forLazy(options) {
        return new LazyModuleFactory(AccountModule.forChild(options));
    }
}
AccountModule.decorators = [
    { type: NgModule, args: [{
                declarations: [
                    AuthWrapperComponent,
                    LoginComponent,
                    RegisterComponent,
                    TenantBoxComponent,
                    ChangePasswordComponent,
                    ManageProfileComponent,
                    PersonalSettingsComponent,
                ],
                imports: [
                    CoreModule,
                    AccountRoutingModule,
                    ThemeSharedModule,
                    NgbDropdownModule,
                    NgxValidateCoreModule,
                ],
                exports: [],
            },] }
];

/**
 * Generated bundle index. Do not edit.
 */

export { ACCOUNT_OPTIONS, AccountModule, AccountService, AuthService, AuthenticationFlowGuard, ChangePasswordComponent, LoginComponent, ManageProfileComponent, ManageProfileGuard, PersonalSettingsComponent, RegisterComponent, TenantBoxComponent, AuthWrapperComponent as ɵa, LoginComponent as ɵb, AuthService as ɵc, RegisterComponent as ɵd, AccountService as ɵe, TenantBoxComponent as ɵf, ChangePasswordComponent as ɵg, ManageProfileComponent as ɵh, PersonalSettingsComponent as ɵi, AccountRoutingModule as ɵj, AuthenticationFlowGuard as ɵk, ManageProfileGuard as ɵm, ACCOUNT_OPTIONS as ɵn, accountOptionsFactory as ɵo };
//# sourceMappingURL=fs-tw-account.js.map
