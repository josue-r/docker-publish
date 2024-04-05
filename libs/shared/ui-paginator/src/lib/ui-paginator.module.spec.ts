import { TestBed } from '@angular/core/testing';
import { UiPaginatorModule } from './ui-paginator.module';

describe('UiPaginatorModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiPaginatorModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiPaginatorModule).toBeDefined();
    });
});
