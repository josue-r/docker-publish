import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Described } from '@vioc-angular/shared/common-functionality';
import { MockFilteredInputComponent, UiFilteredInputMockModule } from '@vioc-angular/shared/ui-filtered-input';
import { InventoryTransferStoreSelectionComponent } from './inventory-transfer-store-selection.component';

describe('InventoryTransferStoreSelectionComponent', () => {
    let component: InventoryTransferStoreSelectionComponent;
    let fixture: ComponentFixture<InventoryTransferStoreSelectionComponent>;

    const store1 = { ...new Described(), code: 'STORE1' };
    const store2 = { ...new Described(), code: 'STORE2' };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InventoryTransferStoreSelectionComponent],
            imports: [ReactiveFormsModule, UiFilteredInputMockModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InventoryTransferStoreSelectionComponent);
        component = fixture.componentInstance;
        component.fromStore = new FormControl(null);
        component.toStore = new FormControl(null);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('fromStore', () => {
        let fromStoreFilterInput: MockFilteredInputComponent;

        beforeEach(() => {
            component.fromStores = [store1, store2];
            fixture.detectChanges();
            fromStoreFilterInput = fixture.debugElement.queryAll(By.directive(MockFilteredInputComponent))[0]
                .componentInstance;
        });

        it('should reset the toStore when the value changes', fakeAsync(() => {
            jest.spyOn(component.toStore, 'setValue');
            fromStoreFilterInput.valueControl.setValue(store1);
            tick(200);
            expect(component.toStore.setValue).toHaveBeenCalledWith(null, { emitEvent: false });
        }));
    });

    describe('toStore', () => {
        let toStoreFilterInput: MockFilteredInputComponent;

        beforeEach(() => {
            component.fromStores = [store1, store2];
            component.toStores = [store1, store2];
            toStoreFilterInput = fixture.debugElement.queryAll(By.directive(MockFilteredInputComponent))[1]
                .componentInstance;
        });

        it('should be disabled if no fromStore is selected', () => {
            expect(toStoreFilterInput.editable).toBeFalsy();

            component.fromStore.setValue(store1);
            fixture.detectChanges();
            expect(toStoreFilterInput.editable).toBeTruthy();
        });
        it('should not be able to select the fromStore from the list', () => {
            component.fromStore.setValue(store1);
            fixture.detectChanges();
            expect(toStoreFilterInput.options).toEqual([store2]);
        });
    });

    describe('filterInput mapping', () => {
        let filterInputs: MockFilteredInputComponent[];

        beforeEach(() => {
            component.fromStores = [store1, store2];
            component.toStores = [store1, store2];
            fixture.detectChanges();
            filterInputs = fixture.debugElement
                .queryAll(By.directive(MockFilteredInputComponent))
                .map((e) => e.componentInstance);
        });

        it.each`
            input | placeHolder
            ${0}  | ${'From Store'}
            ${1}  | ${'To Store'}
        `('should display $placeHolder as the placeHolder', ({ input, placeHolder }) => {
            expect(filterInputs[input].placeHolder).toEqual(placeHolder);
        });
        it.each`
            input | list
            ${0}  | ${'fromStores'}
            ${1}  | ${'toStores'}
        `('should pass a list of available stores', ({ input, list }) => {
            expect(filterInputs[input].options).toEqual(component[list]);
        });
    });
});
