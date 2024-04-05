import { FeatureConfiguration } from '@vioc-angular/shared/common-feature-flag';
import { UserManagerSettings } from 'oidc-client-ts';

//
// This will connect to the CF dev instance by default.  If you wish to connect to a local instance, update the appropriate URL in the
// corresponding api class.
//
export const environment = {
    production: 'false',
    environmentName: 'local',
    gateway: 'https://apis.dev.vioc.valvoline.com/',
    // Disable New Relic metrics gathering when running on local developer workstation.
    // Could be temporarily enabled when/if we need to debug metrics gathering.
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
    googleAnalyticsTrackingId: undefined,
    version: 'LOCAL',
    features: {
        // Default to enabled for local testing
        default: true,
        features: {
            storeProduct: {
                search: {
                    add: true,
                    massUpdate: true,
                    activateDeactivate: true,
                },
            },
            inventoryOrder: {
                search: {
                    grid: false,
                },
            },
            storeService: {
                search: {
                    add: true,
                },
            },
            physicalInventory: {
                edit: {
                    calculator: true,
                },
            },
        },
    } as FeatureConfiguration,
};
