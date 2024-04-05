import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectorRef } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SearchLine } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { Comparators, integerColumn } from '@vioc-angular/shared/util-column';
import { ReplaySubject } from 'rxjs';
import { FormFactory } from './form-factory';
import { TypedFormGroup } from './typed-form-group';

class Model {
    field1: number = null;
    field2: number = null;
    fieldInfo?: Described = null;
}

describe('FormFactory', () => {
    let formFactory: FormFactory;
    let formBuilder: FormBuilder;
    let componentDestroyed: ReplaySubject<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FormFactory],
            imports: [ReactiveFormsModule],
        });
        formBuilder = TestBed.inject(FormBuilder);
        formFactory = new FormFactory(formBuilder);

        componentDestroyed = new ReplaySubject<any>();
    });
    afterEach(
        waitForAsync(() => {
            componentDestroyed.next();
            componentDestroyed.unsubscribe();
        })
    );

    it('should create a registerd form with validators', () => {
        const model: Model = {
            field1: 1,
            field2: undefined,
        };

        formFactory.register('Model', (m) => {
            const fg = TypedFormGroup.create<Model>(formBuilder.group(m));
            fg.getControl('field1').setValidators(Validators.required);
            fg.getControl('field2').setValidators(Validators.min(0));
            return fg;
        });

        const form = formFactory.group('Model', model, undefined);
        form.setControlValue('field2', -1);
        // Form should be invalid if "field2" is negative
        expect(form.valid).toBe(false);

        form.setControlValue('field2', 1);
        expect(form.valid).toBe(true);
    });

    it('should fail on duplicate registration', () => {
        formFactory.register('Model', (m) => formBuilder.group(m));

        expect(() => formFactory.register('Model', (m) => formBuilder.group(m))).toThrowError(
            'Duplicate type registration Model'
        );
    });

    describe('grid', () => {
        const testData: {
            id: number;
            desc: string;
        }[] = [
            { id: 1, desc: 'desc1' },
            { id: 2, desc: 'desc2' },
        ];
        const testSelectionModel = new SelectionModel();
        const testChangeDetector = { detectChanges: () => {} } as ChangeDetectorRef;
        const buildGridForm = (): FormGroup => {
            const groupSpy = jest
                .spyOn(formFactory, 'group')
                .mockImplementation((t, m, cd, o) => new TypedFormGroup<any>(formBuilder.group(m), cd));
            const opts = { selectionModel: testSelectionModel, changeDetector: testChangeDetector };
            const results = formFactory.grid('test', testData, componentDestroyed, opts);
            // Should have delegated to 'group' for each element
            expect(groupSpy).toHaveBeenCalledTimes(testData.length);
            return results;
        };
        const getDataArray = (gridForm: FormGroup) => gridForm.get('data') as FormArray;
        it('should require a changeDetector and selectionModel to be provided', () => {
            // Neither option provided
            expect(() => formFactory.grid('Test', testData, componentDestroyed, {})).toThrowError(
                'The "changeDetector" option must be passed to the FormFactory for undefined'
            );
            // Change detector not provided
            expect(() =>
                formFactory.grid('Test', testData, componentDestroyed, { selectionModel: testSelectionModel })
            ).toThrowError('The "changeDetector" option must be passed to the FormFactory for undefined');
            // Selection model not provided
            expect(() =>
                formFactory.grid('Test', testData, componentDestroyed, { changeDetector: testChangeDetector })
            ).toThrowError('The "selectionModel" option must be passed to the FormFactory for undefined');
        });
        it('should create a control for each data element', () => {
            const gridArray = getDataArray(buildGridForm());
            expect(gridArray.length).toEqual(testData.length);
        });
        it('should have each row already marked as touched', () => {
            const gridArray = getDataArray(buildGridForm());
            gridArray.controls.forEach((row) => expect(row.touched).toBeTruthy());
        });
        describe('configures a value change listener that', () => {
            const updateDesc = (gridArray: FormArray, rowIndex: number) => {
                const firstRow = gridArray.controls[rowIndex];
                firstRow.get('desc').patchValue('updated desc');
                firstRow.updateValueAndValidity();
                tick(200); // Debounce time of 200
            };
            it('should select a row on value change', fakeAsync(() => {
                const selectionSpy = jest.spyOn(testSelectionModel, 'select');
                const rowIndex = 0;
                updateDesc(getDataArray(buildGridForm()), rowIndex);
                expect(selectionSpy).toHaveBeenCalledWith(rowIndex);
            }));
            it('should deselect a row on value change if invalid', fakeAsync(() => {
                const deselectionSpy = jest.spyOn(testSelectionModel, 'deselect');
                const rowIndex = 0;
                const gridArray = getDataArray(buildGridForm());
                // Update control to never be valid
                gridArray.controls[rowIndex].get('desc').setValidators(() => ({ valid: false }));
                updateDesc(gridArray, rowIndex);
                expect(deselectionSpy).toHaveBeenCalledWith(rowIndex);
            }));
        });
    });

    describe.each`
        lines                                                     | expectedLength
        ${[new SearchLine(), new SearchLine(), new SearchLine()]} | ${3}
        ${[new SearchLine()]}                                     | ${1}
        ${[]}                                                     | ${1}
    `('searchFilter', ({ lines, expectedLength }) => {
        it(`should build a form with ${expectedLength} control(s) if given ${lines.length} lines`, () => {
            jest.spyOn(formFactory, 'searchFilterLine');
            const form = formFactory.searchFilter(lines);
            expect(formFactory.searchFilterLine).toHaveBeenCalledTimes(expectedLength);
            expect(form.getArray('lines').length).toEqual(expectedLength);
        });
    });

    describe.each`
        line                                                     | expectedValue
        ${new SearchLine()}                                      | ${null}
        ${new SearchLine(integerColumn, Comparators.equalTo, 4)} | ${4}
        ${new SearchLine(integerColumn, Comparators.in, 4)}      | ${[4]}
    `('searchFilterLine', ({ line, expectedValue }) => {
        it(`should build a form with a value of ${expectedValue} out of ${JSON.stringify(line)}`, () => {
            const form = formFactory.searchFilterLine(line);
            const expectedColumn = line.column ? line.column : null;
            expect(form.getControlValue('column')).toEqual(expectedColumn);
            const expectedComparator = line.comparator ? line.comparator : null;
            expect(form.getControlValue('comparator')).toEqual(expectedComparator);
            expect(form.getControlValue('value')).toEqual(expectedValue);
            expect(form.getControl('removable').disabled).toBeTruthy();
        });
    });

    describe.each`
        value                                                              | initValue
        ${{ id: 12, code: 'TEST', description: 'Test field', version: 1 }} | ${{ id: 12, code: 'TEST', description: 'Test field', version: 1 }}
        ${null}                                                            | ${new Described()}
    `('extended TypedFormGroup', ({ value, initValue }) => {
        it(`should create an extended group out of ${JSON.stringify(value)} from the TypedFormGroup`, () => {
            const model: Model = {
                field1: 1,
                field2: 2,
                fieldInfo: value,
            };
            formFactory.register('Model', (m) => {
                return TypedFormGroup.create<Model>(formBuilder.group(m));
            });
            const form = formFactory.group('Model', model, undefined);
            formFactory.extendGroup(form, 'fieldInfo', undefined, initValue);

            expect(form.get('fieldInfo').get('id').value).toEqual(initValue.id);
            expect(form.get('fieldInfo').get('code').value).toEqual(initValue.code);
            expect(form.get('fieldInfo').get('description').value).toEqual(initValue.description);
            expect(form.get('fieldInfo').get('version').value).toEqual(initValue.version);
        });
    });
});
