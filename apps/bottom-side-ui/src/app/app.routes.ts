import { Route } from '@angular/router';

export const appRoutes: Route[] = [
    {
        path: 'bay/:bayId',
        loadComponent: () => import('./bay-container/bay-container.component').then((mod) => mod.BayContainerComponent),
    },
    {
        path: 'error',
        loadChildren: () => import('@vioc-angular/shared/feature-error').then((m) => m.FeatureErrorModule),
    },
    {
        path: '**',
        redirectTo: 'error/page-not-found',
    },
];
