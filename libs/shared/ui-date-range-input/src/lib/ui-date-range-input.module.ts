import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DateRangeInputComponent } from './date-range-input/date-range-input.component';

@NgModule({
    imports: [CommonModule, FormsModule, MatFormFieldModule, MatDatepickerModule],
    declarations: [DateRangeInputComponent],
    exports: [DateRangeInputComponent],
})
export class UiDateRangeInputModule {}
