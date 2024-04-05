import { ChangeDetectorRef, Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { StoreSelectionComponent } from '@vioc-angular/central-ui/organization/feature-shared-store-selection';
import { StoreService, StoreServiceFacade } from '@vioc-angular/central-ui/service/data-access-store-service';
import { ServiceSelectionComponent } from '@vioc-angular/central-ui/service/feature-shared-service-selection';
import { QueryRestriction, QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { MassUpdateComponent } from '@vioc-angular/shared/feature-mass-update';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { Columns, Comparators } from '@vioc-angular/shared/util-column';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-store-service-mass-update',
    templateUrl: './store-service-mass-update.component.html',
    styleUrls: ['./store-service-mass-update.component.scss'],
    providers: [ResourceFacade, StoreServiceFacade],
})
export class StoreServiceMassUpdateComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject();

    @ViewChild('storeSelectionComponent', { static: true }) storeSelection: StoreSelectionComponent;
    @ViewChild('serviceSelectionComponent', { static: true }) serviceSelection: ServiceSelectionComponent;
    @ViewChild(MatStepper, { static: true }) stepper: MatStepper;
    @ViewChild('massUpdateComponent', { static: true }) massUpdateComponent: MassUpdateComponent;

    form: FormGroup;

    /**
     * The maximum number of stores that display in the mass update preview
     * If there are more than 55 stores selected, a read more option will appear to display the remaining stores
     */
    readonly maxPreviewableStores = 55;

    /**
     * The maximum number of services that display in the mass update preview
     * If there are more than 25 services selected, a read more option will appear to display the remaining services
     */
    readonly maxPreviewableServices = 25;

    readonly accessRoles = ['ROLE_STORE_SERVICE_UPDATE'];

    describedEquals = Described.idEquals;

    accessibleCompanies: Described[];

    templateMap = new Map<string, TemplateRef<any>>();

    isLoading = false;

    readonly columns: Columns = {
        laborAmount: { apiFieldPath: 'laborAmount', name: 'Labor Price', type: 'decimal' },
        priceOverride: {
            name: 'Price Override',
            columns: {
                priceOverridable: { apiFieldPath: 'priceOverridable', name: 'Overridable', type: 'boolean' },
                priceOverrideMin: { apiFieldPath: 'priceOverrideMin', name: 'Min Overridable Price', type: 'decimal' },
                priceOverrideMax: { apiFieldPath: 'priceOverrideMax', name: 'Max Overridable Price', type: 'decimal' },
                priceOverrideMinMaxOverrideable: {
                    apiFieldPath: 'priceOverrideMinMaxOverrideable',
                    name: 'Min/Max Overridable',
                    type: 'boolean',
                },
            },
        },
        promotionPrice: {
            name: 'Promotion Price',
            columns: {
                promotionPrice: { apiFieldPath: 'promotionPrice', name: 'Promotion Service Price', type: 'decimal' },
                promotionLaborAmount: {
                    apiFieldPath: 'promotionLaborAmount',
                    name: 'Promotion Labor Price',
                    type: 'decimal',
                },
                promotionStartDate: {
                    apiFieldPath: 'promotionStartDate',
                    name: 'Promotion Price Start Date',
                    type: 'date',
                },
                promotionEndDate: { apiFieldPath: 'promotionEndDate', name: 'Promotion Price End Date', type: 'date' },
            },
        },
        schedulePrice: {
            name: 'Schedule Price',
            columns: {
                scheduledChangePrice: {
                    apiFieldPath: 'scheduledChangePrice',
                    name: 'Sched. New Price',
                    type: 'decimal',
                },
                scheduledChangeDate: {
                    apiFieldPath: 'scheduledChangeDate',
                    name: 'Sched. Price Change Date',
                    type: 'date',
                },
            },
        },
        servicePrice: { apiFieldPath: 'servicePrice', name: 'Service Price', type: 'decimal' },
    };

    readonly storeSearch = (querySearch: QuerySearch): Observable<ResponseEntity<Described>> => {
        const companyQueryRestriction: QueryRestriction = {
            fieldPath: 'company',
            dataType: 'company',
            operator: Comparators.equalTo.value,
            values: [this.companyFormControl.value.id],
        };
        return this.resourceFacade.searchStoresByRoles(
            { ...querySearch, queryRestrictions: [...querySearch.queryRestrictions, companyQueryRestriction] },
            this.accessRoles,
            'FULL'
        );
    };

    readonly serviceSearch = (querySearch: QuerySearch): Observable<ResponseEntity<Described>> => {
        return this.storeServiceFacade.searchAssignedServicesByStore(querySearch, this.storesFormControl.value);
    };

    constructor(
        private readonly resourceFacade: ResourceFacade,
        private readonly storeServiceFacade: StoreServiceFacade,
        private readonly formFactory: FormFactory,
        private readonly changeDetector: ChangeDetectorRef,
        private readonly messageFacade: MessageFacade
    ) {
        super();
        this.form = new FormGroup({
            company: new FormControl(null, Validators.required),
            stores: new FormControl(null, Validators.required),
            services: new FormControl(null, Validators.required),
            storeService: this.formFactory.group('StoreService', new StoreService(), this._destroyed, {
                changeDetector,
                scope: 'MASS_UPDATE',
            }),
        });
        const requiredFieldSelection = (control: TypedFormGroup<StoreService>) => {
            const keys = Object.keys(control.controls);
            // Iterate through the controls and mark required if none are dirty or if any are invalid.
            // This prevents the user from going to the next screen until all values are valid and at least one field has been selected
            return keys.every((key) => control.get(key).valid) && keys.some((key) => control.get(key).dirty)
                ? null
                : { required: true };
        };
        this.storeServiceFormControl.setValidators([requiredFieldSelection]);
        this.storeServiceFormControl.updateValueAndValidity();
    }

    ngOnInit() {
        this.resourceFacade
            .findCompaniesByRoles(this.accessRoles)
            .subscribe((response) => (this.accessibleCompanies = response.resources));
        this.storesFormControl.valueChanges.pipe(takeUntil(this._destroyed)).subscribe(() => {
            this.serviceSelection.clear();
        });
    }

    get companyFormControl() {
        return this.form.get('company');
    }

    get storesFormControl() {
        return this.form.get('stores');
    }

    get servicesFormControl() {
        return this.form.get('services');
    }

    get storeServiceFormControl(): TypedFormGroup<StoreService> {
        return this.form.get('storeService') as TypedFormGroup<StoreService>;
    }

    get previewUpdates() {
        const dirtyFieldNames = Object.keys(this.storeServiceFormControl.controls).filter(
            (key) => this.storeServiceFormControl.get(key).dirty
        );
        // Find the columns associated with the dirty field names and return a list of all the column names
        return dirtyFieldNames.map((fieldName) =>
            Columns.toColumnArray(this.columns).find((column) => column.apiFieldPath === fieldName)
        );
    }

    companySelected() {
        this.storeSelection.clear();
        this.serviceSelection.clear();
    }

    update() {
        this.isLoading = true;
        this.storeServiceFacade
            .massUpdate({
                stores: this.storesFormControl.value,
                services: this.servicesFormControl.value,
                storeService: this.storeServiceFormControl.value,
                updateFields: Object.keys(this.storeServiceFormControl.controls).filter(
                    (key) => this.storeServiceFormControl.get(key).dirty
                ),
            })
            .subscribe(
                (updatedRecords) => {
                    this.isLoading = false;
                    this.messageFacade.addSaveCountMessage(updatedRecords, 'updated');
                    this.stepper.reset();
                    this.massUpdateComponent.reset();
                    this.storeSelection.clear();
                    this.serviceSelection.clear();
                },
                (err) => {
                    this.isLoading = false;
                    throw err;
                }
            );
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }
}
