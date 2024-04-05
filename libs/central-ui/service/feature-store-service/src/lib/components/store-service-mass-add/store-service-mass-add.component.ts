import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatStepper } from '@angular/material/stepper';
import { MatTableDataSource } from '@angular/material/table';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { StoreSelectionComponent } from '@vioc-angular/central-ui/organization/feature-shared-store-selection';
import { Service, ServiceFacade } from '@vioc-angular/central-ui/service/data-access-service';
import {
    StoreService,
    StoreServiceFacade,
    StoreServiceMassAdd,
    StoreServiceMassAddPreview,
} from '@vioc-angular/central-ui/service/data-access-store-service';
import { ServiceSelectionComponent } from '@vioc-angular/central-ui/service/feature-shared-service-selection';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { merge, Observable, ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-store-service-mass-add',
    templateUrl: './store-service-mass-add.component.html',
    styleUrls: ['./store-service-mass-add.component.scss'],
    providers: [ResourceFacade, ServiceFacade, StoreServiceFacade],
})
export class StoreServiceMassAddComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroy = new ReplaySubject();
    private readonly _reset = new Subject();

    private readonly _editStepIndex = 2;
    private readonly _previewStepIndex = 3;

    @ViewChild('stepper', { static: true }) readonly stepper: MatStepper;
    @ViewChild('previewPaginator', { static: true }) previewPaginator: MatPaginator;
    @ViewChild('storeSelection', { static: true }) storeSelection: StoreSelectionComponent;
    @ViewChild('serviceSelection', { static: true }) serviceSelection: ServiceSelectionComponent;

    form: TypedFormGroup<StoreServiceMassAdd>;

    preview = new MatTableDataSource<StoreServiceMassAddPreview>([]);

    loadingPreview = false;

    previewDirty = false;

    readonly pageSizeOptions = [20, 50, 100, 1000];

    readonly initialPageSize = 20;

    readonly accessRoles = ['ROLE_STORE_SERVICE_ADD'];

    readonly searchStores = (querySearch: QuerySearch): Observable<ResponseEntity<Described>> =>
        this.resourceFacade.searchStoresByRoles(querySearch, this.accessRoles, 'FULL');

    readonly searchServices = (querySearch: QuerySearch): Observable<ResponseEntity<Service>> =>
        this.serviceFacade.search(querySearch);

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.form.dirty;
    }

    get storesControl(): FormControl {
        return this.form.getControl('stores') as FormControl;
    }

    get servicesControl(): FormControl {
        return this.form.getControl('service') as FormControl;
    }

    get storeServiceControl(): FormControl {
        return this.form.getControl('storeService') as FormControl;
    }

    constructor(
        private readonly resourceFacade: ResourceFacade,
        private readonly serviceFacade: ServiceFacade,
        private readonly storeServiceFacade: StoreServiceFacade,
        private readonly messageFacade: MessageFacade,
        private readonly formFactory: FormFactory,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        super();
    }

    ngOnInit(): void {
        this.initializeForm();
        // Setup preview loading logic
        this.stepper.selectionChange.pipe(takeUntil(this._destroy)).subscribe((stepChange: StepperSelectionEvent) => {
            // load the preview if current preview is out of date and user is going to the edit or preview step
            if (
                this.previewDirty &&
                (stepChange.selectedIndex === this._editStepIndex ||
                    stepChange.selectedIndex === this._previewStepIndex)
            ) {
                this.previewMassAdd();
            }
        });
    }

    ngOnDestroy(): void {
        this._destroy.next();
    }

    initializeForm(): void {
        this.form = this.formFactory.group(
            'StoreServiceMassAdd',
            {
                stores: [],
                service: new Service(),
                storeService: new StoreService(),
            },
            this._destroy,
            { changeDetector: this.changeDetector, accessMode: AccessMode.ADD, serviceFacade: this.serviceFacade }
        );
        // When selected stores or services change, mark the preview dirty so it reloads with updated values
        merge(this.storesControl.valueChanges, this.servicesControl.valueChanges)
            .pipe(takeUntil(merge(this._destroy, this._reset)))
            .subscribe(() => (this.previewDirty = true));
    }

    /**
     * Build a table out of what StoreServices will be assigned with the selected storeIds and serviceIds.
     */
    previewMassAdd(): void {
        const storeIds = this.storesControl.value.map(Described.idMapper);
        const serviceId = this.servicesControl.value.id;
        this.loadingPreview = true; // enable loading overlay
        this.previewDirty = false; // mark preview as up to date
        this.storeServiceFacade
            .previewMassAdd(storeIds, serviceId)
            // cancel preview call if component is destroyed, selected stores or selected services change
            .pipe(
                takeUntil(
                    merge(this.form.getControl('stores').valueChanges, this.form.getControl('service').valueChanges)
                )
            )
            .subscribe(
                (results) => {
                    this.preview = new MatTableDataSource<StoreServiceMassAddPreview>(results);
                    this.preview.paginator = this.previewPaginator;
                    this.previewPaginator.pageIndex = 0;
                    this.loadingPreview = false;
                },
                () => (this.loadingPreview = false)
            );
    }

    /**
     * Use the given store product values and assign new StoreProducts for the selected stores and products.
     */
    addStoreServices(): void {
        this.loadingPreview = true; // start loading overlay
        this.storeServiceFacade.add(this.form.getRawValue() as StoreServiceMassAdd).subscribe(
            (count) => {
                this.messageFacade.addSaveCountMessage(count, 'added');
                // Reset selections, stepper, form subscriptions and form
                this.storeSelection.clear();
                this.serviceSelection.clear();
                this.stepper.reset();
                this._reset.next();
                this.initializeForm();
                this.loadingPreview = false;
            },
            (error) => {
                this.loadingPreview = false;
                throw error;
            }
        );
    }
}
