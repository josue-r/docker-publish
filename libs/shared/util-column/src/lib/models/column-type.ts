/**
 * Interface to represent a type given as an object.
 */
export interface ObjectType {
    entityType: string;
}

export interface EnumType {
    enum: string;
}

export interface CustomType {
    customType: string;
    inputType: string;
}

/**
 * Supported data types for the `column` field.
 */
export type ColumnType =
    | 'string'
    | 'date'
    | 'decimal'
    | 'integer'
    | 'boolean'
    | 'currency'
    | 'dateTime'
    | ObjectType
    | EnumType
    | CustomType;
