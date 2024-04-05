import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { FeatureSearchMockModule } from '@vioc-angular/shared/feature-search';
import { ColumnConfig } from '@vioc-angular/shared/util-column';
import { NonInventoryOrderItemSelectionComponent } from './non-inventory-order-item-selection.component';

describe('NonInventoryItemSelectionComponent', () => {
    let component: NonInventoryOrderItemSelectionComponent;
    let fixture: ComponentFixture<NonInventoryOrderItemSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSearchMockModule],
            declarations: [NonInventoryOrderItemSelectionComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(NonInventoryOrderItemSelectionComponent);
        component = fixture.componentInstance;
        component.control = new FormControl([]);
        component.searchFn = jest.fn();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should pass down the product columns', () => {
        expect(component.columns).toEqual(component.searchComponent.columns);
    });

    it('should pass down the default sort', () => {
        expect(component.sort).toEqual(component.searchComponent.sort);
    });

    it('should be a selectable search', () => {
        expect(component.searchComponent.selectable).toBeTruthy();
    });

    it('should not have previous search logic enabled', () => {
        expect(component.searchComponent.previousSearchEnabled).toBeFalsy();
    });

    it('should filter columns from the table if they are excluded', () => {
        const companyColumn = component.searchComponent.columns['company'] as ColumnConfig;
        expect(companyColumn.searchable).toEqual({ defaultSearch: true });
        expect(companyColumn.displayable).not.toBeDefined();
        component.excludedColumns = ['company'];
        fixture.detectChanges();
        expect(companyColumn.searchable).toEqual(false);
        expect(companyColumn.displayable).toEqual(false);
    });
});
