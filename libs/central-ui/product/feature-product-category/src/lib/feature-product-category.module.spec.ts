import { TestBed } from '@angular/core/testing';
import { FeatureProductCategoryModule } from './feature-product-category.module';

describe('FeatureProductCategoryModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureProductCategoryModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureProductCategoryModule).toBeDefined();
    });
});
