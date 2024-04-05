import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { CarFaxMappingFacade } from '@vioc-angular/central-ui/service/data-access-car-fax-mapping';
import { CarSystemFacade } from '@vioc-angular/central-ui/service/data-access-car-system';
import { ServiceFacade } from '@vioc-angular/central-ui/service/data-access-service';
import {
    ServiceCategory,
    ServiceCategoryFacade,
    ServiceCategoryInfo,
} from '@vioc-angular/central-ui/service/data-access-service-category';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DialogComponent } from '@vioc-angular/shared/ui-dialog';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, of, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServiceCategoryModuleForms } from '../../service-category-module-forms';

@Component({
    selector: 'vioc-angular-service-category',
    templateUrl: './service-category.component.html',
    styleUrls: ['./service-category.component.scss'],
    providers: [ServiceCategoryFacade, CommonCodeFacade, ServiceFacade, CarSystemFacade, CarFaxMappingFacade],
})
export class ServiceCategoryComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    /**
     * Dialog used to show the user a confirmation message on whether or not they want to
     * clear all of the root category fields when switching from a root to a child.
     */
    @ViewChild('confirmDialog', { static: true }) dialog: DialogComponent;

    /**
     * FormGroup tracking the FormControls of the component.
     */
    @Input() form: TypedFormGroup<ServiceCategory>;

    /**
     * View domain object that will model the values of the page.
     */
    model: ServiceCategory;

    /**
     * Indicates the way the component is being accessed and how the form should be created.
     */
    accessMode: AccessMode;

    /**
     * Parent category dropdown display details
     */
    parentCategoryDisplayFn = Described.codeAndDescriptionMapper;
    parentCategoryErrorMapping = ServiceCategoryModuleForms.parentCategoryErrorMapping;

    /** Category code error mapping */
    categoryCodeErrorMapping = ServiceCategoryModuleForms.categoryCodeErrorMapping;

    saveFacade: SaveFacade<ServiceCategory>;

    carSystem$: Observable<Described[]>;
    defaultService$: Observable<Described[]>;
    parentCategory$: Observable<Described[]>;
    nocrGroup$: Observable<Described[]>;
    reportGroup$: Observable<Described[]>;
    fleetProductCode$: Observable<Described[]>;
    nacsProductCode$: Observable<Described[]>;
    carFaxServices$: Observable<string[]>;

    describedEquals = Described.idEquals;

    isLoading = false;

    private readonly _destroyed = new ReplaySubject(1);

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly formFactory: FormFactory,
        private readonly routerService: RouterService,
        private readonly messageFacade: MessageFacade,
        private readonly changeDetector: ChangeDetectorRef,
        public readonly serviceCategoryFacade: ServiceCategoryFacade,
        public readonly commonCodeFacade: CommonCodeFacade,
        public readonly carSystemFacade: CarSystemFacade,
        public readonly serviceFacade: ServiceFacade,
        public readonly carFaxMappingFacade: CarFaxMappingFacade
    ) {
        super();

        this.route.params.pipe(takeUntil(this._destroyed)).subscribe(() => {
            if (this.accessMode) {
                this.ngOnInit();
            }
        });

        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.serviceCategoryFacade.save(model),
            (sc) => `Service category ${sc.code} - ${sc.description} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<ServiceCategory>, model: ServiceCategory) => {
                let formValue: ServiceCategory;
                if (isNullOrUndefined(form.value.parentCategory)) {
                    formValue = form.value;
                } else {
                    // set parent category only fields to null/empty
                    formValue = {
                        ...form.value,
                        serviceInfo: null,
                        defaultService: null,
                        carFaxMapping: [],
                        motorInfo: [],
                        preventativeMaintenanceQualifiers: [],
                    };
                }
                return Object.assign({ ...model }, formValue);
            }
        );
    }

    ngOnInit() {
        // Parse the parameters from the URL
        const params = this.getRouteParams(this.route);
        this.accessMode = params.accessMode;
        const categoryCode = params.categoryCode;
        if (!this.accessMode.isAdd) {
            this.serviceCategoryFacade.findByCode(categoryCode).subscribe((serviceCategory) => {
                this.model = serviceCategory;
                this.createForm(this.model);
            });
        } else {
            this.model = {
                ...new ServiceCategory(),
                active: true,
                serviceInfo: {
                    ...new ServiceCategoryInfo(),
                    appearOnWorkOrder: false,
                    technicalInformationRequired: false,
                },
                premium: false,
                excludeFromMetrics: false,
                carFaxMapping: [],
                motorInfo: [],
                preventativeMaintenanceQualifiers: [],
            };
            this.createForm(this.model);
        }
    }

    /**
     * Maps the parameter values of the ActivatedRoute to values used by the component
     *
     * @param route ActivatedRoute being used to access the component
     */
    private getRouteParams(route: ActivatedRoute): { accessMode: AccessMode; categoryCode: string } {
        const params = route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const categoryCode = params.get('categoryCode');
        return { accessMode, categoryCode };
    }

    /**
     * Create the Service Category form
     */
    createForm(serviceCategory: ServiceCategory) {
        // Build the form
        this.form = this.formFactory.group('ServiceCategory', serviceCategory, this._destroyed, {
            accessMode: this.accessMode,
            changeDetector: this.changeDetector,
            serviceCategoryFacade: this.serviceCategoryFacade,
        });

        // Configure based on accessibility
        if (this.accessMode.isView) {
            if (this.isRootCategory) {
                this.carSystem$ = of([serviceCategory.serviceInfo.carSystem].filter((e) => e));
                this.defaultService$ = of([serviceCategory.defaultService].filter((e) => e));
                this.reportGroup$ = of([serviceCategory.serviceInfo.reportGroup].filter((e) => e));
                this.carFaxServices$ = of(
                    serviceCategory.carFaxMapping.map((cfm) => cfm.carFaxServiceName).filter((e) => e)
                );
            }
            this.nacsProductCode$ = of([serviceCategory.nacsProductCode].filter((e) => e));
            this.parentCategory$ = of([serviceCategory.parentCategory].filter((e) => e));
            this.fleetProductCode$ = of([serviceCategory.fleetProductCode].filter((e) => e));
            this.nocrGroup$ = of([serviceCategory.nocrGroup].filter((e) => e));

            this.form.disable();
        } else if (this.accessMode.isAdd || this.accessMode.isEdit) {
            if (this.accessMode.isEdit) {
                this.form.markAllAsTouched(); // Displays errors for components that are loaded with invalid data
            }

            if (this.isRootCategory) {
                if (this.accessMode.isEdit) {
                    this.defaultService$ = this.serviceFacade.findActiveByCategory(this.model.code);
                }
                this.carSystem$ = this.carSystemFacade.findActive();
                this.reportGroup$ = this.commonCodeFacade.findByType('SCATRPTGRP');
                this.carFaxServices$ = this.carFaxMappingFacade.getServiceNames();
            }
            this.nacsProductCode$ = this.commonCodeFacade.findByType('NACSPRODUCT');
            this.parentCategory$ = this.serviceCategoryFacade.findActive('ALL');
            this.fleetProductCode$ = this.commonCodeFacade.findByType('BILLCODE');
            this.nocrGroup$ = this.commonCodeFacade.findByType('NOCR_METRICS_GROUP');
        } else {
            throw Error('Unhandled Access Mode: ' + this.accessMode.urlSegement);
        }
    }

    get updatedModel(): ServiceCategory {
        return Object.assign({ ...this.model }, this.form.value);
    }

    get parentCategory() {
        return this.form.getControl('parentCategory');
    }

    get pmQualifier() {
        return this.form.getArray('preventativeMaintenanceQualifiers');
    }
    get carFaxMapping() {
        return this.form.getArray('carFaxMapping');
    }
    get motorInfo() {
        return this.form.getArray('motorInfo');
    }

    /**
     * A root root category has no parent category.  These categories have additional configuration available.
     **/
    get isRootCategory(): boolean {
        return this.form.getControlValue('parentCategory') === null;
    }

    get hasPmQualifier(): boolean {
        return this.isRootCategory && (this.pmQualifier?.length > 0 || !this.accessMode.isView);
    }

    get hasCarfaxMapping(): boolean {
        return this.isRootCategory && (this.carFaxMapping?.length > 0 || !this.accessMode.isView);
    }

    get hasMotorInfo(): boolean {
        return this.isRootCategory && (this.motorInfo?.length > 0 || !this.accessMode.isView);
    }

    /**
     * Will return null if not a root category
     **/
    get serviceInfoForm(): TypedFormGroup<ServiceCategoryInfo> {
        return this.form.getControl('serviceInfo') as TypedFormGroup<ServiceCategoryInfo>;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
    }

    /**
     * Save the values of the model without navigating away from page
     */
    apply() {
        const reload = () => {
            if (this.accessMode.isAdd) {
                const code = this.form.getControlValue('code');
                this.router.navigate([AccessMode.EDIT.urlSegement, code], { relativeTo: this.route.parent });
            } else {
                this.ngOnInit();
            }
        };
        this.saveFacade.apply(this.form, this.model, reload).subscribe();
    }

    /**
     * Save the values of the model
     */
    save() {
        this.saveFacade.save(this.form, this.model, this.route).subscribe();
    }

    /**
     * Reloads the form when the parent category has been changed. If the parent
     * category was null/undefined, but now has a value, then a dialog will open
     * to confirm the users action of switching from a root to a child category.
     * Otherwise it will reload the form.
     */
    reload() {
        if (
            this.accessMode.isEdit &&
            isNullOrUndefined(this.model.parentCategory) &&
            !isNullOrUndefined(this.form.getControlValue('parentCategory'))
        ) {
            this.dialog.open();
        } else {
            this.createForm(this.updatedModel);
        }
    }

    /**
     * Loads the form with only the value child category fields and closes the
     * confirmation dialog box.
     */
    loadChildForm() {
        this.createForm(this.updatedModel);
        // Reload form and trigger async validation for parent category
        this.form.getControl('parentCategory').markAsDirty();
        if (this.dialog) {
            this.dialog.close();
        }
    }

    /**
     * Cancels the process for switching a root category to a child category,
     * resets the parent category field to null and closes the confirmation dialog.
     */
    cancelRootSwitch() {
        this.form.setControlValue('parentCategory', null);
        this.dialog.close();
    }

    /**
     * @see DataModifyingComponent
     */
    get unsavedChanges() {
        return this.form && this.form.dirty;
    }
}
