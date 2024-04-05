import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { FeatureSearchMockModule } from '@vioc-angular/shared/feature-search';
import { ServiceCategorySelectionComponent } from './service-category-selection.component';

describe('ServiceCategorySelectionComponent', () => {
    let component: ServiceCategorySelectionComponent;
    let fixture: ComponentFixture<ServiceCategorySelectionComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSearchMockModule],
            declarations: [ServiceCategorySelectionComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ServiceCategorySelectionComponent);
        component = fixture.componentInstance;
        component.control = new FormControl([]);
        component.searchFn = jest.fn();
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should pass down the service columns', () => {
        expect(component.columns).toEqual(component.searchComponent.columns);
    });

    it('should pass down the default sort', () => {
        expect(component.sort).toEqual(component.searchComponent.sort);
    });

    it('should pass down the default page', () => {
        expect(component.page).toEqual(component.searchComponent.page);
    });

    it('should be a selectable search', () => {
        expect(component.searchComponent.selectable).toBeTruthy();
    });

    it('should pass down the multiple property', () => {
        expect(component.searchComponent.multiple).toBeTruthy();
    });

    it('should not have previous search logic enabled', () => {
        expect(component.searchComponent.previousSearchEnabled).toBeFalsy();
    });
});
