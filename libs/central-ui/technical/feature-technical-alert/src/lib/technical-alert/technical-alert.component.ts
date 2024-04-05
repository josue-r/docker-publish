import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormControl } from '@angular/forms';
import { MatSelectionList } from '@angular/material/list';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { Product, ProductFacade } from '@vioc-angular/central-ui/product/data-access-product';
import { TechnicalAlert, TechnicalAlertFacade } from '@vioc-angular/central-ui/technical/data-access-technical-alert';
import { DocumentFile } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import {
    Described,
    defaultEmptyObjectToNull,
    isEmptyInputValue,
    isNullOrUndefined,
} from '@vioc-angular/shared/common-functionality';
import { FeatureFlagFacade } from '@vioc-angular/shared/data-access-feature-flag';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-technical-alert',
    templateUrl: './technical-alert.component.html',
    styleUrls: ['./technical-alert.component.scss'],
    providers: [ProductFacade, CommonCodeFacade, TechnicalAlertFacade],
})
export class TechnicalAlertComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    @ViewChild('searchDialog', { static: true }) searchDialog: DialogComponent;

    /** Element used to monitor the selected `activeAlertScreens` values. */
    @ViewChild('selectedActiveAlertScreens', { static: false }) selectedActiveAlertScreens: MatSelectionList;

    /** Element used to monitor the selected `passiveAlertScreen` values. */
    @ViewChild('selectedPassiveAlertScreens', { static: false }) selectedPassiveAlertScreens: MatSelectionList;

    /** Mode that determines the editable state of the page. */
    accessMode: AccessMode;

    /** Model that holds the values of the `TechnicalAlert` being viewed. */
    model: TechnicalAlert;

    @ViewChild('addDialog', { static: true }) alertAddDialog: DialogComponent;

    /** Form for validating and updating `TechnicalAlert` field values. */
    form: TypedFormGroup<TechnicalAlert>;

    saveFacade: SaveFacade<TechnicalAlert>;

    /** List of screens that can be selected to required user action for given alert information on the given screen. */
    activeAlertScreens$: Observable<Described[]>;

    /** List of screens that can be selected to display the given alert information on the given screen. */
    passiveAlertScreens$: Observable<Described[]>;

    /** Controls the value for the product search selection. */
    productSelectionControl = new FormControl<Product[]>(null);

    /** FormControl is being used to display the product code value after it is getting cleared on form recreation  */
    productCodeControl = new FormControl('');

    isProductSelected = false;

    filterVehicleDetails = false;

    isLoading = false;

    addOrEditProductEnabled = false;

    /** maintains the state of callback methods(save()/apply()) for adding alerts in case of opening warning dialog */
    alertDialogCallback: () => void;

    private readonly _destroyed = new ReplaySubject(1);

    constructor(
        private readonly productFacade: ProductFacade,
        private readonly routerService: RouterService,
        public readonly messageFacade: MessageFacade,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly formFactory: FormFactory,
        private readonly commonCodeFacade: CommonCodeFacade,
        private readonly technicalAlertFacade: TechnicalAlertFacade,
        private readonly changeDetector: ChangeDetectorRef,
        public readonly featureFlagFacade: FeatureFlagFacade
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.technicalAlertFacade.save(model),
            (ta) => `Technical Alert ${ta.name} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<TechnicalAlert>, model: TechnicalAlert): TechnicalAlert => {
                const requestObject = Object.assign({ ...model }, form.value);
                // If the document is the same, so no reason to send up the document bytes
                if (model.documentFile && model.documentFile.document === form.value.documentFile?.document) {
                    requestObject.documentFile = { id: model.documentFile.id };
                }
                this.updateVehicleConfig(requestObject);
                return requestObject;
            }
        );
        // This will trigger a reload of the component when the route parameters change i.e. switching from add to edit etc
        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(() => {
            // Checking if accessMode is set to see if the component is already initialized, otherwise when
            // the component is first created ngOnInit will run twice
            if (this.accessMode) {
                this.ngOnInit();
            }
        });
    }

    ngOnInit(): void {
        // Parse the parameters from the URL
        const params = this.getRouteParams();
        this.accessMode = params.accessMode;
        // feature flag the functionality to add/edit a product to/in a technical alert
        this.featureFlagFacade
            .isEnabled('technicalAlert.addAndEdit.addOrEditProduct')
            .pipe(takeUntil(this._destroyed))
            .subscribe((e) => (this.addOrEditProductEnabled = e));
        if (this.accessMode.isView || this.accessMode.isEdit) {
            // convert string parameter to a number
            const alertId = +params.alertId;
            this.technicalAlertFacade.findById(alertId).subscribe((ta: TechnicalAlert) => {
                this.model = ta;
                this.createForm();
            });
        } else if (this.accessMode.isAdd) {
            this.model = new TechnicalAlert();
            this.createForm();
        } else {
            throw Error(`Unhandled Access Mode: ${this.accessMode.urlSegement}`);
        }
    }

    private createForm(): void {
        this.form = this.formFactory.group('TechnicalAlert', this.model, this._destroyed);
        if (this.accessMode.isView) {
            this.form.disable();
        }
        if (!isNullOrUndefined(this.form.getControlValue('product'))) {
            this.isProductSelected = true;
            this.productCodeControl.disable();
        }
        this.activeAlertScreens$ = this.commonCodeFacade.findByType('ALERT_ACTIVE_SCREEN', true);
        this.passiveAlertScreens$ = this.commonCodeFacade.findByType('ALERT_PASSIVE_SCREEN', true);
        this.checkForVehicleFilter();
    }

    /** Adding a vehicle filter if there are more than 30 mappings */
    private checkForVehicleFilter(): void {
        const filterVehicleThreshold = 30;
        if (this.vehiclesControlArray.length > filterVehicleThreshold) {
            this.filterVehicleDetails = true;
        }
    }

    apply(): void {
        if (
            this.selectedActiveAlertScreens.selectedOptions.hasValue() ||
            this.selectedPassiveAlertScreens.selectedOptions.hasValue()
        ) {
            this.updateAlertScreens();
            this.saveFacade
                .apply(this.form, this.model, () => {})
                .subscribe((alertId) => {
                    this.form = undefined;
                    if (this.accessMode.isAdd) {
                        this.router.navigate([AccessMode.EDIT.urlSegement, alertId], { relativeTo: this.route.parent });
                    } else {
                        this.ngOnInit();
                    }
                });
        } else {
            this.displayMissingAlertScreenMessage();
        }
    }

    openAlertAddDialog(): void {
        this.alertAddDialog.open();
    }

    closeAlertAddDialog(): void {
        this.alertAddDialog.close();
    }

    // callback  calls the save/apply as callback methods when product or vehicle selected
    openAlerts(callback: () => void): void {
        if (this.vehiclesControlArray.length || this.isProductSelected) {
            callback.call(this);
        } else {
            this.openAlertAddDialog();
            this.alertDialogCallback = callback;
        }
    }

    save(): void {
        if (
            this.selectedActiveAlertScreens.selectedOptions.hasValue() ||
            this.selectedPassiveAlertScreens.selectedOptions.hasValue()
        ) {
            this.updateAlertScreens();
            this.saveFacade.save(this.form, this.model, this.route).subscribe();
        } else {
            this.displayMissingAlertScreenMessage();
        }
    }

    displayMissingAlertScreenMessage(): void {
        this.messageFacade.addMessage({
            severity: 'error',
            message: 'Must select at least one Active or Passive Alert',
            hasTimeout: true,
        });
    }

    onDocumentFileChange(documentFile: DocumentFile): void {
        this.form.setControlValueDirtying('documentFile', documentFile);
    }

    onExternalLinkChange(externalLink: string): void {
        this.form.setControlValueDirtying('externalLink', externalLink);
    }

    /** Updates the vehicle config by removing empty vehicle configs and vehicle attribute configs. */
    updateVehicleConfig(model: TechnicalAlert): void {
        // Remove any empty vehicle mappings
        model.vehicles = model.vehicles.filter((vehicle) => {
            const wrappingObject = { vehicle }; // temporarily wrapping vehicle to enable defaultEmptyObjectToNull
            defaultEmptyObjectToNull(wrappingObject, ['vehicle']);
            return wrappingObject.vehicle !== null;
        });
        model.vehicles.forEach((vehicle) => {
            vehicle.attributes = vehicle.attributes
                ? vehicle.attributes
                      .filter((attribute) => attribute.key !== null && attribute.type !== null)
                      // filter out engine designations and sub models when the make and/or model are null
                      .filter(
                          (attribute) =>
                              (!isNullOrUndefined(vehicle.makeId) && attribute.type.code === 'ENGINE_DESIGNATION') ||
                              (!isNullOrUndefined(vehicle.makeId) &&
                                  !isNullOrUndefined(vehicle.modelId) &&
                                  attribute.type.code === 'SUB_MODEL') ||
                              !['ENGINE_DESIGNATION', 'SUB_MODEL'].includes(attribute.type.code)
                      )
                : [];
        });
    }

    /**
     * Returns `true` if the passed alert is a selected active alert screen for the viewed model.
     * This method is intended to display the existing selected values in the selection list.
     */
    isActiveAlertSelected(alert: Described): boolean {
        return this.model.activeScreens.map((s) => s.screen.code).includes(alert.code);
    }

    /**
     * Returns `true` if the passed alert is a selected passive alert screen for the viewed model.
     * This method is intended to display the existing selected values in the selection list.
     */
    isPassiveAlertSelected(alert: Described): boolean {
        return this.model.passiveScreens.map((s) => s.screen.code).includes(alert.code);
    }

    /** Updates the form with the currently selected active and passive alert screen values. */
    updateAlertScreens(): void {
        this.form.setControlValue(
            'activeScreens',
            this.selectedActiveAlertScreens.selectedOptions.selected.map((o) => {
                return { screen: o.value };
            })
        );
        this.form.setControlValue(
            'passiveScreens',
            this.selectedPassiveAlertScreens.selectedOptions.selected.map((o) => {
                return { screen: o.value };
            })
        );
    }

    private getRouteParams(): { accessMode: AccessMode; alertId: string } {
        const params = this.route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const alertId = params.get('alertId');
        return { accessMode, alertId };
    }

    get vehiclesControlArray(): FormArray {
        return this.form.getArray('vehicles');
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form && this.form.dirty;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }

    /** Function that supplies a query to the product add searching for active products to add. */
    readonly searchProductFn = (querySearch: QuerySearch): Observable<ResponseEntity<Product>> => {
        // active is true is enforced in the vioc-angular-product-selection so it appears on the search
        return this.productFacade.search(querySearch);
    };

    openSearchDialog(): void {
        this.searchDialog.open();

        this.searchDialog.dialogRef
            .afterClosed()
            .pipe(takeUntil(this._destroyed))
            .subscribe(() => this.productSelectionControl.reset());
    }

    /** Validates that product(s) are selected in the product search dialog. */
    isSelected(): boolean {
        return this.productSelectionControl.value?.length > 0;
    }

    /** Adds the selected product from the product code input. */
    addProductFromInput(): void {
        if (isEmptyInputValue(this.productCodeControl.value)) {
            return;
        }
        this.isLoading = true;
        const addedProduct = this.productCodeControl.value;
        this.productFacade.findByCode(addedProduct).subscribe(
            (product) => {
                this.form.patchControlValue('product', product);
                this.productCodeControl.disable();
                this.isProductSelected = true;
                this.isLoading = false;
                this.changeDetector.detectChanges();
            },
            (error) => {
                this.messageFacade.addMessage({
                    severity: 'error',
                    message: `Product ${this.productCodeControl.value} not found`,
                });
                this.isLoading = false;
                this.changeDetector.detectChanges();
            }
        );
    }

    /** Adds the selected product(s) from the search dialog selection. */
    addProductFromSearch(): void {
        const addedProduct: Product = this.productSelectionControl.value as Product;
        if (!isNullOrUndefined(addedProduct)) {
            // Using the selectionControl returns an array, for products there is only allowed to be one product selected so location will always be 0
            const addedProductLocation = 0;
            this.productCodeControl.patchValue(addedProduct[addedProductLocation].code);
            this.changeDetector.detectChanges();
            this.addProductFromInput();
            this.closeSearchDialog();
        }
    }

    closeSearchDialog(): void {
        this.searchDialog.close();
    }

    removeProduct(): void {
        this.productCodeControl.patchValue(null);
        this.form.patchControlValue('product', null);
        this.productCodeControl.enable();
        this.isProductSelected = false;
    }

    get productCode(): string {
        const product = this.form.getControlValue('product');
        return product ? `${product.code}` : '';
    }

    get productDescription(): string {
        const product = this.form.getControlValue('product');
        return product ? `${product.description}` : '';
    }

    get productSelected(): boolean {
        return this.isProductSelected;
    }
}
