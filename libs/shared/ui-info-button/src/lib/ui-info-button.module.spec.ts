import { TestBed } from '@angular/core/testing';
import { UiInfoButtonModule } from './ui-info-button.module';

describe('UiInfoButtonModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiInfoButtonModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiInfoButtonModule).toBeDefined();
    });
});
