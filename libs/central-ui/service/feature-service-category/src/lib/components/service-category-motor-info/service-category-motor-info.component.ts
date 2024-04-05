import { ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { ServiceCategoryMotorInfo } from '@vioc-angular/central-ui/service/data-access-service-category';
import { FormArray } from '@angular/forms';

/**
 * Component used to display motor info for service categories
 */
@Component({
    selector: 'vioc-angular-service-category-motor-info',
    templateUrl: './service-category-motor-info.component.html',
})
export class ServiceCategoryMotorInfoComponent implements OnDestroy {
    /**
     * FormArray containing formGroups that map to serviceExtraCharge fields.
     */
    @Input() motorInfoFormArray: FormArray;

    /**
     * Determines whether or not the add/remove button will appear
     */
    @Input() isViewMode: boolean;

    private readonly _destroyed = new ReplaySubject(1);

    constructor(private readonly changeDetector: ChangeDetectorRef, private readonly formFactory: FormFactory) {}

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }

    /**
     * Adds a new car fax mapping to the form array
     */
    addMotorInfo(): void {
        this.motorInfoFormArray.push(
            this.formFactory.group('ServiceCategoryMotorInfo', new ServiceCategoryMotorInfo(), this._destroyed, {
                changeDetector: this.changeDetector,
            })
        );
        // manually detect changes since form array is modified directly, otherwise a `ExpressionChangedAfterItHasBeenCheckedError` is thrown
        this.changeDetector.detectChanges();
    }

    /**
     * Removed a new car fax mapping to the form array at the given index
     */
    removeMotorInfo(index: number): void {
        this.motorInfoFormArray.removeAt(index);
        // manually detect changes since form array is modified directly, otherwise a `ExpressionChangedAfterItHasBeenCheckedError` is thrown
        this.changeDetector.detectChanges();
    }

    /**
     * Determine if a car fax mapping is addable
     */
    isMotorInfoAddable(index: number): boolean {
        return !this.isViewMode && index + 1 === this.motorInfoFormArray.length;
    }
}
