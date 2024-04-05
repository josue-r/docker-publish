import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { FeatureSearchMockModule } from '@vioc-angular/shared/feature-search';
import { ProductCategorySelectionComponent } from './product-category-selection.component';

describe('ProductSelectionComponent', () => {
    let component: ProductCategorySelectionComponent;
    let fixture: ComponentFixture<ProductCategorySelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSearchMockModule],
            declarations: [ProductCategorySelectionComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ProductCategorySelectionComponent);
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

    it('should default singleSelection to false', () => {
        expect(component.singleSelection).toBeFalsy();
    });

    it('should allow singleSelection to be set to true', () => {
        component.singleSelection = true;
        expect(component.singleSelection).toBeTruthy();
    });
});
