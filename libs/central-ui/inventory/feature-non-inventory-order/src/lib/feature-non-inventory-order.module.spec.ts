import { TestBed } from '@angular/core/testing';
import { FeatureNonInventoryOrderModule } from './feature-non-inventory-order.module';

describe('FeatureNonInventoryOrderModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureNonInventoryOrderModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureNonInventoryOrderModule).toBeDefined();
    });
});
