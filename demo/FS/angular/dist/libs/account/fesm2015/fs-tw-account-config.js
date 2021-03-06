import { APP_INITIALIZER, NgModule } from '@angular/core';
import { RoutesService } from '@abp/ng.core';

const ACCOUNT_ROUTE_PROVIDERS = [
    { provide: APP_INITIALIZER, useFactory: configureRoutes, deps: [RoutesService], multi: true },
];
function configureRoutes(routes) {
    return () => {
        routes.add([
            {
                layout: "account" /* account */,
                path: '/account',
                name: "AbpAccount::Menu:Account" /* Account */,
                invisible: true,
                order: 1,
            },
            {
                path: '/account/login',
                name: "AbpAccount::Login" /* Login */,
                parentName: "AbpAccount::Menu:Account" /* Account */,
                order: 1,
            },
            {
                path: '/account/register',
                name: "AbpAccount::Register" /* Register */,
                parentName: "AbpAccount::Menu:Account" /* Account */,
                order: 2,
            },
            {
                layout: "application" /* application */,
                path: '/account/manage-profile',
                name: "AbpAccount::ManageYourProfile" /* ManageProfile */,
                parentName: "AbpAccount::Menu:Account" /* Account */,
                order: 3,
            },
        ]);
    };
}

class AccountConfigModule {
    static forRoot() {
        return {
            ngModule: AccountConfigModule,
            providers: [ACCOUNT_ROUTE_PROVIDERS],
        };
    }
}
AccountConfigModule.decorators = [
    { type: NgModule }
];

/**
 * Generated bundle index. Do not edit.
 */

export { ACCOUNT_ROUTE_PROVIDERS, AccountConfigModule, configureRoutes, ACCOUNT_ROUTE_PROVIDERS as ɵa, configureRoutes as ɵb };
//# sourceMappingURL=fs-tw-account-config.js.map
