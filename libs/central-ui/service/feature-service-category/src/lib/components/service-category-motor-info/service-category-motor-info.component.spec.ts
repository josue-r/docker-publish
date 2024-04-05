import { TextFieldModule } from '@angular/cdk/text-field';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceCategoryMotorInfo } from '@vioc-angular/central-ui/service/data-access-service-category';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { MockAddRemoveButtonComponent, UiAddRemoveButtonMockModule } from '@vioc-angular/shared/ui-add-remove-button';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import { expectInput } from '@vioc-angular/test/util-test';
import { ReplaySubject } from 'rxjs';
import { ServiceCategoryModuleForms } from '../../service-category-module-forms';
import { ServiceCategoryMotorInfoComponent } from './service-category-motor-info.component';

describe('ServiceCategoryMotorInfoComponent', () => {
    const testMotorInfo: ServiceCategoryMotorInfo[] = [
        {
            id: 1,
            serviceCategory: { id: 1, code: 'SC', description: 'Service Category', version: 1 },
            item: 'MII',
            action: 'MIA',
            version: 0,
        },
    ];

    let component: ServiceCategoryMotorInfoComponent;
    let fixture: ComponentFixture<ServiceCategoryMotorInfoComponent>;
    let formFactory: FormFactory;
    let componentDestroyed: ReplaySubject<any>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ServiceCategoryMotorInfoComponent],
            imports: [
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                NoopAnimationsModule,
                TextFieldModule,
                UiAddRemoveButtonMockModule,
                UtilFormModule,
            ],
            providers: [FormFactory, { provide: GATEWAY_TOKEN, useValue: '//gateway' }],
        }).compileComponents();
    });

    beforeEach(() => {
        componentDestroyed = new ReplaySubject(1);
        formFactory = TestBed.inject(FormFactory);
        ServiceCategoryModuleForms.registerForms(formFactory, TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(ServiceCategoryMotorInfoComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => componentDestroyed.next());

    const initialize = (accessMode: AccessMode, model: ServiceCategoryMotorInfo[] = testMotorInfo, andflush = true) => {
        const isViewMode = accessMode === AccessMode.VIEW;
        component.isViewMode = isViewMode;
        component.motorInfoFormArray = createFormArray(isViewMode, model);
        fixture.detectChanges();
        if (andflush) {
            flush();
        }
    };

    const createFormArray = (isViewMode: boolean, motorInfo: ServiceCategoryMotorInfo[]): FormArray => {
        const array = formFactory.array('ServiceCategoryMotorInfo', motorInfo, componentDestroyed);

        if (isViewMode) {
            array.disable();
        }
        return array;
    };

    it('should create', () => {
        expect(ServiceCategoryMotorInfoComponent).toBeDefined();
    });

    describe.each`
        accessMode         | control     | value    | enabled
        ${AccessMode.VIEW} | ${'item'}   | ${'MII'} | ${false}
        ${AccessMode.VIEW} | ${'action'} | ${'MIA'} | ${false}
        ${AccessMode.EDIT} | ${'item'}   | ${'MII'} | ${true}
        ${AccessMode.EDIT} | ${'action'} | ${'MIA'} | ${true}
    `('fields', ({ accessMode, control, value, enabled }) => {
        it(`should display input for ${control} as ${value} and ${enabled ? '' : 'not '}be enabled`, fakeAsync(() => {
            initialize(accessMode);
            expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
        }));
    });

    describe('with a list of ServiceCategoryMotorInfo', () => {
        const addRemoveButtonList = () => fixture.debugElement.queryAll(By.directive(MockAddRemoveButtonComponent));
        const getMotorInfoLength = () => component.motorInfoFormArray.length;

        it('should be able to add a new ServiceCategoryMotorInfo', fakeAsync(() => {
            initialize(AccessMode.EDIT, []);
            expect(getMotorInfoLength()).toBe(0);
            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    element.componentInstance.addItem.emit();
                });
            tick(100);
            expect(getMotorInfoLength()).toBe(1);
        }));

        it('should be able to add a new ServiceCategoryMotorInfo to an existing list', fakeAsync(() => {
            initialize(AccessMode.EDIT);
            expect(getMotorInfoLength()).toBe(1);
            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    element.componentInstance.addItem.emit();
                });
            tick(100);
            expect(getMotorInfoLength()).toBe(2);
        }));

        it('should be able to remove a ServiceCategoryMotorInfo', fakeAsync(() => {
            initialize(AccessMode.EDIT);
            expect(getMotorInfoLength()).toBe(1);
            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    element.componentInstance.removeItem.emit();
                });
            expect(getMotorInfoLength()).toBe(0);
        }));

        it('should not be able add or remove in view mode', fakeAsync(() => {
            initialize(AccessMode.VIEW);
            expect(
                addRemoveButtonList().filter(
                    (addRemoveButton) =>
                        addRemoveButton.componentInstance.addButtonDisplayed ||
                        addRemoveButton.componentInstance.removeButtonDisplayed
                ).length
            ).toBe(0);
        }));
    });
});
