import { Column } from './column';
import { ColumnType } from './column-type';
import { Comparator } from './comparator';

// @dynamic (See https://github.com/angular/angular/issues/18867#issuecomment-357484102)
export class Comparators {
    // standard
    static get equalTo(): Comparator {
        return { displayValue: 'equal to', value: '=', requiresData: true, multiValue: false };
    }
    static get notEqualTo(): Comparator {
        return { displayValue: 'not equal to', value: '!=', requiresData: true, multiValue: false };
    }
    // TODO: At some point, we may want to add legit "blank" handling.
    static get blank(): Comparator {
        return { displayValue: 'is blank', value: 'is-null', requiresData: false, multiValue: false };
    }
    static get notBlank(): Comparator {
        return { displayValue: 'is not blank', value: 'is-not-null', requiresData: false, multiValue: false };
    }
    private static readonly standardValueComparators = [
        Comparators.equalTo,
        Comparators.notEqualTo,
        Comparators.blank,
        Comparators.notBlank,
    ];
    // text
    static get startsWith(): Comparator {
        return { displayValue: 'starts with', value: 'starts-with', requiresData: true, multiValue: false };
    }
    static get contains(): Comparator {
        return { displayValue: 'contains', value: 'contains', requiresData: true, multiValue: false };
    }
    static get endsWith(): Comparator {
        return { displayValue: 'ends with', value: 'ends-with', requiresData: true, multiValue: false };
    }
    // boolean
    static get true(): Comparator {
        return { displayValue: 'is Y', value: 'true', requiresData: false, multiValue: false };
    }
    static get falseOrBlank(): Comparator {
        return { displayValue: 'is N or blank', value: 'false', requiresData: false, multiValue: false };
    }
    // dropdown
    static get in(): Comparator {
        return { displayValue: 'in', value: 'in', requiresData: true, multiValue: true };
    }
    static get notIn(): Comparator {
        return { displayValue: 'not in', value: 'not-in', requiresData: true, multiValue: true };
    }
    // Number
    static get greaterThanOrEqual(): Comparator {
        return { displayValue: 'greater than or equals', value: '>=', requiresData: true, multiValue: false };
    }
    static get lessThanOrEqual(): Comparator {
        return { displayValue: 'less than or equals', value: '<=', requiresData: true, multiValue: false };
    }
    // Date
    static get before(): Comparator {
        return { displayValue: 'is before', value: 'before', requiresData: true, multiValue: false };
    }
    static get after(): Comparator {
        return { displayValue: 'is after', value: 'after', requiresData: true, multiValue: false };
    }
    static get between(): Comparator {
        return { displayValue: 'between', value: 'between', requiresData: true, multiValue: true };
    }
    static get notBetween(): Comparator {
        return { displayValue: 'not between', value: 'not-between', requiresData: true, multiValue: true };
    }

    static for(searchColumn: Column, exclusions: Comparator[] = []): Comparator[] {
        let comparators: Comparator[];
        if (searchColumn.comparators && searchColumn.comparators.length > 0) {
            comparators = searchColumn.comparators;
        } else {
            // if a dropdown
            if (searchColumn.isDropdown) {
                comparators = Comparators.standardValueComparators.concat([Comparators.in, Comparators.notIn]);
            } else {
                // standard comparators
                comparators = this.forType(searchColumn.getTopLevelType());
            }
        }

        if (!searchColumn.nullable) {
            exclusions = exclusions.concat([Comparators.blank, Comparators.notBlank]);
        }
        return comparators.filter((comp) => exclusions.every((exclusion) => comp.value !== exclusion.value));
    }

    static forType(columnType: ColumnType) {
        let comparators: Comparator[];
        // standard comparators
        switch (columnType) {
            case 'string':
                comparators = [Comparators.startsWith, Comparators.contains, Comparators.endsWith].concat(
                    Comparators.standardValueComparators
                );
                break;
            case 'boolean':
                comparators = [Comparators.true, Comparators.falseOrBlank];
                break;
            case 'date':
                comparators = Comparators.standardValueComparators.concat([
                    Comparators.before,
                    Comparators.after,
                    Comparators.between,
                    Comparators.notBetween,
                ]);
                break;
            case 'dateTime':
                comparators = [
                    Comparators.equalTo,
                    Comparators.notEqualTo,
                    Comparators.before,
                    Comparators.after,
                    Comparators.between,
                    Comparators.notBetween,
                    Comparators.blank,
                    Comparators.notBlank,
                ];
                break;
            case 'integer':
            case 'decimal':
                comparators = Comparators.standardValueComparators.concat([
                    Comparators.greaterThanOrEqual,
                    Comparators.lessThanOrEqual,
                ]);
                break;
            default:
                throw new Error(`Comparators not registered for ${JSON.stringify(columnType)}`);
        }
        return comparators;
    }

    /** Check if the given comparator requires a range of date values. */
    static isDateRangeComparator(comparator: Comparator): boolean {
        return comparator?.value === Comparators.between.value || comparator?.value === Comparators.notBetween.value;
    }
}
