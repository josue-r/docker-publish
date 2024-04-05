import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
    FeatureSharedProductCategorySelectionMockModule,
    ProductCategorySelectionComponent,
} from '@vioc-angular/central-ui/product/feature-shared-product-category-selection';
import { RoleFacade } from '@vioc-angular/security/data-access-security';
import { DialogComponent, UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { EMPTY, of } from 'rxjs';
import { ProductCategoryAddInputComponent } from './product-category-add-input.component';

describe('ProductCategoryAddInputComponent', () => {
    let component: ProductCategoryAddInputComponent;
    let fixture: ComponentFixture<ProductCategoryAddInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProductCategoryAddInputComponent],
            imports: [
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                NoopAnimationsModule,
                ReactiveFormsModule,
                UiDialogMockModule,
                FeatureSharedProductCategorySelectionMockModule,
            ],
            providers: [{ provide: RoleFacade, useValue: { hasAnyRole: jest.fn(() => of()) } }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductCategoryAddInputComponent);
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
            component.searchDialog.dialogRef = {
                afterClosed: () => {
                    return EMPTY;
                },
            } as any as MatDialogRef<any>;
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
            const products = [
                { id: 1, code: 'P1' },
                { id: 2, code: 'P2' },
            ];
            const expectedProducts = [
                { id: 1, code: 'P1' },
                { id: 2, code: 'P2' },
            ];
            let productSelection: DebugElement;
            let productCategorySelectionComponent: ProductCategorySelectionComponent;

            beforeEach(() => {
                productSelection = dialog.query(By.css('#product-selection'));
                productCategorySelectionComponent = productSelection.componentInstance;
            });

            it('should have the searchFn passed', () => {
                expect(productCategorySelectionComponent.searchFn).toEqual(component.searchFn);
            });

            it('should display errors for products that already exist', () => {
                jest.spyOn(component.categories, 'emit');
                productCategorySelectionComponent.control.setValue(products);
                // product that already exists
                component.existingProductCategoryCodes = ['P1'];
                // update the selected values so the add button is enabled
                fixture.detectChanges();

                addProductsButton().click();
                fixture.detectChanges();

                const error = fixture.debugElement.query(By.css('#product-error'));

                expect(component.categories.emit).toHaveBeenCalledWith([{ id: 2, code: 'P2' }]);
                expect(error.nativeElement.textContent).toEqual('Category code(s) P1 already added');
            });

            describe('action buttons', () => {
                it('should trigger the addProducts', () => {
                    jest.spyOn(component, 'addProductCategories');
                    productCategorySelectionComponent.control.setValue(products);
                    // update the selected values so the add button is enabled
                    fixture.detectChanges();

                    addProductsButton().click();
                    fixture.detectChanges();

                    expect(component.addProductCategories).toHaveBeenCalled();
                });

                it('should update the selected product values when they are selected', () => {
                    jest.spyOn(component.categories, 'emit');
                    productCategorySelectionComponent.control.setValue(products);
                    // update the selected values so the add button is enabled
                    fixture.detectChanges();

                    addProductsButton().click();
                    fixture.detectChanges();

                    expect(component.categories.emit).toHaveBeenCalledWith(expectedProducts);
                });

                it('should close the dialog after clicking the add button', () => {
                    jest.spyOn(component, 'closeSearchDialog');
                    productCategorySelectionComponent.control.setValue(products);
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
});
