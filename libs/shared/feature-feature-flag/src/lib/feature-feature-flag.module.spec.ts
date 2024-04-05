import { TestBed } from '@angular/core/testing';
import { FeatureFeatureFlagModule } from './feature-feature-flag.module';

describe('FeatureFeatureFlagModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureFeatureFlagModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureFeatureFlagModule).toBeDefined();
    });
});
