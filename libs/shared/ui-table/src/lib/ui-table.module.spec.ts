import { TestBed } from '@angular/core/testing';
import { UiTableModule } from './ui-table.module';

describe('UiTableModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiTableModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiTableModule).toBeDefined();
    });
});
