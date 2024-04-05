import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import { CompanyServiceFacade, PricingStrategy } from '@vioc-angular/central-ui/service/data-access-company-service';
import { ServiceFacade } from '@vioc-angular/central-ui/service/data-access-service';
import {
    StoreService,
    StoreServiceFacade,
    StoreServiceMassAdd,
} from '@vioc-angular/central-ui/service/data-access-store-service';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import * as moment from 'moment';
import { Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-store-service',
    templateUrl: './store-service.component.html',
    styleUrls: ['./store-service.component.scss'],
    providers: [StoreServiceFacade, CompanyServiceFacade, ServiceFacade, CommonCodeFacade, ResourceFacade],
})
export class StoreServiceComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed$ = new ReplaySubject(1);

    /**
     * Determines if the component is in mass add mode
     */
    @Input() massAddForm: TypedFormGroup<StoreServiceMassAdd>;

    form: TypedFormGroup<StoreService>;

    accessMode: AccessMode;

    storeService: StoreService;

    saveFacade: SaveFacade<StoreService>;

    extraChargeItems$: Observable<Described[]>;

    /**
     * Signifies product based pricingStrategy, default value is false.
     */
    isProductBasedPricingStrategy = false;

    isLoading = false;

    hasAddAccess: boolean;

    describedEquals = Described.idEquals;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly formFactory: FormFactory,
        private readonly messageFacade: MessageFacade,
        public readonly storeServiceFacade: StoreServiceFacade,
        public readonly companyServiceFacade: CompanyServiceFacade,
        public readonly serviceFacade: ServiceFacade,
        private readonly router: Router,
        private readonly roleFacade: RoleFacade,
        public readonly commonCodeFacade: CommonCodeFacade,
        public readonly resourceFacade: ResourceFacade,
        private readonly routerService: RouterService,
        private readonly changeDetector: ChangeDetectorRef
    ) {
        super();

        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.storeServiceFacade.save(model),
            (ss) => `Store Service ${ss.store.code} - ${ss.service.code} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            // check the nested form values to see if any are empty, if so set them to null
            (form, model) => {
                if (form.value.extraCharge1.charge == null) {
                    form.value.extraCharge1 = null;
                }
                if (form.value.extraCharge2.charge == null) {
                    form.value.extraCharge2 = null;
                }
                return Object.assign(model, form.value);
            }
        );

        // this will trigger a reload of the component when the parameters change i.e. switching from edit to clone etc
        this.route.params.pipe(takeUntil(this._destroyed$)).subscribe(() => {
            // only run ngOnInit if the component is already initialized, otherwise when
            // the component is first created ngOnInit will run twice
            if (this.accessMode) {
                this.ngOnInit();
            }
        });
    }

    ngOnInit(): void {
        this.determineAccessMode();
        this.extraChargeItems$ = this.commonCodeFacade.findByType('EXTCHRTYPE', true);
        // determine if use has add access, done here to only need to make the call once
        this.roleFacade
            .hasAnyRole(['ROLE_STORE_SERVICE_ADD'])
            .subscribe((hasAddRole) => (this.hasAddAccess = hasAddRole));

        if (this.accessMode.isAdd) {
            // use the storeService form from the massAddForm for the edit component
            this.form = this.massAddForm.getControl('storeService') as TypedFormGroup<StoreService>;
            this.storeService = this.form.getRawValue();
            this.initializeForm();
        } else {
            const params = this.getRouteParams(this.route);
            const store = params.storeNum;
            const code = params.serviceCode;
            this.storeServiceFacade.findByStoreAndService(store, code).subscribe((response) => {
                this.storeService = response;
                this.initializeForm();
            });
        }
    }

    get serviceControl() {
        return this.form.getControl('service');
    }

    get productExtraChargesControl() {
        return this.form.getControl('productExtraCharges');
    }

    get storeDescription(): string {
        return this.storeService.store ? Described.codeMapper(this.storeService.store) : '';
    }

    get serviceDescription() {
        const service = this.form.getControlValue('service');
        return service ? `${service.code} - ${service.description}` : '';
    }

    get updatedModel(): StoreService {
        return Object.assign({ ...this.storeService }, this.form.value);
    }

    private determineAccessMode(): void {
        if (this.massAddForm) {
            // massAddForm input will be set if mass-adding
            this.accessMode = AccessMode.ADD;
        } else {
            this.accessMode = AccessMode.of(this.route.snapshot.paramMap.get('accessMode'));
        }
    }

    /**
     * Initializing the form with the current store service values as well as setting up validation and disabled fields.
     */
    private initializeForm(): void {
        if (isNullOrUndefined(this.form)) {
            // Use a temporary form object and set the form at the end. This ensures that the form is complete abefore rendering
            this.form = this.formFactory.group('StoreService', this.storeService, this._destroyed$, {
                changeDetector: this.changeDetector,
            });
        }
        // based on the accessMode, add validators and disable appropriate storeService fields
        if (this.accessMode.isView) {
            this.form.disable();
        } else if (this.accessMode.isEdit) {
            this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
        }

        this.changeDetector.detectChanges();
        // fetching pricing strategy for the passed companycode and service code
        if (!this.accessMode.isAdd) {
            this.companyServiceFacade
                .findByCompanyAndServiceCode(this.storeService.store.company.code, this.storeService.service.code)
                .subscribe((companyService) => {
                    const pricingStrategy = companyService.pricingStrategy;
                    if (pricingStrategy === PricingStrategy.PRODUCT) {
                        // setting pricing strategy field to be used for displaying hint if pricingStrategy is 'PRODUCT'.
                        this.isProductBasedPricingStrategy = true;
                        this.updateServicePrice();
                    }
                });
        }
    }

    /**
     * Setting servicePrice field value to 0 and marking it disabled if pricingStrategy is 'PRODUCT'.
     */
    private updateServicePrice() {
        this.form.setControlValue('servicePrice', 0.0);
        this.form.getControl('servicePrice').disable();
    }

    /**
     * Saves and doesn't navigate.
     */
    apply(): void {
        const reload = () => {
            this.form = undefined;
            this.ngOnInit();
        };
        this.saveFacade.apply(this.form, this.updatedModel, reload).subscribe();
    }

    /**
     * Saves the values of the model.
     */
    save(): void {
        this.saveFacade.save(this.form, this.updatedModel, this.route).subscribe();
    }

    promotionalPriceIsInEffect(): boolean {
        const promotionStartDate = this.form.getControlValue('promotionStartDate');
        const promotionEndDate = this.form.getControlValue('promotionEndDate');
        return moment().isBetween(promotionStartDate, promotionEndDate);
    }

    minimumPriceIsGreaterThanOverrideableMax(): boolean {
        const minPrice = this.form.getControlValue('priceOverrideMin');
        const maxPrice = this.form.getControlValue('priceOverrideMax');
        return maxPrice !== (undefined || null) && minPrice > maxPrice;
    }

    servicePriceIsGreaterThanOverrideableMax(): boolean {
        const servicePrice = this.form.getControlValue('servicePrice');
        const maxPrice = this.form.getControlValue('priceOverrideMax');
        return maxPrice !== (undefined || null) && servicePrice > maxPrice;
    }

    noProductExtraChargeExists(): boolean {
        return !this.form.getArray('productExtraCharges').controls.some((control) => control.get('charge').value);
    }

    ngOnDestroy(): void {
        this._destroyed$.next();
        this._destroyed$.unsubscribe();
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges() {
        return this.form?.dirty;
    }

    /**
     * Maps the parameter values of the ActivatedRoute to values used by the component.
     *
     * @param route ActivatedRoute being used to access the component.
     */
    private getRouteParams(route: ActivatedRoute): { accessMode: AccessMode; storeNum: string; serviceCode: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const storeNum = params.get('storeNum');
        const serviceCode = params.get('serviceCode');
        return { accessMode, storeNum, serviceCode };
    }
}
