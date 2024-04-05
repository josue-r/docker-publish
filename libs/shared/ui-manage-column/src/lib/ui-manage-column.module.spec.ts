import { TestBed } from '@angular/core/testing';
import { UiManageColumnModule } from './ui-manage-column.module';

describe('UiManageColumnModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiManageColumnModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiManageColumnModule).toBeDefined();
    });
});
