import { TestBed } from '@angular/core/testing';
import { FeaturePhysicalInventoryModule } from './feature-physical-inventory.module';

describe('FeaturePhysicalInventoryModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeaturePhysicalInventoryModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeaturePhysicalInventoryModule).toBeDefined();
    });
});
