import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { describeInput, expectInput, findFormControlInput, inputExtensions } from './input-extension';

class TestModel {
    constructor(
        private booleanField: boolean,
        private yesNo: 'Y' | 'N' = 'N',
        private displayIfTrue: string = 'displayIfTrue',
        private enableIfTrue: string = 'enableIfTrue'
    ) {}
}

@Component({
    template: `
        <form [formGroup]="form" *ngIf="form">
            <mat-checkbox id="bf" formControlName="booleanField"></mat-checkbox>
            <mat-form-field *ngIf="form.get('booleanField').value">
                <input id="dit" matInput formControlName="displayIfTrue" />
                <mat-hint class="warning" id="dit-hint" *ngIf="isHintDisplayIfTrueDisplayed">
                    Only displayed if true
                </mat-hint>
            </mat-form-field>
            <mat-form-field>
                <input id="eit" matInput formControlName="enableIfTrue" />
            </mat-form-field>
            <mat-form-field class="flex-item">
                <mat-select matInput formControlName="yesNo">
                    <mat-option></mat-option>
                    <mat-option value="Y">Yes</mat-option>
                    <mat-option value="N">No</mat-option>
                </mat-select>
                <mat-hint class="warning" id="eit-hint" *ngIf="isHintYesNoDisplayed"> Must be Yes or No </mat-hint>
            </mat-form-field>
            <input id="nonFormBackedInput" value="foo" />
        </form>
    `,
})
class TestComponent {
    public form: FormGroup;
    public isHintDisplayIfTrueDisplayed = false;
    public isHintYesNoDisplayed = false;
    constructor(private formBuilder: FormBuilder) {}

    initForm(model: TestModel) {
        const tempForm = this.formBuilder.group(model);
        if (tempForm.get('booleanField').value) {
            tempForm.get('enableIfTrue').enable();
            tempForm.get('yesNo').enable();
        } else {
            tempForm.get('enableIfTrue').disable();
            tempForm.get('yesNo').disable();
        }
        this.form = tempForm;
    }
}

describe('input jest extensions', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                MatDatepickerModule,
                NoopAnimationsModule,
                ReactiveFormsModule,
                MatCheckboxModule,
                MatFormFieldModule,
                MatSelectModule,
                MatInputModule,
                MatButtonModule,
            ],
            declarations: [TestComponent],
            providers: [],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
    });

    it(
        'should create TestComponent',
        waitForAsync(() => {
            component.initForm(new TestModel(true));
            fixture.detectChanges();
            expect(component).toBeTruthy();
        })
    );

    describe.each`
        field                           | booleanField | expectExists
        ${'booleanField'}               | ${true}      | ${true}
        ${'booleanField'}               | ${false}     | ${true}
        ${'yesNo'}                      | ${true}      | ${true}
        ${'yesNo'}                      | ${false}     | ${true}
        ${'displayIfTrue'}              | ${true}      | ${true}
        ${'displayIfTrue'}              | ${false}     | ${false}
        ${'enableIfTrue'}               | ${true}      | ${true}
        ${'enableIfTrue'}               | ${false}     | ${true}
        ${'doesNotExist'}               | ${true}      | ${false}
        ${'doesNotExist'}               | ${false}     | ${false}
        ${{ id: 'nonFormBackedInput' }} | ${true}      | ${true}
        ${{ id: 'nonFormBackedInput' }} | ${false}     | ${true}
    `('inputIsPresent for field="$field"', ({ field, booleanField, expectExists }) => {
        it(`should ${expectExists ? 'exist' : 'not exist'} when booleanField=${booleanField}`, () => {
            component.initForm(new TestModel(booleanField));
            fixture.detectChanges();
            expect(findFormControlInput(fixture, field)).toBeInputThatIsPresent(expectExists);
            expect(findFormControlInput(fixture, field)).not.toBeInputThatIsPresent(!expectExists);
            expectInput(fixture, field).toBePresent(expectExists).not.toBePresent(!expectExists);
        });
    });

    describe('inputIsEnabled', () => {
        describe.each`
            field                           | booleanField | expectEnabled
            ${'booleanField'}               | ${true}      | ${true}
            ${'yesNo'}                      | ${true}      | ${true}
            ${'yesNo'}                      | ${false}     | ${false}
            ${'enableIfTrue'}               | ${true}      | ${true}
            ${'enableIfTrue'}               | ${false}     | ${false}
            ${{ id: 'nonFormBackedInput' }} | ${true}      | ${true}
        `('for field="$field"', ({ field, booleanField, expectEnabled }) => {
            it(`should ${expectEnabled ? 'be enabled' : 'not be enabled'} when booleanField=false`, () => {
                component.initForm(new TestModel(booleanField));
                fixture.detectChanges();
                expect(findFormControlInput(fixture, field)).toBeInputThatIsEnabled(expectEnabled);
                expect(findFormControlInput(fixture, field)).not.toBeInputThatIsEnabled(!expectEnabled);
                expectInput(fixture, field).toBeEnabled(expectEnabled).not.toBeEnabled(!expectEnabled);
            });
        });

        it('should always fail if field does not exist', () => {
            // I don't know how else to do this.  I'd like to expect that a test fails but doesn't seem possible
            inputExtensions['isNot'] = undefined;
            expect(inputExtensions.toBeInputThatIsEnabled(null, true).pass).toEqual(false);
            expect(inputExtensions.toBeInputThatIsEnabled(null, false).pass).toEqual(false);
            inputExtensions['isNot'] = true;
            expect(inputExtensions.toBeInputThatIsEnabled(null, true).pass).toEqual(true); // true flipped to false to trigger failure
            expect(inputExtensions.toBeInputThatIsEnabled(null, false).pass).toEqual(true); // true flipped to false to trigger failure
        });
    });

    describe('toBeInputThatHasValue', () => {
        describe('<mat-checkbox>', () => {
            let input: DebugElement;
            beforeEach(() => {
                component.initForm(new TestModel(false));
                fixture.detectChanges();
                input = findFormControlInput(fixture, 'booleanField');
                expect(input).toBeTruthy();
                expect(input.name).toBe('mat-checkbox');
            });
            it('should handle string', () => {
                expect(input).not.toBeInputThatHasValue('false'); // does not match since not boolean
                expectInput(fixture, 'booleanField') //
                    .not.toHaveValue('false');
            });
            it('should handle boolean', () => {
                expect(input).toBeInputThatHasValue(false);
                expect(input).not.toBeInputThatHasValue(true);
                expectInput(fixture, 'booleanField').toHaveValue(false).not.toHaveValue(true);
            });
            it('should handle RegExp', () => {
                expect(input).toBeInputThatHasValue(/false/); // supports regex check of boolean apparently
                expect(input).not.toBeInputThatHasValue(/true/);
                expectInput(fixture, 'booleanField').toHaveValue(/false/).not.toHaveValue(/true/);
            });
        });

        describe('<input>', () => {
            let input: DebugElement;
            beforeEach(() => {
                component.initForm(new TestModel(true, 'Y', 'Some Value'));
                fixture.detectChanges();
                input = findFormControlInput(fixture, 'displayIfTrue');
                expect(input).toBeTruthy();
                expect(input.name).toBe('input');
            });
            it('should handle string', () => {
                expect(input).toBeInputThatHasValue('Some Value');
                expect(input).not.toBeInputThatHasValue('SOME VALUE');
                expectInput(fixture, 'displayIfTrue').toHaveValue('Some Value').not.toHaveValue('SOME VALUE');
            });
            it('should handle boolean', () => {
                expect(input).not.toBeInputThatHasValue(false);
                expect(input).not.toBeInputThatHasValue(true);
                expectInput(fixture, 'displayIfTrue').not.toHaveValue(false).not.toHaveValue(true);
            });
            it('should handle RegExp', () => {
                expect(input).toBeInputThatHasValue(/Some Value/);
                expect(input).toBeInputThatHasValue(/^Some Value$/);
                expect(input).toBeInputThatHasValue(/.*/);
                expect(input).toBeInputThatHasValue(/.*Value/);
                expect(input).toBeInputThatHasValue(/Value/);
                expect(input).not.toBeInputThatHasValue(/^Value$/);

                expectInput(fixture, 'displayIfTrue')
                    .toHaveValue(/Some Value/)
                    .toHaveValue(/^Some Value$/)
                    .toHaveValue(/.*/)
                    .toHaveValue(/.*Value/)
                    .toHaveValue(/Value/)
                    .not.toHaveValue(/^Value$/);
            });
        });

        describe('<mat-select>', () => {
            let input: DebugElement;
            beforeEach(() => {
                component.initForm(new TestModel(true, 'Y'));
                fixture.detectChanges();
                input = findFormControlInput(fixture, 'yesNo');
                expect(input).toBeTruthy();
                expect(input.name).toBe('mat-select');
            });
            it('should handle string', () => {
                expect(input).toBeInputThatHasValue('Yes');
                expect(input).not.toBeInputThatHasValue('Y');

                expectInput(fixture, 'yesNo').toHaveValue('Yes').not.toHaveValue('Y');
            });
            it('should handle boolean', () => {
                expect(input).not.toBeInputThatHasValue(false);
                expect(input).not.toBeInputThatHasValue(true);

                expectInput(fixture, 'yesNo').not.toHaveValue(false).not.toHaveValue(true);
            });
            it('should handle RegExp', () => {
                expect(input).toBeInputThatHasValue(/Y/);
                expect(input).toBeInputThatHasValue(/Yes/);
                expect(input).toBeInputThatHasValue(/^Yes$/);
                expect(input).not.toBeInputThatHasValue(/N/);
                expect(input).not.toBeInputThatHasValue(/^Y$/);

                expectInput(fixture, 'yesNo')
                    .toHaveValue(/Y/)
                    .toHaveValue(/Yes/)
                    .toHaveValue(/^Yes$/)
                    .not.toHaveValue(/N/)
                    .not.toHaveValue(/^Y$/);
            });
        });

        it('should always fail if field does not exist', () => {
            // I don't know how else to do this.  I'd like to expect that a test fails but doesn't seem possible
            inputExtensions['isNot'] = undefined;
            expect(inputExtensions.toBeInputThatHasValue(null, true).pass).toEqual(false);
            expect(inputExtensions.toBeInputThatHasValue(null, false).pass).toEqual(false);
            inputExtensions['isNot'] = true;
            expect(inputExtensions.toBeInputThatHasValue(null, true).pass).toEqual(true); // true flipped to false to trigger failure
            expect(inputExtensions.toBeInputThatHasValue(null, false).pass).toEqual(true); // true flipped to false to trigger failure
        });
    });

    describe('inputHasWarning', () => {
        it('should handle <input> wrapped in a mat-form-field', () => {
            component.initForm(new TestModel(true));
            fixture.detectChanges();

            // do not find initially
            expect(findFormControlInput(fixture, 'displayIfTrue')).not.toBeInputThatHasWarning();

            // trigger hint and verify again
            component.isHintDisplayIfTrueDisplayed = true;
            fixture.detectChanges();
            const input = findFormControlInput(fixture, 'displayIfTrue');
            expect(input).toBeInputThatHasWarning();
            expect(input).toBeInputThatHasWarning('Only displayed if true');
            expect(input).toBeInputThatHasWarning(/displayed/);
            expectInput(fixture, 'displayIfTrue')
                .toHaveWarning()
                .toHaveWarning('Only displayed if true')
                .toHaveWarning(/displayed/)
                .not.toHaveWarning('displayed')
                .not.toHaveWarning(/Foo/);
        });

        it('should handle <mat-select> wrapped in a mat-form-field', () => {
            component.initForm(new TestModel(true));
            fixture.detectChanges();

            // do not find initially
            expect(findFormControlInput(fixture, 'yesNo')).not.toBeInputThatHasWarning();

            // trigger hint and verify again
            component.isHintYesNoDisplayed = true;
            fixture.detectChanges();
            const input = findFormControlInput(fixture, 'yesNo');
            expect(input).toBeInputThatHasWarning();
            expect(input).toBeInputThatHasWarning('Must be Yes or No');
            expect(input).toBeInputThatHasWarning(/be Yes or/);

            expectInput(fixture, 'yesNo')
                .toHaveWarning()
                .toHaveWarning('Must be Yes or No')
                .toHaveWarning(/be Yes or/)
                .not.toHaveWarning('Must')
                .not.toHaveWarning(/Foo/);
        });

        it('should always fail if field does not exist', () => {
            // I don't know how else to do this.  I'd like to expect that a test fails but doesn't seem possible
            inputExtensions['isNot'] = undefined;
            expect(inputExtensions.toBeInputThatHasWarning(null).pass).toEqual(false);
            expect(inputExtensions.toBeInputThatHasWarning(null).pass).toEqual(false);
            inputExtensions['isNot'] = true;
            expect(inputExtensions.toBeInputThatHasWarning(null).pass).toEqual(true); // true flipped to false to trigger failure
            expect(inputExtensions.toBeInputThatHasWarning(null).pass).toEqual(true); // true flipped to false to trigger failure
        });
    });

    describe('describeInput', () => {
        it('should handle form backed inputs', () => {
            component.initForm(new TestModel(true));
            fixture.detectChanges();

            const input = findFormControlInput(fixture, 'booleanField');
            expect(describeInput(input, 'enabled', 'value')) //
                .toEqual(
                    'Input[formControlName="booleanField", id="bf", tag="mat-checkbox", enabled="true", value="true"]'
                );
        });

        it('should handle non-form backed inputs', () => {
            component.initForm(new TestModel(true));
            fixture.detectChanges();

            const input = findFormControlInput(fixture, { id: 'nonFormBackedInput' });
            expect(describeInput(input, 'enabled', 'value')) //
                .toEqual('Input[id="nonFormBackedInput", tag="input", enabled="true", value="foo"]');
        });

        it('should handle null inputs', () => {
            const input = findFormControlInput(fixture, 'foo');
            expect(describeInput(input, 'enabled', 'value')) //
                .toEqual('Input[null]');
        });
    });
});
