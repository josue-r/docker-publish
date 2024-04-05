import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServiceCategoryFacade } from '@vioc-angular/central-ui/service/data-access-service-category';
import { DocumentFile, Tsb, TsbFacade } from '@vioc-angular/central-ui/technical/data-access-tsb';
import { SaveFacade } from '@vioc-angular/central-ui/util-component';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { defaultEmptyObjectToNull, Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { DataModifyingComponent } from '@vioc-angular/shared/util-data-modifying';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, of, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TsbForms } from '../tsb-module.forms';

@Component({
    selector: 'vioc-angular-tsb',
    templateUrl: './tsb.component.html',
    styleUrls: ['./tsb.component.scss'],
    providers: [TsbFacade, ServiceCategoryFacade],
})
export class TsbComponent extends DataModifyingComponent implements OnInit, OnDestroy {
    private readonly _destroyed = new ReplaySubject(1);

    /** Mode that determines the editable state of the page. */
    accessMode: AccessMode;

    /** Model that holds the values of the Common Code being viewed. */
    model: Tsb;

    /** Form for validating and updating Common Code field values. */
    form: TypedFormGroup<Tsb>;

    /** Custom Tsb form errors. */
    tsbErrorMapping = TsbForms.tsbErrorMapping;

    saveFacade: SaveFacade<Tsb>;

    isLoading = false;

    serviceCategories$: Observable<Described[]>;

    filterVehicleDetails = false;

    idEquals = Described.idEquals;

    constructor(
        private readonly routerService: RouterService,
        messageFacade: MessageFacade,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly formFactory: FormFactory,
        private readonly tsbFacade: TsbFacade,
        private readonly serviceCategoryFacade: ServiceCategoryFacade
    ) {
        super();
        this.saveFacade = new SaveFacade(
            this.routerService,
            messageFacade,
            (model) => this.tsbFacade.save(model),
            (tsb) => `Tsb ${tsb.name} saved successfully`,
            (isLoading: boolean) => (this.isLoading = isLoading),
            (form: TypedFormGroup<Tsb>, model: Tsb): Tsb => {
                const requestObject: Tsb = Object.assign({ ...model }, form.value);
                // If the document is the same, so no reason to send up the document bytes
                if (model.documentFile && model.documentFile.document === form.value.documentFile?.document) {
                    requestObject.documentFile = { id: model.documentFile.id };
                }
                // Remove any empty vehicle mappings
                requestObject.vehicles = requestObject.vehicles.filter((vehicle) => {
                    const wrappingObject = { vehicle }; // temporarily wrapping vehicle to enable defaultEmptyObjectToNull
                    defaultEmptyObjectToNull(wrappingObject, ['vehicle']);
                    return wrappingObject.vehicle !== null;
                });
                requestObject.vehicles.forEach((vehicle) => {
                    vehicle.attributes = vehicle.attributes
                        ? vehicle.attributes
                              .filter((attribute) => attribute.key !== null && attribute.type !== null)
                              // filter out engine designations and sub models when the make and/or model are null
                              .filter(
                                  (attribute) =>
                                      (!isNullOrUndefined(vehicle.makeId) &&
                                          attribute.type.code === 'ENGINE_DESIGNATION') ||
                                      (!isNullOrUndefined(vehicle.makeId) &&
                                          !isNullOrUndefined(vehicle.modelId) &&
                                          attribute.type.code === 'SUB_MODEL') ||
                                      !['ENGINE_DESIGNATION', 'SUB_MODEL'].includes(attribute.type.code)
                              )
                        : [];
                });
                return requestObject;
            }
        );
        // This will trigger a reload of the component when the route parameters change i.e. switching from add to edit etc
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
        const params = this.getRouteParams();
        this.accessMode = params.accessMode;
        if (this.accessMode.isView || this.accessMode.isEdit) {
            const tsbId = +params.tsbId;
            this.tsbFacade.findById(tsbId).subscribe((tsb: Tsb) => {
                this.model = tsb;
                this.createForm();
            });
        } else if (this.accessMode.isAdd) {
            this.model = new Tsb();
            this.createForm();
        }
    }

    private getRouteParams(): { accessMode: AccessMode; tsbId: string } {
        const params = this.route.snapshot.paramMap;
        const accessMode = AccessMode.of(params.get('accessMode'));
        const tsbId = params.get('tsbId');
        return { accessMode, tsbId };
    }

    private createForm(): void {
        this.form = this.formFactory.group('Tsb', this.model, this._destroyed);
        if (this.accessMode.isView) {
            this.serviceCategories$ = of([this.model.serviceCategory].filter((e) => e));
            this.form.disable();
        } else if (this.accessMode.isEdit) {
            this.serviceCategories$ = this.serviceCategoryFacade.findActive('ROOT');
            this.form.markAllAsTouched();
        } else if (this.accessMode.isAdd) {
            this.serviceCategories$ = this.serviceCategoryFacade.findActive('ROOT');
        } else {
            throw Error('Unhandled Access Mode: ' + this.accessMode);
        }
        this.checkForVehicleFilter();
    }

    /** Adding a vehicle filter if there are more than 30 mappings */
    private checkForVehicleFilter(): void {
        const filterVehicleThreshold = 30;
        if (this.vehiclesControlArray.length > filterVehicleThreshold) {
            this.filterVehicleDetails = true;
        }
    }

    onDocumentFileChange(documentFile: DocumentFile): void {
        this.form.setControlValueDirtying('documentFile', documentFile);
    }

    onExternalLinkChange(externalLink: string): void {
        this.form.setControlValueDirtying('externalLink', externalLink);
    }

    /** Save changes and reload the entity from the API. */
    apply(): void {
        this.saveFacade
            .apply(this.form, this.model, () => {})
            .subscribe((tsbId) => {
                this.form = undefined;
                if (this.accessMode.isAdd) {
                    this.router.navigate([AccessMode.EDIT.urlSegement, tsbId], { relativeTo: this.route.parent });
                } else {
                    this.ngOnInit();
                }
            });
    }

    /** Save and navigate back to previous page. */
    save(): void {
        this.saveFacade.save(this.form, this.model, this.route).subscribe();
    }

    get serviceCategoryControl(): AbstractControl {
        return this.form.getControl('serviceCategory');
    }

    get vehiclesControlArray(): FormArray {
        return this.form.getArray('vehicles');
    }

    /** @see DataModifyingComponent */
    get unsavedChanges(): boolean {
        return this.form && this.form.dirty;
    }

    ngOnDestroy(): void {
        this._destroyed.next();
        this._destroyed.unsubscribe();
    }
}
