import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ErrorHandler, LOCALE_ID, NgModule } from '@angular/core';
import { MatMomentDateModule, MomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FeatureAboutModule } from '@vioc-angular/central-ui/feature-about';
import { GlobalErrorHandler } from '@vioc-angular/central-ui/feature-global-error-handler';
import { UiFooterModule } from '@vioc-angular/layout/ui-footer';
import { UiHeaderModule } from '@vioc-angular/layout/ui-header';
import { UiSidenavModule } from '@vioc-angular/layout/ui-sidenav';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
//  This needs to be put into a feature module that configures all
// eslint-disable-next-line
import { USER_MANAGER_SETTINGS_TOKEN } from '@vioc-angular/security/data-access-security';
import { FeatureLogoutWhenIdleModule } from '@vioc-angular/security/feature-logout-when-idle';
import { OAuth2Interceptor } from '@vioc-angular/security/util-authentication';
import { FEATURE_CONFIGURATION_TOKEN, FeatureConfiguration } from '@vioc-angular/shared/common-feature-flag';
import { ConsoleLogPublisher, LogLevel, Loggers, StorageLogLevelProvider } from '@vioc-angular/shared/common-logging';
import { UiMessageModule } from '@vioc-angular/shared/ui-message';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import {
    GA_TRACKING_ID,
    GoogleAnalyticsService,
    UtilGoogleAnalyticsModule,
} from '@vioc-angular/shared/util-google-analytics';
import { UserManagerSettings, WebStorageStateStore } from 'oidc-client-ts';
import { of } from 'rxjs';
import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Configure Logging
Loggers.publishers = [new ConsoleLogPublisher()];
Loggers.logLevelProvider = new StorageLogLevelProvider(localStorage);
Loggers.defaultLogLevel = LogLevel.WARN;

export function featureFlagConfigurationFactory() {
    // When deployed features will come in as a string and needs to be parsed
    if (typeof environment.features === 'string') {
        return of(JSON.parse(environment.features) as FeatureConfiguration);
    } else {
        return of(environment.features);
    }
}

export function localeFactory() {
    // Return browser preferred language or United States english if unable to determine browser language
    // @ts-ignore (The 'userLanguage' property is IE specific. So, type error can be ignored.)
    return navigator?.language || navigator?.userLanguage || 'en-US';
}

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatSidenavModule,
        MatDialogModule,
        AppRoutingModule,
        UiFooterModule,
        UiHeaderModule,
        UiSidenavModule,
        UiMessageModule,
        UtilGoogleAnalyticsModule,
        FeatureAboutModule,
        FeatureLogoutWhenIdleModule,
        MomentDateModule,
        MatMomentDateModule,
    ],
    providers: [
        { provide: GA_TRACKING_ID, useValue: environment.googleAnalyticsTrackingId },
        { provide: GATEWAY_TOKEN, useValue: environment.gateway },
        { provide: HTTP_INTERCEPTORS, useClass: OAuth2Interceptor, multi: true },
        { provide: ErrorHandler, useClass: GlobalErrorHandler },
        {
            provide: USER_MANAGER_SETTINGS_TOKEN,
            useValue: {
                client_id: 'VIOCUI',
                scope: 'openid profile email',
                response_type: 'code',
                redirect_uri: `${window.location.origin}/login`,
                post_logout_redirect_uri: `${window.location.origin}`,
                loadUserInfo: true,
                silent_redirect_uri: `${window.location.origin}/oidc-client-slient-refresh.html`,
                automaticSilentRenew: true,
                userStore: new WebStorageStateStore({ store: window.sessionStorage }),
                stateStore: new WebStorageStateStore({ store: window.sessionStorage }),
                // Environment level override of defaults.  This should always have the authority property defined
                ...environment.oidc,
            } as UserManagerSettings,
        },
        { provide: FEATURE_CONFIGURATION_TOKEN, useFactory: featureFlagConfigurationFactory },
        { provide: LOCALE_ID, useFactory: localeFactory },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    /** GoogleAnalyticsService injection included to ensure it gets created at app startup and isn't tree-shook. */
    constructor(gaService: GoogleAnalyticsService) {}
}
