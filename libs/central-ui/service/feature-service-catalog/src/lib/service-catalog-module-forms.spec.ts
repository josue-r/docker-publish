import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Service, ServiceProduct } from '@vioc-angular/central-ui/service/data-access-service';
import { Described } from '@vioc-angular/shared/common-functionality';
import { FormFactory } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { ServiceCatalogModuleForms } from './service-catalog-module-forms';

describe('ServiceModuleForms', () => {
    const genericDescribed: Described = { id: 0, code: 'D', description: 'Described', version: 0 };
    const sp1: ServiceProduct = {
        id: { productCategoryId: 0, serviceId: 0 },
        productCategory: genericDescribed,
        defaultQuantity: null,
        version: null,
    };
    const sp2: ServiceProduct = {
        id: { productCategoryId: 1, serviceId: 0 },
        productCategory: genericDescribed,
        defaultQuantity: 1,
        version: null,
    };

    const completeService = {
        id: 12,
        code: 'SERVICE_1',
        description: 'Service 1',
        version: 1,
        serviceCategory: { id: 2, code: 'SERVICE_1', description: 'Service 1', version: 1 },
        active: true,
        supportsECommerce: null,
        requiresApproval: true,
        supportsQuickSale: true,
        supportsQuickInvoice: true,
        supportsRegularInvoice: true,
        supportsRefillInvoice: true,
        supportsTireCheckInvoice: true,
        serviceProducts: [sp1, sp2],
        updatedOn: '2017-01-01',
        updatedBy: 'a524122',
    };

    describe('validations', () => {
        let formFactory: FormFactory;
        let formBuilder: FormBuilder;
        let componentDestroyed;

        beforeEach(async () => {
            await TestBed.configureTestingModule({
                imports: [ReactiveFormsModule],
                providers: [FormFactory],
            }).compileComponents();
        });

        beforeEach(() => {
            formFactory = TestBed.inject(FormFactory);
            formBuilder = TestBed.inject(FormBuilder);
            ServiceCatalogModuleForms.registerForms(formFactory, formBuilder);
            componentDestroyed = new ReplaySubject(1);
        });

        describe('for Service', () => {
            const expectFormErrorToBeTrue = (testValue: Service, testProperty: keyof Service, error: string) => {
                const group = formFactory.group('Service', testValue, componentDestroyed);
                group.getControl(testProperty).updateValueAndValidity();
                expect(group.getControl(testProperty).hasError(error)).toBe(true);
            };

            it('should disable code if code has a valid value', () => {
                const group = formFactory.group('Service', completeService, componentDestroyed);

                expect(group.getControl('code').disabled).toBe(true);
            });

            it('should disable active if active has a valid value', () => {
                const group = formFactory.group('Service', completeService, componentDestroyed);

                expect(group.getControl('active').disabled).toBe(true);
            });

            it('should set serviceProducts', () => {
                const group = formFactory.group('Service', completeService, componentDestroyed);

                expect(group.getControlValue('serviceProducts')).toEqual(completeService.serviceProducts);
            });

            it('should give an error message when serviceCategory value is not entered', () => {
                expectFormErrorToBeTrue({ ...completeService, serviceCategory: null }, 'serviceCategory', 'required');
            });

            it('should set supportsECommerce to false if it is null', () => {
                const group = formFactory.group('Service', completeService, componentDestroyed);
                expect(group.getControlValue('supportsECommerce')).toEqual(false);
            });

            it('should not set supportsECommerce to false if it is true', () => {
                const group = formFactory.group(
                    'Service',
                    { ...completeService, supportsECommerce: true },
                    componentDestroyed
                );
                expect(group.getControlValue('supportsECommerce')).toEqual(true);
            });

            describe('description', () => {
                it('should give an error message when value is not entered', () => {
                    expectFormErrorToBeTrue({ ...completeService, description: null }, 'description', 'required');
                });

                it('should give an error when it has more than the max number of characters', () => {
                    const value: Service = {
                        ...completeService,
                        description: 'a'.repeat(51),
                    };
                    expectFormErrorToBeTrue(value, 'description', 'maxlength');
                });
            });

            describe('code', () => {
                const changeDetector = {} as ChangeDetectorRef;

                let codeControl: FormControl;

                const validateCode = (value: string, error: string, toBe: boolean) => {
                    codeControl.patchValue(value);
                    codeControl.updateValueAndValidity();
                    expect(codeControl.hasError(error)).toBe(toBe);
                };

                beforeEach(() => {
                    const group = formFactory.group('Service', new Service(), componentDestroyed, {
                        changeDetector,
                    });
                    codeControl = group.getControl('code') as FormControl;
                });

                it('should give an error message when value is not entered', () => {
                    validateCode(null, 'required', true);
                });

                it('should give an error when it has more than the max number of characters', () => {
                    validateCode('a'.repeat(16), 'maxlength', true);
                    validateCode('a'.repeat(15), 'maxlength', false);
                });

                it('should allow uppercase and numbers', () => {
                    validateCode('ABC123CDE456', 'serviceCodeInvalidPattern', false);
                });

                it.each`
                    character | allowed
                    ${'_'}    | ${false}
                    ${'-'}    | ${false}
                    ${'/'}    | ${false}
                    ${'A'}    | ${true}
                    ${'1'}    | ${true}
                `(`should validate start character $character allowed=$allowed`, ({ character, allowed }) => {
                    validateCode(character + 'ABC123', 'serviceCodeInvalidPattern', !allowed);
                });

                // test a few special characters to ensure they aren't allowed
                it.each`
                    character
                    ${'!'}
                    ${'@'}
                    ${'#'}
                    ${'$'}
                    ${'%'}
                    ${'^'}
                    ${'&'}
                    ${'*'}
                    ${'+'}
                    ${'='}
                `('should disallow $character', ({ character }) => {
                    validateCode('A' + character, 'serviceCodeInvalidPattern', true);
                });
            });
        });

        describe('for ServiceProduct inside Service', () => {
            const value: ServiceProduct = {
                productCategory: { code: 'PRODCAT', description: 'Test product category', id: 1, version: 0 },
                defaultQuantity: -5, // negative defaultQuantity
            };

            it('should give an error message when defaultQuantity value is less than 0', () => {
                const group = formFactory.group('ServiceProduct', value, componentDestroyed);
                group.getControl('defaultQuantity').updateValueAndValidity();

                expect(group.getControl('defaultQuantity').hasError('min')).toBe(true);
            });

            it('should be valid when null', () => {
                const defaultQuantityIsNull: ServiceProduct = {
                    ...value,
                    defaultQuantity: null,
                };
                const group = formFactory.group('ServiceProduct', defaultQuantityIsNull, componentDestroyed);
                group.getControl('defaultQuantity').updateValueAndValidity();

                expect(group.getControl('defaultQuantity').valid).toBe(true);
            });
        });
    });
});
