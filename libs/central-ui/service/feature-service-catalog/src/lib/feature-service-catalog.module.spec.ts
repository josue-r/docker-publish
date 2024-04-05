import { TestBed } from '@angular/core/testing';
import { FeatureServiceCatalogModule } from './feature-service-catalog.module';

describe('FeatureServiceCatalogModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureServiceCatalogModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureServiceCatalogModule).toBeDefined();
    });
});
