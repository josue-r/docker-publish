import { TestBed } from '@angular/core/testing';
import { UiGridModule } from './ui-grid.module';

describe('UiGridModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiGridModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiGridModule).toBeDefined();
    });
});
