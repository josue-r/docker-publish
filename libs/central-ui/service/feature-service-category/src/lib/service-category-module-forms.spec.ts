import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { fakeAsync, flush } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
import { ServiceCategoryCarFaxMapping } from '@vioc-angular/central-ui/service/data-access-car-fax-mapping';
import {
    PreventativeMaintenanceQualifier,
    ServiceCategory,
    ServiceCategoryMotorInfo,
} from '@vioc-angular/central-ui/service/data-access-service-category';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { ApiErrorResponse } from '@vioc-angular/shared/util-api';
import { FormFactory, FormFactoryOptions, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, of, ReplaySubject, throwError } from 'rxjs';
import { ServiceCategoryModuleForms } from './service-category-module-forms';

describe('SericeCategoryModuleForms', () => {
    describe('registerForms', () => {
        it('should register all models relating to ServiceCategory', () => {
            const mockFormFactory = { register: jest.fn() } as unknown as FormFactory;
            ServiceCategoryModuleForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('ServiceCategory', expect.any(Function));
            expect(mockFormFactory.register).toHaveBeenCalledWith('ServiceCategoryMotorInfo', expect.any(Function));
            expect(mockFormFactory.register).toHaveBeenCalledWith(
                'PreventativeMaintenanceQualifier',
                expect.any(Function)
            );
            expect(mockFormFactory.register).toHaveBeenCalledWith('ServiceCategoryCarFaxMapping', expect.any(Function));
        });
    });

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        const changeDetector = {} as ChangeDetectorRef;
        const testServiceCategory: ServiceCategory = new ServiceCategory();
        let componentDestroyed: ReplaySubject<any>;
        let control: FormControl;
        let group: TypedFormGroup<ServiceCategory>;

        const createControlGroup = (model: ServiceCategory, accessMode: AccessMode = AccessMode.EDIT) => {
            group = formFactory.group('ServiceCategory', model, componentDestroyed, {
                accessMode,
                changeDetector,
            } as FormFactoryOptions);
        };

        const validateField = (value: any, error: string, toBe: boolean) => {
            control.patchValue(value);
            control.updateValueAndValidity();
            expect(control.hasError(error)).toBe(toBe);
        };

        const validateRequiredField = (groupType: string, model: any, field: any) => {
            group = formFactory.group(groupType, model, componentDestroyed, {
                changeDetector,
                accessMode: AccessMode.EDIT,
            });
            group.getControl(field).updateValueAndValidity();
            expect(group.getControl(field).hasError('required')).toBe(true);
        };

        beforeAll(() => ServiceCategoryModuleForms.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        describe('ServiceCategory', () => {
            describe.each`
                accessMode         | enabled  | field               | model
                ${AccessMode.EDIT} | ${false} | ${'code'}           | ${{ ...testServiceCategory, code: 'TESTCD' }}
                ${AccessMode.EDIT} | ${false} | ${'code'}           | ${{ ...testServiceCategory, code: 'TESTCD', parentCategory: { ...new Described(), code: 'TESTPAR' } }}
                ${AccessMode.EDIT} | ${false} | ${'active'}         | ${{ ...testServiceCategory, active: true }}
                ${AccessMode.EDIT} | ${true}  | ${'active'}         | ${{ ...testServiceCategory, active: false }}
                ${AccessMode.EDIT} | ${true}  | ${'defaultService'} | ${testServiceCategory}
                ${AccessMode.ADD}  | ${true}  | ${'code'}           | ${testServiceCategory}
                ${AccessMode.ADD}  | ${true}  | ${'code'}           | ${{ ...testServiceCategory, code: 'TESTCD' }}
                ${AccessMode.ADD}  | ${true}  | ${'code'}           | ${{ ...testServiceCategory, code: 'TESTCD', parentCategory: { ...new Described(), code: 'TESTPAR' } }}
                ${AccessMode.ADD}  | ${true}  | ${'active'}         | ${testServiceCategory}
                ${AccessMode.ADD}  | ${false} | ${'defaultService'} | ${testServiceCategory}
            `(`with disableable fields`, ({ accessMode, enabled, field, model }) => {
                it(`in ${accessMode.urlSegement} mode the field '${field}' should be ${
                    enabled ? 'en' : 'dis'
                }abled`, () => {
                    createControlGroup(model, accessMode);
                    expect(group.getControl(field).enabled).toBe(enabled);
                });
            });

            describe.each`
                field
                ${'active'}
                ${'description'}
                ${'nacsProductCode'}
            `('required fields', ({ field }) => {
                it(`should validate that ${field} is required`, () => {
                    validateRequiredField('ServiceCategory', testServiceCategory, field);
                });
            });

            describe.each`
                field            | length  | showError
                ${'description'} | ${'51'} | ${true}
                ${'description'} | ${'50'} | ${false}
            `('text fields', ({ field, length, showError }) => {
                it(`should ${showError ? '' : 'not '} when ${field} has ${length} characters `, () => {
                    control = group.getControl(field) as FormControl;
                    validateField('a'.repeat(length), 'maxlength', showError);
                });
            });

            describe('serviceInfo', () => {
                describe.each`
                    field                    | value    | errorCode           | showError
                    ${'recommendationOrder'} | ${1_000} | ${'max'}            | ${true}
                    ${'recommendationOrder'} | ${999}   | ${'max'}            | ${false}
                    ${'recommendationOrder'} | ${-1}    | ${'min'}            | ${true}
                    ${'recommendationOrder'} | ${0}     | ${'min'}            | ${false}
                    ${'recommendationOrder'} | ${0.1}   | ${'invalidInteger'} | ${true}
                    ${'recommendationOrder'} | ${0}     | ${'invalidInteger'} | ${false}
                `('numerical fields', ({ field, value, errorCode, showError }) => {
                    it(`should ${
                        showError ? '' : 'not '
                    }show an '${errorCode}' error for ${field} if the value is ${value}`, () => {
                        group = formFactory.group('ServiceCategory', testServiceCategory, componentDestroyed, {
                            changeDetector,
                            accessMode: AccessMode.EDIT,
                        });
                        control = group.getControl('serviceInfo').get(field) as FormControl;
                        validateField(value, errorCode, showError);
                    });
                });

                describe.each`
                    field                    | length   | showError
                    ${'customerDisplayName'} | ${'201'} | ${true}
                    ${'customerDisplayName'} | ${'200'} | ${false}
                `('text fields', ({ field, length, showError }) => {
                    it(`should ${showError ? '' : 'not '} when ${field} has ${length} characters `, () => {
                        group = formFactory.group('ServiceCategory', testServiceCategory, componentDestroyed, {
                            changeDetector,
                            accessMode: AccessMode.EDIT,
                        });
                        control = group.getControl('serviceInfo').get(field) as FormControl;
                        validateField('a'.repeat(length), 'maxlength', showError);
                    });
                });
            });
        });

        describe.each`
            character | valid
            ${'!'}    | ${false}
            ${'@'}    | ${false}
            ${'#'}    | ${false}
            ${'$'}    | ${false}
            ${'%'}    | ${false}
            ${'^'}    | ${false}
            ${'&'}    | ${false}
            ${'*'}    | ${false}
            ${'+'}    | ${false}
            ${'='}    | ${false}
            ${'/'}    | ${false}
            ${'_'}    | ${false}
            ${'a'}    | ${false}
            ${' '}    | ${true}
            ${'A'}    | ${true}
            ${'0'}    | ${true}
            ${'-'}    | ${true}
        `('Code field', ({ character, valid }) => {
            it(`should mark character ${character} as ${valid ? '' : 'in'}valid`, () => {
                createControlGroup(testServiceCategory, AccessMode.ADD);
                const codeControl = group.getControl('code');
                codeControl.patchValue(character);
                codeControl.updateValueAndValidity();
                expect(codeControl.hasError('pattern')).toBe(!valid);
            });
        });

        it('should validate code can only be 25 characters long', () => {
            createControlGroup(testServiceCategory, AccessMode.ADD);
            const codeControl = group.getControl('code');
            codeControl.patchValue('a'.repeat(25));
            codeControl.updateValueAndValidity();
            expect(codeControl.hasError('maxlength')).toBeFalsy();

            codeControl.patchValue('a'.repeat(26));
            codeControl.updateValueAndValidity();
            expect(codeControl.hasError('maxlength')).toBeTruthy();
        });

        describe('ParentCategory', () => {
            const serviceCategoryFacade = {
                validateParentCategory(parentCategoryCode: string, serviceCategoryCode: string): Observable<any> {
                    return of(null);
                },
            };

            const buildApiError = (messageKey: string) => {
                return { error: { messageKey }, apiVersion: '1.0.0' } as ApiErrorResponse;
            };

            const options = (accessMode: AccessMode) => {
                return { accessMode, changeDetector, serviceCategoryFacade } as FormFactoryOptions;
            };

            const createErrorGroup = (field, accessMode: AccessMode = AccessMode.EDIT) => {
                group = formFactory.group(
                    'ServiceCategory',
                    { ...new ServiceCategory(), code: 'TEST', parentCategory: { ...new Described(), code: 'TESTPAR' } },
                    componentDestroyed,
                    options(accessMode)
                );
                group.getControl(field).markAsDirty();
                group.getControl(field).updateValueAndValidity();
                flush();
            };

            describe.each`
                messageKey                                              | error
                ${'error.service-api.notFoundParentCategory'}           | ${{ parentCategoryInvalid: true }}
                ${'error.service-api.inactiveParentCategory'}           | ${{ parentCategoryInactive: true }}
                ${'error.service-api.circularServiceCategoryHierarchy'} | ${{ parentCategoryCircularHierarchy: true }}
            `('with validation errors', ({ messageKey, error }) => {
                it(`should throw error ${messageKey} when referenced validation fails`, fakeAsync(() => {
                    jest.spyOn(serviceCategoryFacade, 'validateParentCategory').mockReturnValueOnce(
                        throwError(new HttpErrorResponse({ error: buildApiError(messageKey) }))
                    );
                    createErrorGroup('parentCategory');

                    expect(group.getControl('parentCategory').errors).toEqual(error);
                }));
            });

            it.each`
                accessMode         | asyncValidatorActive
                ${AccessMode.EDIT} | ${true}
                ${AccessMode.VIEW} | ${false}
                ${AccessMode.ADD}  | ${false}
            `(
                `async validator should be disabled in $accessMode.urlSegement mode`,
                fakeAsync(({ accessMode, asyncValidatorActive }) => {
                    createErrorGroup('parentCategory', accessMode);

                    if (asyncValidatorActive) {
                        expect(group.getControl('parentCategory').asyncValidator).toBeTruthy();
                    } else {
                        expect(group.getControl('parentCategory').asyncValidator).toBeFalsy();
                    }
                })
            );
        });

        describe('PreventativeMaintenanceQualifier', () => {
            const testPreventativeMQ: PreventativeMaintenanceQualifier = new PreventativeMaintenanceQualifier();

            describe.each`
                field
                ${'transmissionType'}
                ${'qualifier'}
            `('required fields', ({ field }) => {
                it(`should validate that ${field} is required`, () => {
                    validateRequiredField('PreventativeMaintenanceQualifier', testPreventativeMQ, field);
                });
            });

            describe.each`
                field          | maxLength
                ${'qualifier'} | ${'20'}
            `('Name of the group', ({ field, maxLength }) => {
                it(`should validate that ${field} cannot have more than ${maxLength} characters`, () => {
                    group = formFactory.group(
                        'PreventativeMaintenanceQualifier',
                        testPreventativeMQ,
                        componentDestroyed,
                        {
                            changeDetector,
                            accessMode: AccessMode.EDIT,
                        }
                    );
                    control = group.getControl(field) as FormControl;

                    validateField('a'.repeat(maxLength + 1), 'maxlength', true);
                    validateField('a'.repeat(maxLength), 'maxlength', false);
                });
            });
        });

        describe('ServiceCategoryCarFaxMapping', () => {
            const testCarFaxMapping: ServiceCategoryCarFaxMapping = new ServiceCategoryCarFaxMapping();

            describe.each`
                field
                ${'carFaxServiceName'}
            `('required fields', ({ field }) => {
                it(`should validate that ${field} is required`, () => {
                    validateRequiredField('ServiceCategoryCarFaxMapping', testCarFaxMapping, field);
                });
            });

            describe.each`
                field                  | maxLength
                ${'carFaxServiceName'} | ${'50'}
            `('Name of the group', ({ field, maxLength }) => {
                it(`should validate that ${field} cannot have more than ${maxLength} characters`, () => {
                    group = formFactory.group('ServiceCategoryCarFaxMapping', testCarFaxMapping, componentDestroyed, {
                        changeDetector,
                        accessMode: AccessMode.EDIT,
                    });
                    control = group.getControl(field) as FormControl;

                    validateField('a'.repeat(maxLength + 1), 'maxlength', true);
                    validateField('a'.repeat(maxLength), 'maxlength', false);
                });
            });
        });

        describe('ServiceCategoryCarFaxMapping', () => {
            const testMotorInfo: ServiceCategoryMotorInfo = new ServiceCategoryMotorInfo();

            describe.each`
                field
                ${'item'}
                ${'action'}
            `('required fields', ({ field }) => {
                it(`should validate that ${field} is required`, () => {
                    validateRequiredField('ServiceCategoryMotorInfo', testMotorInfo, field);
                });
            });

            describe.each`
                field       | maxLength
                ${'item'}   | ${'5'}
                ${'action'} | ${'5'}
            `('Name of the group', ({ field, maxLength }) => {
                it(`should validate that ${field} cannot have more than ${maxLength} characters`, () => {
                    group = formFactory.group('ServiceCategoryMotorInfo', testMotorInfo, componentDestroyed, {
                        changeDetector,
                        accessMode: AccessMode.EDIT,
                    });
                    control = group.getControl(field) as FormControl;

                    validateField('a'.repeat(maxLength + 1), 'maxlength', true);
                    validateField('a'.repeat(maxLength), 'maxlength', false);
                });
            });
        });
    });
});
