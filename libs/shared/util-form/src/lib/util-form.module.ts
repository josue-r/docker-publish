import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormErrorDirective } from './form-error/form-error.directive';
import { AsTypedFormPipe } from './pipes/as-typed-form.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [FormErrorDirective, AsTypedFormPipe],
    exports: [FormErrorDirective, AsTypedFormPipe],
    providers: [],
})
export class UtilFormModule {}
