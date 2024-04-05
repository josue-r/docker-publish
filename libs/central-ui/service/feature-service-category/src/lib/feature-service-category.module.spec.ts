import { TestBed } from '@angular/core/testing';
import { FeatureServiceCategoryModule } from './feature-service-category.module';

describe('FeatureServiceCategoryModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureServiceCategoryModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureServiceCategoryModule).toBeDefined();
    });
});
