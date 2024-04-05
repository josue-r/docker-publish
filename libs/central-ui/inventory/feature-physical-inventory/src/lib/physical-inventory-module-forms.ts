import { AbstractControl, FormBuilder, ValidatorFn } from '@angular/forms';
import {
    CountLocation,
    PhysicalInventory,
    PhysicalInventoryCount,
} from '@vioc-angular/central-ui/inventory/data-access-physical-inventory';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { CentralValidators, FormCreator, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { isEmpty, sum } from 'lodash';

export class PhysicalInventoryForms {
    constructor(private readonly formBuilder: FormBuilder, private readonly formFactory: FormFactory) {}

    static registerForms(formFactory: FormFactory, formBuilder: FormBuilder) {
        const forms = new PhysicalInventoryForms(formBuilder, formFactory);
        formFactory.register('PhysicalInventory', forms.physicalInventoryFormCreator);
        formFactory.register('PhysicalInventoryCount', forms.physicalInventoryCountFormCreator);
        formFactory.register('CountLocation', forms.physicalInventorycountsByLocationFormCreator);
    }

    private readonly physicalInventoryFormCreator: FormCreator<PhysicalInventory> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<PhysicalInventory>(this.formBuilder.group(model, opts), componentDestroyed);
        // Disabled all non-ediable fields
        form.disable();
        return form;
    };

    private readonly physicalInventoryCountFormCreator: FormCreator<PhysicalInventoryCount> = (
        model,
        componentDestroyed,
        opts
    ) => {
        const form = new TypedFormGroup<PhysicalInventoryCount>(
            this.formBuilder.group(model, opts),
            componentDestroyed
        );
        const accessMode = opts.accessMode as AccessMode;
        // Disabled all non-ediable fields
        form.getControl('id').disable();
        form.getControl('status').disable();
        form.getControl('category').disable();
        form.getControl('closedOn').disable();
        form.getControl('product').disable();
        // We can only disable variance, qohCountWhenOpened, and qohCountWhenClosed if they are present
        if (form.getControl('variance') != null) {
            form.getControl('variance').disable();
        }
        if (form.getControl('qohCountWhenOpened') != null) {
            form.getControl('qohCountWhenOpened').disable();
        }
        if (form.getControl('qohCountWhenClosed') != null) {
            form.getControl('qohCountWhenClosed').disable();
        }

        // Add required validation
        if (accessMode.isEdit && form.getControlValue('status').code === 'OPEN') {
            form.addControl('volumeCalculatorEnabled', this.formBuilder.control(0));
            form.addFormControlValidators('actualCount', this.actualAccountValidator());
            // check the primary uom
            if (model.uom.code === 'EACH') {
                form.addFormControlValidators('actualCount', CentralValidators.integer({ min: 0 }));
            } else {
                form.addFormControlValidators('actualCount', CentralValidators.decimal({ min: 0.0 }));
            }
        } else {
            form.disable();
        }

        // count location fields
        form.removeControl('countsByLocation');
        if (opts.isCountingByLocation) {
            form.setControl(
                'countsByLocation',
                this.formFactory.array(
                    'CountLocation',
                    !isEmpty(model.countsByLocation) ? model.countsByLocation : [],
                    componentDestroyed
                )
            );
            // set the total quantity of the products counted
            const totalQuantity = sum(model?.countsByLocation?.map((cl) => cl.count));
            const countForLocation = model?.countsByLocation?.filter((cl) => cl.location === opts.currentLocation);
            form.addControl('totalQuantity', this.formBuilder.control(0));
            form.setControlValue('totalQuantity', totalQuantity);
            // update actual count to zero so it does not get set for a specific location
            form.setControlValue('actualCount', !isEmpty(countForLocation) ? countForLocation[0].count : 0);
        }
        return form;
    };

    private readonly physicalInventorycountsByLocationFormCreator: FormCreator<CountLocation> = (
        model,
        componentDestroyed,
        opts
    ) => {
        // Disabled all non-ediable fields
        return new TypedFormGroup<CountLocation>(this.formBuilder.group(model), componentDestroyed);
    };

    /** Validates that any updated count has a value. This is to prevent users from trying to save with empty values. */
    private readonly actualAccountValidator = (): ValidatorFn => {
        return (actualCount: AbstractControl): { [key: string]: boolean } | null => {
            if (actualCount.dirty && isNullOrUndefined(actualCount.value)) {
                return { required: true };
            }
            return null;
        };
    };
}
