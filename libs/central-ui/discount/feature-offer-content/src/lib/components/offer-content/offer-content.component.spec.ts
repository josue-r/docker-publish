import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DebugElement, Type } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, flush, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, convertToParamMap } from '@angular/router';
import { OfferContent, OfferContentFacade } from '@vioc-angular/central-ui/discount/data-access-offer-content';
import { RouterService } from '@vioc-angular/central-ui/util-router';
import { CommonFunctionalityModule } from '@vioc-angular/shared/common-functionality';
import { MessageFacade } from '@vioc-angular/shared/data-access-message';
import { UiActionBarModule } from '@vioc-angular/shared/ui-action-bar';
import { UiAuditModule } from '@vioc-angular/shared/ui-audit';
import { MockLoadingOverlayComponent, UiLoadingMockModule } from '@vioc-angular/shared/ui-loading';
import { GATEWAY_TOKEN } from '@vioc-angular/shared/util-api';
import { FormFactory, UtilFormModule } from '@vioc-angular/shared/util-form';
import {
    expectInput,
    getApplyActionButton,
    getCancelActionButton,
    getSaveActionButton,
} from '@vioc-angular/test/util-test';
import { Subject, of } from 'rxjs';
import { OfferContentModuleForms } from '../../offer-content-module-forms';
import { OfferContentComponent } from '../offer-content/offer-content.component';

describe('OfferContentComponent', () => {
    let component: OfferContentComponent;
    let fixture: ComponentFixture<OfferContentComponent>;
    let offerContentFacade: OfferContentFacade;
    let messageFacade: MessageFacade;

    const testOfferContent: OfferContent = {
        id: 1001,
        name: 'Offer Content Name Test',
        active: true,
        shortText: 'Short Text Test',
        longText: 'a'.repeat(1000),
        disclaimerShortText: 'Disclaimer Short Text',
        disclaimerLongText: 'd'.repeat(1000),
        conditions: 'A couple conditions',
        version: 1,
        updatedBy: null,
        updatedOn: null,
    };
    const routeParams = new Subject();

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OfferContentComponent],
            imports: [
                NoopAnimationsModule,
                HttpClientTestingModule,
                ReactiveFormsModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatInputModule,
                MatButtonModule,
                MatSelectModule,
                MatOptionModule,
                UiLoadingMockModule,
                UiActionBarModule,
                UiAuditModule,
                UtilFormModule,
                CommonFunctionalityModule,
            ],
            providers: [
                FormFactory,
                { provide: ActivatedRoute, useValue: { params: routeParams, parent: '/digital/offer-content' } },
                { provide: Router, useValue: { navigate: jest.fn() } },
                { provide: RouterService, useValue: { navigateToSearchPage: jest.fn() } },
                { provide: MessageFacade, useValue: { addMessage: jest.fn() } },
                { provide: GATEWAY_TOKEN, useValue: '//gateway/' },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        OfferContentModuleForms.registerForms(TestBed.inject(FormFactory), TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(OfferContentComponent);
        component = fixture.componentInstance;
        offerContentFacade = component.offerContentFacade;
    });

    const initialize = (
        accessMode: 'view' | 'edit' | 'add',
        model: OfferContent = testOfferContent,
        andflush = true
    ) => {
        const route = TestBed.inject(ActivatedRoute);
        route.snapshot = {
            paramMap: convertToParamMap({ accessMode: accessMode, offerContentName: model.name }),
        } as ActivatedRouteSnapshot;
        const offerContent = { ...new OfferContent(), ...model };
        jest.spyOn(offerContentFacade, 'findByName').mockReturnValue(of(offerContent));
        fixture.detectChanges();
        if (andflush) {
            flush();
        }
    };

    const verifySaveAndMessage = (model: OfferContent = testOfferContent) => {
        expect(offerContentFacade.save).toHaveBeenCalledWith(model);
        expect(messageFacade.addMessage).toHaveBeenCalledWith({
            message: `Offer Content ${model.name} saved successfully`,
            severity: 'info',
        });
    };

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should display loading overlay if isLoading', fakeAsync(() => {
        initialize('edit');
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

    describe('with cancel button clicked', () => {
        it('should navigate to the search page when clicking cancel button', fakeAsync(() => {
            initialize('edit');
            const router = TestBed.inject(Router);
            fixture.debugElement.query(By.css('#cancel-action')).nativeElement.click();

            expect(router.navigate).toHaveBeenCalledWith(['search'], {
                relativeTo: TestBed.inject(ActivatedRoute).parent,
            });
        }));
    });

    describe('ngOnInit', () => {
        describe('view mode', () => {
            let router: Router;
            beforeEach(() => {
                router = TestBed.inject(Router);
            });
            it('should load offerContent data', fakeAsync(() => {
                initialize('view');
                expect(offerContentFacade.findByName).toHaveBeenCalledWith(testOfferContent.name);
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
            it('should load offerContent data with form fields enabled', fakeAsync(() => {
                initialize('edit');
                expect(offerContentFacade.findByName).toHaveBeenCalledWith(testOfferContent.name);
                expect(component.form.enabled).toBeTruthy();
            }));
        });

        describe('add mode', () => {
            it('should not load offerContent data', fakeAsync(() => {
                initialize('add');
                expect(offerContentFacade.findByName).not.toHaveBeenCalled();
            }));

            it('should default active to true', fakeAsync(() => {
                initialize('add');
                expect(component.model.active).toBe(true);
            }));
        });
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
            let routerService: RouterService;
            let router: Router;

            beforeEach(() => {
                offerContentFacade.save = jest.fn(() => of(null));
                messageFacade = TestBed.inject(MessageFacade as Type<MessageFacade>);
                routerService = TestBed.inject(RouterService as Type<RouterService>);
                router = TestBed.inject(Router as Type<Router>);
            });

            describe('with save button', () => {
                it('should call save only once when clicked multiple times', fakeAsync(() => {
                    initialize('edit');
                    // click on save button
                    getSaveActionButton(fixture).nativeElement.click();
                    fixture.detectChanges();
                    // multiple clicks testing
                    getSaveActionButton(fixture).nativeElement.click();
                    getSaveActionButton(fixture).nativeElement.click();
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600);

                    expect(offerContentFacade.save).toHaveBeenCalled();
                    // only one offer content should be saved even if save is clicked multiple times
                    expect(component.messageFacade.addMessage).toHaveBeenCalledTimes(1);
                }));
                it('should save, add an info message, and navigate to previous page', fakeAsync(() => {
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600); // tick to account for debounce time and time to re-enable button
                    verifySaveAndMessage();
                    expect(routerService.navigateToSearchPage).toHaveBeenCalled();
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const saveSubject = new Subject();
                    offerContentFacade.save = jest.fn(() => saveSubject);
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600); // tick to account for debounce time and time to re-enable button
                    fixture.detectChanges();

                    expect(component.isLoading).toBeTruthy();

                    saveSubject.next(null);
                    flush();

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const saveSubject = new Subject();
                    offerContentFacade.save = jest.fn(() => saveSubject);
                    initialize('edit');
                    getSaveActionButton(fixture).nativeElement.click();
                    tick(600); // tick to account for debounce time and time to re-enable button
                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        saveSubject.error('An error occurred');
                        flush();
                    }).toThrow();

                    expect(component.isLoading).toBeFalsy();
                }));
            });

            describe('with apply button', () => {
                it('should call apply only once when clicked multiple times', fakeAsync(() => {
                    initialize('edit');
                    // click on apply button
                    getApplyActionButton(fixture).nativeElement.click();
                    fixture.detectChanges();
                    // multiple clicks testing
                    getApplyActionButton(fixture).nativeElement.click();
                    getApplyActionButton(fixture).nativeElement.click();
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600);
                    expect(offerContentFacade.save).toHaveBeenCalled();
                    // only one offer content should be saved even if apply is clicked multiple times
                    expect(component.messageFacade.addMessage).toHaveBeenCalledTimes(1);
                }));
                it('should reload model in edit mode', fakeAsync(() => {
                    initialize('edit');
                    jest.spyOn(component, 'ngOnInit');

                    getApplyActionButton(fixture).nativeElement.click();
                    fixture.detectChanges();
                    tick(600); // tick to account for debounce time and time to re-enable button
                    verifySaveAndMessage();

                    expect(component.ngOnInit).toHaveBeenCalled();
                }));

                it('should show loading overlay when processing', fakeAsync(() => {
                    const applySubject = new Subject();
                    offerContentFacade.save = jest.fn(() => applySubject);
                    initialize('edit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600); // tick to account for debounce time and time to re-enable button
                    expect(component.isLoading).toBeTruthy();

                    applySubject.next(null);
                    flush();

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should cancel loading overlay if an error occurs', fakeAsync(() => {
                    const applySubject = new Subject();
                    offerContentFacade.save = jest.fn(() => applySubject);
                    initialize('edit');
                    getApplyActionButton(fixture).nativeElement.click();
                    tick(600); // tick to account for debounce time and time to re-enable button
                    expect(component.isLoading).toBeTruthy();

                    expect(() => {
                        applySubject.error('An error occurred');
                        flush();
                    }).toThrow();

                    expect(component.isLoading).toBeFalsy();
                }));

                it('should navigate to the edit page when in add mode', fakeAsync(() => {
                    initialize('add');

                    const testName = 'Offer Content Name Test';
                    component.form.patchControlValue('name', testName);
                    component.form.patchControlValue('active', true);
                    component.form.patchControlValue('shortText', 'Short Text Test');
                    component.apply(); // Calling apply directly because there's not a way to intialize a valid form in add mode
                    flush();

                    expect(component.form).toBeFalsy();
                    expect(router.navigate).toHaveBeenCalledWith(['edit', testName], expect.anything());
                }));
            });
        });

        describe('unsavedChanges', () => {
            it('should track if the form has been modified', fakeAsync(() => {
                initialize('edit');
                expect(component.unsavedChanges).toBeFalsy();
                component.form.markAsDirty();
                expect(component.unsavedChanges).toBeTruthy();
            }));
        });
    });

    describe('Offer Content information', () => {
        describe.each`
            control                  | value                        | enabled
            ${'name'}                | ${'Offer Content Name Test'} | ${true}
            ${'active'}              | ${true}                      | ${true}
            ${'shortText'}           | ${'Short Text Test'}         | ${true}
            ${'longText'}            | ${'a'.repeat(1000)}          | ${true}
            ${'disclaimerShortText'} | ${'Disclaimer Short Text'}   | ${true}
            ${'disclaimerLongText'}  | ${'d'.repeat(1000)}          | ${true}
            ${'conditions'}          | ${'A couple conditions'}     | ${true}
        `('fields', ({ control, value, enabled }) => {
            it(`should display input for ${control} as ${value} and ${
                enabled ? '' : 'not '
            }be enabled`, fakeAsync(() => {
                initialize('edit');
                expectInput(fixture, control).toHaveValue(value).toBeEnabled(enabled);
            }));
        });
    });
});
