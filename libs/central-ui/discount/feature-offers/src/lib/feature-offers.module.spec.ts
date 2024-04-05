import { TestBed } from '@angular/core/testing';
import { FeatureOfferModule } from './feature-offers.module';

describe('FeatureOfferModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureOfferModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureOfferModule).toBeDefined();
    });
});
