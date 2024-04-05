import { Pipe, PipeTransform } from '@angular/core';
import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { ColumnType, CustomType, EnumType, ObjectType } from '../../models/column-type';

/**
 * Check if the given ColumnType is equal to the expected. This is meant to replace type comparisons
 * done in the HTML. So, instead of doing something like `*ngIf="column.type === 'currency'", you would
 * do:
 *
 *      *ngIf="column.type | isType: 'currency'"
 *
 * This prevents the "Expected the operants to be of similar type or any" linting error.
 */

@Pipe({ name: 'isType' })
export class IsTypePipe implements PipeTransform {
    transform(type: ColumnType, expectedType: ColumnType): boolean {
        return (
            type === expectedType ||
            this.objectTypeEquals(type as ObjectType, expectedType as ObjectType) ||
            this.enumTypeEquals(type as EnumType, expectedType as EnumType) ||
            this.customTypeEquals(type as CustomType, expectedType as CustomType)
        );
    }

    private objectTypeEquals(left: ObjectType, right: ObjectType): boolean {
        return !isNullOrUndefined(left.entityType) && left.entityType === right.entityType;
    }

    private enumTypeEquals(left: EnumType, right: EnumType): boolean {
        return !isNullOrUndefined(left.enum) && left.enum === right.enum;
    }

    private customTypeEquals(left: CustomType, right: CustomType): boolean {
        return !isNullOrUndefined(left.customType) && left.customType === right.customType;
    }
}
