import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
import { NavSearchComponent } from './nav-search/nav-search.component';
import { FilterSearchableOnlyPipe } from './pipes/filter-searchable-only.pipe';
import { HasChildrenPipe } from './pipes/has-children.pipe';
import { SidenavComponent } from './sidenav/sidenav.component';
import { SubnavComponent } from './subnav/subnav.component';

@NgModule({
    imports: [
        CommonModule,
        MatListModule,
        MatAutocompleteModule,
        FormsModule,
        ReactiveFormsModule,
        MatIconModule,
        MatTooltipModule,
        MatListModule,
        MatMenuModule,
        CommonFunctionalityModule,
        MatButtonModule,
    ],
    declarations: [SidenavComponent, NavSearchComponent, SubnavComponent, HasChildrenPipe, FilterSearchableOnlyPipe],
    exports: [SidenavComponent],
})
export class UiSidenavModule {}
