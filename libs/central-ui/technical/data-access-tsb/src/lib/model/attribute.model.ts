import { Described } from '@vioc-angular/shared/common-functionality';

/**
 * An Aces attribute representation.
 *
 * For example, if we have these fuel types set up
 *
 *  | FuelTypeID|FuelTypeName|
 *  ------------|-------------
 *  | 5         |GAS         |
 *  | 6         |DIESEL      |
 *
 * The `Attribute` for `GAS` would be `{type="FuelType", id=5}`
 */
export class Attribute {
    /** The type of the aces data (ex FuelType or TransmissionType) */
    type: Described;

    /**
     * The id for the specific record of the dataset defined by the type field.  This is *NOT* The id of this object.
     */
    key: number;

    version?: number;
}
