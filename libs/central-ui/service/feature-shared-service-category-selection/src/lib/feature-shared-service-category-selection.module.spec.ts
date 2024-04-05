import { TestBed } from '@angular/core/testing';
import { FeatureSharedServiceCategorySelectionModule } from './feature-shared-service-category-selection.module';

describe('FeatureSharedServiceSelectionModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSharedServiceCategorySelectionModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureSharedServiceCategorySelectionModule).toBeDefined();
    });
});
