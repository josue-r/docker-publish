import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CentralSearchUiModule } from '@vioc-angular/central-ui/ui-modules';
import { HasRoleActivateGuard } from '@vioc-angular/security/util-authorization';
import { FeatureSearchModule } from '@vioc-angular/shared/feature-search';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { InvoiceSearchComponent } from './invoice-search/invoice-search.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    {
        path: 'search',
        component: InvoiceSearchComponent,
        canActivate: [HasRoleActivateGuard],
        data: { requiredRoles: ['ROLE_INVOICE_READ'], featureFlag: 'invoice.search.enabled' },
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes), CentralSearchUiModule, CommonModule, FeatureSearchModule],
    declarations: [InvoiceSearchComponent],
    providers: [FormFactory],
})
export class FeatureInvoiceModule {}
