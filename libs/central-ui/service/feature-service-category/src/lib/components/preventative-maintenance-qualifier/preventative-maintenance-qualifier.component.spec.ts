import { TextFieldModule } from '@angular/cdk/text-field';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormArray, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { PreventativeMaintenanceQualifier } from '@vioc-angular/central-ui/service/data-access-service-category';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MockAddRemoveButtonComponent, UiAddRemoveButtonMockModule } from '@vioc-angular/shared/ui-add-remove-button';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import { expectInput } from '@vioc-angular/test/util-test';
import { of, ReplaySubject } from 'rxjs';
import { ServiceCategoryModuleForms } from '../../service-category-module-forms';
import { PreventativeMaintenanceQualifierComponent } from './preventative-maintenance-qualifier.component';

describe('PreventativeMaintenanceQualifierComponent', () => {
    const testTransmissions: Described[] = [
        { id: 1, code: 'AT', description: 'Automatic', version: 1 },
        { id: 2, code: 'MA', description: 'Manual', version: 1 },
    ];

    const testPmQualifier: PreventativeMaintenanceQualifier[] = [
        {
            id: 1,
            serviceCategory: { id: 1, code: 'SC', description: 'Service Category', version: 1 },
            transmissionType: testTransmissions[0],
            qualifier: 'AT',
            version: 0,
        },
    ];

    let component: PreventativeMaintenanceQualifierComponent;
    let fixture: ComponentFixture<PreventativeMaintenanceQualifierComponent>;
    let formFactory: FormFactory;
    let componentDestroyed: ReplaySubject<any>;
    let commonCodeFacade: CommonCodeFacade;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PreventativeMaintenanceQualifierComponent],
            imports: [
                HttpClientTestingModule,
                ReactiveFormsModule,
                MatFormFieldModule,
                MatInputModule,
                MatOptionModule,
                MatSelectModule,
                NoopAnimationsModule,
                TextFieldModule,
                UiAddRemoveButtonMockModule,
                UtilFormModule,
            ],
            providers: [FormFactory, CommonCodeFacade, { provide: GATEWAY_TOKEN, useValue: '//gateway' }],
        }).compileComponents();
    });

    beforeEach(() => {
        componentDestroyed = new ReplaySubject(1);
        formFactory = TestBed.inject(FormFactory);
        commonCodeFacade = TestBed.inject(CommonCodeFacade);
        ServiceCategoryModuleForms.registerForms(formFactory, TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(PreventativeMaintenanceQualifierComponent);
        component = fixture.componentInstance;

        jest.spyOn(commonCodeFacade, 'findByType').mockReturnValue(of(testTransmissions));
    });

    afterEach(() => componentDestroyed.next());

    const initialize = (
        accessMode: AccessMode,
        model: PreventativeMaintenanceQualifier[] = testPmQualifier,
        andFlush = true
    ) => {
        const isViewMode = accessMode === AccessMode.VIEW;
        component.isViewMode = isViewMode;
        component.pmQualifierFormArray = createFormArray(isViewMode, model);
        fixture.detectChanges();
        if (andFlush) {
            flush();
        }
    };

    const createFormArray = (isViewMode: boolean, pmQualifiers: PreventativeMaintenanceQualifier[]): FormArray => {
        const array = formFactory.array('PreventativeMaintenanceQualifier', pmQualifiers, componentDestroyed);

        if (isViewMode) {
            array.disable();
        }

        return array;
    };

    it('should create', () => {
        expect(PreventativeMaintenanceQualifierComponent).toBeDefined();
    });

    describe.each`
        accessMode         | control               | value          | enabled
        ${AccessMode.VIEW} | ${'transmissionType'} | ${'Automatic'} | ${false}
        ${AccessMode.VIEW} | ${'qualifier'}        | ${'AT'}        | ${false}
        ${AccessMode.EDIT} | ${'transmissionType'} | ${'Automatic'} | ${true}
        ${AccessMode.EDIT} | ${'qualifier'}        | ${'AT'}        | ${true}
    `('fields', ({ accessMode, control, value, enabled }) => {
        it(`should display input for ${control} as ${value} and ${enabled ? '' : 'not '}be enabled`, fakeAsync(() => {
            initialize(accessMode);
            expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
        }));
    });

    it('should load a dropdown of transmission types', fakeAsync(() => {
        const spy = jest.spyOn(commonCodeFacade, 'findByType');
        initialize(AccessMode.EDIT);
        expect(spy).toHaveBeenCalledWith('TRNSTYPE', true);
    }));

    describe('with a list of PreventativeMaintenanceQualifiers', () => {
        const addRemoveButtonList = () => fixture.debugElement.queryAll(By.directive(MockAddRemoveButtonComponent));
        const getPmQualifierLength = () => component.pmQualifierFormArray.length;

        it('should be able to add a new PreventativeMaintenanceQualifier', fakeAsync(() => {
            initialize(AccessMode.EDIT, []);
            expect(getPmQualifierLength()).toBe(0);
            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    element.componentInstance.addItem.emit();
                });
            tick(100);
            expect(getPmQualifierLength()).toBe(1);
        }));

        it('should be able to add a new PreventativeMaintenanceQualifier to an existing list', fakeAsync(() => {
            initialize(AccessMode.EDIT);
            expect(getPmQualifierLength()).toBe(1);
            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    element.componentInstance.addItem.emit();
                });
            tick(100);
            expect(getPmQualifierLength()).toBe(2);
        }));

        it('should be able to remove a PreventativeMaintenanceQualifier', fakeAsync(() => {
            initialize(AccessMode.EDIT);
            expect(getPmQualifierLength()).toBe(1);
            addRemoveButtonList()
                .filter((addRemoveButton) => addRemoveButton.componentInstance.addButtonDisplayed)
                .forEach((element) => {
                    element.componentInstance.removeItem.emit();
                });
            expect(getPmQualifierLength()).toBe(0);
        }));

        it('should not be able add or remove in view mode', fakeAsync(() => {
            jest.spyOn(component, 'isPreventativeMaintenanceQualifierAddable').mockReturnValue(false);
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
