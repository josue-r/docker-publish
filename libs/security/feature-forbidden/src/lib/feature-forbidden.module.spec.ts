import { TestBed } from '@angular/core/testing';
import { FeatureForbiddenModule } from './feature-forbidden.module';

describe('FeatureForbiddenModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureForbiddenModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureForbiddenModule).toBeDefined();
    });
});
