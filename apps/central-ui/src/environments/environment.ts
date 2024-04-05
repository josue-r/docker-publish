import { FeatureConfiguration } from '@vioc-angular/shared/common-feature-flag';
import { UserManagerSettings } from 'oidc-client-ts';

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --configuration=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular.json`.

export const environment = {
    production: 'false',
    environmentName: 'dev',
    gateway: 'https://apis.dev.vioc.valvoline.com/',
    newRelicAccountID: '',
    newRelicTrustKey: '',
    newRelicAgentID: '',
    newRelicLicenseKey: '',
    newRelicApplicationID: '',
    oidc: {
        authority: 'https://sso.dev.vioc.com/vauth/oauth2',
        silent_redirect_uri: `${window.location.origin}/assets/oidc-client-slient-refresh.html`,
    } as UserManagerSettings,
    deployUrl: '',
    googleAnalyticsTrackingId: 'UA-91542893-5',
    version: 'UNKNOWN',
    features: {
        // Default to enabled for local testing
        default: true,
        features: {},
    } as FeatureConfiguration,
};
