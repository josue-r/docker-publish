import { TestBed } from '@angular/core/testing';
import { UtilFormModule } from './util-form.module';

describe('UtilFormModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UtilFormModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UtilFormModule).toBeDefined();
    });
});
