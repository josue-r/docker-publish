import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { ParameterFacade } from '@vioc-angular/central-ui/config/data-access-parameter';
import {
    PhysicalInventory,
    PhysicalInventoryCount,
    PhysicalInventoryFacade,
} from '@vioc-angular/central-ui/inventory/data-access-physical-inventory';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { isEmpty } from 'lodash';
import { ReplaySubject, combineLatest, throwError } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { PhysicalInventoryProductsComponent } from '../physical-inventory-products/physical-inventory-products.component';

@Component({
    selector: 'vioc-angular-physical-inventory',
    templateUrl: './physical-inventory.component.html',
    styleUrls: ['./physical-inventory.component.scss'],
    providers: [PhysicalInventoryFacade, ResourceFacade, CommonCodeFacade, ParameterFacade],
})
export class PhysicalInventoryComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    /** Dialog used to confirm if user wishes to stop count */
    @ViewChild('stopCountDialog', { static: true }) stopDialog: DialogComponent;

    @ViewChild('productCounts', { static: false }) productCounts: PhysicalInventoryProductsComponent;

    /** Mode that determines state of the page. */
    accessMode: AccessMode;

    /** Model that holds values of the product count. */
    model: PhysicalInventory;

    /** Form that handles validating and updating transfer fields. */
    form: TypedFormGroup<PhysicalInventory>;

    isLoading = false;

    stopFacade: SaveFacade<PhysicalInventory>;

    saveFacade: SaveFacade<PhysicalInventory>;

    saveByLocationFacade: SaveFacade<PhysicalInventory>;

    initiateCategorySearch = undefined;

    isCountingByLocation = false;

    selectedValueIndex: number = 0;

    constructor(
        public readonly physicalInventoryFacade: PhysicalInventoryFacade,
        public readonly parameterFacade: ParameterFacade,
        private readonly routerService: RouterService,
        private readonly formFactory: FormFactory,
        private readonly route: ActivatedRoute,
        public readonly messageFacade: MessageFacade
    ) {
        super();
        this.stopFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.physicalInventoryFacade.stopCount(model.id, model.store.code),
            (it) => `Product Count ${it.id} was stopped successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<PhysicalInventory>, model: PhysicalInventory): PhysicalInventory =>
                Object.assign({ ...model }, form.getRawValue())
        );
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.physicalInventoryFacade.updateCount(model),
            (it) => `Product Count ${it.id} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<PhysicalInventory>, model: PhysicalInventory): PhysicalInventory => {
                const updatedModel: PhysicalInventory = Object.assign({ ...model }, form.value);
                // Include only updated counts, ignore null
                updatedModel.counts = form
                    .getArray('counts')
                    .controls.filter((c) => c.dirty && !isNullOrUndefined(c.get('actualCount').value))
                    .map((c: TypedFormGroup<PhysicalInventoryCount>) => c.getRawValue());
                return updatedModel;
            }
        );
        this.saveByLocationFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => {
                // combine all returns for the update call
                return combineLatest(
                    model.counts.map((c) => {
                        return this.physicalInventoryFacade.updateCountByLocation(model.id, c);
                    })
                );
            },
            (it) => `Product Count ${it.id} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<PhysicalInventory>, model: PhysicalInventory): PhysicalInventory => {
                const updatedModel: PhysicalInventory = Object.assign({ ...model }, form.value);
                // Include only updated location counts
                updatedModel.counts = form
                    .getArray('counts')
                    .controls.filter((c) => c.dirty && !isEmpty(c.get('countsByLocation').value))
                    .map((c: TypedFormGroup<PhysicalInventoryCount>) => {
                        const count = c.getRawValue();
                        return {
                            ...count,
                            countsByLocation: c.getControlValue('countsByLocation'),
                            actualCount: count.totalQuantity,
                        };
                    });
                return updatedModel;
            }
        );
        // This will trigger a reload of the component when the parameters change i.e. switching from add to edit etc
        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(() => {
            // Checking if accessMode is set to see if the component is already initialized, otherwise when
            // the component is first created ngOnInit will run twice
            if (this.accessMode) {
                this.ngOnInit();
            }
        });
    }

    ngOnInit(): void {
        // Parse parameters from URL for view
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        const productCountNumber = params.productCountNumber;
        if (this.accessMode.isView || this.accessMode.isEdit) {
            this.physicalInventoryFacade.findById(productCountNumber).subscribe((physicalInventory) => {
                this.model = physicalInventory;
                this.initializeForm(this.model);
                super.unsavedChangesMessage = this.unsavedProductsMessage;
            });
        } else {
            throw Error(`Unhandled Access Mode: ${this.accessMode?.urlSegement}`);
        }
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    /** Get route parameters from URL. */
    private getRouteParams(route: ActivatedRoute): {
        accessMode: AccessMode;
        storeCode: string;
        productCountNumber: string;
    } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const storeCode = params.get('storeCode');
        const productCountNumber = params.get('productCountNumber');
        return { accessMode, storeCode, productCountNumber };
    }

    /** Initialize form with current values. */
    private initializeForm(model: PhysicalInventory): void {
        if (isNullOrUndefined(this.form)) {
            this.form = this.formFactory.group('PhysicalInventory', model, this._destroyed);
        }
    }

    get isEditButtonsDisplayed(): boolean {
        return this.accessMode.isEdit && this.form.getControlValue('status').code === 'OPEN';
    }

    openStopCountDialog(): void {
        this.stopDialog.open();
    }

    closeStopCountDialog(): void {
        this.stopDialog.close();
    }

    stopCount(): void {
        this.stopDialog.close();
        const reload = () => {
            this.form = undefined;
            this.initiateCategorySearch = this.productCounts.allCategories;
            this.ngOnInit();
        };
        this.stopFacade.apply(this.form, this.model, reload).subscribe();
    }

    apply(): void {
        // used to maintain current state after the page has been reloaded
        this.initiateCategorySearch = this.productCounts.currentCategories;
        if (this.isCountingByLocation) {
            this.applyChanges(this.saveByLocationFacade);
        } else {
            const promises = this.calculateVolumeOnApply();
            Promise.all(promises).then(() => {
                this.applyChanges(this.saveFacade);
            });
        }
    }

    applyChanges(saveFacade: SaveFacade<any>): void {
        saveFacade
            .apply(this.form, this.model, () => {})
            .subscribe(() => {
                this.form = undefined;
                this.ngOnInit();
            });
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }

    /** @see DataModifier */
    unsavedProductsMessage(): string {
        if (this.form?.getArray('counts') && this.form.getArrayValue('counts').length > 0) {
            const productCodes = this.form
                .getArray('counts')
                .controls.filter((c) => c.invalid)
                .map((c: TypedFormGroup<PhysicalInventoryCount>) => c.getRawValue().product.code);
            return `Products ${productCodes.join()} are unsaved, if you leave your changes will be lost.`;
        } else {
            return null;
        }
    }

    /** If there is any changes in height,below method is used to calculate volume on click of apply. */
    calculateVolumeOnApply(): Promise<void>[] {
        return this.form
            .getArray('counts')
            .controls.filter(
                (c) =>
                    c.dirty && !isNullOrUndefined(c.get('actualCount').value) && c.get('volumeCalculatorEnabled').value
            )
            .map((c: TypedFormGroup<PhysicalInventoryCount>) => {
                const count = c.getRawValue();
                return new Promise((resolve) => {
                    this.physicalInventoryFacade
                        .calculateVolume(
                            c.getControlValue('product').id,
                            this.form.getControlValue('store').code,
                            c.get('actualCount').value
                        )
                        .pipe(
                            catchError((e) => {
                                return throwError(e);
                            })
                        )
                        .subscribe((calculatedVolume) => {
                            c.patchValue({
                                ...count,
                                actualCount: calculatedVolume,
                            });
                            resolve();
                        });
                });
            });
    }

    /** Calls to the physical Inventory API to request a PDF printout for the count sheet, then displays it in a new window. */
    getPDF(): void {
        // Trigger loading overlay when generating PDF
        this.isLoading = true;
        const categoryCodes = this.productCounts?.categoryCode?.includes('ALL')
            ? null
            : this.productCounts.categoryCode;
        this.physicalInventoryFacade
            .getPDF(this.model.store.code, this.model.id, categoryCodes)
            .subscribe((resolve) => {
                this.isLoading = false;
                const fileURL = URL.createObjectURL(resolve);
                window.open(fileURL);
            });
    }

    /** Updates the count by location state to keep track of after the page has been reloaded. */
    switchedToChangeByLocation(event: boolean): void {
        this.isCountingByLocation = event;
    }

    setSelectedValue(selectedValueIndex: number): void {
        this.selectedValueIndex = selectedValueIndex;
    }
}
