import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Store } from '@vioc-angular/central-ui/organization/data-access-resources';
import { FeatureSharedStoreSelectionMockModule } from '@vioc-angular/central-ui/organization/feature-shared-store-selection';
import { Service } from '@vioc-angular/central-ui/service/data-access-service';
import { FeatureSharedServiceSelectionMockModule } from '@vioc-angular/central-ui/service/feature-shared-service-selection';
import { CentralFormUiModule } from '@vioc-angular/central-ui/ui-modules';
import { UiStepperNavigationMockModule } from '@vioc-angular/shared/ui-stepper-navigation';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { of, throwError } from 'rxjs';
import { StoreServiceModuleForms } from '../../store-service-module-forms';
import { StoreServiceMassAddComponent } from './store-service-mass-add.component';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
import { By } from '@angular/platform-browser';
import { StoreServiceMassAddPreview } from '@vioc-angular/central-ui/service/data-access-store-service';

@Component({
    selector: 'vioc-angular-store-service',
    template: ``,
})
class MockStoreServiceComponent {
    @Input() massAddForm: any;
}

describe('StoreServiceMassAddComponent', () => {
    let component: StoreServiceMassAddComponent;
    let fixture: ComponentFixture<StoreServiceMassAddComponent>;
    let formFactory: FormFactory;
    const testStore = { id: 1, desc: 'store1' } as Store;
    const testService = { id: 2, desc: 'serv1' } as Service;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                CentralFormUiModule,
                FeatureSharedStoreSelectionMockModule,
                FeatureSharedServiceSelectionMockModule,
                MatStepperModule,
                MatListModule,
                MatTableModule,
                MatPaginatorModule,
                UiStepperNavigationMockModule,
                CommonFunctionalityModule,
            ],
            declarations: [StoreServiceMassAddComponent, MockStoreServiceComponent],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: { get: jest.fn(() => of()) } },
                FormFactory,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StoreServiceMassAddComponent);
        component = fixture.componentInstance;
        formFactory = TestBed.inject(FormFactory);
        StoreServiceModuleForms.registerForms(formFactory, TestBed.inject(FormBuilder));
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should setup the StoreServiceMassAdd form', () => {
            jest.spyOn(formFactory, 'group');
            // execute ngOnInit via first detectChanges call
            fixture.detectChanges();
            expect(component.form.getControl('stores')).toBeDefined();
            expect(component.form.getControl('service')).toBeDefined();
            expect(component.form.getControl('storeService')).toBeDefined();
        });
    });

    describe('after initialized', () => {
        beforeEach(() => fixture.detectChanges());

        describe('preview subscription logic', () => {
            it('should be marked dirty when the store selection changes', () => {
                expect(component.previewDirty).toBeFalsy();
                // execute subscription via a value update
                component.storesControl.setValue([testStore]);
                expect(component.previewDirty).toBeTruthy();
            });

            it('should be marked dirty when the store service changes', () => {
                expect(component.previewDirty).toBeFalsy();
                // execute subscription via a value update
                component.servicesControl.setValue([testService]);
                expect(component.previewDirty).toBeTruthy();
            });

            it.each`
                previewDirty | selectedStep | updateExpected
                ${true}      | ${0}         | ${false}
                ${true}      | ${1}         | ${false}
                ${true}      | ${2}         | ${true}
                ${true}      | ${3}         | ${true}
                ${false}     | ${0}         | ${false}
                ${false}     | ${1}         | ${false}
                ${false}     | ${2}         | ${false}
                ${false}     | ${3}         | ${false}
            `(
                'when previewDirty=$previewDirty and selectedStep=$selectedStep, updateExpected=$updateExpected',
                ({ previewDirty, selectedStep, updateExpected }) => {
                    jest.spyOn(component, 'previewMassAdd').mockImplementation();
                    component.previewDirty = previewDirty;
                    // execute subscription via a stepper event
                    component.stepper.selectionChange.next({
                        selectedIndex: selectedStep,
                    } as unknown as StepperSelectionEvent);
                    expect(component.previewMassAdd).toHaveBeenCalledTimes(updateExpected ? 1 : 0);
                }
            );
        });

        describe('previewMassAdd', () => {
            beforeEach(() => {
                component.storesControl.setValue([testStore]);
                component.servicesControl.setValue([testService]);
                component.previewDirty = true;
            });

            it('should use the selected stores and services to configure the preview data table', fakeAsync(() => {
                const previewSpy = jest
                    .spyOn(component['storeServiceFacade'], 'previewMassAdd')
                    .mockImplementation(() => {
                        expect(component.loadingPreview).toBeTruthy();
                        return of([{ storeNumber: '001', prodCodes: ['PR1', 'PR2'] }]);
                    });
                // execute
                component.previewMassAdd();
                flush();
                expect(previewSpy).toHaveBeenCalled();
            }));

            it('should hide the loading overlay on error', fakeAsync(() => {
                const previewSpy = jest
                    .spyOn(component['storeServiceFacade'], 'previewMassAdd')
                    .mockReturnValue(throwError('test'));
                // execute
                component.previewMassAdd();
                flush();
                expect(previewSpy).toHaveBeenCalled();
                expect(component.loadingPreview).toBeFalsy();
            }));
        });

        describe('addStoreServices', () => {
            it('should add using the form values and reset the stepper state', fakeAsync(() => {
                const testCount = 1;
                jest.spyOn(component.form, 'getRawValue');
                const addSpy = jest.spyOn(component['storeServiceFacade'], 'add').mockImplementation(() => {
                    // verify that loading overlay shows
                    expect(component.loadingPreview).toBeTruthy();
                    return of(testCount);
                });
                const messageSpy = jest.spyOn(component['messageFacade'], 'addSaveCountMessage');
                const resetSpy = jest.spyOn(component['_reset'], 'next');
                jest.spyOn(component.stepper, 'reset');
                jest.spyOn(component, 'initializeForm').mockImplementation();
                jest.spyOn(component.storeSelection, 'clear').mockImplementation();
                jest.spyOn(component.serviceSelection, 'clear').mockImplementation();

                // execute
                component.addStoreServices();
                flush();

                expect(component.loadingPreview).toBeFalsy();
                expect(component.form.getRawValue).toHaveBeenCalled();
                expect(addSpy).toHaveBeenCalled();
                expect(messageSpy).toHaveBeenCalledWith(testCount, 'added');
                expect(component.storeSelection.clear).toHaveBeenCalled();
                expect(component.serviceSelection.clear).toHaveBeenCalled();
                expect(component.stepper.reset).toHaveBeenCalled();
                expect(resetSpy).toHaveBeenCalled();
                expect(component.initializeForm).toHaveBeenCalled();
            }));

            it('should only call addStoreServices once, even with double clicks', fakeAsync(() => {
                Object.defineProperty(component.form, 'invalid', {
                    get: () => {
                        return false;
                    },
                });
                component.preview = new MatTableDataSource<StoreServiceMassAddPreview>([
                    { storeNumber: 'testStoreNumber', serviceCodes: ['testServiceCode'] },
                ]);

                fixture.detectChanges();

                const addServiceButton = fixture.debugElement.query(By.css('#addStoreService')).nativeElement;
                jest.spyOn(component['storeServiceFacade'], 'add').mockReturnValue(of(1));
                jest.spyOn(component['messageFacade'], 'addSaveCountMessage').mockImplementation();

                addServiceButton.click();
                addServiceButton.click();
                addServiceButton.click();

                tick(600);
                fixture.detectChanges();

                expect(component['storeServiceFacade'].add).toHaveBeenCalledTimes(1);
                expect(component['messageFacade'].addSaveCountMessage).toHaveBeenCalledTimes(1);
            }));

            it('should hide the loading overlay on error', fakeAsync(() => {
                const error = 'test';
                const addSpy = jest.spyOn(component['storeServiceFacade'], 'add').mockReturnValue(throwError(error));

                // execute
                expect(() => {
                    component.addStoreServices();
                    flush();
                }).toThrow(error);
                expect(addSpy).toHaveBeenCalled();
                expect(component.loadingPreview).toBeFalsy();
            }));
        });
    });
});
