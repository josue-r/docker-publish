import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MockFormErrorDirective } from './form-error.directive.mock';

@NgModule({
    imports: [CommonModule],
    declarations: [MockFormErrorDirective],
    exports: [MockFormErrorDirective],
})
export class UtilFormMockModule {}
