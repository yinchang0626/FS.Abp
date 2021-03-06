import { AuthService } from '../../services/auth.service';
import { ToasterService } from '@abp/ng.theme.shared';
import { Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Store } from '@ngxs/store';
import { OAuthService } from 'angular-oauth2-oidc';
import { AccountService } from '../../services/account.service';
import { eAccountComponents } from '../../enums/components';
export declare class RegisterComponent implements OnInit {
    private fb;
    private accountService;
    private oauthService;
    private store;
    private toasterService;
    private authService;
    private injector;
    form: FormGroup;
    inProgress: boolean;
    isSelfRegistrationEnabled: boolean;
    authWrapperKey: eAccountComponents;
    constructor(fb: FormBuilder, accountService: AccountService, oauthService: OAuthService, store: Store, toasterService: ToasterService, authService: AuthService, injector: Injector);
    ngOnInit(): void;
    onSubmit(): void;
}
