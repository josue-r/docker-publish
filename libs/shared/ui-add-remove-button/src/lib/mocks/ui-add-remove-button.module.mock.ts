import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MockAddRemoveButtonComponent } from './add-remove-button.component.mock';

@NgModule({
    imports: [CommonModule],
    declarations: [MockAddRemoveButtonComponent],
    exports: [MockAddRemoveButtonComponent],
})
export class UiAddRemoveButtonMockModule {}
