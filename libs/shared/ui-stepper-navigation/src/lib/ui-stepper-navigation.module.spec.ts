import { TestBed } from '@angular/core/testing';
import { UiStepperNavigationModule } from './ui-stepper-navigation.module';

describe('UiStepperNavigationModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiStepperNavigationModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiStepperNavigationModule).toBeDefined();
    });
});
