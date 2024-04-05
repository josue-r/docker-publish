import { TestBed } from '@angular/core/testing';
import { FeatureProductCatalogModule } from './feature-product-catalog.module';

describe('FeatureProductCatalogModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureProductCatalogModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureProductCatalogModule).toBeDefined();
    });
});
