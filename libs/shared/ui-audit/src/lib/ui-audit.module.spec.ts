import { TestBed } from '@angular/core/testing';
import { UiAuditModule } from './ui-audit.module';

describe('UiAuditModule', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [UiAuditModule],
        }).compileComponents();
    });

    it('should create', () => {
        expect(UiAuditModule).toBeDefined();
    });
});
