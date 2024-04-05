import { TestBed } from '@angular/core/testing';
import { FeatureInventoryOrderModule } from './feature-inventory-order.module';

describe('FeatureInventoryOrderModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureInventoryOrderModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureInventoryOrderModule).toBeDefined();
    });
});
