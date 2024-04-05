import { TestBed } from '@angular/core/testing';
import { FeatureStoreServiceModule } from './feature-store-service.module';

describe('FeatureStoreServiceModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureStoreServiceModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureStoreServiceModule).toBeDefined();
    });
});
