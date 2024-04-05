import { Routes } from '@angular/router';

export const organizationRoutes: Routes = [
    {
        path: 'store',
        loadChildren: () =>
            import('@vioc-angular/central-ui/organization/feature-store').then((m) => m.FeatureStoreModule),
    },
    {
        path: '**',
        redirectTo: '/error/page-not-found',
    },
];
