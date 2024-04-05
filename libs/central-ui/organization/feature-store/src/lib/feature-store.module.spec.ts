import { TestBed } from '@angular/core/testing';
import { FeatureStoreModule } from './feature-store.module';

describe('FeatureStoreModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureStoreModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureStoreModule).toBeDefined();
    });
});
