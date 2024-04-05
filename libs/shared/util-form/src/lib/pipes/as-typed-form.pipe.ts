import { Pipe, PipeTransform } from '@angular/core';
import { TypedFormGroup } from '../form/typed-form-group';

/**
 * A simple way to case a form to a `TypedFormGroup` in a template.
 *
 * Example:
 * ```
 *  *ngIf="(form | asTypedForm).isRequiredFieldGroupDisplayed('foo') | async"
 * ```
 *
 * @export
 * @class AsTypedFormGroupPipe
 * @implements {PipeTransform}
 */
@Pipe({
    name: 'asTypedForm',
})
export class AsTypedFormPipe implements PipeTransform {
    transform(value: any): TypedFormGroup<any> {
        return value;
    }
}
