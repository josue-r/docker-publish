import { AbstractControl, FormArray, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Tsb } from '@vioc-angular/central-ui/technical/data-access-tsb';
import {
    defaultEmptyObjectToNull,
    isEmptyInputValue,
    isNullOrUndefined,
} from '@vioc-angular/shared/common-functionality';
import { CentralValidators, FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { takeUntil } from 'rxjs/operators';

export class TsbForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static tsbErrorMapping = {
        requiresVehicleSpecification() {
            return 'A vehicle specification is required';
        },
    };

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder): void {
        const forms = new TsbForms(formBuilder, formFactory);
        formFactory.register('Tsb', forms.tsbFormCreator);
    }

    private readonly tsbFormCreator: FormCreator<Tsb> = (model, componentDestroyed, opts) => {
        const form = new TypedFormGroup<Tsb>(this.formBuilder.group(model, opts), componentDestroyed);
        // Validators
        form.addFormControlValidators('name', Validators.required, Validators.maxLength(60));
        form.addFormControlValidators('serviceCategory', this.requiresVehicleSpecification());
        form.addFormControlValidators('documentFile', CentralValidators.oneOfRequired(form, 'externalLink'));
        form.addFormValidationGroup('documentFile', 'externalLink');
        form.addFormControlValidators('externalLink', CentralValidators.url());
        // Defaults
        if (isNullOrUndefined(form.getControlValue('active'))) {
            form.setControlValue('active', true);
        }
        // Create vehicle/attribute forms
        form.setControl(
            'vehicles',
            this.formFactory.array('YearMakeModelEngine', model.vehicles, componentDestroyed, opts)
        );
        form.getArray('vehicles')
            .valueChanges.pipe(takeUntil(componentDestroyed))
            .subscribe(() => form.getControl('serviceCategory').updateValueAndValidity());
        return form;
    };

    private requiresVehicleSpecification(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!isEmptyInputValue(control.value)) {
                // A value is set, so check for vehicle specifications
                const vehicles = control.parent.get('vehicles').value?.filter((vehicle) => {
                    const wrappingObject = { vehicle }; // temporarily wrapping vehicle to enable defaultEmptyObjectToNull
                    defaultEmptyObjectToNull(wrappingObject, ['vehicle']);
                    return wrappingObject.vehicle !== null;
                });
                if (vehicles.length < 1) {
                    return { requiresVehicleSpecification: true };
                }
            }
            return null;
        };
    }
}
