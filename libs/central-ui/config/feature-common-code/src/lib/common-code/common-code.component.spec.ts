import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, Router } from '@angular/router';
import { CommonCode, CommonCodeFacade } from '@vioc-angular/central-ui/config/data-access-common-code';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { RouterHistoryFacade } from '@vioc-angular/shared/data-access-router-history';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { UiFilteredInputModule } from '@vioc-angular/shared/ui-filtered-input';
import { UiInfoButtonModule } from '@vioc-angular/shared/ui-info-button';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import {
    expectInput,
    getApplyActionButton,
    getCancelActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import { of, Subject } from 'rxjs';
import { CommonCodeForms } from '../common-code-module.forms';
import { CommonCodeComponent } from './common-code.component';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';

describe('CommonCodeComponent', () => {
    let component: CommonCodeComponent;
    let fixture: ComponentFixture<CommonCodeComponent>;
    let commonCodeFacade: CommonCodeFacade;
    const routeParams = new Subject();
    const parentRoute: ActivatedRoute = new ActivatedRoute();
    const testCommonCodeType: CommonCode = {
        id: 6,
        type: 'CDTYPE',
        code: 'TT',
        reportOrder: 3,
        active: true,
        description: 'TT Description',
        updatedBy: null,
        updatedOn: null,
        version: 1,
    };

    const testCommonCode: CommonCode = {
        ...testCommonCodeType,
        id: 2,
        type: 'TT',
        code: 'CC',
        reportOrder: 1,
        active: true,
        description: 'CC Description',
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CommonCodeComponent],
            imports: [
                NoopAnimationsModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatOptionModule,
                MatSelectModule,
                UiActionBarModule,
                UiAuditModule,
                UiInfoButtonModule,
                UtilFormModule,
                UiLoadingMockModule,
                UiFilteredInputModule,
                CommonFunctionalityModule,
            ],
            providers: [
                FormFactory,
                { provide: ActivatedRoute, useValue: { params: routeParams, parent: '/config/common-code' } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: RouterHistoryFacade, useValue: { revertRouterHistory: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                {
                    provide: ActivatedRoute,
                    useValue: { params: routeParams, parent: parentRoute },
                },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        CommonCodeForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(CommonCodeComponent);
        component = fixture.componentInstance;
        commonCodeFacade = component.commonCodeFacade;
        //Common mocking
        commonCodeFacade.findByType = jest.fn();
        commonCodeFacade.findByTypeAndCode = jest.fn();
    });

    /** Initialize the the component with the given access mode, type and code. */
    const initialize = (
        accessMode: 'view' | 'edit' | 'add',
        model: CommonCode = testCommonCode,
        andflush = true,
        commonCodeType = testCommonCodeType
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({ accessMode: accessMode, type: model.type, code: model.code }),
        } as ActivatedRouteSnapshot;
        const commonCode = { ...new CommonCode(), ...model };
        // Mocking the two separate calls to commonCode to first get the code and then the second one to get the type
        // the third one will cover all other calls to the findByTypeAndCode method
        jest.spyOn(commonCodeFacade, 'findByTypeAndCode')
            .mockReturnValueOnce(of(commonCode))
            .mockReturnValueOnce(of(commonCodeType))
            .mockReturnValue(of(commonCode));

        fixture.detectChanges();
        if (andflush) {
            flush();
        }
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display loading overlay if isLoading', fakeAsync(() => {
        initialize('view');
        const loadingOverlay: MockLoadingOverlayComponent = fixture.debugElement.query(
            By.directive(MockLoadingOverlayComponent)
        ).componentInstance;

        component.isLoading = false;
        fixture.detectChanges();
        expect(loadingOverlay.loading).toEqual(false);

        component.isLoading = true;
        fixture.detectChanges();
        expect(loadingOverlay.loading).toEqual(true);
    }));

    describe('ngOnInit', () => {
        describe('view mode', () => {
            let router: Router;
            beforeEach(() => {
                router = TestBed.inject(Router);
            });
            it('should load common code data', fakeAsync(() => {
                initialize('view');
                expect(commonCodeFacade.findByTypeAndCode).toHaveBeenCalledWith(
                    testCommonCode.type,
                    testCommonCode.code
                );
                expect(commonCodeFacade.findByType).not.toHaveBeenCalled();
                expect(component.form.enabled).toBeFalsy();
            }));

            it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
                initialize('view');
                fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();
                expect(router.navigate).toHaveBeenCalledWith(['search'], {
                    relativeTo: TestBed.inject(ActivatedRoute).parent,
                });
            }));
        });

        describe('edit mode', () => {
            it('should load common code data', fakeAsync(() => {
                initialize('edit');
                expect(commonCodeFacade.findByTypeAndCode).toHaveBeenCalledWith(
                    testCommonCode.type,
                    testCommonCode.code
                );
                expect(commonCodeFacade.findByType).not.toHaveBeenCalled();
            }));
        });

        describe('add mode', () => {
            it('should not load common code data and should load dropdown data', fakeAsync(() => {
                initialize('add');
                expect(commonCodeFacade.findByTypeAndCode).not.toHaveBeenCalled();
                expect(commonCodeFacade.findByType).toHaveBeenCalledWith('CDTYPE', true);
            }));

            it('should default the boolean values since they are required', fakeAsync(() => {
                initialize('add');
                expect(component.model.active).toBe(true);
            }));
        });
    });

    describe('with cancel button clicked', () => {
        let router: Router;
        beforeEach(() => {
            router = TestBed.inject(Router);
        });
        it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
            initialize('edit');
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });

    describe('Action Bar', () => {
        describe.each`
            accessMode | saveDisplayed | applyDisplayed | cancelDisplayed
            ${'view'}  | ${false}      | ${false}       | ${true}
            ${'edit'}  | ${true}       | ${true}        | ${true}
            ${'add'}   | ${true}       | ${true}        | ${true}
        `('in $accessMode mode', ({ accessMode, saveDisplayed, applyDisplayed, cancelDisplayed }) => {
            const verifyDisplayedState = (element: DebugElement, shouldBeDisplayed: boolean) => {
                initialize(accessMode);
                if (shouldBeDisplayed) {
                    expect(element).toBeDefined();
                } else {
                    expect(element).toBeNull();
                }
            };

            it(`should ${saveDisplayed ? '' : 'not '}display the save button`, fakeAsync(() => {
                verifyDisplayedState(getSaveActionButton(fixture), saveDisplayed);
            }));
            it(`should ${applyDisplayed ? '' : 'not '}display the apply button`, fakeAsync(() => {
                verifyDisplayedState(getApplyActionButton(fixture), applyDisplayed);
            }));
            it(`should ${cancelDisplayed ? '' : 'not '}display the cancel button`, fakeAsync(() => {
                verifyDisplayedState(getCancelActionButton(fixture), cancelDisplayed);
            }));
        });

        describe.each`
            formState    | saveEnabled | applyEnabled | cancelEnabled
            ${'valid'}   | ${true}     | ${true}      | ${true}
            ${'invalid'} | ${false}    | ${false}     | ${true}
        `(`with $formState form`, ({ formState, saveEnabled, applyEnabled, cancelEnabled }) => {
            beforeEach(fakeAsync(() => {
                initialize('edit');
                if (formState === 'invalid') {
                    component.form.setErrors({ invalid: true });
                }
                fixture.detectChanges();
            }));

            it(`save button should be ${saveEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                expect(getSaveActionButton(fixture).nativeElement.disabled).toBe(!saveEnabled);
            }));
            it(`apply button should be ${applyEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                expect(getApplyActionButton(fixture).nativeElement.disabled).toBe(!applyEnabled);
            }));
            it(`cancel button should be ${cancelEnabled ? 'en' : 'dis'}abled`, fakeAsync(() => {
                expect(getCancelActionButton(fixture).nativeElement.disabled).toBe(!cancelEnabled);
            }));
        });

        describe('saving', () => {
            let messageFacade: MessageFacade;
            let routerService: RouterService;
            let router: Router;
            const verifySaveAndMessage = (model: CommonCode = testCommonCode) => {
                expect(commonCodeFacade.save).toHaveBeenCalledWith(model);
                expect(messageFacade.addMessage).toHaveBeenCalledWith({
                    message: `Common Code ${model.code} saved successfully`,
                    severity: 'info',
                });
            };

            beforeEach(() => {
                commonCodeFacade.save = jest.fn(() => of(null));
                messageFacade = TestBed.inject(MessageFacade as Type<MessageFacade>);
                routerService = TestBed.inject(RouterService as Type<RouterService>);
                router = TestBed.inject(Router as Type<Router>);
            });

            describe('with save button', () => {
                it('should save, add an info message, and navigate to previous page', fakeAsync(() => {
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    verifySaveAndMessage();
                    expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                }));

                it('should only call save once, even with double clicks', fakeAsync(async () => {
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    verifySaveAndMessage();
                    expect(routerService.navigateToSearchPage).toHaveBeenCalledTimes(1);
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const saveSubject = new Subject();
                    commonCodeFacade.save = jest.fn(() => saveSubject);
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    fixture.detectChanges();

                    expect(component.isLoading).toBeTruthy();

                    saveSubject.next(null);
                    flush();

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const saveSubject = new Subject();
                    commonCodeFacade.save = jest.fn(() => saveSubject);
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        saveSubject.error('An error occurred');
                        flush();
                    }).toThrow();

                    expect(component.isLoading).toBeFalsy();
                }));
            });

            describe('with apply button', () => {
                it('should reload model in edit mode', fakeAsync(() => {
                    initialize('edit');
                    jest.spyOn(component, 'ngOnInit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    verifySaveAndMessage();
                    expect(component.ngOnInit).toHaveBeenCalled();
                }));

                it('should only call apply once, even with double clicks', fakeAsync(async () => {
                    initialize('edit');
                    jest.spyOn(component, 'ngOnInit');
                    getApplyActionButton(fixture).nativeElement.click();
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    verifySaveAndMessage();
                    expect(component.ngOnInit).toHaveBeenCalledTimes(1);
                }));

                it('should navigate to the edit page when in add mode', fakeAsync(() => {
                    const testNavigate: CommonCode = {
                        ...new CommonCode(),
                        type: 'TESTTYPE',
                        code: 'TESTCODE',
                        active: true,
                    };
                    initialize('add');
                    component.form.patchControlValue('type', testNavigate.type);
                    component.form.patchControlValue('code', testNavigate.code);
                    component.apply(); // Calling apply directly because there's not a way to intialize a valid form in add mode
                    verifySaveAndMessage(testNavigate);
                    expect(component.form).toBeFalsy();
                    expect(router.navigate).toHaveBeenCalledWith(
                        [`/config/common-code/edit/${testNavigate.type}/${testNavigate.code}`],
                        expect.anything()
                    );
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const applySubject = new Subject();
                    commonCodeFacade.save = jest.fn(() => applySubject);
                    initialize('edit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);

                    expect(component.isLoading).toBeTruthy();

                    applySubject.next(null);
                    flush();

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const applySubject = new Subject();
                    commonCodeFacade.save = jest.fn(() => applySubject);
                    initialize('edit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);

                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        applySubject.error('An error occurred');
                        flush();
                    }).toThrow();

                    expect(component.isLoading).toBeFalsy();
                }));
            });
        });

        describe('unsavedChanges', () => {
            it('should track if the form has been modified', fakeAsync(() => {
                initialize('edit');
                expect(component.unsavedChanges).toBe(false);
                component.form.markAsDirty();
                expect(component.unsavedChanges).toBe(true);
            }));

            it('should track if the common code type dropdown has been modified', fakeAsync(() => {
                initialize('add');
                expect(component.unsavedChanges).toBe(false);
                // should dirty form by updating value of commonCodeTypeControl
                component.commonCodeTypeControl.setValue('TESTCOMMONCODE');
                expect(component.unsavedChanges).toBe(true);
            }));
        });
    });

    describe('Common Code Information', () => {
        it.each`
            control          | value               | enabled
            ${'type'}        | ${'TT'}             | ${false}
            ${'code'}        | ${'CC'}             | ${false}
            ${'reportOrder'} | ${'1'}              | ${true}
            ${'active'}      | ${true}             | ${true}
            ${'description'} | ${'CC Description'} | ${true}
        `(
            'formControl=$control should have value=$value, enabled=$enabled',
            fakeAsync(({ control, value, enabled }) => {
                initialize('edit');
                expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
            })
        );

        it('should save after editing all editable fields', fakeAsync(() => {
            const testAdd: CommonCode = {
                ...testCommonCode,
                reportOrder: 2,
                description: 'Test',
                active: false,
            };
            const applySubject = new Subject();
            commonCodeFacade.save = jest.fn(() => applySubject);

            initialize('edit');
            component.form.patchControlValue('reportOrder', testAdd.reportOrder);
            component.form.patchControlValue('description', testAdd.description);
            component.form.patchControlValue('active', testAdd.active);
            getApplyActionButton(fixture).nativeElement.click();
            tick(600);

            expect(commonCodeFacade.save).toHaveBeenCalledWith(testAdd);
            expect(component.form.getControlValue('reportOrder')).toEqual(testAdd.reportOrder);
            expect(component.form.getControlValue('description')).toEqual(testAdd.description);
            expect(component.form.getControlValue('active')).toEqual(testAdd.active);
        }));
    });

    describe('Common Code Type', () => {
        const testInactiveType: CommonCode = {
            ...testCommonCodeType,
            active: false,
        };

        it('should navigate to view screen when requesting edit screen and type is inactive', fakeAsync(() => {
            const routerHistoryFacade = TestBed.inject(RouterHistoryFacade as Type<RouterHistoryFacade>);
            const router = TestBed.inject(Router as Type<Router>);
            initialize('edit', testCommonCode, true, testInactiveType);

            expect(routerHistoryFacade.revertRouterHistory).toHaveBeenCalled();
            expect(router.navigate).toHaveBeenCalledWith([
                `/config/common-code/view/${testCommonCode.type}/${testCommonCode.code}`,
            ]);
            expect(component.form.enabled).toBeFalsy();
        }));
    });
});
