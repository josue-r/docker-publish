import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { ServiceExtraCharge } from '@vioc-angular/central-ui/service/data-access-store-service';
import { Described } from '@vioc-angular/shared/common-functionality';
import { FormFactory, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, ReplaySubject } from 'rxjs';

/**
 * Component used to display storeService serviceExtraCharges, allowing to add and remove up to two extraCharges.
 */
@Component({
    selector: 'vioc-angular-service-extra-charge',
    templateUrl: './service-extra-charge.component.html',
})
export class ServiceExtraChargeComponent implements OnInit, OnDestroy {
    /**
     * FormArray containing formGroups that map to serviceExtraCharge fields.
     */
    @Input() serviceExtraCharges: TypedFormGroup<ServiceExtraCharge>[];

    /**
     * Determines whether or not to show the button to add/remove storeServiceExtraCharges.
     */
    @Input() isViewMode: boolean;

    /**
     * List of commonCode extraChargeTypes to be used in an extraChargeType dropdown.
     */
    extraChargeItems: Observable<Described[]>;

    serviceExtraChargeHolder: TypedFormGroup<ServiceExtraCharge>[] = [];

    describedEquals = Described.idEquals;

    private readonly destroyed = new ReplaySubject(1);

    constructor(
        private readonly changeDetector: ChangeDetectorRef,
        public readonly commonCodeFacade: CommonCodeFacade,
        private readonly formFactory: FormFactory
    ) {}

    ngOnInit(): void {
        this.extraChargeItems = this.commonCodeFacade.findByType('EXTCHRTYPE', true);
        this.createValidFormGroups();
    }

    ngOnDestroy(): void {
        this.destroyed.next();
        this.destroyed.unsubscribe();
    }

    /**
     * Creates valid `ServiceExtraCharge` FormGroups if none were provided,
     * otherwise adds the empty FormGroups to a serviceExtraChargeHolder.
     */
    createValidFormGroups(): void {
        if (this.serviceExtraCharges && this.serviceExtraCharges.length > 0) {
            // removes the empty extraCharges into the serviceExtraChargeHolder
            // so they do not appear on the page
            const emptyFormGroup = (formGroup: TypedFormGroup<ServiceExtraCharge>) =>
                Object.values(formGroup.getRawValue()).every((value) => !value);
            this.serviceExtraChargeHolder.push(
                ...this.serviceExtraCharges.splice(
                    this.serviceExtraCharges.findIndex(emptyFormGroup),
                    this.serviceExtraCharges.filter(emptyFormGroup).length
                )
            );
        } else {
            this.serviceExtraChargeHolder = [
                this.formFactory.group('ServiceExtraCharge', new ServiceExtraCharge(), this.destroyed, {
                    changeDetector: this.changeDetector,
                }),
                this.formFactory.group('ServiceExtraCharge', new ServiceExtraCharge(), this.destroyed, {
                    changeDetector: this.changeDetector,
                }),
            ];
        }
    }

    /**
     * Adds a new service extra charge to the form array.
     */
    addServiceExtraCharge(): void {
        this.serviceExtraCharges.push(this.serviceExtraChargeHolder.shift());
        this.changeDetector.detectChanges();
    }

    /**
     * Removes the service extra charge at the given index.
     */
    removeServiceExtraCharge(index: number): void {
        const extraCharge = this.serviceExtraCharges.splice(index, 1)[0];
        extraCharge.reset();
        this.serviceExtraChargeHolder.push(extraCharge);
        this.changeDetector.detectChanges();
    }

    /**
     * Determine if a ServiceExtraCharge is addable (empty array handled in html).
     */
    isExtraChargeAddable(index: number): boolean {
        const extraChargeCount = this.serviceExtraCharges.length;
        const maxExtraCharges = 2;
        return !this.isViewMode && extraChargeCount < maxExtraCharges && index + 1 === extraChargeCount;
    }
}
