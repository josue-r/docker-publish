import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MockSearchFilterComponent } from './search-filter.component.mock';
import { MockSearchComponent } from './search.component.mock';

@NgModule({
    declarations: [MockSearchFilterComponent, MockSearchComponent],
    exports: [MockSearchFilterComponent, MockSearchComponent],
    imports: [CommonModule],
})
export class FeatureSearchMockModule {}
