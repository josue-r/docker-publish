import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FeatureSearchMockModule } from '@vioc-angular/shared/feature-search';
import { DialogComponent, UiDialogMockModule } from '@vioc-angular/shared/ui-dialog';
import { ColumnConfig } from '@vioc-angular/shared/util-column';
import { EMPTY } from 'rxjs';
import { NonInventoryOrderItemSelectionComponent } from '../non-inventory-order-item-selection/non-inventory-order-item-selection.component';
import { NonInventoryItemAddInputComponent } from './non-inventory-item-add-input.component';

describe('NonInventoryItemAddInputComponent', () => {
    let component: NonInventoryItemAddInputComponent;
    let fixture: ComponentFixture<NonInventoryItemAddInputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NonInventoryItemAddInputComponent, NonInventoryOrderItemSelectionComponent],
            imports: [
                MatFormFieldModule,
                MatIconModule,
                MatInputModule,
                NoopAnimationsModule,
                ReactiveFormsModule,
                UiDialogMockModule,
                FeatureSearchMockModule,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NonInventoryItemAddInputComponent);
        component = fixture.componentInstance;
        component.searchFn = jest.fn();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('item search dialog', () => {
        let dialog: DebugElement;
        let dialogComponent: DialogComponent;
        const addItemsButton = () => {
            return dialog.query(By.css('#add-items-button')).nativeElement;
        };
        beforeEach(() => {
            component.searchDialog.dialogRef = ({
                afterClosed: () => {
                    return EMPTY;
                },
            } as any) as MatDialogRef<any>;
            dialog = fixture.debugElement.query(By.css('#search-add-item'));
            dialogComponent = dialog.componentInstance;
        });

        it('should have content passed to the item search dialog', () => {
            expect(dialogComponent.content).not.toBeNull();
            expect(dialog.query(By.css('#item-selection'))).not.toBeNull();
        });

        it('should have actions passed to the item search dialog', () => {
            expect(dialogComponent.actions).not.toBeNull();
            expect(dialog.query(By.css('#cancel-search-button'))).not.toBeNull();
            expect(dialog.query(By.css('#add-items-button'))).not.toBeNull();
        });

        describe('item selection', () => {
            const items = [
                { id: 1, number: 'P1' },
                { id: 2, number: 'P2' },
            ];
            let itemSelection: DebugElement;
            let itemSelectionComponent: NonInventoryOrderItemSelectionComponent;

            beforeEach(() => {
                itemSelection = dialog.query(By.css('#item-selection'));
                itemSelectionComponent = itemSelection.componentInstance;
            });

            it('should have the searchFn passed', () => {
                expect(itemSelectionComponent.searchFn).toEqual(component.searchFn);
            });

            it('should exclude the store and vendor columns from the search', () => {
                component.excludedItemSearchColumns.forEach((c) => {
                    expect((itemSelectionComponent.usableColumns[c] as ColumnConfig).searchable).toEqual(false);
                    expect((itemSelectionComponent.usableColumns[c] as ColumnConfig).displayable).toEqual(false);
                });
            });

            it('should display errors for items that already exist', () => {
                jest.spyOn(component.items, 'emit');
                itemSelectionComponent.control.setValue(items);
                // item that already exists
                component.existingItemNumbers = ['P1'];
                // update the selected values so the add button is enabled
                fixture.detectChanges();

                addItemsButton().click();
                fixture.detectChanges();

                const error = fixture.debugElement.query(By.css('#item-error'));

                expect(component.items.emit).toHaveBeenCalledWith([{ id: 2, number: 'P2' }]);
                expect(error.nativeElement.textContent).toEqual('Item(s) P1 already added');
            });

            describe('action buttons', () => {
                it('should trigger the addItems', () => {
                    jest.spyOn(component, 'addItems');
                    itemSelectionComponent.control.setValue(items);
                    // update the selected values so the add button is enabled
                    fixture.detectChanges();

                    addItemsButton().click();
                    fixture.detectChanges();

                    expect(component.addItems).toHaveBeenCalled();
                });

                it('should update the selected item values when they are selected', () => {
                    jest.spyOn(component.items, 'emit');
                    itemSelectionComponent.control.setValue(items);
                    // update the selected values so the add button is enabled
                    fixture.detectChanges();

                    addItemsButton().click();
                    fixture.detectChanges();

                    expect(component.items.emit).toHaveBeenCalledWith(items.map((p) => p));
                });

                it('should close the dialog after clicking the add button', () => {
                    jest.spyOn(component, 'closeSearchDialog');
                    itemSelectionComponent.control.setValue(items);
                    // update the selected values so the add button is enabled
                    fixture.detectChanges();

                    addItemsButton().click();
                    fixture.detectChanges();

                    expect(component.closeSearchDialog).toHaveBeenCalled();
                });

                it('should disable the add button if no items are selected', () => {
                    expect(addItemsButton().disabled).toEqual(true);
                });

                it('should close the search dialog after clicking cancel', () => {
                    jest.spyOn(component, 'closeSearchDialog');

                    dialog.query(By.css('#cancel-search-button')).nativeElement.click();
                    fixture.detectChanges();

                    expect(component.closeSearchDialog).toHaveBeenCalled();
                });
            });
        });

        describe('item search button', () => {
            const searchDialogButton = () => {
                return fixture.debugElement.query(By.css('#item-search')).nativeElement;
            };

            it('should open the item search dialog', () => {
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

    describe('entering a item code', () => {
        const itemNumber = 'p1';
        const goButton = () => {
            return fixture.debugElement.query(By.css('#item-go')).nativeElement;
        };

        describe('keydown event', () => {
            it('should trigger the addRequestedItem on enter', () => {
                jest.spyOn(component, 'addRequestedItem');
                component.itemNumberControl.setValue(itemNumber);
                // update the entered item number
                fixture.detectChanges();

                const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
                const productAddInput = fixture.debugElement.query(By.css('#item-number-input')).nativeElement;
                productAddInput.dispatchEvent(enterEvent);
                fixture.detectChanges();

                expect(component.addRequestedItem).toHaveBeenCalled();
            });

            describe.each`
                addDisabled
                ${'true'}
                ${'false'}
            `('with addDisabled', ({ addDisabled }) => {
                it(`should ${addDisabled ? 'not emit' : 'emit'} the entered item code in all caps`, () => {
                    component.addDisabled = addDisabled;
                    jest.spyOn(component.items, 'emit');
                    // update the entered item code
                    component.itemNumberControl.setValue(itemNumber);
                    fixture.detectChanges();
                    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
                    const itemAddInput = fixture.debugElement.query(By.css('#item-number-input')).nativeElement;
                    itemAddInput.dispatchEvent(enterEvent);
                    fixture.detectChanges();

                    if (addDisabled) {
                        expect(component.items.emit).not.toHaveBeenCalled();
                    } else {
                        expect(component.items.emit).toHaveBeenCalledWith([{ number: itemNumber.toUpperCase() }]);
                    }
                });
            });
        });

        describe('go button', () => {
            it('should trigger the addRequestedItem', () => {
                jest.spyOn(component, 'addRequestedItem');
                component.itemNumberControl.setValue(itemNumber);
                // update the entered item number so the go button is enabled
                fixture.detectChanges();

                goButton().click();
                fixture.detectChanges();

                expect(component.addRequestedItem).toHaveBeenCalled();
            });

            it('should emit the entered item number in all caps', () => {
                jest.spyOn(component.items, 'emit');
                component.itemNumberControl.setValue(itemNumber);
                // update the entered item number so the go button is enabled
                fixture.detectChanges();

                goButton().click();
                fixture.detectChanges();

                expect(component.items.emit).toHaveBeenCalledWith([{ number: itemNumber.toUpperCase() }]);
            });

            it('input field should be cleared after searching for valid item', () => {
                component.itemNumberControl.setValue(itemNumber);

                fixture.detectChanges();

                goButton().click();
                fixture.detectChanges();

                expect(component.itemNumberControl.value).toEqual('');
            });

            it('should be disabled if addDisabled is true', () => {
                component.addDisabled = true;
                fixture.detectChanges();

                expect(goButton().disabled).toEqual(true);
                expect(fixture.debugElement.query(By.css('#item-number-input')).nativeElement.disabled).toEqual(true);
            });

            it('should be disabled if no item number has been entered', () => {
                expect(goButton().disabled).toEqual(true);
            });
        });

        describe.each`
            itemNumber
            ${'p1'}
            ${'  p1   '}
            ${'  p1'}
            ${'p1   '}
        `('with value=$value', ({ value }) => {
            it('should display errors for a item that already exist', () => {
                jest.spyOn(component.items, 'emit');
                component.itemNumberControl.setValue(itemNumber);
                // item that already exists
                component.existingItemNumbers = ['P1'];
                // update the entered item number so the go button is enabled
                fixture.detectChanges();

                goButton().click();
                fixture.detectChanges();

                const error = fixture.debugElement.query(By.css('#item-error'));

                expect(component.items.emit).not.toHaveBeenCalled();
                expect(error.nativeElement.textContent).toEqual('Item already added');
            });
        });
    });
});
