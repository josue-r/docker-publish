import { Routes } from '@angular/router';

export const configRoutes: Routes = [
    {
        path: 'common-code',
        loadChildren: () =>
            import('@vioc-angular/central-ui/config/feature-common-code').then((m) => m.FeatureCommonCodeModule),
    },
    {
        path: '**',
        redirectTo: '/error/page-not-found',
    },
];
