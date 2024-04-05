import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { CompanyExportFacade } from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import { CompanyProduct, CompanyProductFacade } from '@vioc-angular/central-ui/product/data-access-company-product';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, of, ReplaySubject } from 'rxjs';

@Component({
    selector: 'vioc-angular-company-product',
    templateUrl: './company-product.component.html',
    providers: [CompanyProductFacade, CommonCodeFacade, CompanyExportFacade],
})
export class CompanyProductComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    /**
     * FormGroup tracking the FormControls of the component.
     */
    @Input() form: TypedFormGroup<CompanyProduct>;

    /**
     * View domain object that will model the values of the page.
     */
    model: CompanyProduct;

    /**
     * Indicates the way the component is being accessed and how the form should be created.
     */
    accessMode: AccessMode;

    saveFacade: SaveFacade<CompanyProduct>;

    costAccounts$: Observable<Described[]>;
    salesAccounts$: Observable<Described[]>;
    unitOfMeasures$: Observable<Described[]>;

    /**
     * Comparator for Described dropdowns.
     */
    describedEquals = Described.idEquals;

    isLoading = false;

    private readonly _destroyed$ = new ReplaySubject(1);

    constructor(
        private readonly route: ActivatedRoute,
        private readonly formFactory: FormFactory,
        public readonly companyProductFacade: CompanyProductFacade,
        public readonly commonCodeFacade: CommonCodeFacade,
        public readonly companyExportFacade: CompanyExportFacade,
        private readonly router: Router,
        messageFacade: MessageFacade,
        private readonly routerService: RouterService
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.companyProductFacade.update(model),
            (cp) => `Company Product ${cp.company.code} - ${cp.product.code} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading)
        );
    }

    ngOnInit() {
        if (this.form) {
            // form is already set if it is doing mass-add
            this.accessMode = AccessMode.ADD;
            // use getRawValue over value to also get disabled fields
            this.model = this.form.getRawValue();
            this.createForm(this.model);
        } else {
            // Parse the parameters from the URL
            const params = this.getRouteParams(this.route);
            this.accessMode = params.accessMode;
            const companyCode = params.companyCode;
            const productCode = params.productCode;
            // Load data and create the form
            this.companyProductFacade
                .findByCompanyAndProductCode(companyCode, productCode) //
                .subscribe((companyProduct) => {
                    this.model = companyProduct;
                    this.createForm(this.model);
                });
        }
    }

    ngOnDestroy() {
        this._destroyed$.next();
    }

    /**
     * Saves and doesn't navigate.
     */
    apply(): void {
        const reload = () => {
            this.form = undefined;
            this.ngOnInit();
        };
        this.saveFacade.apply(this.form, this.model, reload).subscribe();
    }

    /**
     * Saves the values of the model.
     */
    save(): void {
        this.saveFacade.save(this.form, this.model, this.route).subscribe();
    }

    /**
     * Creates a FormGroup from the CompanyProduct model provided and configures the page based on the accessMode.
     *
     * @param companyProduct Model of the CompanyProduct being accessed by the page.
     */
    createForm(companyProduct: CompanyProduct): void {
        // Build the form
        if (isNullOrUndefined(this.form)) {
            this.form = this.formFactory.group('CompanyProduct', companyProduct, this._destroyed$);
        }

        // Configure based on accessibility
        if (this.accessMode === AccessMode.VIEW) {
            // For view mode, prevent external calls and use array of set account value or empty array
            this.costAccounts$ = of([companyProduct.costAccount].filter((e) => e));
            this.salesAccounts$ = of([companyProduct.salesAccount].filter((e) => e));
            this.unitOfMeasures$ = of([companyProduct.uom]);
            this.form.disable();
        } else if (this.accessMode === AccessMode.ADD || this.accessMode === AccessMode.EDIT) {
            this.costAccounts$ = this.companyExportFacade.findByCompanyAndType(companyProduct.company.code, 'COST');
            this.salesAccounts$ = this.companyExportFacade.findByCompanyAndType(companyProduct.company.code, 'SALES');
            this.unitOfMeasures$ = this.commonCodeFacade.findByType('PRDUOM', true, {
                field: 'code',
                direction: 'asc',
            });
            if (this.accessMode.isEdit) {
                this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
            }
        } else {
            throw Error('Unhandled Access Mode: ' + this.accessMode);
        }
    }

    /**
     * Maps the parameter values of the ActivatedRoute to values used by the component.
     *
     * @param route ActivatedRoute being used to access the component.
     */
    private getRouteParams(
        route: ActivatedRoute
    ): { accessMode: AccessMode; companyCode: string; productCode: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const companyCode = params.get('companyCode');
        const productCode = params.get('productCode');
        return { accessMode, companyCode, productCode };
    }

    get companyCodeAndDescription(): string {
        return Described.codeAndDescriptionMapper(this.form.getControl('company').value);
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.form && this.form.dirty;
    }
}
