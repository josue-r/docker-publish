import { TestBed } from '@angular/core/testing';
import { UtilDataModifyingModule } from './util-data-modifying.module';

describe('UtilDataModifyingModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UtilDataModifyingModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UtilDataModifyingModule).toBeDefined();
    });
});
