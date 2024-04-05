import { TestBed } from '@angular/core/testing';
import { FeatureSharedCommonTechnicalModule } from './feature-shared-common-technical.module';

describe('FeatureSharedCommonTechnicalModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureSharedCommonTechnicalModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureSharedCommonTechnicalModule).toBeDefined();
    });
});
