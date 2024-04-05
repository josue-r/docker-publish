import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PreviousDisplayedColumnsState, PreviousSearchState } from '@vioc-angular/shared/data-access-search';
// TODO: 04/03/2020: Feature#5256 Create TS Lint rules for vioc-angular Mono-Repro and resolve any errors identified
// tslint:disable-next-line: nx-enforce-module-boundaries
import { FeatureDropdownColumnModule } from '@vioc-angular/shared/feature-dropdown-column';
import { UiAddRemoveButtonModule } from '@vioc-angular/shared/ui-add-remove-button';
import { UiDateRangeInputModule } from '@vioc-angular/shared/ui-date-range-input';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiGridModule } from '@vioc-angular/shared/ui-grid';
import { UiLoadingModule } from '@vioc-angular/shared/ui-loading';
import { UiManageColumnModule } from '@vioc-angular/shared/ui-manage-column';
import { UiPaginatorModule } from '@vioc-angular/shared/ui-paginator';
import { UiTableModule } from '@vioc-angular/shared/ui-table';
import { UtilFormModule } from '@vioc-angular/shared/util-form';
import { SearchFilterComponent } from './search-filter/search-filter.component';
import { SearchLineComponent } from './search-line/search-line.component';
import { SearchComponent } from './search/search.component';

@NgModule({
    imports: [
        CommonModule,
        FeatureDropdownColumnModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatChipsModule,
        MatDatepickerModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        ReactiveFormsModule,
        UiAddRemoveButtonModule,
        UiLoadingModule,
        UiFilteredInputModule,
        UiGridModule,
        UiManageColumnModule,
        UiPaginatorModule,
        UiTableModule,
        UtilFormModule,
        UiDateRangeInputModule,
    ],
    declarations: [SearchFilterComponent, SearchLineComponent, SearchComponent],
    exports: [SearchFilterComponent, SearchLineComponent, SearchComponent],
    providers: [PreviousSearchState, PreviousDisplayedColumnsState],
})
export class FeatureSearchModule {}
