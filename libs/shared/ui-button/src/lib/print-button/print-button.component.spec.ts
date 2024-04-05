import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PrintButtonComponent } from './print-button.component';

describe('PrintButtonComponent', () => {
    let component: PrintButtonComponent;
    let fixture: ComponentFixture<PrintButtonComponent>;
    let loader: HarnessLoader;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatButtonModule, MatIconModule, NoopAnimationsModule],
            declarations: [PrintButtonComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PrintButtonComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('click', async () => {
        window.print = jest.fn();
        const printBtn = await loader.getHarness(MatButtonHarness.with({ selector: '.print-button' }));
        await printBtn.click();
        expect(window.print).toHaveBeenCalled();
    });
});
