import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { Store, StoreFacade } from '@vioc-angular/central-ui/organization/data-access-store';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { SEARCHABLE_TOKEN } from '@vioc-angular/shared/data-access-search';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, EMPTY, ReplaySubject, of } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-store',
    templateUrl: './store.component.html',
    providers: [StoreFacade, CommonCodeFacade, ResourceFacade, { provide: SEARCHABLE_TOKEN, useValue: StoreFacade }],
})
export class StoreComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    /**
     * Mode that determines the editable state of the page.
     */
    accessMode: AccessMode;

    /** `Store` model that holds the values of the store being viewed. */
    model: Store;

    /** `Store` form for validating and updating store field values. */
    form: TypedFormGroup<Store>;

    /** List of companies used to populate the `Company` dropdown. */
    companies$: Observable<Described[]> = EMPTY;

    /** List of regions used to populate the `Region` dropdown. */
    regions$: Observable<Described[]> = EMPTY;

    /** List of companies used to populate the `Market` dropdown. */
    markets$: Observable<Described[]> = EMPTY;

    /** List of companies used to populate the `Area` dropdown. */
    areas$: Observable<Described[]> = EMPTY;

    /** List of classifications used to populate the `Classification` dropdown. */
    classification$: Observable<Described[]> = EMPTY;

    /** Comparison function to specify which `Described` option is displayed. */
    describedEquals = Described.idEquals;

    stateList: Observable<Described[]> = EMPTY;

    saveFacade: SaveFacade<Store>;

    isLoading = false;

    private readonly _destroyed = new ReplaySubject(1);

    roles: string[];

    constructor(
        private readonly routerService: RouterService,
        messageFacade: MessageFacade,
        private readonly route: ActivatedRoute,
        private readonly formFactory: FormFactory,
        private readonly changeDetector: ChangeDetectorRef,
        public readonly storeFacade: StoreFacade,
        public readonly commonCodeFacade: CommonCodeFacade,
        public readonly roleFacade: RoleFacade
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.storeFacade.save(model),
            (s) => `Store ${s.code} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<Store>, model: Store) => {
                return Object.assign({ ...model }, form.value);
            }
        );
        // This will trigger a reload of the component when the parameters change i.e. switching from add to edit etc
        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(() => {
            // Checking if accessMode is set to see if the component is already initialized, otherwise when
            // the component is first created ngOnInit will run twice.
            if (this.accessMode) {
                this.ngOnInit();
            }
        });
    }

    ngOnInit(): void {
        // Parse the parameters from the URL
        const params = this.getRouteParams();
        this.accessMode = params.accessMode;
        const storeCode = params.storeCode;
        if (this.accessMode.isView || this.accessMode.isEdit) {
            // Load data into the form
            this.storeFacade.findByCode(storeCode).subscribe((store: Store) => {
                this.model = store;
                this.createForm(this.model);
            });
        } else {
            throw Error('Unhandled Access Mode: ' + this.accessMode?.urlSegement);
        }
    }

    private createForm(store: Store): void {
        // Build the form
        this.form = this.formFactory.group('Store', this.model, this._destroyed, {
            accessMode: this.accessMode,
            changeDetector: this.changeDetector,
            storeFacade: this.storeFacade,
        });

        // Configure based on access
        if (this.accessMode.isView) {
            this.companies$ = of([store.company].filter((e) => e));
            this.regions$ = of([store.region].filter((e) => e));
            this.markets$ = of([store.market].filter((e) => e));
            this.areas$ = of([store.area].filter((e) => e));
            this.classification$ = of([store.classification].filter((e) => e));
            this.stateList = of([store.address.state].filter((e) => e));
            this.form.disable();
        } else if (this.accessMode.isEdit) {
            this.roleFacade.getMyRoles().subscribe((response) => {
                this.loadDropdowns();
                if (response.includes('ROLE_STORE_UPDATE')) {
                    this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
                } else if (
                    response.includes('ROLE_STORE_LATITUDE_LONGITUDE_UPDATE') ||
                    response.includes('ROLE_STORE_LOCATION_CONTENT_UPDATE')
                ) {
                    this.disableFormFieldsExceptAuthorized(response);
                }
            });
        }
    }

    // Disable all non-default disabled fields except specifically authorized
    disableFormFieldsExceptAuthorized(roles: string[]): void {
        this.form.getControl('code').disable();
        this.form.getControl('description').disable();
        this.form.getControl('active').disable();
        this.form.getControl('classification').disable();
        this.form.getControl('phone').disable();
        this.form.getControl('fax').disable();
        this.form.getControl('emergencyPhone').disable();

        if (roles.includes('ROLE_STORE_LATITUDE_LONGITUDE_UPDATE')) {
            // DigitalContentOwner only has permission to edit coordinates
            this.form.getControl('locationDirections').disable();
            this.form.getControl('communitiesServed').disable();
        } else if (roles.includes('ROLE_STORE_LOCATION_CONTENT_UPDATE')) {
            // DigitalContentAdmin only has permission to edit location content
            this.form.getControl('latitude').disable();
            this.form.getControl('longitude').disable();
        }
    }

    private getRouteParams(): { accessMode: AccessMode; storeCode: string } {
        const params = this.route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const storeCode = params.get('storeCode');
        return { accessMode, storeCode };
    }

    private loadDropdowns(): void {
        this.stateList = this.commonCodeFacade.findByType('STATE', true);
        this.classification$ = this.commonCodeFacade.findByType('STORE CLASSIFICATION', true);
    }

    /** Save changes and reload the entity from the API. */
    apply(): void {
        const reload = () => {
            this.form = undefined;
            this.ngOnInit();
        };
        this.saveFacade.apply(this.form, this.model, reload).subscribe();
    }

    /** Save and navigate back to previous page. */
    save(): void {
        this.saveFacade.save(this.form, this.model, this.route).subscribe();
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form && this.form.dirty;
    }

    get companyCodeAndDescription(): string {
        return Described.codeAndDescriptionMapper(this.form.getControl('company').value);
    }

    get regionCodeAndDescription(): string {
        return Described.codeAndDescriptionMapper(this.form.getControl('region').value);
    }

    get marketCodeAndDescription(): string {
        return Described.codeAndDescriptionMapper(this.form.getControl('market').value);
    }

    get areaCodeAndDescription(): string {
        return Described.codeAndDescriptionMapper(this.form.getControl('area').value);
    }

    get street(): string {
        const address = this.form.getControlValue('address');
        return address ? `${address.line1}` : '';
    }

    get apt(): string {
        const address = this.form.getControlValue('address');
        return address.line2 !== null ? `${address.line2}` : '';
    }

    get city(): string {
        const address = this.form.getControlValue('address');
        return address ? `${address.city}` : '';
    }

    get state(): string {
        const address = this.form.getControlValue('address');
        return address ? `${address.state}` : '';
    }

    get zip(): string {
        const address = this.form.getControlValue('address');
        return address ? `${address.zip}` : '';
    }

    get storeManager(): string {
        const manager = this.form.getControlValue('manager');
        return manager ? `${manager.firstName} ${manager.lastName}` : '';
    }

    get storeManagerId(): string {
        const manager = this.form.getControlValue('manager');
        return manager ? `${manager.id}` : '';
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
