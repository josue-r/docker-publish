import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { ServiceExtraCharge } from '@vioc-angular/central-ui/service/data-access-store-service';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described, isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { UiCurrencyPrefixModule } from '@vioc-angular/shared/ui-currency-prefix';
import { UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, TypedFormGroup, UtilFormModule } from '@vioc-angular/shared/util-form';
import { of } from 'rxjs';
import { StoreServiceModuleForms } from '../../store-service-module-forms';
import { ServiceExtraChargeComponent } from './service-extra-charge.component';

@Component({
    selector: 'vioc-angular-add-remove-button',
    template: '',
})
class MockAddRemoveButtonComponent {
    @Input() addButtonDisplayed: boolean;
    @Input() removeButtonDisplayed: boolean;
    @Input() addButtonDisabled = false;
    @Output() addItem: EventEmitter<any> = new EventEmitter();
    @Output() removeItem: EventEmitter<any> = new EventEmitter();
}

describe('ServiceExtraChargeComponent', () => {
    let component: ServiceExtraChargeComponent;
    let fixture: ComponentFixture<ServiceExtraChargeComponent>;
    let commonCodeFacade: CommonCodeFacade;
    const genericDescribed: Described = { id: 0, code: 'D', description: 'Described', version: 0 };

    /**
     * This function is designed to be what triggers the ngOnInit function of the component (fixture.detectChanges() will trigger it).
     * It makes sure that the form gets initialized with the expected values and the page is loaded with the desired accessMode.
     */
    function initializeWith(accessMode: AccessMode, ...serviceExtraCharges: ServiceExtraCharge[]) {
        component.isViewMode = accessMode === AccessMode.VIEW;
        component.serviceExtraCharges = createFormGroup(...serviceExtraCharges);
        fixture.detectChanges();
    }

    function createFormGroup(...serviceExtraCharges: ServiceExtraCharge[]): TypedFormGroup<ServiceExtraCharge>[] {
        const extraCharges: TypedFormGroup<ServiceExtraCharge>[] = [];

        if (serviceExtraCharges.filter((extraCharge) => !isNullOrUndefined(extraCharge))) {
            serviceExtraCharges.forEach((extraCharge) => {
                const charge = new FormControl();
                charge.patchValue(extraCharge.charge);
                const amount = new FormControl();
                amount.patchValue(extraCharge.amount);
                const taxable = new FormControl();
                taxable.patchValue(extraCharge.taxable);
                extraCharges.push(
                    new TypedFormGroup<ServiceExtraCharge>(
                        new FormGroup({
                            charge,
                            amount,
                            taxable,
                        })
                    )
                );
            });
        }
        return extraCharges;
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                NoopAnimationsModule,
                MatFormFieldModule,
                MatCheckboxModule,
                MatSelectModule,
                MatInputModule,
                UtilFormModule,
                UiLoadingMockModule,
                UiCurrencyPrefixModule,
            ],
            declarations: [ServiceExtraChargeComponent, MockAddRemoveButtonComponent],
            providers: [
                FormFactory,
                CommonCodeFacade,
                { provide: GATEWAY_TOKEN, useValue: '//gateway' },
                { provide: HttpClient, useValue: {} },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        // setup
        StoreServiceModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(ServiceExtraChargeComponent);
        commonCodeFacade = TestBed.inject(CommonCodeFacade);
        component = fixture.componentInstance;

        jest.spyOn(commonCodeFacade, 'findByType').mockImplementation(() => of([genericDescribed]));
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('with a list of serviceExtraCharges', () => {
        const addRemoveButtonList = () => fixture.debugElement.queryAll(By.directive(MockAddRemoveButtonComponent));
        const getServiceExtraChargesFormLength = () => component.serviceExtraCharges.length;

        const serviceExtraCharge1: ServiceExtraCharge = {
            amount: 2,
            charge: { id: 1, code: 'EXTRCHRG1', description: 'Extra Charge 1', version: 1 },
            taxable: true,
        };

        const serviceExtraCharge2: ServiceExtraCharge = {
            amount: 3.5,
            charge: { id: 2, code: 'EXTRCHRG2', description: 'Extra Charge 2', version: 1 },
            taxable: false,
        };

        it('should be able to add a new serviceExtraCharge', () => {
            initializeWith(AccessMode.EDIT);
            expect(getServiceExtraChargesFormLength()).toBe(0);

            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    element.componentInstance.addItem.emit();
                });
            expect(getServiceExtraChargesFormLength()).toBe(1);
        });

        it('should be able to add a new serviceExtraCharge to an existing list', () => {
            initializeWith(AccessMode.EDIT, serviceExtraCharge1);

            expect(getServiceExtraChargesFormLength()).toBe(1);
            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    element.componentInstance.addItem.emit();
                });
            expect(getServiceExtraChargesFormLength()).toBe(2);
        });

        it('should be able to remove a serviceExtraCharge', () => {
            initializeWith(AccessMode.EDIT, serviceExtraCharge1);

            expect(getServiceExtraChargesFormLength()).toBe(1);

            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    element.componentInstance.removeItem.emit();
                });
            expect(getServiceExtraChargesFormLength()).toBe(0);
        });

        it('should not be able to add more than 2', () => {
            initializeWith(AccessMode.EDIT, serviceExtraCharge1, serviceExtraCharge2);

            let addButtonCount = 0;
            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    addButtonCount++;
                });
            expect(addButtonCount).toBe(0);
            expect(getServiceExtraChargesFormLength()).toBe(2);
        });

        it('should not be able to add or remove an extra charge in view mode', () => {
            initializeWith(AccessMode.VIEW, serviceExtraCharge1);

            expect(
                addRemoveButtonList().filter(
                    (addRemoveButton) =>
                        addRemoveButton.componentInstance.addButtonDisplayed ||
                        addRemoveButton.componentInstance.removeButtonDisplayed
                ).length
            ).toBe(0);
        });
    });
});
