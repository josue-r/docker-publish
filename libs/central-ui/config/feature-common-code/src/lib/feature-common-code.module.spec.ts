import { TestBed } from '@angular/core/testing';
import { FeatureCommonCodeModule } from './feature-common-code.module';

describe('FeatureCommonCodeModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureCommonCodeModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureCommonCodeModule).toBeDefined();
    });
});
