import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { ProductCategory, ProductCategoryFacade } from '@vioc-angular/central-ui/product/data-access-product-category';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, of, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProductCategoryModuleForms } from '../../product-category-module-forms';

@Component({
    selector: 'vioc-angular-product-category',
    templateUrl: './product-category.component.html',
    providers: [ProductCategoryFacade, CommonCodeFacade],
})
export class ProductCategoryComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    /** Mode that determines the editable state of the page. */
    accessMode: AccessMode;
    /** Model that holds the values of the commonCode being viewed. */
    model: ProductCategory = null;
    /** Form for validating and updating commonCode field values. */
    form: TypedFormGroup<ProductCategory>;

    /** The value used when calling `findByCode` to load the model. */
    code: string;

    // Observables that will contain dropdown values
    nacsProductCode$: Observable<Described[]>;
    fleetProductCode$: Observable<Described[]>;
    productRating$: Observable<Described[]>;
    parentCategory$: Observable<Described[]>;

    saveFacade: SaveFacade<ProductCategory>;

    isLoading = false;

    private readonly _destroyed = new ReplaySubject(1);

    /** Comparison function to specify which `Described` option is displayed. */
    describedEquals = Described.idEquals;

    /** Formats the values of the `parentCategory` filtered dropdown to be 'code - description' */
    parentCategoryCodeDescriptionFn = Described.codeAndDescriptionMapper;

    productCategoryCodeErrorMapping = ProductCategoryModuleForms.productCategoryCodeErrorMapping;

    constructor(
        private readonly changeDetector: ChangeDetectorRef,
        private readonly formFactory: FormFactory,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly routerService: RouterService,
        public readonly commonCodeFacade: CommonCodeFacade,
        public readonly messageFacade: MessageFacade,
        public readonly productCategoryFacade: ProductCategoryFacade
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.productCategoryFacade.save(model),
            (pc) => `Product Category ${pc.code} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<ProductCategory>, model: ProductCategory): ProductCategory => {
                let formValue: ProductCategory;
                // Only checking primaryTable because if primaryTable is null, then primaryColumn must be null too.
                // Not checking secondary info because it requires the primary info to be set
                if (form.value.motorInfo.primaryTable && !isNullOrUndefined(form.value.parentCategory)) {
                    formValue = form.value;
                } else {
                    formValue = { ...form.value, motorInfo: null };
                }
                return Object.assign({ ...model }, formValue);
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
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        this.code = params.productCategoryCode;

        if (this.accessMode === AccessMode.VIEW || this.accessMode === AccessMode.EDIT) {
            // fetch the model from the facade and load existing data into the form
            this.productCategoryFacade.findByCode(this.code).subscribe((productCategory) => {
                this.model = productCategory;
                this.createForm(this.model);
            });
        } else if (this.accessMode === AccessMode.ADD) {
            // Create a new form, default all the boolean values as they are required
            this.model = { ...new ProductCategory(), active: true, highMileage: false, diesel: false };
            this.createForm(this.model);
        }
    }

    private getRouteParams(route: ActivatedRoute): { accessMode: AccessMode; productCategoryCode: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const productCategoryCode = params.get('productCategoryCode');
        return { accessMode, productCategoryCode };
    }

    /**
     * Initializing the form with the current product category values.
     */
    private createForm(model: ProductCategory): void {
        this.form = this.formFactory.group('ProductCategory', model, this._destroyed, {
            changeDetector: this.changeDetector,
            accessMode: this.accessMode,
        });
        if (this.accessMode === AccessMode.VIEW) {
            this.nacsProductCode$ = of([model.nacsProductCode].filter((e) => e));
            this.fleetProductCode$ = of([model.fleetProductCode].filter((e) => e));
            this.productRating$ = of([model.productRating].filter((e) => e));
            this.parentCategory$ = of([model.parentCategory].filter((e) => e));
            this.form.disable();
        } else if (this.accessMode === AccessMode.EDIT) {
            this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
            this.loadDropdownValues();
        } else if (this.accessMode === AccessMode.ADD) {
            this.loadDropdownValues();
        } else {
            throw Error('Unhandled Access Mode: ' + this.accessMode);
        }
    }

    /** Gets the display value of `parentCategory` for the dropdown */
    get parentCategoryControl(): AbstractControl {
        return this.form.getControl('parentCategory');
    }

    /** A root root category has no parent category. */
    get isRootCategory(): boolean {
        return isNullOrUndefined(this.form.getControlValue('parentCategory'));
    }

    /** Load dropdown options externally */
    private loadDropdownValues(): void {
        this.nacsProductCode$ = this.commonCodeFacade.findByType('NACSPRODUCT', true);
        this.fleetProductCode$ = this.commonCodeFacade.findByType('BILLCODE', true);
        this.productRating$ = this.commonCodeFacade.findByType('PRODRATING', true);
        this.parentCategory$ = this.productCategoryFacade.findAssignableParents();
    }

    /** Save changes and reload the entity from the API. */
    apply(): void {
        const code = this.form.getControlValue('code');
        const reload = () => {
            this.form = undefined;
            if (this.accessMode === AccessMode.ADD) {
                this.router.navigate([AccessMode.EDIT.urlSegement, code], { relativeTo: this.route.parent });
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

    ngOnDestroy(): void {
        this._destroyed.next();
    }
}
