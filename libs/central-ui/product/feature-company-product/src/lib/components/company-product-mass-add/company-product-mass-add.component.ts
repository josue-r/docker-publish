import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import {
    CompanyProduct,
    CompanyProductFacade,
    CompanyProductMassAdd,
} from '@vioc-angular/central-ui/product/data-access-company-product';
import { Product, ProductFacade } from '@vioc-angular/central-ui/product/data-access-product';
import { ProductSelectionComponent } from '@vioc-angular/central-ui/product/feature-shared-product-selection';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { merge, Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-company-product-mass-add',
    templateUrl: './company-product-mass-add.component.html',
    providers: [ProductFacade, ResourceFacade, CompanyProductFacade],
})
export class CompanyProductMassAddComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject();

    @ViewChild('stepper', { static: true }) readonly stepper: MatStepper;
    @ViewChild('productSelectionComponent', { static: true }) productSelection: ProductSelectionComponent;
    @ViewChild(FormGroupDirective, { static: true }) formDirective: FormGroupDirective;

    form: TypedFormGroup<CompanyProductMassAdd>;

    describedEquals = Described.idEquals;

    /** Default `CompanyProduct` model with un-initialized fields. */
    accessibleCompanies: Described[];

    isLoading = false;

    /** Search for `Product`s that have not already been assigned to the selected `Company`. */
    readonly searchProducts = (querySearch: QuerySearch): Observable<ResponseEntity<Product>> =>
        this.productFacade.findUnassignedProductsForCompany(this.companyControl.value, querySearch);

    get companyControl(): FormControl {
        return this.form.get('company') as FormControl;
    }
    get productsControl(): FormControl {
        return this.form.get('products') as FormControl;
    }
    get companyProductControl(): FormControl {
        return this.form.get('companyProduct') as FormControl;
    }
    get previewControl(): FormControl {
        return this.form.get('preview') as FormControl;
    }

    constructor(
        private readonly formFactory: FormFactory,
        private readonly productFacade: ProductFacade,
        private readonly resourceFacade: ResourceFacade,
        private readonly companyProductFacade: CompanyProductFacade,
        private readonly messageFacade: MessageFacade
    ) {
        super();
    }

    ngOnInit(): void {
        this.createForm();
        // Update preview form valid state on step change
        merge(
            this.companyControl.valueChanges,
            this.productsControl.valueChanges,
            this.companyProductControl.valueChanges
        )
            .pipe(takeUntil(merge(this._destroyed)))
            .subscribe(() =>
                this.previewControl.setValue(
                    this.companyControl.valid && this.productsControl.valid && this.companyProductControl.valid
                )
            );
        // Configure company dropdown
        this.resourceFacade
            .findCompaniesByRoles(['ROLE_COMPANY_SERVICE_ADD'])
            .subscribe((resp) => (this.accessibleCompanies = resp.resources));
        // Update the product code to display all selected products
        this.productsControl.valueChanges.pipe(takeUntil(this._destroyed)).subscribe((values: Product[]) =>
            this.companyProductControl.patchValue({
                ...this.companyProductControl.value,
                product: values ? ({ code: values.map((value) => value.code).join(', ') } as Product) : null,
                reportOrder: values?.length === 1 ? values[0].reportOrder : null,
                uom: values?.length === 1 ? values[0].defaultUom : null,
                active: true,
            })
        );
    }

    /** Update other dependent forms when the selected company is changed. */
    selectCompany(company: Described): void {
        // This will be undefined on setting the company for the first time
        if (this.productSelection) {
            // Clear out selected products when a company is changed
            this.productSelection.clear();
        }
        // Update company product
        this.companyProductControl.patchValue({
            ...this.companyProductControl.value,
            company,
            costAccount: null,
            salesAccount: null,
        });
    }

    /** Adds `CompanyProduct`s based on the entered information from each step. */
    addProducts(): void {
        this.isLoading = true;
        const updatedModel = this.companyProductControl.value;
        const companyProducts = this.productsControl.value.map((product: Product) => {
            return { ...updatedModel, product } as CompanyProduct;
        });
        this.companyProductFacade.add(companyProducts).subscribe(
            (addedCount) => {
                this.isLoading = false;
                this.messageFacade.addSaveCountMessage(addedCount, 'added');
                // Reset stepper/form
                this.formDirective.resetForm();
                this.stepper.reset();
            },
            (err) => {
                this.isLoading = false;
                throw err;
            }
        );
    }

    createForm(): void {
        this.form = this.formFactory.group(
            'CompanyProductMassAdd',
            new CompanyProductMassAdd(new CompanyProduct()),
            this._destroyed
        );
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }
}
