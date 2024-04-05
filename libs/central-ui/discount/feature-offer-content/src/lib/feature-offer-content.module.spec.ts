import { TestBed } from '@angular/core/testing';
import { FeatureOfferContentModule } from './feature-offer-content.module';

describe('FeatureOfferContentModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureOfferContentModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureOfferContentModule).toBeDefined();
    });
});
