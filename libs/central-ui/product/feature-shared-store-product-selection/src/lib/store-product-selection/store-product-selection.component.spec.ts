import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { FeatureSearchMockModule } from '@vioc-angular/shared/feature-search';
import { ColumnConfig } from '@vioc-angular/shared/util-column';
import { StoreProductSelectionComponent } from './store-product-selection.component';

describe('StoreProductSelectionComponent', () => {
    let component: StoreProductSelectionComponent;
    let fixture: ComponentFixture<StoreProductSelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSearchMockModule],
            declarations: [StoreProductSelectionComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(StoreProductSelectionComponent);
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
        const storeColumn = component.searchComponent.columns['store'] as ColumnConfig;
        const vendorColumn = component.searchComponent.columns['vendor'] as ColumnConfig;
        expect(storeColumn.searchable).toEqual({ defaultSearch: true });
        expect(storeColumn.displayable).not.toBeDefined();
        expect(vendorColumn.searchable).toEqual({ defaultSearch: true });
        expect(vendorColumn.displayable).not.toBeDefined();

        component.excludedColumns = ['store', 'vendor'];
        fixture.detectChanges();

        expect(storeColumn.searchable).toEqual(false);
        expect(storeColumn.displayable).toEqual(false);
        expect(vendorColumn.searchable).toEqual(false);
        expect(vendorColumn.displayable).toEqual(false);
    });
});
