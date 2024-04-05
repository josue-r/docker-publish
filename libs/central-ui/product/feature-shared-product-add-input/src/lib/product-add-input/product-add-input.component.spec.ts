import { DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    FeatureSharedStoreProductSelectionMockModule,
    StoreProductSelectionComponent,
} from '@vioc-angular/central-ui/product/feature-shared-store-product-selection';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { DialogComponent, UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { ColumnConfig } from '@vioc-angular/shared/util-column';
import { EMPTY, of } from 'rxjs';
import { ProductAddInputComponent } from './product-add-input.component';

describe('ProductAddInputComponent', () => {
    let component: ProductAddInputComponent;
    let fixture: ComponentFixture<ProductAddInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProductAddInputComponent],
            imports: [
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                NoopAnimationsModule,
                ReactiveFormsModule,
                UiDialogMockModule,
                FeatureSharedStoreProductSelectionMockModule,
            ],
            providers: [{ provide: RoleFacade, useValue: { hasAnyRole: jest.fn(() => of()) } }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductAddInputComponent);
        component = fixture.componentInstance;
        component.searchFn = jest.fn();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('product search dialog', () => {
        let dialog: DebugElement;
        let dialogComponent: DialogComponent;
        const addProductsButton = () => {
            return dialog.query(By.css('#add-products-button')).nativeElement;
        };
        beforeEach(() => {
            component.searchDialog.dialogRef = ({
                afterClosed: () => {
                    return EMPTY;
                },
            } as any) as MatDialogRef<any>;
            jest.spyOn(component.searchDialog.dialogRef, 'afterClosed').mockReturnValue(EMPTY);

            dialog = fixture.debugElement.query(By.css('#search-add-product'));
            dialogComponent = dialog.componentInstance;
        });

        it('should have content passed to the product search dialog', () => {
            expect(dialogComponent.content).not.toBeNull();
            expect(dialog.query(By.css('#product-selection'))).not.toBeNull();
        });

        it('should have actions passed to the product search dialog', () => {
            expect(dialogComponent.actions).not.toBeNull();
            expect(dialog.query(By.css('#cancel-search-button'))).not.toBeNull();
            expect(dialog.query(By.css('#add-products-button'))).not.toBeNull();
        });

        describe('product selection', () => {
            const products = [{ product: { id: 1, code: 'P1' } }, { product: { id: 2, code: 'P2' } }];
            let productSelection: DebugElement;
            let productSelectionComponent: StoreProductSelectionComponent;

            beforeEach(() => {
                productSelection = dialog.query(By.css('#product-selection'));
                productSelectionComponent = productSelection.componentInstance;
            });

            it('should have the searchFn passed', () => {
                expect(productSelectionComponent.searchFn).toEqual(component.searchFn);
            });

            it('should exclude the store, vendor and wholesalePrice columns from the search', () => {
                component.excludedProductSearchColumns.forEach((c) => {
                    expect((productSelectionComponent.usableColumns[c] as ColumnConfig).searchable).toEqual(false);
                    expect((productSelectionComponent.usableColumns[c] as ColumnConfig).displayable).toEqual(false);
                });
            });

            it('should display errors for products that already exist', () => {
                jest.spyOn(component.products, 'emit');
                productSelectionComponent.control.setValue(products);
                // product that already exists
                component.existingProductCodes = ['P1'];
                // update the selected values so the add button is enabled
                fixture.detectChanges();

                addProductsButton().click();
                fixture.detectChanges();

                const error = fixture.debugElement.query(By.css('#product-error'));

                expect(component.products.emit).toHaveBeenCalledWith([{ id: 2, code: 'P2' }]);
                expect(error.nativeElement.textContent).toEqual('Product(s) P1 already added');
            });

            describe('action buttons', () => {
                it('should trigger the addProducts', () => {
                    jest.spyOn(component, 'addProducts');
                    productSelectionComponent.control.setValue(products);
                    // update the selected values so the add button is enabled
                    fixture.detectChanges();

                    addProductsButton().click();
                    fixture.detectChanges();

                    expect(component.addProducts).toHaveBeenCalled();
                });

                it('should update the selected product values when they are selected', () => {
                    jest.spyOn(component.products, 'emit');
                    productSelectionComponent.control.setValue(products);
                    // update the selected values so the add button is enabled
                    fixture.detectChanges();

                    addProductsButton().click();
                    fixture.detectChanges();

                    expect(component.products.emit).toHaveBeenCalledWith(products.map((p) => p.product));
                });

                it('should close the dialog after clicking the add button', () => {
                    jest.spyOn(component, 'closeSearchDialog');
                    productSelectionComponent.control.setValue(products);
                    // update the selected values so the add button is enabled
                    fixture.detectChanges();

                    addProductsButton().click();
                    fixture.detectChanges();

                    expect(component.closeSearchDialog).toHaveBeenCalled();
                });

                it('should disable the add button if no products are selected', () => {
                    expect(addProductsButton().disabled).toEqual(true);
                });

                it('should close the search dialog after clicking cancel', () => {
                    jest.spyOn(component, 'closeSearchDialog');

                    dialog.query(By.css('#cancel-search-button')).nativeElement.click();
                    fixture.detectChanges();

                    expect(component.closeSearchDialog).toHaveBeenCalled();
                });
            });
        });

        describe.each`
            hasRole  | shouldExclude
            ${true}  | ${false}
            ${false} | ${true}
        `('with hasRole=$hasRole', ({ hasRole, shouldExclude }) => {
            it(`should ${shouldExclude ? 'exclude' : 'include'} wholesale price`, fakeAsync(() => {
                jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(hasRole));

                component.openSearchDialog();
                flush();
                if (shouldExclude) {
                    expect(component.excludedProductSearchColumns).toEqual(['store', 'vendor', 'wholesalePrice']);
                } else {
                    expect(component.excludedProductSearchColumns).toEqual(['store', 'vendor']);
                }
            }));
        });

        it(`should remove only wholesalePrice, if user has access`, fakeAsync(() => {
            jest.spyOn(component['roleFacade'], 'hasAnyRole').mockReturnValue(of(true));
            /*  verify that only wholesale price column has been removed*/
            component.openSearchDialog();
            flush();
            expect(component.excludedProductSearchColumns).toEqual(['store', 'vendor']);

            /*  No other columns has been removed other than wholesale price on second call */
            component.openSearchDialog();
            flush();
            expect(component.excludedProductSearchColumns).toEqual(['store', 'vendor']);
        }));

        describe('product search button', () => {
            const searchDialogButton = () => {
                return fixture.debugElement.query(By.css('#product-search')).nativeElement;
            };

            it('should open the product search dialog', () => {
                jest.spyOn(component, 'openSearchDialog');
                jest.spyOn(component.searchDialog, 'open');

                searchDialogButton().click();
                fixture.detectChanges();

                expect(component.openSearchDialog).toHaveBeenCalled();
                expect(component.searchDialog.open).toHaveBeenCalled();
            });

            it('should be disabled if addDisabled is true', () => {
                component.addDisabled = true;
                fixture.detectChanges();

                expect(searchDialogButton().disabled).toEqual(true);
            });
        });
    });

    describe('entering a product code', () => {
        const productCode = 'p1';
        const goButton = () => {
            return fixture.debugElement.query(By.css('#product-go')).nativeElement;
        };

        describe('keydown event', () => {
            it('should trigger the addRequestedProduct on enter', () => {
                jest.spyOn(component, 'addRequestedProduct');
                component.productCodeControl.setValue(productCode);
                fixture.detectChanges();
                const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
                const productAddInput = fixture.debugElement.query(By.css('#product-code-input')).nativeElement;
                productAddInput.dispatchEvent(enterEvent);
                fixture.detectChanges();

                expect(component.addRequestedProduct).toHaveBeenCalled();
            });
            describe.each`
                addDisabled
                ${'true'}
                ${'false'}
            `('with addDisabled', ({ addDisabled }) => {
                it(`should ${addDisabled ? 'not emit' : 'emit'} the entered product code in all caps`, () => {
                    component.addDisabled = addDisabled;
                    jest.spyOn(component.products, 'emit');
                    // update the entered product code
                    component.productCodeControl.setValue(productCode);
                    fixture.detectChanges();
                    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
                    const productAddInput = fixture.debugElement.query(By.css('#product-code-input')).nativeElement;
                    productAddInput.dispatchEvent(enterEvent);
                    fixture.detectChanges();

                    if (addDisabled) {
                        expect(component.products.emit).not.toHaveBeenCalled();
                    } else {
                        expect(component.products.emit).toHaveBeenCalledWith([{ code: productCode.toUpperCase() }]);
                    }
                });
            });
        });
        describe('go button', () => {
            it('should trigger the addRequestedProduct', () => {
                jest.spyOn(component, 'addRequestedProduct');
                component.productCodeControl.setValue(productCode);
                // update the entered product code so the go button is enabled
                fixture.detectChanges();

                goButton().click();
                fixture.detectChanges();

                expect(component.addRequestedProduct).toHaveBeenCalled();
            });

            it('should emit the entered product code in all caps', () => {
                jest.spyOn(component.products, 'emit');
                component.productCodeControl.setValue(productCode);
                // update the entered product code so the go button is enabled
                fixture.detectChanges();

                goButton().click();
                fixture.detectChanges();

                expect(component.products.emit).toHaveBeenCalledWith([{ code: productCode.toUpperCase() }]);
            });

            it('input field should be cleared after searching for valid product', () => {
                component.productCodeControl.setValue(productCode);

                fixture.detectChanges();

                goButton().click();
                fixture.detectChanges();

                expect(component.productCodeControl.value).toEqual('');
            });

            it('should be disabled if addDisabled is true', () => {
                component.addDisabled = true;
                fixture.detectChanges();

                expect(goButton().disabled).toEqual(true);
                expect(fixture.debugElement.query(By.css('#product-code-input')).nativeElement.disabled).toEqual(true);
            });

            it('should be disabled if no product code has been entered', () => {
                expect(goButton().disabled).toEqual(true);
            });
        });

        describe.each`
            value
            ${'p1'}
            ${'  p1   '}
            ${'  p1'}
            ${'p1   '}
        `('with value=$value', ({ value }) => {
            it('should display errors for a product that already exist', () => {
                jest.spyOn(component.products, 'emit');
                component.productCodeControl.setValue(value);
                // product that already exists
                component.existingProductCodes = ['P1'];
                fixture.detectChanges();

                goButton().click();
                fixture.detectChanges();

                const error = fixture.debugElement.query(By.css('#product-error'));

                expect(component.products.emit).not.toHaveBeenCalled();
                expect(error.nativeElement.textContent).toEqual('Product already added');
            });
        });
    });
});
