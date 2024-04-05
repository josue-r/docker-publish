import { Routes } from '@angular/router';

export const customerRoutes: Routes = [
    {
        path: 'invoice',
        loadChildren: () =>
            import('@vioc-angular/central-ui/customer/feature-invoice').then((m) => m.FeatureInvoiceModule),
    },
    {
        path: '**',
        redirectTo: '/error/page-not-found',
    },
];
