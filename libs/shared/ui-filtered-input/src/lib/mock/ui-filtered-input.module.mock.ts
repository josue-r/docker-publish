import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MockFilteredInputComponent } from './filtered-input.component.mock';

@NgModule({
    imports: [CommonModule],
    declarations: [MockFilteredInputComponent],
    exports: [MockFilteredInputComponent],
})
export class UiFilteredInputMockModule {}
