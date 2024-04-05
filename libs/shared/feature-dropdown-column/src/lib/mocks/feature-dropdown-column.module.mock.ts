import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDropdownColumnComponent } from './dropdown-column.component.mock';

@NgModule({
    imports: [CommonModule],
    declarations: [MockDropdownColumnComponent],
    exports: [MockDropdownColumnComponent],
})
export class FeatureDropdownColumnMockModule {}
