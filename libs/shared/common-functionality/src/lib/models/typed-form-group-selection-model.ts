import { SelectionModel } from '@angular/cdk/collections';
import { TypedFormGroup } from '@vioc-angular/shared/util-form';

/**
 * This class should be used to replace the implentation of SelectionModel on any page.
 * The key difference being an overridden comparison being necessary to make sure different instances of the same object have already been selected
 * See AB#25793
 */
export class TypedFormGroupSelectionModel<T> extends SelectionModel<TypedFormGroup<T>> {
    constructor(multiple?: boolean, emitChanges?: boolean, formControl?: keyof T) {
        super(
            multiple,
            [],
            emitChanges,
            (originalFormInstance: TypedFormGroup<T>, newFormInstance: TypedFormGroup<T>) =>
                originalFormInstance.getControlValue(formControl) === newFormInstance.getControlValue(formControl)
        );
    }
}
