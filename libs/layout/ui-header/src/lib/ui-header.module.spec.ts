import { TestBed } from '@angular/core/testing';
import { UiHeaderModule } from './ui-header.module';

describe('UiHeaderModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiHeaderModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiHeaderModule).toBeDefined();
    });
});
