import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent, FeatureDashboardModule } from '@vioc-angular/central-ui/dashboard/feature-dashboard';
import { FeatureForbiddenModule, ForbiddenComponent } from '@vioc-angular/security/feature-forbidden';
import {
    FeatureLoginModule,
    LoginComponent,
    LoginErrorComponent,
    LogoutComponent,
} from '@vioc-angular/security/feature-login';
import { IsAuthenticatedActivateGuard } from '@vioc-angular/security/util-authentication';
import { HasRoleActivateGuard } from '@vioc-angular/security/util-authorization';
import { configRoutes } from './routes/config.routes';
import { customerRoutes } from './routes/customer.routes';
import { digitalRoutes } from './routes/digital.routes';
import { inventoryRoutes } from './routes/inventory.routes';
import { maintenanceRoutes } from './routes/maintenance.routes';
import { organizationRoutes } from './routes/organization.routes';

const appRoutes: Routes = [
    {
        path: '',
        canActivate: [IsAuthenticatedActivateGuard],
        canActivateChild: [IsAuthenticatedActivateGuard],
        children: [
            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full',
            },
            {
                path: 'dashboard',
                component: DashboardComponent,
                canActivate: [HasRoleActivateGuard],
                data: { requiredRoles: ['*'] },
            },
            {
                path: 'error',
                loadChildren: () => import('@vioc-angular/shared/feature-error').then((m) => m.FeatureErrorModule),
            },
            { path: 'forbidden', component: ForbiddenComponent },
            { path: 'maintenance', children: maintenanceRoutes },
            { path: 'organization', children: organizationRoutes },
            { path: 'digital', children: digitalRoutes },
            { path: 'config', children: configRoutes },
            { path: 'inventory', children: inventoryRoutes },
            { path: 'customer', children: customerRoutes },
        ],
    },
    { path: 'login', component: LoginComponent },
    { path: 'login-error', component: LoginErrorComponent },
    { path: 'logout', component: LogoutComponent },
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forRoot(
            appRoutes
            // { enableTracing: true } // <-- debugging purposes only
        ),
        FeatureDashboardModule,
        FeatureLoginModule,
        FeatureForbiddenModule,
    ],
    declarations: [],
    exports: [RouterModule],
    providers: [IsAuthenticatedActivateGuard],
})
export class AppRoutingModule {}
