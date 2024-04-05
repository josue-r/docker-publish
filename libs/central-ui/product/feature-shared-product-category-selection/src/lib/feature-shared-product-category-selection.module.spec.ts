import { TestBed } from '@angular/core/testing';
import { FeatureSharedProductCategorySelectionModule } from './feature-shared-product-category-selection.module';

describe('FeatureSharedProductSelectionModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSharedProductCategorySelectionModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureSharedProductCategorySelectionModule).toBeDefined();
    });
});
