import { ChangeDetectorRef, Component, Input, OnDestroy } from '@angular/core';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { ServiceCategoryCarFaxMapping } from '@vioc-angular/central-ui/service/data-access-car-fax-mapping';
import { FormArray } from '@angular/forms';

/**
 * Component used to display the CarFax Service Name field for a service category
 */
@Component({
    selector: 'vioc-angular-service-category-car-fax-mapping',
    templateUrl: './service-category-car-fax-mapping.component.html',
})
export class ServiceCategoryCarFaxMappingComponent implements OnDestroy {
    /**
     * FormArray containing formGroups that map to ServiceCategoryCarFaxMapping fields.
     */
    @Input() carFaxMappingFormArray: FormArray;

    /**
     * Determines whether or not the add/remove button will appear
     */
    @Input() isViewMode: boolean;

    /**
     * A list of possible service names to display to the user
     */
    @Input() carFaxServiceNames: string[] = [];

    private readonly _destroyed = new ReplaySubject(1);

    constructor(private readonly changeDetector: ChangeDetectorRef, private readonly formFactory: FormFactory) {}

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }

    /**
     * Adds a new car fax mapping to the form array
     */
    addCarFaxMapping(): void {
        this.carFaxMappingFormArray.push(
            this.formFactory.group(
                'ServiceCategoryCarFaxMapping',
                new ServiceCategoryCarFaxMapping(),
                this._destroyed,
                {
                    changeDetector: this.changeDetector,
                }
            )
        );
        // manually detect changes since form array is modified directly
        this.changeDetector.detectChanges();
    }

    /**
     * Removed a new car fax mapping to the form array at the given index
     */
    removeCarFaxMapping(index: number): void {
        this.carFaxMappingFormArray.removeAt(index);
        // manually detect changes since form array is modified directly
        this.changeDetector.detectChanges();
    }

    /**
     * Determine if a car fax mapping is addable
     */
    isCarFaxMappingAddable(index: number): boolean {
        return !this.isViewMode && index + 1 === this.carFaxMappingFormArray.length;
    }
}
