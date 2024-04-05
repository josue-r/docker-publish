import { TestBed } from '@angular/core/testing';
import { CommonFunctionalityModule } from './common-functionality.module';

describe('CommonFunctionalityModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CommonFunctionalityModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(CommonFunctionalityModule).toBeDefined();
    });
});
