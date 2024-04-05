import { Routes } from '@angular/router';

export const digitalRoutes: Routes = [
    {
        path: 'company-holiday',
        loadChildren: () =>
            import('@vioc-angular/central-ui/organization/feature-company-holiday').then(
                (m) => m.FeatureCompanyHolidayModule
            ),
    },
    {
        path: 'offers',
        loadChildren: () =>
            import('@vioc-angular/central-ui/discount/feature-offers').then((m) => m.FeatureOfferModule),
    },
    {
        path: 'offer-content',
        loadChildren: () =>
            import('@vioc-angular/central-ui/discount/feature-offer-content').then((m) => m.FeatureOfferContentModule),
    },
    {
        path: '**',
        redirectTo: '/error/page-not-found',
    },
];
