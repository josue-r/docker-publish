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
import { MatSortModule } from '@angular/material/sort';
import { MatSortHeaderHarness } from '@angular/material/sort/testing';
import { MatTableModule } from '@angular/material/table';
import { MatCellHarness, MatHeaderCellHarness, MatTableHarness } from '@angular/material/table/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { InventoryTransferProduct } from '@vioc-angular/central-ui/inventory/data-access-inventory-transfer';
import { FormFactory, TypedFormGroup, UtilFormMockModule } from '@vioc-angular/shared/util-form';
import { ReplaySubject } from 'rxjs';
import { InventoryTransferForms } from '../../inventory-transfer-module-forms';
import { InventoryTransferProductsComponent } from './inventory-transfer-products.component';
import { UiButtonModule } from '@vioc-angular/shared/ui-button';
import { By } from '@angular/platform-browser';

describe('InventoryTransferProductsComponent', () => {
    let component: InventoryTransferProductsComponent;
    let fixture: ComponentFixture<InventoryTransferProductsComponent>;
    let formFactory: FormFactory;
    let componentDestroyed: ReplaySubject<any>;
    let loader: HarnessLoader;
    const testProduct: InventoryTransferProduct = {
        product: { code: 'TEST', description: 'Test Description' },
        uom: { code: 'EACH', description: 'Each' },
        quantity: null,
        quantityOnHand: 10,
        version: 0,
    };

    const testProduct1: InventoryTransferProduct = {
        product: { code: 'TEST1', description: 'Test Description1' },
        uom: { code: 'EACH', description: 'Each' },
        quantity: null,
        quantityOnHand: 11,
        version: 0,
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InventoryTransferProductsComponent],
            imports: [
                ReactiveFormsModule,
                MatTableModule,
                MatSortModule,
                MatFormFieldModule,
                MatInputModule,
                NoopAnimationsModule,
                MatCheckboxModule,
                UtilFormMockModule,
                UiButtonModule,
            ],
            providers: [FormFactory],
        }).compileComponents();
    });

    beforeEach(() => {
        formFactory = TestBed.inject(FormFactory);
        InventoryTransferForms.registerForms(formFactory, TestBed.inject(FormBuilder));
        fixture = TestBed.createComponent(InventoryTransferProductsComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        componentDestroyed = new ReplaySubject(1);
    });

    afterEach(() => componentDestroyed.next());

    describe('sortingDataAcessor', () => {
        it.each`
            column           | responseValue
            ${'code'}        | ${testProduct.product.code}
            ${'description'} | ${testProduct.product.description}
            ${'uom'}         | ${testProduct.uom.code}
            ${'quantity'}    | ${testProduct.quantity}
        `('should return the correct value for $column', ({ column, responseValue }) => {
            component.form = formFactory.array('InventoryTransferProduct', [testProduct], componentDestroyed);
            const response = component.products.sortingDataAccessor(
                component.form.get('0') as TypedFormGroup<InventoryTransferProduct>,
                column
            );
            expect(response).toEqual(responseValue);
        });
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it.each`
        field               | header                   | value
        ${'code'}           | ${'Product Code'}        | ${testProduct.product.code}
        ${'description'}    | ${'Product Description'} | ${testProduct.product.description}
        ${'uom'}            | ${'Unit'}                | ${testProduct.uom.description}
        ${'quantityOnHand'} | ${'Qty on Hand'}         | ${`${testProduct.quantityOnHand}`}
    `(`should display the $field field with value $value and header $header`, async ({ field, header, value }) => {
        component.form = formFactory.array('InventoryTransferProduct', [testProduct], componentDestroyed);
        fixture.detectChanges();
        const cell = await loader.getHarness(MatCellHarness.with({ selector: `#${field}-0` }));
        expect(await cell.getText()).toEqual(value);
        const headerCell = await loader.getHarness(MatHeaderCellHarness.with({ selector: `#${field}-header` }));
        expect(await headerCell.getText()).toEqual(header);
    });

    describe('quantity', () => {
        it('should provide input for quantity with header Quantity', async () => {
            const quantity = 10;
            component.form = formFactory.array(
                'InventoryTransferProduct',
                [{ ...testProduct, quantity }],
                componentDestroyed
            );
            fixture.detectChanges();
            const quantityInput = await loader.getHarness(MatInputHarness.with({ selector: '#quantity-input-0' }));
            expect(await quantityInput.getValue()).toEqual(`${quantity}`);
            const headerCell = await loader.getHarness(MatHeaderCellHarness.with({ selector: '#quantity-header' }));
            expect(await headerCell.getText()).toEqual('Quantity');
        });

        it('should update form when quantity is updated', async () => {
            const quantity = 10;
            component.form = formFactory.array('InventoryTransferProduct', [testProduct], componentDestroyed);
            fixture.detectChanges();
            const quantityInput = await loader.getHarness(MatInputHarness.with({ selector: '#quantity-input-0' }));
            await quantityInput.setValue(`${quantity}`);
            expect(component.form.get('0').get('quantity').value).toEqual(`${quantity}`);
        });

        it('should apply the decimal places directive', async () => {
            component.form = formFactory.array('InventoryTransferProduct', [testProduct], componentDestroyed);
            fixture.detectChanges();
            const quantityInput = await loader.getHarness(MatInputHarness.with({ selector: '#quantity-input-0' }));
            const quantityHost = await quantityInput.host();
            // Expect empty string since no additional params are passed
            expect(await quantityHost.getAttribute('viocangulardecimalplaces')).toEqual('');
        });

        it('should display form errors', async () => {
            const errors = { error: true };
            component.form = formFactory.array('InventoryTransferProduct', [testProduct], componentDestroyed);
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

    describe.each`
        qoh    | quantity | status         | warning
        ${10}  | ${5}     | ${null}        | ${null}
        ${10}  | ${5}     | ${'OPEN'}      | ${null}
        ${-10} | ${null}  | ${'CLOSED'}    | ${null}
        ${5}   | ${6}     | ${'CLOSED'}    | ${null}
        ${5}   | ${6}     | ${'FINALIZED'} | ${null}
        ${-10} | ${null}  | ${'FINALIZED'} | ${null}
        ${-10} | ${null}  | ${null}        | ${'Qty on Hand is less than zero'}
        ${-10} | ${null}  | ${'OPEN'}      | ${'Qty on Hand is less than zero'}
        ${5}   | ${6}     | ${null}        | ${'Quantity is greater than the available Qty on Hand'}
        ${5}   | ${6}     | ${'OPEN'}      | ${'Quantity is greater than the available Qty on Hand'}
        ${-10} | ${6}     | ${null}        | ${'Qty on Hand is less than zero'}
        ${-10} | ${6}     | ${'OPEN'}      | ${'Qty on Hand is less than zero'}
    `('Qty on Hand', ({ qoh, quantity, status, warning }) => {
        beforeEach(() => {
            component.form = formFactory.array(
                'InventoryTransferProduct',
                [{ ...testProduct, quantityOnHand: qoh, quantity }],
                componentDestroyed
            );
            component.status = status;
            fixture.detectChanges();
        });

        it(`should ${
            warning ? '' : 'not '
        }display a warning when the Qty on Hand=${qoh}, quantity=${quantity} and status=${status}`, async () => {
            const cell = await loader.getHarness(MatCellHarness.with({ selector: '#quantityOnHand-0' }));
            if (warning) {
                expect(await cell.getText()).toContain(warning);
            } else {
                expect(await cell.getText()).not.toContain('Qty on Hand is less than zero');
                expect(await cell.getText()).not.toContain('Quantity is greater than the available Qty on Hand');
            }
        });
    });

    describe('adding product to order', () => {
        it('should maintain the forms check mark status after new products are added to the array', fakeAsync(async () => {
            let existingArray = [testProduct];
            component.form = formFactory.array('InventoryTransferProduct', existingArray, componentDestroyed);
            // assert no selections made
            expect(component.selection.isEmpty()).toEqual(true);
            (await loader.getHarness(MatCheckboxHarness.with({ selector: '#select-all-checkbox' }))).check();
            flush();
            fixture.detectChanges();
            expect(component.selection.isEmpty()).toEqual(false);
            expect(component.form.length).toEqual(1);
            component.form = formFactory.array(
                'InventoryTransferProduct',
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
                'InventoryTransferProduct',
                [testProduct, testProduct2],
                componentDestroyed
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
                'InventoryTransferProduct',
                [testProduct, testProduct2],
                componentDestroyed
            );
            fixture.detectChanges();
            await clickCheckbox('#checkbox-0');
            await clickRemoveProducts();
            expect(component.selection.isEmpty()).toBeTruthy();
        });

        describe('header checkbox', () => {
            beforeEach(() => {
                component.form = formFactory.array(
                    'InventoryTransferProduct',
                    [testProduct, testProduct2],
                    componentDestroyed
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
                'InventoryTransferProduct',
                [testProduct, testProduct2],
                componentDestroyed
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
                component.form = formFactory.array('InventoryTransferProduct', [testProduct], componentDestroyed);
                fixture.detectChanges();
                expect(await (await getRemoveProductsButton()).isDisabled()).toBeTruthy();
            });

            it('should be disabled if disabledSelection is true', async () => {
                component.form = formFactory.array('InventoryTransferProduct', [testProduct], componentDestroyed);
                component.disableSelection = true;
                fixture.detectChanges();
                expect(await (await getRemoveProductsButton()).isDisabled()).toBeTruthy();
            });
        });
    });

    it('should not display checkboxes if the transfer status is FINALIZED', () => {
        component.form = formFactory.array('InventoryTransferProduct', [testProduct, testProduct1], componentDestroyed);
        component.status = 'FINALIZED';
        fixture.detectChanges();

        expect(fixture.debugElement.query(By.css('#select-all-header')).children.length).toBeLessThanOrEqual(0);
        expect(fixture.debugElement.query(By.css('.select-single')).children.length).toBeLessThanOrEqual(0);
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
            ${'quantityOnHand-header'}
            ${'uom-header'}
            ${'quantity-header'}
        `(
            'should be sortable by the $column column',
            fakeAsync(async ({ column }) => {
                component.form = formFactory.array(
                    'InventoryTransferProduct',
                    [testProduct, testProduct1],
                    componentDestroyed
                );
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
});
