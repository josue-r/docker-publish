import { TestBed } from '@angular/core/testing';
import { FeatureInventoryTransferModule } from './feature-inventory-transfer.module';

describe('FeatureInventoryTransferModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FeatureInventoryTransferModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(FeatureInventoryTransferModule).toBeDefined();
    });
});
