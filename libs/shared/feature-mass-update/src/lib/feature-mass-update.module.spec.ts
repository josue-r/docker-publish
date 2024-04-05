import { TestBed } from '@angular/core/testing';
import { FeatureMassUpdate } from './feature-mass-update.module';

describe('FeatureMassUpdate', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureMassUpdate],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureMassUpdate).toBeDefined();
    });
});
