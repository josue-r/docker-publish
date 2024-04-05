import { HarnessLoader } from '@angular/cdk/testing';
import { HttpClient } from '@angular/common/http';
import { Component, Input } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CompanyExportValidators } from '@vioc-angular/central-ui/organization/company/data-access-company-export';
import {
    CompanyService,
    CompanyServiceMassAdd,
    PricingStrategy,
} from '@vioc-angular/central-ui/service/data-access-company-service';
import { FeatureSharedServiceSelectionMockModule } from '@vioc-angular/central-ui/service/feature-shared-service-selection';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { UiStepperNavigationMockModule } from '@vioc-angular/shared/ui-stepper-navigation';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormMockModule } from '@vioc-angular/shared/util-form';
import { of, Subject } from 'rxjs';
import { CompanyServiceModuleForms } from '../company-service-module-forms';
import { CompanyServiceMassAddComponent } from './company-service-mass-add.component';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';

@Component({
    selector: 'vioc-angular-company-service',
    template: ``,
})
class MockCompanyServiceComponent {
    @Input() form: any;
}

describe('CompanyServiceMassAddComponent', () => {
    let component: CompanyServiceMassAddComponent;
    let fixture: ComponentFixture<CompanyServiceMassAddComponent>;
    let formFactory: FormFactory;

    const testCompany = { id: 1, code: 'COMPANY' };
    const testCompany2 = { id: 2, code: 'COMPANY' };
    const testService = { id: 2, code: 'SERVICE', active: true };
    const testService2 = { id: 3, code: 'SERVICE', active: true };
    const testCompanyService: CompanyService = {
        ...new CompanyService(),
        company: testCompany,
        pricingStrategy: PricingStrategy.PRODUCT,
    };

    const completeCompanySelectionStep = () => {
        component.companyControl.setValue(testCompany);
        component.stepper.next();
        expect(component.stepper.selectedIndex).toEqual(1);
    };

    const completeServiceSelectionStep = () => {
        component.servicesControl.setValue([testService]);
        component.stepper.next();
        expect(component.stepper.selectedIndex).toEqual(2);
    };

    const completeServiceInformationStep = () => {
        component.companyServiceControl.setValue(testCompanyService);
        component.stepper.next();
        expect(component.stepper.selectedIndex).toEqual(3);
    };

    const getAddServicesButton = () => fixture.debugElement.query(By.css('#add-services'));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                MatFormFieldModule,
                MatStepperModule,
                MatListModule,
                MatOptionModule,
                MatSelectModule,
                UiLoadingMockModule,
                UiActionBarModule,
                UtilFormMockModule,
                ReactiveFormsModule,
                FeatureSharedServiceSelectionMockModule,
                UiStepperNavigationMockModule,
                CommonFunctionalityModule,
            ],
            declarations: [CompanyServiceMassAddComponent, MockCompanyServiceComponent],
            providers: [
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
                { provide: HttpClient, useValue: { get: jest.fn(() => of()) } },
                FormFactory,
                CompanyExportValidators,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CompanyServiceMassAddComponent);
        component = fixture.componentInstance;
        formFactory = TestBed.inject(FormFactory);
        CompanyServiceModuleForms.registerForms(
            formFactory,
            TestBed.inject(FormBuilder),
            TestBed.inject(CompanyExportValidators)
        );
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('ngOnInit', () => {
        it('should setup the CompanyServiceMassAdd form', () => {
            jest.spyOn(formFactory, 'group');
            fixture.detectChanges();
            expect(formFactory.group).toHaveBeenCalledWith(
                'CompanyServiceMassAdd',
                new CompanyServiceMassAdd(new CompanyService()),
                component['_destroyed']
            );
        });
        it('should load the companies the user has access to', () => {
            const testCompanies = [
                { id: 1, desc: 'desc 1', code: 'CODE1' },
                { id: 2, desc: 'desc 2', code: 'CODE2' },
            ];
            jest.spyOn(component['resourceFacade'], 'findCompaniesByRoles').mockReturnValueOnce(
                of({ resources: testCompanies, allCompanies: false })
            );
            fixture.detectChanges();
            expect(component['resourceFacade'].findCompaniesByRoles).toHaveBeenCalledWith(['ROLE_COMPANY_SERVICE_ADD']);
            expect(component.accessibleCompanies).toEqual(testCompanies);
        });
    });

    describe('after initialized', () => {
        beforeEach(() => fixture.detectChanges());

        it('should be linear', () => {
            expect(component.stepper.linear).toBeTruthy();
        });

        describe.each`
            companyControl | servicesControl  | companyServiceControl   | isValid
            ${testCompany} | ${[testService]} | ${testCompanyService}   | ${true}
            ${null}        | ${[testService]} | ${testCompanyService}   | ${false}
            ${testCompany} | ${[]}            | ${testCompanyService}   | ${false}
            ${testCompany} | ${[testService]} | ${new CompanyService()} | ${false}
        `('previewControl', ({ companyControl, servicesControl, companyServiceControl, isValid }) => {
            it(`should ${
                isValid ? '' : 'not '
            }allow update when controls are ${companyControl}, ${servicesControl}, and ${companyServiceControl}`, fakeAsync(async () => {
                jest.spyOn(component.previewControl, 'setValue');
                component.companyControl.patchValue(companyControl);
                component.servicesControl.patchValue(servicesControl);
                component.companyServiceControl.patchValue(companyServiceControl);
                fixture.detectChanges();
                flush();
                expect(component.previewControl.value).toEqual(isValid);
            }));
        });

        describe('service selection', () => {
            it('should provide the search logic', () => {
                expect(component.serviceSelection.searchFn).toEqual(component.searchServices);
            });
        });

        describe('selectCompany', () => {
            it('should clear the services and update the companyService', () => {
                const testAccount = { id: 2, code: 'account' };
                component.companyServiceControl.patchValue({
                    ...component.companyServiceControl.value,
                    costAccount: testAccount,
                    salesAccount: testAccount,
                });
                jest.spyOn(component.serviceSelection, 'clear');
                const previousCompanyService = component.companyServiceControl.value;
                component.selectCompany(testCompany);
                expect(component.serviceSelection.clear).toHaveBeenCalled();
                expect(component.companyServiceControl.value).toEqual({
                    ...previousCompanyService,
                    company: testCompany,
                    costAccount: null,
                    salesAccount: null,
                });
            });
        });

        describe('addServices', () => {
            it('should add a CompanyService for every selected service and reset', fakeAsync(() => {
                const services = [
                    { id: 1, code: 'serv1' },
                    { id: 2, code: 'serv2' },
                ];
                component.servicesControl.patchValue(services);
                jest.spyOn(component['companyServiceFacade'], 'add').mockImplementation((companyServices: any[]) =>
                    of(companyServices.length)
                );
                jest.spyOn(component['messageFacade'], 'addSaveCountMessage');
                jest.spyOn(component.formDirective, 'resetForm');
                jest.spyOn(component.stepper, 'reset');

                component.addServices();
                flush();

                expect(component['companyServiceFacade'].add).toHaveBeenCalled();
                expect(component['messageFacade'].addSaveCountMessage).toHaveBeenCalledWith(services.length, 'added');
                expect(component.formDirective.resetForm).toHaveBeenCalled();
                expect(component.stepper.reset).toHaveBeenCalled();
            }));

            it('should only call addServices once, even with double clicks', fakeAsync(() => {
                completeCompanySelectionStep();
                completeServiceSelectionStep();
                completeServiceInformationStep();
                fixture.detectChanges();

                jest.spyOn(component['companyServiceFacade'], 'add').mockReturnValue(of(1));
                jest.spyOn(component['messageFacade'], 'addSaveCountMessage').mockImplementation();

                getAddServicesButton().nativeElement.click();
                getAddServicesButton().nativeElement.click();
                getAddServicesButton().nativeElement.click();
                tick(600);
                fixture.detectChanges();

                expect(component['companyServiceFacade'].add).toHaveBeenCalledTimes(1);
                expect(component['messageFacade'].addSaveCountMessage).toHaveBeenCalledTimes(1);
            }));
        });

        describe('unsavedChanges', () => {
            it('should be false if the form is not dirty', () => {
                expect(component.unsavedChanges).toBeFalsy();
            });
            it('should be true if the form is dirty', () => {
                component.form.markAsDirty();
                expect(component.unsavedChanges).toBeTruthy();
            });
            it('should be false if the form is undefined', () => {
                component.form = undefined;
                expect(component.unsavedChanges).toBeFalsy();
            });
        });

        describe('when adding company services', () => {
            beforeEach(() => {
                completeCompanySelectionStep();
                completeServiceSelectionStep();
                completeServiceInformationStep();
                fixture.detectChanges();
            });
            it('Should not display cancel Button', fakeAsync(() => {
                const actionBar = fixture.debugElement.query(By.css('vioc-angular-action-bar')).componentInstance;
                expect(actionBar.isCancelButtonDisplayed).toBeFalsy();
            }));

            it('should display the loading overlay', fakeAsync(() => {
                const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                    By.directive(MockLoadingOverlayComponent)
                ).componentInstance;
                expect(loadingOverlay.loading).toBeFalsy();
                const addSubject = new Subject<number>();
                jest.spyOn(component['companyServiceFacade'], 'add').mockImplementation(() => addSubject);
                getAddServicesButton().nativeElement.click();
                tick(600);
                fixture.detectChanges();
                expect(loadingOverlay.loading).toBeTruthy();
                jest.spyOn(component.stepper, 'reset').mockImplementation(() => {});
                jest.spyOn(component.formDirective, 'resetForm').mockImplementation(() => {});
                addSubject.next(1);
                tick(600);
                fixture.detectChanges();

                expect(loadingOverlay.loading).toBeFalsy();
            }));

            it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
                    By.directive(MockLoadingOverlayComponent)
                ).componentInstance;
                expect(loadingOverlay.loading).toBeFalsy();
                const addSubject = new Subject<number>();
                jest.spyOn(component['companyServiceFacade'], 'add').mockImplementation(() => addSubject);

                getAddServicesButton().nativeElement.click();
                tick(600);
                fixture.detectChanges();
                expect(loadingOverlay.loading).toBeTruthy();

                expect(() => {
                    addSubject.error('An error occurred');
                    tick(600);
                }).toThrow();
                fixture.detectChanges();

                expect(component.isLoading).toBeFalsy();
            }));
        });

        describe('adding two services back to back', () => {
            it('should add a service to the first company then adds another service to another compnany', fakeAsync(async () => {
                const numServicesAdded = 1;
                component.selectCompany(testCompany);
                jest.spyOn(component['companyServiceFacade'], 'add').mockImplementation((companyServices: any[]) =>
                    of(companyServices.length)
                );
                jest.spyOn(component['messageFacade'], 'addSaveCountMessage');
                component.servicesControl.patchValue([testService]);
                flush();

                expect(component.companyServiceControl.get('active').value).toEqual(true);
                component.addServices();
                flush();
                expect(component['messageFacade'].addSaveCountMessage).toHaveBeenCalledWith(numServicesAdded, 'added');

                component.selectCompany(testCompany2);
                component.servicesControl.patchValue([testService2]);
                flush();

                expect(component.companyServiceControl.get('active').value).toEqual(true);
                component.addServices();
                flush();
                expect(component['messageFacade'].addSaveCountMessage).toHaveBeenCalledWith(numServicesAdded, 'added');
            }));
        });
    });
});
