import { TextFieldModule } from '@angular/cdk/text-field';
import { Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceCategoryCarFaxMapping } from '@vioc-angular/central-ui/service/data-access-car-fax-mapping';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { MockAddRemoveButtonComponent, UiAddRemoveButtonMockModule } from '@vioc-angular/shared/ui-add-remove-button';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import { expectInput } from '@vioc-angular/test/util-test';
import { ReplaySubject } from 'rxjs';
import { ServiceCategoryModuleForms } from '../../service-category-module-forms';
import { ServiceCategoryCarFaxMappingComponent } from './service-category-car-fax-mapping.component';

describe('ServiceCategoryCarFaxMappingComponent', () => {
    const testCarFaxMapping: ServiceCategoryCarFaxMapping = {
        id: 1,
        serviceCategory: { id: 1, code: 'SC', description: 'Service Category', version: 1 },
        carFaxServiceName: 'Test CarFax Service Name',
        excludeFromMapping: false,
        version: 0,
    };

    const testCarFaxServiceNames = ['Test CarFax Service Name', 'Another Test CarFax Service Name'];

    let component: ServiceCategoryCarFaxMappingComponent;
    let fixture: ComponentFixture<ServiceCategoryCarFaxMappingComponent>;
    let formFactory: FormFactory;
    let componentDestroyed: ReplaySubject<any>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ServiceCategoryCarFaxMappingComponent],
            imports: [
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                NoopAnimationsModule,
                TextFieldModule,
                UiAddRemoveButtonMockModule,
                UtilFormModule,
                MatSelectModule,
            ],
            providers: [FormFactory, { provide: GATEWAY_TOKEN, useValue: '//gateway' }],
        }).compileComponents();
    });

    beforeEach(() => {
        componentDestroyed = new ReplaySubject(1);
        formFactory = TestBed.inject(FormFactory);
        ServiceCategoryModuleForms.registerForms(formFactory, TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(ServiceCategoryCarFaxMappingComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => componentDestroyed.next());

    const initialize = (accessMode: AccessMode, model: ServiceCategoryCarFaxMapping[] = [testCarFaxMapping]) => {
        const isViewMode = accessMode === AccessMode.VIEW;
        component.isViewMode = isViewMode;
        component.carFaxMappingFormArray = createFormArray(isViewMode, model);
        component.carFaxServiceNames = testCarFaxServiceNames;
        fixture.detectChanges();
    };

    const createFormArray = (isViewMode: boolean, carFaxMappings: ServiceCategoryCarFaxMapping[]): FormArray => {
        const array = formFactory.array('ServiceCategoryCarFaxMapping', carFaxMappings, componentDestroyed);

        if (isViewMode) {
            array.disable();
        }
        return array;
    };

    const openDropdown = (index: number) => {
        fixture.debugElement
            .query(By.css(`#car-fax-service-${index}`))
            .injector.get<MatSelect>(MatSelect as Type<MatSelect>)
            .open();
        fixture.detectChanges();
    };

    it('should create', () => {
        expect(ServiceCategoryCarFaxMappingComponent).toBeDefined();
    });

    describe.each`
        accessMode         | index | value                                 | enabled
        ${AccessMode.VIEW} | ${0}  | ${'Test CarFax Service Name'}         | ${false}
        ${AccessMode.VIEW} | ${1}  | ${'Another Test CarFax Service Name'} | ${false}
        ${AccessMode.EDIT} | ${0}  | ${'Test CarFax Service Name'}         | ${true}
        ${AccessMode.EDIT} | ${1}  | ${'Another Test CarFax Service Name'} | ${true}
    `('fields', ({ accessMode, index, value, enabled }) => {
        it(`should display input for index ${index} as ${value} and ${
            enabled ? '' : 'not '
        }be enabled`, fakeAsync(() => {
            initialize(accessMode, [
                testCarFaxMapping,
                { ...testCarFaxMapping, carFaxServiceName: testCarFaxServiceNames[1] },
            ]);
            flush();
            expectInput(fixture, { id: `car-fax-service-${index}` })
                .toHaveValue(value)
                .toBeEnabled(enabled);
        }));
    });

    it('should display available car fax service names as options', () => {
        initialize(AccessMode.EDIT);
        openDropdown(0);
        const options = fixture.debugElement.queryAll(By.directive(MatOption));
        expect(options.map((option) => option.nativeElement.textContent)).toEqual(testCarFaxServiceNames);
    });

    describe('with a list of ServiceCategoryCarFaxMapping', () => {
        const addRemoveButtonList = () => fixture.debugElement.queryAll(By.directive(MockAddRemoveButtonComponent));
        const getCarFaxLength = () => component.carFaxMappingFormArray.length;

        it('should be able to add a new ServiceCategoryCarFaxMapping', () => {
            initialize(AccessMode.EDIT, []);
            expect(getCarFaxLength()).toBe(0);
            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    element.componentInstance.addItem.emit();
                });
            expect(getCarFaxLength()).toBe(1);
        });

        it('should be able to add a new ServiceCategoryCarFaxMapping to an existing list', () => {
            initialize(AccessMode.EDIT);
            expect(getCarFaxLength()).toBe(1);
            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    element.componentInstance.addItem.emit();
                });
            expect(getCarFaxLength()).toBe(2);
        });

        it('should be able to remove a ServiceCategoryCarFaxMapping', () => {
            initialize(AccessMode.EDIT);
            expect(getCarFaxLength()).toBe(1);
            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    element.componentInstance.removeItem.emit();
                });
            expect(getCarFaxLength()).toBe(0);
        });

        it('should not be able add or remove in view mode', () => {
            initialize(AccessMode.VIEW);
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
