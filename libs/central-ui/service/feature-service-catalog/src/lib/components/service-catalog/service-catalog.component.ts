import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { Service, ServiceFacade, ServiceProduct } from '@vioc-angular/central-ui/service/data-access-service';
import { ServiceCategoryFacade } from '@vioc-angular/central-ui/service/data-access-service-category';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormErrorMapping, FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { EMPTY, Observable, of, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
    selector: 'vioc-angular-service',
    templateUrl: './service-catalog.component.html',
    styleUrls: ['./service-catalog.component.scss'],
    providers: [ServiceFacade, ServiceCategoryFacade, ProductCategoryFacade],
})
export class ServiceCatalogComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    /**
     * FormGroup tracking the FormControls of the component.
     */
    @Input() form: TypedFormGroup<Service>;

    /**
     * View domain object that will model the values of the page.
     */
    model: Service;

    /**
     * Indicates the way the component is being accessed and how the form should be created.
     */
    accessMode: AccessMode;

    saveFacade: SaveFacade<Service>;
    serviceCode: string;

    serviceProductsAcessible = false;
    describedEquals = Described.idEquals;

    serviceCategories$: Observable<Described[]> = EMPTY;
    productCategories$: Observable<Described[]> = EMPTY;

    isLoading = false;

    customErrorMapping: FormErrorMapping = {
        pattern: () => 'Uppercase letters and numbers only.',
    };

    private _hasAddAccess = false;

    private readonly _destroyed = new ReplaySubject(1);

    constructor(
        private readonly route: ActivatedRoute,
        private readonly formFactory: FormFactory,
        private readonly changeDetector: ChangeDetectorRef,
        private readonly routerService: RouterService,
        private readonly router: Router,
        private readonly messageFacade: MessageFacade,
        public readonly serviceFacade: ServiceFacade,
        public readonly serviceCategoryFacade: ServiceCategoryFacade,
        public readonly productCategoryFacade: ProductCategoryFacade,
        private readonly roleFacade: RoleFacade
    ) {
        super();
        // this will trigger a reload of the component when the parameters change i.e. switching from edit to clone etc
        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(() => {
            // only run ngOnInit if the component is already initialized, otherwise when
            // the component is first created ngOnInit will run twice
            if (this.accessMode) {
                this.ngOnInit();
            }
        });
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.serviceFacade.save(model),
            (s) => `Service ${s.code} - ${s.description} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            // TODO: Remove once service api has been updated with request objects using a list instead of set, fix for bug 5537
            (form: TypedFormGroup<Service>, model: Service) => Object.assign({ ...model }, form.getRawValue())
        );
    }

    ngOnInit() {
        // Parse the parameters from the URL
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        this.serviceCode = params.serviceCode;
        this.roleFacade.hasAnyRole(['ROLE_SERVICE_ADD']).subscribe((hasAddRole) => (this._hasAddAccess = hasAddRole));

        // Load the service & product categories
        this.serviceCategories$ = this.serviceCategoryFacade.findActive('LEAF');
        // Load the service & product categories
        this.productCategories$ = this.productCategoryFacade.findActive('LEAF');

        // Load data and create the form
        if (
            this.accessMode === AccessMode.VIEW ||
            this.accessMode === AccessMode.EDIT ||
            this.accessMode === AccessMode.ADD_LIKE
        ) {
            this.serviceFacade.findByCode(this.serviceCode).subscribe((service) => {
                this.model =
                    this.accessMode === AccessMode.ADD_LIKE // of cloning, remove fields that need to be cleared for cloning
                        ? {
                              ...service,
                              id: undefined,
                              version: undefined,
                              code: undefined,
                              updatedBy: undefined,
                              updatedOn: undefined,
                          }
                        : service; // otherwise, pass service to model
                this.createForm(this.model);
            });
        }

        // create the form
        if (this.accessMode === AccessMode.ADD) {
            const serviceProducts: ServiceProduct[] = [];
            this.model = {
                id: undefined,
                version: undefined,
                active: true,
                supportsECommerce: false,
                code: undefined,
                description: undefined,
                serviceCategory: undefined,
                requiresApproval: true,
                supportsQuickSale: false,
                supportsQuickInvoice: false,
                supportsRegularInvoice: false,
                supportsRefillInvoice: false,
                supportsTireCheckInvoice: false,
                serviceProducts,
            };
            this.createForm(this.model);
        }
    }

    /**
     * Maps the parameter values of the ActivatedRoute to values used by the component
     *
     * @param route ActivatedRoute being used to access the component
     */
    private getRouteParams(route: ActivatedRoute): { accessMode: AccessMode; serviceCode: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const serviceCode = params.get('serviceCode');
        return { accessMode, serviceCode };
    }

    /**
     * Create the Service and add the appropriate validators.
     */
    createForm(service: Service) {
        // Build the form, substituting the serviceProducts FormArray for the js array
        this.form = this.formFactory.group('Service', service, this._destroyed);

        // Service products are not editable if assigned to any stores
        if (
            this.accessMode === AccessMode.EDIT ||
            this.accessMode === AccessMode.ADD ||
            this.accessMode === AccessMode.ADD_LIKE
        ) {
            // Can’t modify service products if assigned to store (actively or inactively) i.e. after a service is assigned
            // to stores, the StoreService.storeServiceCharges are not editable. Hence, if accessMode allows, make  sure that
            // the service is not assigned to any stores.
            this.isAssignedToAnyStores(service).subscribe((isAssigned) => {
                this.serviceProductsAcessible = !isAssigned;
                this.serviceProductsFormArray.enable();
                if (isAssigned) {
                    // Default quantity should be editable but productCategory should not.
                    this.serviceProductsFormArray.controls.forEach((ctl) => ctl.get('productCategory').disable());
                }
            });

            // Can’t deactivate if active at store or company. If service is found to be active, need to disable active checkbox
            this.checkIfActiveAtStoreOrCompany(service);
        } else {
            this.form.disable();
        }
    }

    public isAssignedToAnyStores(service: Service): Observable<boolean> {
        return service.id ? this.serviceFacade.isAssignedToAnyStores(service) : of(false);
    }

    /**
     * Returns true if actively assigned to any company or store, else returns false
     * @param service
     */
    private checkIfActiveAtStoreOrCompany(service: Service): void {
        this.serviceFacade.checkIfActiveAtStoreOrCompany(service).subscribe((isActivelyAssigned) => {
            if (!isActivelyAssigned) {
                this.form.getControl('active').enable();
            }
        });
    }

    get serviceProductsFormArray(): FormArray {
        return this.form.getArray('serviceProducts');
    }

    get showAddLike() {
        return (this.accessMode === AccessMode.VIEW || this.accessMode === AccessMode.EDIT) && this._hasAddAccess;
    }

    addProduct(): void {
        const newServiceProduct: ServiceProduct = {
            id: null,
            productCategory: null,
            defaultQuantity: null,
            version: null,
        };
        this.serviceProductsFormArray.push(
            this.formFactory.group('ServiceProduct', newServiceProduct, this._destroyed)
        );
        this.changeDetector.detectChanges();
    }

    removeProduct(index: number): void {
        this.serviceProductsFormArray.removeAt(index);
    }

    addLike() {
        this.router.navigate([`/maintenance/service/add-like/${this.model.code}`]);
    }

    /**
     * Save and reload form
     */
    apply() {
        const code = this.form.getControlValue('code').toUpperCase();
        const reload = () => {
            if (this.accessMode === AccessMode.ADD || this.accessMode === AccessMode.ADD_LIKE) {
                this.router.navigate([`/maintenance/service/edit/${code}`], { relativeTo: this.route.parent });
            } else {
                this.ngOnInit();
            }
        };
        this.saveFacade.apply(this.form, this.model, reload).subscribe();
    }

    /**
     * Save and navigate to previous page
     */
    save() {
        this.saveFacade.save(this.form, this.model, this.route).subscribe();
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges() {
        return this.form && this.form.dirty;
    }
}
