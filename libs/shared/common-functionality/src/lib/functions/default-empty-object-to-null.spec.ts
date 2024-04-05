import { defaultEmptyObjectToNull } from './default-empty-object-to-null';

describe('defaultEmptyObjectToNull', () => {
    interface Obj {
        foo?: number;
        bar?: {
            barNum?: number;
            barCode?: string;
            barObj1?: {
                barObjNum?: number;
                barObjCode?: string;
            };
            barObj2?: {
                barObjNum?: number;
                barObjCode?: string;
            };
        };
    }

    const nestedObject: Obj = {
        foo: 1,
        bar: {
            barNum: 2,
            barCode: 'CODE',
            barObj1: {
                barObjNum: 3,
                barObjCode: 'CODE1',
            },
            barObj2: {
                barObjNum: 3,
                barObjCode: 'CODE2',
            },
        },
    };

    it.each`
        object                                                                                                                                                                                         | validFields                                            | fieldsToDefault
        ${{ ...nestedObject }}                                                                                                                                                                         | ${['foo', 'bar']}                                      | ${['bar']}
        ${{ ...nestedObject, bar: { barNum: null, barCode: undefined, barObj1: { barObjNum: null, barObjCode: undefined } } }}                                                                         | ${['foo']}                                             | ${['bar']}
        ${{ ...nestedObject.bar, barNum: 2, barCode: 'CODE', barObj1: { barObjNum: 3, barObjCode: null }, barObj2: { barObjNum: 3, barObjCode: 'CODE2' } }}                                            | ${['barNum', 'barCode', 'barObj1', 'barObj2']}         | ${['barObj1']}
        ${{ ...nestedObject.bar, barNum: 2, barCode: 'CODE', barNull: null, barObj1: { barObjNum: null, barObjCode: null }, barObj2: { barObjNum: null, barObjCode: undefined } }}                     | ${['barNum', 'barCode']}                               | ${['barObj1', 'barObj2', 'barNull']}
        ${{ ...nestedObject.bar, barNum: 2, barCode: 'CODE', barUndefined: undefined, barObj1: { barObjNum: undefined, barObjCode: undefined }, barObj2: { barObjNum: null, barObjCode: undefined } }} | ${['barNum', 'barCode']}                               | ${['barObj1', 'barObj2', 'barUndefined']}
        ${{ ...nestedObject.bar, barNum: 2, barCode: 'CODE', barString: '', barObj1: { barObjNum: '', barObjCode: '' }, barObj2: { barObjNum: null, barObjCode: undefined } }}                         | ${['barNum', 'barCode']}                               | ${['barObj1', 'barObj2', 'barString']}
        ${{ ...nestedObject.bar, barNum: 2, barCode: 'CODE', barZero: 0, barObj1: { barObjNum: 0, barObjCode: 0 }, barObj2: { barObjNum: null, barObjCode: undefined } }}                              | ${['barNum', 'barCode', 'barObj1', 'barZero']}         | ${['barObj2']}
        ${{ ...nestedObject.bar, barNum: 2, barCode: 'CODE', barNegativeZero: -0, barObj1: { barObjNum: -0, barObjCode: -0 }, barObj2: { barObjNum: null, barObjCode: undefined } }}                   | ${['barNum', 'barCode', 'barObj1', 'barNegativeZero']} | ${['barObj2']}
        ${{ ...nestedObject.bar, barNum: 2, barCode: 'CODE', barNan: NaN, barObj1: { barObjNum: NaN, barObjCode: NaN }, barObj2: { barObjNum: null, barObjCode: undefined } }}                         | ${['barNum', 'barCode', 'barObj1', 'barNan']}          | ${['barObj2']}
        ${{ ...nestedObject.bar, barNum: 2, barCode: 'CODE', barFalse: false, barObj1: { barObjNum: false, barObjCode: false }, barObj2: { barObjNum: null, barObjCode: undefined } }}                 | ${['barNum', 'barCode', 'barObj1', 'barFalse']}        | ${['barObj2']}
    `(
        'should update object $object empty fields $fieldsToDefault to null',
        ({ object, validFields, fieldsToDefault }) => {
            defaultEmptyObjectToNull(object, fieldsToDefault);

            fieldsToDefault
                .filter((f) => !validFields.includes(f))
                .forEach((field) => {
                    expect(object[field]).toBeNull();
                });

            validFields.forEach((field) => {
                expect(object[field]).not.toBeNull();
            });
        }
    );
});
