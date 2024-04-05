import { TestBed } from '@angular/core/testing';
import { UiDropListModule } from './ui-drop-list.module';

describe('UiDropListModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiDropListModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiDropListModule).toBeDefined();
    });
});
