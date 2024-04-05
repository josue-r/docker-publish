import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatFormFieldHarness } from '@angular/material/form-field/testing';
import { MatInputModule } from '@angular/material/input';
import { MatInputHarness } from '@angular/material/input/testing';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatSortHeaderHarness } from '@angular/material/sort/testing';
import { MatTableModule } from '@angular/material/table';
import { MatCellHarness, MatHeaderCellHarness, MatTableHarness } from '@angular/material/table/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductAdjustmentDetail } from '@vioc-angular/central-ui/inventory/data-access-product-adjustment';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { AccessMode } from '@vioc-angular/security/util-authorization';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { FormFactory, TypedFormGroup, UtilFormMockModule } from '@vioc-angular/shared/util-form';
import { of, ReplaySubject } from 'rxjs';
import { ProductAdjustmentForms } from '../product-adjustment-module-forms';
import { ProductAdjustmentProductsComponent } from './product-adjustment-products.component';

describe('ProductAdjustmentProductsComponent', () => {
    let component: ProductAdjustmentProductsComponent;
    let fixture: ComponentFixture<ProductAdjustmentProductsComponent>;
    let formFactory: FormFactory;
    let componentDestroyed: ReplaySubject<any>;
    let loader: HarnessLoader;
    let accessMode: AccessMode;
    const testProduct: ProductAdjustmentDetail = {
        id: null,
        lineNumber: null,
        wholesalePrice: 5,
        product: { code: 'TEST', description: 'Test Description' },
        unitOfMeasure: { code: 'EACH', description: 'EA' },
        adjustmentReason: { code: 'REASON', description: 'Test Reason' },
        sign: '+',
        quantity: null,
    };

    const testProduct1: ProductAdjustmentDetail = {
        product: { code: 'TEST1', description: 'Test Description1' },
        unitOfMeasure: { code: 'QUART', description: 'QT' },
        quantity: null,
        wholesalePrice: 14,
        adjustmentReason: null,
        sign: null,
    };

    function mockHasWholesalePriceReadAccess(hasAccess: boolean): void {
        jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(hasAccess));
    }

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProductAdjustmentProductsComponent],
            imports: [
                ReactiveFormsModule,
                MatTableModule,
                MatSortModule,
                MatFormFieldModule,
                MatInputModule,
                MatSelectModule,
                NoopAnimationsModule,
                MatCheckboxModule,
                UtilFormMockModule,
                UiButtonModule,
                UiFilteredInputMockModule,
            ],
            providers: [FormFactory, { provide: RoleFacade, useValue: { hasAnyRole: jest.fn(() => of()) } }],
        }).compileComponents();
    });

    beforeEach(() => {
        formFactory = TestBed.inject(FormFactory);
        ProductAdjustmentForms.registerForms(formFactory, TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(ProductAdjustmentProductsComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        componentDestroyed = new ReplaySubject(1);
        accessMode = AccessMode.ADD;
        component.accessMode = accessMode;
    });

    afterEach(() => componentDestroyed.next());

    describe('sortingDataAcessor', () => {
        it.each`
            column              | hasWholesaleAccess | responseValue
            ${'code'}           | ${false}           | ${testProduct.product.code}
            ${'description'}    | ${false}           | ${testProduct.product.description}
            ${'unitOfMeasure'}  | ${false}           | ${testProduct.unitOfMeasure.code}
            ${'reason'}         | ${false}           | ${testProduct.adjustmentReason.description}
            ${'sign'}           | ${false}           | ${testProduct.sign}
            ${'quantity'}       | ${false}           | ${testProduct.quantity}
            ${'wholesalePrice'} | ${true}            | ${testProduct.wholesalePrice}
        `('should return the correct value for $column', ({ column, hasWholesaleAccess, responseValue }) => {
            component.form = formFactory.array('ProductAdjustmentDetail', [testProduct], componentDestroyed, {
                accessMode: AccessMode.ADD,
            });
            mockHasWholesalePriceReadAccess(hasWholesaleAccess);

            const response = component.products.sortingDataAccessor(
                component.form.get('0') as TypedFormGroup<ProductAdjustmentDetail>,
                column
            );
            expect(response).toEqual(responseValue);
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it.each`
        field               | header                   | hasWholesaleAccess | value
        ${'code'}           | ${'Product Code'}        | ${false}           | ${testProduct.product.code}
        ${'description'}    | ${'Product Description'} | ${false}           | ${testProduct.product.description}
        ${'unitOfMeasure'}  | ${'Unit'}                | ${false}           | ${testProduct.unitOfMeasure.description}
        ${'wholesalePrice'} | ${'Wholesale Price'}     | ${true}            | ${testProduct.wholesalePrice}
    `(
        `should display the $field field with value $value and header $header`,
        async ({ field, header, hasWholesaleAccess, value }) => {
            component.form = formFactory.array('ProductAdjustmentDetail', [testProduct], componentDestroyed, {
                accessMode: AccessMode.ADD,
            });
            mockHasWholesalePriceReadAccess(hasWholesaleAccess);

            fixture.detectChanges();
            const cell = await loader.getHarness(MatCellHarness.with({ selector: `#${field}-0` }));
            expect(await cell.getText()).toEqual(value.toString());
            const headerCell = await loader.getHarness(MatHeaderCellHarness.with({ selector: `#${field}-header` }));
            expect(await headerCell.getText()).toEqual(header);
        }
    );

    describe('quantity', () => {
        it('should provide input for quantity with header Quantity', async () => {
            const quantity = 10;
            component.form = formFactory.array(
                'ProductAdjustmentDetail',
                [{ ...testProduct, quantity }],
                componentDestroyed,
                {
                    accessMode: AccessMode.ADD,
                }
            );
            fixture.detectChanges();
            const quantityInput = await loader.getHarness(MatInputHarness.with({ selector: '#quantity-input-0' }));
            expect(await quantityInput.getValue()).toEqual(`${quantity}`);
            const headerCell = await loader.getHarness(MatHeaderCellHarness.with({ selector: '#quantity-header' }));
            expect(await headerCell.getText()).toEqual('Quantity');
        });

        it('should update form when quantity is updated', async () => {
            const quantity = 10;
            component.form = formFactory.array('ProductAdjustmentDetail', [testProduct], componentDestroyed, {
                accessMode: AccessMode.ADD,
            });
            fixture.detectChanges();
            const quantityInput = await loader.getHarness(MatInputHarness.with({ selector: '#quantity-input-0' }));
            await quantityInput.setValue(`${quantity}`);
            expect(component.form.get('0').get('quantity').value).toEqual(`${quantity}`);
        });

        it('should apply the decimal places directive', async () => {
            component.form = formFactory.array('ProductAdjustmentDetail', [testProduct], componentDestroyed, {
                accessMode: AccessMode.ADD,
            });
            fixture.detectChanges();
            const quantityInput = await loader.getHarness(MatInputHarness.with({ selector: '#quantity-input-0' }));
            const quantityHost = await quantityInput.host();
            // Expect empty string since no additional params are passed
            expect(await quantityHost.getAttribute('viocangulardecimalplaces')).toEqual('');
        });

        it('should display form errors', async () => {
            const errors = { error: true };
            component.form = formFactory.array('ProductAdjustmentDetail', [testProduct], componentDestroyed, {
                accessMode: AccessMode.ADD,
            });
            const quantityControl = component.form.get('0').get('quantity');
            quantityControl.setValidators(() => errors);
            quantityControl.markAsTouched();
            const quantityFormField = await loader.getHarness(
                MatFormFieldHarness.with({
                    selector: '#quantity-form-field-0',
                })
            );
            expect(await quantityFormField.getTextErrors()).toEqual([JSON.stringify(errors)]);
        });
    });

    describe('adding product to order', () => {
        it('should maintain the forms check mark status after new products are added to the array', fakeAsync(async () => {
            let existingArray = [testProduct];
            component.form = formFactory.array('ProductAdjustmentDetail', existingArray, componentDestroyed);
            // assert no selections made
            expect(component.selection.isEmpty()).toEqual(true);
            (await loader.getHarness(MatCheckboxHarness.with({ selector: '#select-all-checkbox' }))).check();
            flush();
            fixture.detectChanges();
            expect(component.selection.isEmpty()).toEqual(false);
            expect(component.form.length).toEqual(1);
            component.form = formFactory.array(
                'ProductAdjustmentDetail',
                existingArray.concat([testProduct1]),
                componentDestroyed
            );
            expect(component.selection.selected.length).toEqual(1);
            expect(component.selection.selected[0].value).toEqual(component.form.value[0]);
        }));
    });

    describe('remove products', () => {
        const testProduct2 = { ...testProduct, product: { code: 'TEST2' } };

        const getRemoveProductsButton = () => {
            return loader.getHarness(
                MatButtonHarness.with({
                    selector: '#remove-products-button',
                })
            );
        };

        const clickRemoveProducts = async () => {
            const removeProductsButton = await getRemoveProductsButton();
            await removeProductsButton.click();
        };

        const getCheckbox = (selector: string) => {
            return loader.getHarness(
                MatCheckboxHarness.with({
                    selector,
                })
            );
        };

        const clickCheckbox = async (selector: string) => {
            const checkbox = await getCheckbox(selector);
            await checkbox.toggle();
        };

        const isChecked = (selector: string) => {
            return getCheckbox(selector).then((checkbox) => checkbox.isChecked());
        };

        const isIndeterminate = (selector: string) => {
            return getCheckbox(selector).then((checkbox) => checkbox.isIndeterminate());
        };

        const isDisabled = (selector: string) => {
            return getCheckbox(selector).then((checkbox) => checkbox.isDisabled());
        };

        it('should emit selected values for removal', async () => {
            component.form = formFactory.array(
                'ProductAdjustmentDetail',
                [testProduct, testProduct2],
                componentDestroyed,
                {
                    accessMode: AccessMode.ADD,
                }
            );
            fixture.detectChanges();
            jest.spyOn(component.removeProducts, 'emit');
            await clickCheckbox('#checkbox-0');
            await clickRemoveProducts();
            expect(component.removeProducts.emit).toHaveBeenCalledWith([testProduct.product.code]);

            await clickCheckbox('#checkbox-0');
            await clickCheckbox('#checkbox-1');
            await clickRemoveProducts();
            expect(component.removeProducts.emit).toHaveBeenCalledWith([
                testProduct.product.code,
                testProduct2.product.code,
            ]);
        });

        it('should clear selection', async () => {
            component.form = formFactory.array(
                'ProductAdjustmentDetail',
                [testProduct, testProduct2],
                componentDestroyed,
                {
                    accessMode: AccessMode.ADD,
                }
            );
            fixture.detectChanges();
            await clickCheckbox('#checkbox-0');
            await clickRemoveProducts();
            expect(component.selection.isEmpty()).toBeTruthy();
        });

        describe('header checkbox', () => {
            beforeEach(() => {
                component.form = formFactory.array(
                    'ProductAdjustmentDetail',
                    [testProduct, testProduct2],
                    componentDestroyed,
                    {
                        accessMode: AccessMode.ADD,
                    }
                );
                fixture.detectChanges();
                jest.spyOn(component.removeProducts, 'emit');
            });

            describe('with nothing checked', () => {
                it('should select all rows', async () => {
                    await clickCheckbox('#select-all-checkbox');
                    expect(await isChecked('#checkbox-0')).toBeTruthy();
                    expect(await isChecked('#checkbox-1')).toBeTruthy();
                    await clickRemoveProducts();
                    expect(component.removeProducts.emit).toHaveBeenCalledWith([
                        testProduct.product.code,
                        testProduct2.product.code,
                    ]);
                });

                it('should not be checked', async () => {
                    expect(await isChecked('#select-all-checkbox')).toBeFalsy();
                });

                it('should not be indeterminate', async () => {
                    expect(await isIndeterminate('#select-all-checkbox')).toBeFalsy();
                });
            });

            describe('with some items checked', () => {
                beforeEach(async () => {
                    await clickCheckbox('#checkbox-0');
                    expect(await isChecked('#checkbox-0')).toBeTruthy();
                });

                it('should select all rows', async () => {
                    await clickCheckbox('#select-all-checkbox');
                    expect(await isChecked('#checkbox-0')).toBeTruthy();
                    expect(await isChecked('#checkbox-1')).toBeTruthy();
                    await clickRemoveProducts();
                    expect(component.removeProducts.emit).toHaveBeenCalledWith([
                        testProduct.product.code,
                        testProduct2.product.code,
                    ]);
                });

                it('should not be checked', async () => {
                    expect(await isChecked('#select-all-checkbox')).toBeFalsy();
                });

                it('should be indeterminate', async () => {
                    expect(await isIndeterminate('#select-all-checkbox')).toBeTruthy();
                });
            });

            describe('with all items checked', () => {
                beforeEach(async () => {
                    await clickCheckbox('#checkbox-0');
                    await clickCheckbox('#checkbox-1');
                    expect(await isChecked('#checkbox-0')).toBeTruthy();
                    expect(await isChecked('#checkbox-1')).toBeTruthy();
                });

                it('should deselect all rows', async () => {
                    await clickCheckbox('#select-all-checkbox');
                    expect(await isChecked('#checkbox-0')).toBeFalsy();
                    expect(await isChecked('#checkbox-1')).toBeFalsy();
                    expect(await (await getRemoveProductsButton()).isDisabled()).toBeTruthy();
                });

                it('should be checked', async () => {
                    expect(await isChecked('#select-all-checkbox')).toBeTruthy();
                });

                it('should not be indeterminate', async () => {
                    expect(await isIndeterminate('#select-all-checkbox')).toBeFalsy();
                });
            });
        });

        it('checkboxes should be disabled when disableSelection is true', async () => {
            component.form = formFactory.array(
                'ProductAdjustmentDetail',
                [testProduct, testProduct2],
                componentDestroyed,
                {
                    accessMode: AccessMode.ADD,
                }
            );
            component.disableSelection = true;
            fixture.detectChanges();
            expect(await isDisabled('#select-all-checkbox')).toBeTruthy();
            expect(await isDisabled('#checkbox-0')).toBeTruthy();
            expect(await isDisabled('#checkbox-1')).toBeTruthy();
        });

        describe('remove products button', () => {
            it('should not display if form is not set', () => {
                fixture.detectChanges();
                return expect(() => getRemoveProductsButton()).rejects.toThrow();
            });

            it('should be disabled if nothing is selected', async () => {
                component.form = formFactory.array('ProductAdjustmentDetail', [testProduct], componentDestroyed, {
                    accessMode: AccessMode.ADD,
                });
                fixture.detectChanges();
                expect(await (await getRemoveProductsButton()).isDisabled()).toBeTruthy();
            });

            it('should be disabled if disabledSelection is true', async () => {
                component.form = formFactory.array('ProductAdjustmentDetail', [testProduct], componentDestroyed, {
                    accessMode: AccessMode.ADD,
                });
                component.disableSelection = true;
                fixture.detectChanges();
                expect(await (await getRemoveProductsButton()).isDisabled()).toBeTruthy();
            });
        });
    });

    it('should not display anything if no form is set', () => {
        fixture.detectChanges();
        return expect(() => loader.getHarness(MatTableHarness)).rejects.toThrow();
    });

    describe('sorting', () => {
        it.each`
            column
            ${'code-header'}
            ${'description-header'}
            ${'unitOfMeasure-header'}
            ${'quantity-header'}
            ${'wholesalePrice-header'}
        `(
            'should be sortable by the $column column',
            fakeAsync(async ({ column }) => {
                component.form = formFactory.array(
                    'ProductAdjustmentDetail',
                    [testProduct, testProduct1],
                    componentDestroyed,
                    {
                        accessMode: AccessMode.ADD,
                    }
                );
                mockHasWholesalePriceReadAccess(true);

                fixture.detectChanges();
                flush();
                jest.spyOn(component.products, 'sortingDataAccessor');

                const headerButton = loader.getHarness(
                    MatSortHeaderHarness.with({
                        selector: `#${column}`,
                    })
                );
                await (await headerButton).click();
                expect(await (await headerButton).isActive()).toEqual(true);
                expect(component.products.sortingDataAccessor).toHaveBeenCalled();
                if (!component.products.sort) {
                    fail('Sort should be truthy');
                }
            })
        );
    });

    describe('display columns', () => {
        it('should not display wholesalePrice column with view access and without wholesale price access', fakeAsync(() => {
            component.form = formFactory.array(
                'ProductAdjustmentDetail',
                [testProduct, testProduct1],
                componentDestroyed,
                {
                    accessMode: AccessMode.VIEW,
                }
            );
            mockHasWholesalePriceReadAccess(false);
            expect(component.displayedColumns).toEqual([
                'select',
                'code',
                'description',
                'unitOfMeasure',
                'reason',
                'quantity',
            ]);
        }));

        it('should display wholesalePrice column with add access and with wholesale price access', fakeAsync(() => {
            component.form = formFactory.array(
                'ProductAdjustmentDetail',
                [testProduct, testProduct1],
                componentDestroyed,
                {
                    accessMode: AccessMode.ADD,
                }
            );
            mockHasWholesalePriceReadAccess(true);

            fixture.detectChanges();
            flush();
            expect(component.displayedColumns).toEqual([
                'select',
                'code',
                'description',
                'unitOfMeasure',
                'reason',
                'sign',
                'quantity',
                'wholesalePrice',
            ]);
        }));

        it('should display wholesalePrice column with view access and with wholesale price access', fakeAsync(() => {
            component.form = formFactory.array(
                'ProductAdjustmentDetail',
                [testProduct, testProduct1],
                componentDestroyed,
                {
                    accessMode: AccessMode.VIEW,
                }
            );
            mockHasWholesalePriceReadAccess(true);

            fixture.detectChanges();
            flush();
            expect(component.displayedColumns).toEqual([
                'select',
                'code',
                'description',
                'unitOfMeasure',
                'reason',
                'sign',
                'quantity',
                'wholesalePrice',
            ]);
        }));
    });
});
