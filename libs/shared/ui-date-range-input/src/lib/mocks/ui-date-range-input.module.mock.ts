import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MockDateRangeInputComponent } from './date-range-input.component.mock';

@NgModule({
    imports: [CommonModule],
    declarations: [MockDateRangeInputComponent],
    exports: [MockDateRangeInputComponent],
})
export class UiDateRangeInputMockModule {}
