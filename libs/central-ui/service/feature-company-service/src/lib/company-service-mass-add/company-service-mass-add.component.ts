import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { ResourceFacade } from '@vioc-angular/central-ui/organization/data-access-resources';
import {
    CompanyService,
    CompanyServiceFacade,
    CompanyServiceMassAdd,
} from '@vioc-angular/central-ui/service/data-access-company-service';
import { Service, ServiceFacade } from '@vioc-angular/central-ui/service/data-access-service';
import { ServiceSelectionComponent } from '@vioc-angular/central-ui/service/feature-shared-service-selection';
import { QuerySearch } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { ResponseEntity } from '@vioc-angular/shared/util-api';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { merge, Observable, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'vioc-angular-company-service-mass-add',
    templateUrl: './company-service-mass-add.component.html',
    providers: [ServiceFacade, ResourceFacade, CompanyServiceFacade],
})
export class CompanyServiceMassAddComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject();

    @ViewChild('stepper', { static: true }) readonly stepper: MatStepper;
    @ViewChild('serviceSelectionComponent', { static: true }) serviceSelection: ServiceSelectionComponent;
    @ViewChild(FormGroupDirective, { static: true }) formDirective: FormGroupDirective;

    form: TypedFormGroup<CompanyServiceMassAdd>;

    describedEquals = Described.idEquals;

    accessibleCompanies: Described[];

    isLoading = false;

    /** Search for `Service`s that have not already been assigned to the selected `Company`. */
    readonly searchServices = (querySearch: QuerySearch): Observable<ResponseEntity<Service>> =>
        this.serviceFacade.findUnassignedServicesForCompany(this.companyControl.value, querySearch);

    get companyControl(): FormControl {
        return this.form.getControl('companies') as FormControl;
    }
    get servicesControl(): FormControl {
        return this.form.getControl('services') as FormControl;
    }
    get companyServiceControl(): FormControl {
        return this.form.getControl('companyService') as FormControl;
    }
    get previewControl(): FormControl {
        return this.form.getControl('preview') as FormControl;
    }

    constructor(
        private readonly formFactory: FormFactory,
        private readonly serviceFacade: ServiceFacade,
        private readonly resourceFacade: ResourceFacade,
        private readonly companyServiceFacade: CompanyServiceFacade,
        private readonly messageFacade: MessageFacade
    ) {
        super();
    }

    ngOnInit(): void {
        this.form = this.formFactory.group(
            'CompanyServiceMassAdd',
            new CompanyServiceMassAdd(new CompanyService()),
            this._destroyed
        );
        // Update preview form valid state on step change
        merge(
            this.companyControl.valueChanges,
            this.servicesControl.valueChanges,
            this.companyServiceControl.valueChanges
        )
            .pipe(takeUntil(merge(this._destroyed)))
            .subscribe(() =>
                this.previewControl.setValue(
                    this.companyControl.valid && this.servicesControl.valid && this.companyServiceControl.valid
                )
            );
        // Configure company dropdown
        this.resourceFacade
            .findCompaniesByRoles(['ROLE_COMPANY_SERVICE_ADD'])
            .subscribe((resp) => (this.accessibleCompanies = resp.resources));
        // update the product code to display selected services
        this.servicesControl.valueChanges.pipe(takeUntil(this._destroyed)).subscribe((values: Service[]) => {
            this.companyServiceControl.patchValue({
                ...this.companyServiceControl.value,
                active: true,
            });
        });
    }

    /** Update other dependent forms when the selected company is changed. */
    selectCompany(company: Described): void {
        // This will be undefined on setting the company for the first time
        if (this.serviceSelection) {
            // Clear out selected services when a company is changed
            this.serviceSelection.clear();
        }
        // Update company service
        this.companyServiceControl.patchValue({
            ...this.companyServiceControl.value,
            company,
            costAccount: null,
            salesAccount: null,
        });
    }

    /** Adds `CompanyService`s based on the entered information from each step. */
    addServices(): void {
        this.isLoading = true;
        const updatedModel = this.companyServiceControl.value;
        const companyServices = this.servicesControl.value.map((service: Service) => {
            return { ...updatedModel, service } as CompanyService;
        });
        this.companyServiceFacade.add(companyServices).subscribe(
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

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form?.dirty;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }
}
