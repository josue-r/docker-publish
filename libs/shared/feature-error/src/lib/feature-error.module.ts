import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ErrorComponent } from './error/error.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

const routes: Routes = [
    { path: '', pathMatch: 'full', component: ErrorComponent },
    { path: 'page-not-found', pathMatch: 'full', component: PageNotFoundComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [],
    declarations: [ErrorComponent, PageNotFoundComponent],
})
export class FeatureErrorModule {}
