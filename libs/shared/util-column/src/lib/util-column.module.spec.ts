import { TestBed } from '@angular/core/testing';
import { UtilColumnModule } from './util-column.module';

describe('UtilColumnModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UtilColumnModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UtilColumnModule).toBeDefined();
    });
});
