import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CompanyExportFacade } from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import {
    CompanyService,
    CompanyServiceFacade,
    PricingStrategy,
} from '@vioc-angular/central-ui/service/data-access-company-service';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { forkJoin, Observable, of, ReplaySubject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

/**
 * Component for adding, viewing and editing Company Services.
 */
@Component({
    selector: 'vioc-angular-company-service',
    templateUrl: './company-service.component.html',
    providers: [CompanyServiceFacade, CompanyExportFacade],
})
export class CompanyServiceComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    /**
     * If this is set, the component will be treated as in "mass add" mode.  Otherwise, it will parse details from url for edit mode.
     */
    // TODO: add typing
    @Input() massAddModel: any;

    @Input() form: TypedFormGroup<CompanyService>;

    /**
     * View domain object that will model the values of the page.
     */
    model: CompanyService;

    /**
     * Indicates the way the component is being accessed and how the form should be created.
     */
    accessMode: AccessMode;

    /**
     * FormGroup tracking the FormControls of the component.
     */
    saveFacade: SaveFacade<CompanyService>;

    account$: Observable<{ costAccounts: Described[]; salesAccounts: Described[] }>;

    /**
     * List of PricingStrategies used in a dropdown.
     */
    pricingStrategies: PricingStrategy[] = Object.values(PricingStrategy);

    /**
     * Comparator for Described dropdowns.
     */
    describedEquals = Described.idEquals;

    accessibleCompanies: Described[] = [];

    addAccess: Observable<boolean>;

    private readonly _destroyed$ = new ReplaySubject(1);

    isLoading = false;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly formFactory: FormFactory,
        public readonly companyServiceFacade: CompanyServiceFacade,
        public readonly companyExportFacade: CompanyExportFacade,
        messageFacade: MessageFacade,
        private readonly routerService: RouterService,
        private readonly roleFacade: RoleFacade,
        private readonly router: Router,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.companyServiceFacade.update(model),
            (cs) => `Company Service ${cs.company.code} - ${cs.service.code} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading)
        );

        // this will trigger a reload of the component when the parameters change i.e. switching from edit to clone etc
        this.route.params.pipe(takeUntil(this._destroyed$)).subscribe(() => {
            // only run ngOnInit if the component is already initialized, otherwise when
            // the component is first created ngOnInit will run twice
            if (this.accessMode) {
                this.ngOnInit();
            }
        });
        // determine if use has add access, done here to only need to make the call once
        this.addAccess = this.roleFacade.hasAnyRole(['ROLE_COMPANY_SERVICE_ADD']);
    }

    ngOnInit() {
        if (this.form) {
            // form is already set if it is doing mass-add
            this.accessMode = AccessMode.ADD;
            // use getRawValue over value to also get disabled fields
            this.model = this.form.getRawValue();
            this.configureForm(this.model);
        } else {
            const params = this.getRouteParams(this.route);
            this.accessMode = params.accessMode;
            const companyCode = params.companyCode;
            const serviceCode = params.serviceCode;
            // Load data and create the form
            this.companyServiceFacade
                .findByCompanyAndServiceCode(companyCode, serviceCode) //
                .subscribe((companyService) => {
                    //
                    if (this.accessMode === AccessMode.ADD_LIKE) {
                        // remove fields that need to be cleared for cloning
                        this.model = {
                            ...companyService,
                            id: undefined,
                            version: undefined,
                            company: undefined,
                            salesAccount: undefined,
                            costAccount: undefined,
                            updatedBy: undefined,
                            updatedOn: undefined,
                        };
                    } else {
                        this.model = companyService;
                    }
                    this.configureForm(this.model);
                });
        }
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

    clone() {
        this.router.navigate([
            `/maintenance/company-service/clone/${this.model.company.code}/${this.model.service.code}`,
        ]);
    }

    /**
     * Builds the updated model from the form.
     */
    get updatedModel(): CompanyService {
        return Object.assign({ ...this.model }, this.form.value);
    }

    /**
     * Creates a FormGroup from the CompanyService model provided and configures the page based on the accessMode.
     *
     * @param companyService Model of the CompanyService being accessed by the page.
     */
    configureForm(companyService: CompanyService): void {
        // Build the form
        if (isNullOrUndefined(this.form)) {
            this.form = this.formFactory.group('CompanyService', companyService, this._destroyed$);
        }
        // Configure based on accessibility
        if (this.accessMode === AccessMode.VIEW) {
            // For view mode, prevent external calls and use array of set account value or empty array
            this.account$ = of({
                costAccounts: [companyService.costAccount].filter((e) => e),
                salesAccounts: [companyService.salesAccount].filter((e) => e),
            });
            this.form.disable();
        } else if (
            this.accessMode === AccessMode.ADD ||
            this.accessMode === AccessMode.EDIT ||
            this.accessMode === AccessMode.ADD_LIKE
        ) {
            // Prevent extra network call during mass-add before company is set
            if (companyService.company && companyService.company.code) {
                this.selectCompany();
            } else {
                this.account$ = undefined;
            }
        } else {
            throw Error('Unhandled Access Mode: ' + this.accessMode);
        }
        this.changeDetector.detectChanges();
    }

    selectCompany() {
        this.account$ = forkJoin([
            this.companyExportFacade.findByCompanyAndType(this.form.getControlValue('company').code, 'COST'),
            this.companyExportFacade.findByCompanyAndType(this.form.getControlValue('company').code, 'SALES'),
        ]).pipe(map(([costAccounts, salesAccounts]) => ({ costAccounts, salesAccounts })));
    }

    get serviceDescription() {
        return this.services.map(Described.codeMapper).join(', ');
    }

    get companyDescription() {
        return this.company ? Described.codeAndDescriptionMapper(this.company) : '';
    }

    get showClone() {
        return this.accessMode !== AccessMode.ADD && !this.cloning && this.addAccess;
    }

    get cloning() {
        return this.accessMode === AccessMode.ADD_LIKE;
    }

    private get company() {
        return this.model.company;
    }
    private get services() {
        return [this.model.service];
    }

    /**
     * Maps the parameter values of the ActivatedRoute to values used by the component.
     *
     * @param route ActivatedRoute being used to access the component.
     */
    private getRouteParams(
        route: ActivatedRoute
    ): { accessMode: AccessMode; companyCode: string; serviceCode: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const companyCode = params.get('companyCode');
        const serviceCode = params.get('serviceCode');
        return { accessMode, companyCode, serviceCode };
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges(): boolean {
        return this.form && this.form.dirty;
    }
}
