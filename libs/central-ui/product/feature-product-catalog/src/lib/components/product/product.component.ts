import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { Product, ProductFacade, ProductMotorMapping } from '@vioc-angular/central-ui/product/data-access-product';
import { ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { EMPTY, Observable, of, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductModuleForms } from '../../product-module-forms';

/**
 * Component used to add, edit, or update `Product`s.
 */
@Component({
    selector: 'vioc-angular-product',
    templateUrl: './product.component.html',
    providers: [ProductFacade, CommonCodeFacade, ProductCategoryFacade],
})
export class ProductComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    /**
     * Mode that determines the editable state of the page.
     *
     * `AccessMode.VIEW` - all fields disabled
     * `AccessMode.EDIT` - `Product.code` and `Category` are disabled
     * `AccessMode.ADD` - `Product.relatedProductCode` is disabled
     */
    accessMode: AccessMode;

    /** `Product` model that holds the values of the product being viewed. */
    model: Product;

    /** `Product` form for validating and updating product field values. */
    form: TypedFormGroup<Product>;

    /** List of product categories used to populate the `ProductCategory` dropdown. */
    productCategorie$: Observable<Described[]> = EMPTY;

    /** List used to populate the `ProductType` dropdown. */
    productType$: Observable<Described[]> = EMPTY;

    /** List used to populate the `VendorType` dropdown. */
    vendorType$: Observable<Described[]> = EMPTY;

    /** List used to populate the `UnitOfMeasure` dropdown. */
    unitOfMeasure$: Observable<Described[]> = EMPTY;

    /** List used to populate the `FluidGroup` dropdown. */
    fluidGroup$: Observable<Described[]> = EMPTY;

    /** Comparison function to specify which `Described` option is displayed. */
    describedEquals = Described.idEquals;

    /** Signifies if the `Product` being edited is assigned to `StoreProduct`s or `CompanyProduct`s. */
    isProductAssigned = false;

    categoryErrorMapping = ProductModuleForms.categoryErrorMapping;

    saveFacade: SaveFacade<Product>;

    isLoading = false;

    private _hasAddAccess = false;

    private readonly _destroyed = new ReplaySubject(1);

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly formFactory: FormFactory,
        private readonly changeDetector: ChangeDetectorRef,
        private readonly routerService: RouterService,
        private readonly roleFacade: RoleFacade,
        messageFacade: MessageFacade,
        public readonly productFacade: ProductFacade,
        public readonly commonCodeFacade: CommonCodeFacade,
        public readonly productCategoryFacade: ProductCategoryFacade
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.productFacade.save(model),
            (p) => `Product ${p.code} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<Product>, model: Product) => {
                if (this.accessMode === AccessMode.ADD) {
                    // Enable the relatedProdutCode so it can be added with the product
                    form.getControl('relatedProductCode').enable();
                }
                const updatedModel: Product = Object.assign({ ...model }, form.value);
                // Remove productMotorMaps that do not have a motorKey value
                updatedModel.productMotorMapping = updatedModel.productMotorMapping.filter((value) => value.motorKey);
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
        // Parse the parameters from the URL
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        const productCode = params.productCode;
        this.roleFacade.hasAnyRole(['ROLE_PRODUCT_ADD']).subscribe((hasAddRole) => (this._hasAddAccess = hasAddRole));
        if (
            this.accessMode === AccessMode.VIEW ||
            this.accessMode === AccessMode.EDIT ||
            this.accessMode === AccessMode.ADD_LIKE
        ) {
            // Load existing data into the form
            this.productFacade.findByCode(productCode).subscribe((product) => {
                this.model =
                    this.accessMode === AccessMode.ADD_LIKE // of cloning, remove fields that need to be cleared for cloning
                        ? {
                              ...product,
                              id: undefined,
                              version: undefined,
                              code: undefined,
                              sapNumber: undefined,
                              upc: undefined,
                              updatedBy: undefined,
                              updatedOn: undefined,
                          }
                        : product; // otherwise, pass service to model
                this.createForm(this.model);
            });
        } else if (this.accessMode === AccessMode.ADD) {
            // Create a new form, default all the boolean values as they are required
            this.model = { ...new Product(), active: true, bulk: false, obsolete: false, tankStorage: false };
            this.createForm(this.model);
        }
    }

    private getRouteParams(route: ActivatedRoute): { accessMode: AccessMode; productCode: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const productCode = params.get('productCode');
        return { accessMode, productCode };
    }

    private createForm(product: Product): void {
        // Build the form
        this.form = this.formFactory.group('Product', product, this._destroyed, {
            accessMode: this.accessMode,
            changeDetector: this.changeDetector,
            productFacade: this.productFacade,
            productCategoryFacade: this.productCategoryFacade,
        });
        // Configure based on accessibility
        if (this.accessMode === AccessMode.VIEW) {
            this.productCategorie$ = of([product.productCategory].filter((e) => e));
            this.productType$ = of([product.type].filter((e) => e));
            this.vendorType$ = of([product.vendorType].filter((e) => e));
            this.unitOfMeasure$ = of([product.defaultUom].filter((e) => e));
            this.fluidGroup$ = of([product.fluidGroup].filter((e) => e));
            this.form.disable();
        } else if (this.accessMode === AccessMode.EDIT) {
            this.loadDropdownValues();
            this.checkIfProductIsAssigned(product);
            this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
        } else if (this.accessMode === AccessMode.ADD || this.accessMode === AccessMode.ADD_LIKE) {
            this.loadDropdownValues();
        }
    }

    /** Load dropdown options externally */
    private loadDropdownValues(): void {
        this.productCategorie$ = this.productCategoryFacade.findActive('LEAF');
        this.productType$ = this.commonCodeFacade.findByType('PRODTYPE', true);
        this.vendorType$ = this.commonCodeFacade.findByType('VENDOR_TYPE', true);
        this.unitOfMeasure$ = this.commonCodeFacade.findByType('PRDUOM', true);
        this.fluidGroup$ = this.commonCodeFacade.findByType('FLUID_GROUP', true, { field: 'code', direction: 'asc' });
    }

    /** Check if product has been assigned to a company and/or store. */
    private checkIfProductIsAssigned(product: Product): void {
        this.productFacade.isProductAssigned(product).subscribe((isAssigned) => {
            this.isProductAssigned = isAssigned;
            if (!isAssigned) {
                this.form.getControl('active').enable();
            }
        });
    }

    /** Adds a new `ProductMotorMapping` to the `Product.productMotorMapping` array. */
    addProductMotorMapping(): void {
        const productMotorMapControl = this.formFactory.group(
            'ProductMotorMapping',
            new ProductMotorMapping(),
            this._destroyed
        );
        this.form.getArray('productMotorMapping').push(productMotorMapControl);
    }

    /** Removes a `ProductMotorMapping` from the `Product.productMotorMapping` array. */
    removeProductMotorMapping(index: number): void {
        this.form.getArray('productMotorMapping').removeAt(index);
    }

    /** Show add button it's the last item, and it has a value present. */
    isAddProductMotorMappingDisplayed(index: number): boolean {
        return (
            this.form.getArray('productMotorMapping').length - 1 === index &&
            this.form.getArray('productMotorMapping').controls[index].get('motorKey').value
        );
    }

    get showAddLike() {
        return this._hasAddAccess && (this.accessMode === AccessMode.EDIT || this.accessMode === AccessMode.VIEW);
    }

    addLike() {
        this.router.navigate([`/maintenance/product/add-like`, this.model.code]);
    }

    /** Save changes and reload the entity from the API. */
    apply(): void {
        const code = this.form.getControlValue('code').toUpperCase();
        const reload = () => {
            this.form = undefined;
            if (this.accessMode === AccessMode.ADD || this.accessMode === AccessMode.ADD_LIKE) {
                this.router.navigate([`/maintenance/product/edit/${code}`], {
                    relativeTo: this.route.parent,
                });
            } else {
                this.ngOnInit();
            }
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

    get showInvalidCategory(): boolean {
        return this.model.productCategory && this.accessMode.isEdit && this.form.getControl('productCategory').invalid;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
