import { TestBed } from '@angular/core/testing';
import { FeatureSharedStoreProductSelectionModule } from './feature-shared-store-product-selection.module';

describe('FeatureSharedStoreProductSelectionModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSharedStoreProductSelectionModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureSharedStoreProductSelectionModule).toBeDefined();
    });
});
