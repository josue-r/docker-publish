import { TestBed } from '@angular/core/testing';
import { UiMessageModule } from './ui-message.module';

describe('UiMessageModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiMessageModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiMessageModule).toBeDefined();
    });
});
