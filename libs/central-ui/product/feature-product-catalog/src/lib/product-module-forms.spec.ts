import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { fakeAsync, flush } from '@angular/core/testing';
import { FormBuilder, FormControl } from '@angular/forms';
import { Product, ProductMotorMapping } from '@vioc-angular/central-ui/product/data-access-product';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { Described } from '@vioc-angular/shared/common-functionality';
import { ApiErrorResponse } from '@vioc-angular/shared/util-api';
import { FormFactory, FormFactoryOptions, TypedFormGroup } from '@vioc-angular/shared/util-form';
import { Observable, of, ReplaySubject, throwError } from 'rxjs';
import { ProductModuleForms } from './product-module-forms';

describe('ProductModuleForms', () => {
    describe('registerForms', () => {
        it('should register Product models', () => {
            const mockFormFactory = ({ register: jest.fn() } as unknown) as FormFactory;
            ProductModuleForms.registerForms(mockFormFactory, undefined);
            expect(mockFormFactory.register).toHaveBeenCalledWith('Product', expect.any(Function));
            expect(mockFormFactory.register).toHaveBeenCalledWith('ProductMotorMapping', expect.any(Function));
        });
    });

    describe('validations', () => {
        const formBuilder = new FormBuilder();
        const formFactory = new FormFactory(formBuilder);
        const changeDetector = {} as ChangeDetectorRef;
        let componentDestroyed: ReplaySubject<any>;

        beforeAll(() => ProductModuleForms.registerForms(formFactory, formBuilder));
        beforeEach(() => (componentDestroyed = new ReplaySubject(1)));
        afterEach(() => componentDestroyed.next());

        it('should require changeDetector', () => {
            expect(() => formFactory.group('Product', new Product(), componentDestroyed)).toThrow();
        });

        describe('product', () => {
            it('should have code disabled if it has a value', () => {
                const value: Product = { ...new Product(), code: 'test' };
                const group = formFactory.group('Product', value, componentDestroyed, {
                    changeDetector,
                    accessMode: AccessMode.EDIT,
                });
                expect(group.getControl('code').disabled).toBe(true);
            });
            it('should update relatedProductCode if product code value changes', fakeAsync(() => {
                const group = formFactory.group('Product', new Product(), componentDestroyed, {
                    changeDetector,
                    accessMode: AccessMode.EDIT,
                });
                group.patchControlValue('code', 'test');
                flush();
                expect(group.getControl('relatedProductCode').value).toEqual('test');
            }));
            it('should not update relatedProductCode when product code value changes if relatedProductCode has been overridden', fakeAsync(() => {
                const group = formFactory.group('Product', new Product(), componentDestroyed, {
                    changeDetector,
                    accessMode: AccessMode.EDIT,
                });
                group.patchControlValue('code', 'test');
                flush();
                expect(group.getControlValue('relatedProductCode')).toEqual('test');

                group.patchControlValue('relatedProductCode', 'related');
                group.patchControlValue('code', 'test2');
                flush();
                expect(group.getControlValue('relatedProductCode')).toEqual('related');
            }));

            it('should set supportsECommerce to false if it is null', fakeAsync(() => {
                const group = formFactory.group('Product', new Product(), componentDestroyed, {
                    changeDetector,
                    accessMode: AccessMode.EDIT,
                });
                expect(group.getControlValue('supportsECommerce')).toEqual(false);
            }));

            it('should not set supportsECommerce to false if it is true', fakeAsync(() => {
                const group = formFactory.group(
                    'Product',
                    { ...new Product(), supportsECommerce: true },
                    componentDestroyed,
                    {
                        changeDetector,
                        accessMode: AccessMode.EDIT,
                    }
                );
                expect(group.getControlValue('supportsECommerce')).toEqual(true);
            }));

            describe('validates', () => {
                const expectFormErrorToBeTrue = (
                    testValue: Product,
                    testProperty: keyof Product,
                    error: string,
                    formOptions: FormFactoryOptions = { accessMode: AccessMode.EDIT }
                ) => {
                    const group = formFactory.group('Product', testValue, componentDestroyed, {
                        changeDetector,
                        ...formOptions,
                    });
                    group.getControl(testProperty).updateValueAndValidity();
                    expect(group.getControl(testProperty).hasError(error)).toBe(true);
                };
                describe('code', () => {
                    let codeControl: FormControl;

                    const validateCode = (value: string, error: string, toBe: boolean) => {
                        codeControl.patchValue(value);
                        codeControl.updateValueAndValidity();
                        expect(codeControl.hasError(error)).toBe(toBe);
                    };

                    beforeEach(() => {
                        const group = formFactory.group('Product', new Product(), componentDestroyed, {
                            changeDetector,
                            accessMode: AccessMode.EDIT,
                        });
                        codeControl = group.getControl('code') as FormControl;
                    });

                    it('should validate required', () => {
                        expectFormErrorToBeTrue(new Product(), 'code', 'required');
                    });

                    it('should validate cannot have more than 15 characters', () => {
                        validateCode('a'.repeat(16), 'maxlength', true);
                        validateCode('a'.repeat(15), 'maxlength', false);
                    });

                    it('should allow alpha characters, numbers, _, -, /, and space are allowed', () => {
                        validateCode('Abc123 -_/', 'productCode', false);
                    });

                    it.each`
                        character | allowed
                        ${'_'}    | ${false}
                        ${'-'}    | ${false}
                        ${'/'}    | ${false}
                        ${'A'}    | ${true}
                        ${'1'}    | ${true}
                        ${'a'}    | ${true}
                    `(`should validate start character $character allowed=$allowed`, ({ character, allowed }) => {
                        validateCode(character + 'ABC123', 'productCodeStart', !allowed);
                    });

                    it.each`
                        character
                        ${'_'}
                        ${'-'}
                        ${'A'}
                        ${'1'}
                        ${'a'}
                    `(`should allow $character when start character is valid`, ({ character }) => {
                        validateCode('ABC' + character + '123', 'productCodeStart', false);
                    });

                    // test a few special characters and lower case to ensure they aren't allowed
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
                        validateCode(character, 'productCode', true);
                    });
                });

                describe('productCategory', () => {
                    let group: TypedFormGroup<Product>;
                    const validCategory = { ...new Described(), code: 'TESTCAT' };
                    const invalidCategory = { ...new Described(), code: 'TESTINVALIDCAT' };

                    const productCategoryFacade = {
                        findActive(level: string): Observable<any> {
                            return of([validCategory]);
                        },
                    };

                    const options = (accessMode: AccessMode) => {
                        return {
                            accessMode,
                            changeDetector,
                            productCategoryFacade,
                        } as FormFactoryOptions;
                    };

                    const createErrorGroup = (field, accessMode: AccessMode = AccessMode.EDIT) => {
                        group = formFactory.group(
                            'Product',
                            {
                                ...new Product(),
                                code: 'TEST',
                                productCategory: invalidCategory,
                            },
                            componentDestroyed,
                            options(accessMode)
                        );
                        group.getControl(field).markAsDirty();
                        group.getControl(field).updateValueAndValidity();
                        flush();
                    };

                    it('should validate that productCategory is required', () => {
                        expectFormErrorToBeTrue(new Product(), 'productCategory', 'required');
                    });

                    describe.each`
                        accessMode         | asyncValidatorActive
                        ${AccessMode.EDIT} | ${true}
                        ${AccessMode.VIEW} | ${false}
                        ${AccessMode.ADD}  | ${false}
                        ${null}            | ${false}
                    `('with async validator', ({ accessMode, asyncValidatorActive }) => {
                        it(`should be ${
                            asyncValidatorActive ? 'en' : 'dis'
                        }abled in $accessMode.urlSegement mode`, fakeAsync(() => {
                            createErrorGroup('productCategory', accessMode);

                            if (asyncValidatorActive) {
                                expect(group.getControl('productCategory').asyncValidator).toBeTruthy();
                            } else {
                                expect(group.getControl('productCategory').asyncValidator).toBeFalsy();
                            }
                        }));
                    });

                    describe.each`
                        categories                          | error
                        ${[validCategory]}                  | ${{ categoryInvalid: true }}
                        ${[validCategory, invalidCategory]} | ${null}
                    `('with validation errors', ({ categories, error }) => {
                        it(`should throw error ${categories} when referenced validation fails`, fakeAsync(() => {
                            jest.spyOn(productCategoryFacade, 'findActive').mockReturnValueOnce(of(categories));
                            createErrorGroup('productCategory');

                            expect(group.getControl('productCategory').errors).toEqual(error);
                        }));
                    });
                });

                it('should validate that defaultUom is required', () => {
                    expectFormErrorToBeTrue(new Product(), 'defaultUom', 'required');
                });
                it('should validate that type is required', () => {
                    expectFormErrorToBeTrue(new Product(), 'type', 'required');
                });
                it('should validate that vendorType is required', () => {
                    expectFormErrorToBeTrue(new Product(), 'vendorType', 'required');
                });
                it('should validate that upc cannot have more than the max number of characters', () => {
                    expectFormErrorToBeTrue({ ...new Product(), upc: 'a'.repeat(13) }, 'upc', 'maxlength');
                });
                it('should validate that upc cannot have less than the min number of characters', () => {
                    expectFormErrorToBeTrue({ ...new Product(), upc: 'a'.repeat(10) }, 'upc', 'minlength');
                });
                it('should validate that upc must be alphanumeric', () => {
                    expectFormErrorToBeTrue({ ...new Product(), upc: '&'.repeat(11) }, 'upc', 'upc');
                });
                it('should validate that sapNumber cannot have more than the max number of characters', () => {
                    expectFormErrorToBeTrue({ ...new Product(), sapNumber: 'a'.repeat(19) }, 'sapNumber', 'maxlength');
                });
                it('should validate that sapNumber must be alphanumeric', () => {
                    expectFormErrorToBeTrue({ ...new Product(), sapNumber: '&'.repeat(13) }, 'sapNumber', 'sapNumber');
                });
                it('should validate that sapNumber cannot have lowercase', () => {
                    expectFormErrorToBeTrue({ ...new Product(), sapNumber: 'a' }, 'sapNumber', 'sapNumber');
                });

                describe('reportOrder', () => {
                    it('should validate that reportOrder is required', () => {
                        expectFormErrorToBeTrue(new Product(), 'reportOrder', 'required');
                    });
                    it('should validate that reportOrder cannot have more than the max number of characters', () => {
                        expectFormErrorToBeTrue(
                            { ...new Product(), reportOrder: 'a'.repeat(7) },
                            'reportOrder',
                            'maxlength'
                        );
                    });
                });

                describe('description', () => {
                    it('should validate that description is required', () => {
                        expectFormErrorToBeTrue(new Product(), 'description', 'required');
                    });
                    it('should validate that description cannot have more than the max number of characters', () => {
                        expectFormErrorToBeTrue(
                            { ...new Product(), description: 'a'.repeat(51) },
                            'description',
                            'maxlength'
                        );
                    });
                });

                describe('inventoryDescription', () => {
                    it('should validate that inventoryDescription is required', () => {
                        expectFormErrorToBeTrue(new Product(), 'inventoryDescription', 'required');
                    });
                    it('should validate that inventoryDescription cannot have more than the max number of characters', () => {
                        expectFormErrorToBeTrue(
                            { ...new Product(), inventoryDescription: 'a'.repeat(51) },
                            'inventoryDescription',
                            'maxlength'
                        );
                    });
                });

                describe('active', () => {
                    it('should be disabled if active and product already exists', () => {
                        const value: Product = { ...new Product(), active: true, code: 'TEST' };
                        const group = formFactory.group('Product', value, componentDestroyed, {
                            changeDetector,
                            accessMode: AccessMode.EDIT,
                        });
                        expect(group.getControl('active').disabled).toBe(true);
                    });
                    it('should be enabled if inactive', () => {
                        const value: Product = { ...new Product(), active: false };
                        const group = formFactory.group('Product', value, componentDestroyed, {
                            changeDetector,
                            accessMode: AccessMode.EDIT,
                        });
                        expect(group.getControl('active').disabled).toBe(false);
                    });
                    it('should be enabled if active and product does not already exist', () => {
                        const value: Product = { ...new Product(), active: true };
                        const group = formFactory.group('Product', value, componentDestroyed, {
                            changeDetector,
                            accessMode: AccessMode.EDIT,
                        });
                        expect(group.getControl('active').disabled).toBe(false);
                    });
                });

                describe('relatedProductCode', () => {
                    let group: TypedFormGroup<Product>;
                    const productFacade = {
                        validateRelatedProduct(relatedPordCode: string, prodCode: string): Observable<any> {
                            return of(null);
                        },
                    };
                    const apiError = { error: { messageKey: '' }, apiVersion: '1.0.0' } as ApiErrorResponse;
                    const createRelatedProductErrorGroup = () => {
                        group = formFactory.group(
                            'Product',
                            { ...new Product(), code: 'Test', relatedProductCode: 'Test1' },
                            componentDestroyed,
                            { changeDetector, productFacade, accessMode: AccessMode.EDIT }
                        );
                        group.getControl('relatedProductCode').markAsDirty();
                        group.getControl('relatedProductCode').updateValueAndValidity();
                        flush();
                    };

                    describe('should throw and error', () => {
                        beforeEach(() => {
                            jest.spyOn(productFacade, 'validateRelatedProduct').mockReturnValueOnce(
                                throwError(new HttpErrorResponse({ error: apiError }))
                            );
                        });

                        it('when the related product is obsolete', fakeAsync(() => {
                            apiError.error.messageKey = 'error.product-api.obsoleteRelatedProduct';
                            createRelatedProductErrorGroup();
                            expect(group.getControl('relatedProductCode').errors).toEqual({
                                relatedProductObsolete: true,
                            });
                        }));

                        it('when the related product is inactive', fakeAsync(() => {
                            apiError.error.messageKey = 'error.product-api.inactiveRelatedProduct';
                            createRelatedProductErrorGroup();
                            expect(group.getControl('relatedProductCode').errors).toEqual({
                                relatedProductInactive: true,
                            });
                        }));

                        it('when the related product is not found', fakeAsync(() => {
                            apiError.error.messageKey = 'error.product-api.notFoundRelatedProduct';
                            createRelatedProductErrorGroup();
                            expect(group.getControl('relatedProductCode').errors).toEqual({
                                relatedProductInvalid: true,
                            });
                        }));

                        it('when the related product is not found', fakeAsync(() => {
                            apiError.error.messageKey = 'error.product-api.notFoundRelatedProduct';
                            createRelatedProductErrorGroup();
                            expect(group.getControl('relatedProductCode').errors).toEqual({
                                relatedProductInvalid: true,
                            });
                        }));

                        it('when the related product is related to another product', fakeAsync(() => {
                            apiError.error.messageKey = 'error.product-api.nestedRelatedProduct';
                            apiError.error.errors = [
                                {
                                    developerMessage: 'Message',
                                    messageKey: 'error.product-api.nestedRelatedProduct',
                                    messageParams: ['CODE'],
                                },
                            ];
                            createRelatedProductErrorGroup();
                            expect(group.getControl('relatedProductCode').errors).toEqual({
                                relatedProductNested: { code: 'CODE' },
                            });
                        }));
                    });

                    it('when a different httpError returned', fakeAsync(() => {
                        jest.spyOn(productFacade, 'validateRelatedProduct').mockReturnValueOnce(
                            throwError(new Error('something went wrong'))
                        );
                        apiError.error.messageKey = 'error.product-api.someOtherError';
                        expect(() => createRelatedProductErrorGroup()).toThrowError('something went wrong');
                    }));

                    it('when a different apiError returned', fakeAsync(() => {
                        apiError.error.messageKey = 'error.product-api.somethingWentWrong';
                        jest.spyOn(productFacade, 'validateRelatedProduct').mockReturnValueOnce(
                            throwError(new HttpErrorResponse({ error: apiError }))
                        );
                        apiError.error.messageKey = 'error.product-api.someOtherError';
                        expect(() => createRelatedProductErrorGroup()).toThrowError();
                    }));

                    it('should be valid when no error is returned', fakeAsync(() => {
                        createRelatedProductErrorGroup();
                        expect(group.getControl('relatedProductCode').errors).toBeNull();
                    }));
                });
            });

            describe('when not initialized with GRID scope', () => {
                it('should set productMotorMapping', () => {
                    const group = formFactory.group('Product', new Product(), componentDestroyed, {
                        changeDetector,
                        accessMode: AccessMode.EDIT,
                    });
                    expect(group.getControlValue('productMotorMapping')).toEqual(new Product().productMotorMapping);
                });
            });
        });

        describe('ProductMotorMapping', () => {
            const expectFormErrorToBeTrue = (
                testValue: ProductMotorMapping,
                testProperty: keyof ProductMotorMapping,
                error: string
            ) => {
                const group = formFactory.group('ProductMotorMapping', testValue, componentDestroyed, {
                    changeDetector,
                    accessMode: AccessMode.EDIT,
                });
                group.getControl(testProperty).updateValueAndValidity();
                expect(group.getControl(testProperty).hasError(error)).toBe(true);
            };
            it('should validate motorKey length is less than 255 characters', () => {
                expectFormErrorToBeTrue(
                    { ...new ProductMotorMapping(), motorKey: 'a'.repeat(256) },
                    'motorKey',
                    'maxlength'
                );
            });
        });
    });
});
