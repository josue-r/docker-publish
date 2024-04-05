import { TestBed } from '@angular/core/testing';
import { FeatureStoreProductModule } from './feature-store-product.module';

describe('FeatureStoreProductModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureStoreProductModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureStoreProductModule).toBeDefined();
    });
});
