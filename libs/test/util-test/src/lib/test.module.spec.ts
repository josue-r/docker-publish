import { TestBed } from '@angular/core/testing';
import { TestModule } from './test.module';

describe('TestModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TestModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(TestModule).toBeDefined();
    });

    it('should have the extended functions ', () => {
        expect(expect(undefined).toBeInputThatIsPresent).toBeTruthy();
        expect(expect(undefined).toBeInputThatIsEnabled).toBeTruthy();
        expect(expect(undefined).toBeInputThatHasValue).toBeTruthy();
        expect(expect(undefined).toBeInputThatHasWarning).toBeTruthy();
    });
});
