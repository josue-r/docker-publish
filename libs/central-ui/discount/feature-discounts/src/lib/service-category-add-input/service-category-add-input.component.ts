import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { ServiceCategory } from '@vioc-angular/central-ui/service/data-access-service-category';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-service-category-add-input',
    templateUrl: './service-category-add-input.component.html',
    styleUrls: ['./service-category-add-input.component.scss'],
})
export class ServiceCategoryAddInputComponent {
    @ViewChild('searchDialog', { static: true }) searchDialog: DialogComponent;

    /** Disables the add functionality of this component including searching and entering a service code in the input. */
    @Input() set addDisabled(addDisabled: boolean) {
        this._addDisabled = addDisabled;
        if (this._addDisabled) {
            this.categoryCodeControl.disable({ emitEvent: false });
        } else {
            this.categoryCodeControl.enable({ emitEvent: false });
        }
    }
    get addDisabled(): boolean {
        return this._addDisabled;
    }
    private _addDisabled: boolean;

    @Input() singleSelection = false;

    /** List of service codes that will be used to to verify that the services being added don't already exist. */
    @Input() existingServiceCategoryCodes = [];

    /** Function used to trigger a search for the service search dialog. */
    @Input() searchFn: (querySearch: QuerySearch) => Observable<ResponseEntity<ServiceCategory>>;

    /** Emits the selected/entered service ids and codes. */
    @Output() categories = new EventEmitter<{ id?: number; code: string }[]>();

    /** Controls the value for the service code input. */
    @Input() categoryCodeControl = new FormControl('');

    /** Controls the value for the service search selection. */
    serviceCategorySelectionControl = new FormControl([]);

    /** Contains the errors produced by a duplicate service selection/entry. */
    serviceErrors = '';

    private readonly _destroyed = new ReplaySubject(1);

    constructor(private readonly roleFacade: RoleFacade) {}

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    openSearchDialog(): void {
        this.searchDialog.open();

        this.searchDialog.dialogRef
            .afterClosed()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this.serviceCategorySelectionControl.reset());
    }

    closeSearchDialog(): void {
        this.searchDialog.close();
    }

    /** Adds the selected serviceCategories from the search dialog selection. Also filters out duplicated selected service categories and adds them to a list of errors. */
    addServiceCategories(): void {
        const existingServiceCategories: ServiceCategory[] = this.serviceCategorySelectionControl.value.filter(
            (s: ServiceCategory) => this.categoryAlreadyAdded(s.code)
        );

        const addedServices: ServiceCategory[] = this.serviceCategorySelectionControl.value.filter(
            (s: ServiceCategory) => !existingServiceCategories.includes(s)
        );
        this.serviceErrors =
            existingServiceCategories?.length > 0
                ? `Category code(s) ${existingServiceCategories.map((s) => s.code).join(', ')} already added`
                : '';
        if (addedServices.length > 0) {
            this.categories.emit(
                addedServices.map((p) => {
                    return { id: p.id, code: p.code };
                })
            );
        }
        this.closeSearchDialog();
    }

    /** Adds the entered service from the service code input. If the service code already exists, and error will be displayed. */
    addRequestedServiceCategory(): void {
        if (!this.addDisabled) {
            if (this.categoryAlreadyAdded(this.categoryCodeControl.value)) {
                this.serviceErrors = 'Category already added';
            } else {
                this.serviceErrors = '';
                this.categories.emit([{ code: this.categoryCodeControl.value.toUpperCase() }]);
                if (!this.singleSelection) {
                    this.categoryCodeControl.setValue('');
                }
            }
        }
    }

    addServiceErrorMatcher(error: any): ErrorStateMatcher {
        return {
            isErrorState(): boolean {
                return error;
            },
        } as ErrorStateMatcher;
    }

    /** Validates that product(s) are selected in the product search dialog. */
    isSelected(): boolean {
        return this.serviceCategorySelectionControl.value?.length > 0;
    }

    /** Checks the selected product code to see if it already exists in the existing Services. */
    private categoryAlreadyAdded(code: string): string {
        return this.existingServiceCategoryCodes?.find((p) => p.toUpperCase() === code.toUpperCase().trim());
    }
}
