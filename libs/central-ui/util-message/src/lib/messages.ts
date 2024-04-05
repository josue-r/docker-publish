import { isNullOrUndefined } from '@vioc-angular/shared/common-functionality';
import { Loggers } from '@vioc-angular/shared/common-logging';
import { startCase } from 'lodash';

/**
 * Error keys that can be handled and provided user feedback with a custom message.
 */
export const STANDARD_ERROR_MESSAGES: {
    [messageKey: string]: (params?: string[]) => { message: string; hasTimeout?: boolean } | void;
} = {
    'error.argumentTypeMismatch': () => {},
    'error.argumentNotValid': () => {},
    'error.bindValue': () => {},
    'error.concurrencyFailure': () => {},
    'error.conversionNotSupport': () => {},
    'error.dataAccess': () => {},
    'error.dataIntegrityViolation': () => {},
    'error.constraintViolation': () => {},

    /**
     * `error.argumentNotValid` errors, all error details are passed as `error.fieldNotValid` errors and must be parsed
     * based on the parameters to find the type of error being thrown.
     */
    'error.fieldNotValid': (params) => {
        // camelCase field name (params[1]), e.g. 'quantityPerPack', will be broken into words 'Quantity Per Pack'
        if (params[3] === 'AssertFalse') {
            return { message: `${startCase(params[1])} must be false` };
        } else if (params[3] === 'AssertTrue') {
            return { message: `${startCase(params[1])} must be true` };
        } else if (params[3] === 'DecimalMax') {
            return { message: `${params[2]} is greater than the max allowed value for ${startCase(params[1])}` };
        } else if (params[3] === 'Currency') {
            return {
                message: `${params[2]} does not fit within the allowed decimal range for ${startCase(params[1])}`,
            };
        } else if (params[3] === 'DecimalMin') {
            return { message: `${params[2]} is less than the min allowed value for ${startCase(params[1])}` };
        } else if (params[3] === 'Digits') {
            return { message: `Incorrect precision or scale in ${params[2]} for ${startCase(params[1])}` };
        } else if (params[3] === 'Email') {
            return { message: `${startCase(params[1])} contains an invalid email ${params[2]}` };
        } else if (params[3] === 'FieldValueRange') {
            return { message: `${startCase(params[1])} is out of range of another required field` };
        } else if (params[3] === 'Future') {
            return { message: `${startCase(params[1])} must be a future date` };
        } else if (params[3] === 'FutureOrPresent') {
            return { message: `${startCase(params[1])} must be today's date or a future date` };
        } else if (params[3] === 'Language') {
            return {
                message: `${
                    params[2]
                } should be in one of the following formats("aa","aa_BB","aa_BB_CC") for ${startCase(params[1])}`,
            };
        } else if (params[3] === 'Max') {
            return { message: `${params[2]} is greater than the max allowed value for ${startCase(params[1])}` };
        } else if (params[3] === 'Min') {
            return { message: `${params[2]} is less than the min allowed value for ${startCase(params[1])}` };
        } else if (params[3] === 'Negative') {
            return { message: `${startCase(params[1])} must be less than 0` };
        } else if (params[3] === 'NegativeOrZero') {
            return { message: `${startCase(params[1])} must be less than or equal to 0` };
        } else if (params[3] === 'NotBlank') {
            return { message: `${startCase(params[1])} must not be blank` };
        } else if (params[3] === 'NotEmpty') {
            return { message: `${startCase(params[1])} must not be empty` };
        } else if (params[3] === 'NotNull') {
            return { message: `${startCase(params[1])} must not be null` };
        } else if (params[3] === 'Null') {
            return { message: `${startCase(params[1])} must be null` };
        } else if (params[3] === 'Past') {
            return { message: `${startCase(params[1])} must be a past date` };
        } else if (params[3] === 'PastOrPresent') {
            return { message: `${startCase(params[1])} must be a past date or today's date` };
        } else if (params[3] === 'Pattern') {
            return { message: `${params[2]} does not match the required pattern for ${startCase(params[1])}` };
        } else if (params[3] === 'Positive') {
            return { message: `${startCase(params[1])} must be greater than 0` };
        } else if (params[3] === 'PositiveOrZero') {
            return { message: `${startCase(params[1])} must be greater than or equal to 0` };
        } else if (params[3] === 'Quantity') {
            return { message: `${params[2]} does not fit the within the allowed size for ${startCase(params[1])}` };
        } else if (params[3] === 'Size') {
            return { message: `${params[2]} does not fit the allowed size for ${startCase(params[1])}` };
        } else {
            return GENERIC_ERROR_MESSAGE;
        }
    },

    // camelCase field name (params[0]), e.g. 'quantityPerPack', will be broken into words 'Quantity Per Pack'
    // error.constraintViolation errors

    'error.fieldAssertFalseConstraint': (params) => {
        return { message: `${startCase(params[0])} must be false` };
    },
    'error.fieldAssertTrueConstraint': (params) => {
        return { message: `${startCase(params[0])} must be true` };
    },
    'error.fieldCurrencyConstraint': (params) => {
        return { message: `${params[1]} does not fit within the allowed decimal range for ${startCase(params[0])}` };
    },
    'error.fieldDecimalMaxConstraint': (params) => {
        return { message: `${params[1]} is greater than the max allowed value for ${startCase(params[0])}` };
    },
    'error.fieldDecimalMinConstraint': (params) => {
        return { message: `${params[1]} is less than the min allowed value for ${startCase(params[0])}` };
    },
    'error.fieldDigitsConstraint': (params) => {
        return { message: `Incorrect precision or scale in ${params[1]} for ${startCase(params[0])}` };
    },
    'error.fieldEmailConstraint': (params) => {
        return { message: `${startCase(params[0])} contains an invalid email ${params[1]}` };
    },
    'error.fieldFieldValueRangeConstraint': (params) => {
        return { message: `${startCase(params[0])} is out of range of another required field` };
    },
    'error.fieldFutureConstraint': (params) => {
        return { message: `${startCase(params[0])} must be a future date` };
    },
    'error.fieldFutureOrPresentConstraint': (params) => {
        return { message: `${startCase(params[0])} must be today's date or a future date` };
    },
    'error.fieldLanguageConstraint': (params) => {
        return {
            message: `${params[1]} should be in one of the following formats("aa","aa_BB","aa_BB_CC") for ${startCase(
                params[0]
            )}`,
        };
    },
    'error.fieldMaxConstraint': (params) => {
        return { message: `${params[1]} is greater than the max allowed value for ${startCase(params[0])}` };
    },
    'error.fieldMinConstraint': (params) => {
        return { message: `${params[1]} is less than the min allowed value for ${startCase(params[0])}` };
    },
    'error.fieldNegativeConstraint': (params) => {
        return { message: `${startCase(params[0])} must be less than 0` };
    },
    'error.fieldNegativeOrZeroConstraint': (params) => {
        return { message: `${startCase(params[0])} must be less than or equal to 0` };
    },
    'error.fieldNotBlankConstraint': (params) => {
        return { message: `${startCase(params[0])} must not be blank` };
    },
    'error.fieldNotEmptyConstraint': (params) => {
        return { message: `${startCase(params[0])} must not be empty` };
    },
    'error.fieldNotNullConstraint': (params) => {
        return { message: `${startCase(params[0])} must not be null` };
    },
    'error.fieldNullConstraint': (params) => {
        return { message: `${startCase(params[0])} must be null` };
    },
    'error.fieldPastConstraint': (params) => {
        return { message: `${startCase(params[0])} must be a past date` };
    },
    'error.fieldPastOrPresentConstraint': (params) => {
        return { message: `${startCase(params[0])} must be a past date or today's date` };
    },
    'error.fieldPatternConstraint': (params) => {
        return { message: `${params[1]} does not match the required pattern for ${startCase(params[0])}` };
    },
    'error.fieldPositiveConstraint': (params) => {
        return { message: `${startCase(params[0])} must be greater than 0` };
    },
    'error.fieldPositiveOrZeroConstraint': (params) => {
        return { message: `${startCase(params[0])} must be greater than or equal to 0` };
    },
    'error.fieldQuantityConstraint': (params) => {
        return { message: `${params[1]} does not fit the within the allowed size for ${startCase(params[0])}` };
    },
    'error.fieldSizeConstraint': (params) => {
        return { message: `${params[1]} does not fit the allowed size for ${startCase(params[0])}` };
    },

    // end error.constraintViolation errors

    'error.httpMediaTypeNotAcceptable': () => {},
    'error.httpMessageConversion': () => {},
    'error.httpMessageNotWritable': () => {},
    'error.internalServerError': () => {},
    'error.invalidFormat': () => {},
    'error.missingServletRequestPart': () => {},
    'error.noHandlerFound': () => {},
    'error.optimisticLockingFailure': () => {
        return { message: 'The record has be changed by another user, please reload the page and try again' };
    },

    //error.staleStateException

    'error.staleStateException': () => {
        return { message: 'This record has been updated by another user. Please refresh the page and try again.' };
    },

    // generic api exceptions

    'error.storeNotActive': () => {
        return { message: 'The store is not active.' };
    },

    // inventory-api

    'error.inventory-api.alreadyFinalized': () => {
        return { message: `Transfer has already been finalized, please reload the page` };
    },
    'error.inventory-api.productNotAssignedToStore': (params) => {
        return {
            message: `Product code(s) ${params[2]} were not assigned at both stores ${params[0]} and ${params[1]}`,
        };
    },
    'error.inventory-api.transferNotFound': () => {
        return {
            message: 'Transfer not found.',
        };
    },
    'error.inventory-api.itemNotActive': (params) => {
        return {
            message: `Item(s) ${params.join(', ')} is not active and cannot be ordered`,
        };
    },
    'error.inventory-api.invalidTransferStatusForCancel': () => {
        return {
            message: 'Unable to cancel a finalized transfer.',
        };
    },
    'error.inventory-api.invalidHeight': (params) => {
        return {
            message: `Entered height greater than tank height of ${params[0]}`,
        };
    },
    'error.inventory-api.transferProductNotActive': (params) => {
        return {
            message: `Product code(s) ${params[1]} were not active at store ${params[0]}`,
        };
    },
    // end inventory-api

    // invoice-api
    'error.invoice-api.exceedsMaxSearchDays': (params) => {
        return {
            message: `Invoice search is limited to a ${params[0]} day period`,
        };
    },
    // end invoice-api

    // order-api

    'error.order-api.alreadyFinalized': () => {
        return { message: 'Cannot modify an order that has already been finalized.' };
    },
    'error.order-api.invalidOrderStatusForCancel': () => {
        return { message: 'Unable to cancel a finalized order' };
    },
    'error.order-api.invalidReceiptOfMaterialStatusForCancel': () => {
        return { message: 'Unable to cancel a finalized receipt.' };
    },
    'error.order-api.invalidQuantity': () => {
        return { message: `Order Qty is invalid` };
    },
    'error.order-api.noSuggestedOrderQuantityForProduct': (params) => {
        return { message: `Unable to generate a Suggested Order Qty for Product ${params[0]}` };
    },
    'error.order-api.notFoundReceiptOfMaterial': () => {
        return { message: 'Receipt not found.' };
    },
    'error.order-api.orderNotFound': () => {
        return { message: 'Order not found' };
    },
    'error.order-api.productNotAssignedToStoreException': (params) => {
        // add spacing between the product codes for better readability on the screen
        return { message: `Product(s) ${params[2]?.replace(',', ', ')} cannot be ordered` };
    },
    'error.order-api.storeProductNotActive': (params) => {
        // add spacing between the product codes for better readability on the screen
        return { message: `Product(s) ${params[0]?.replace(',', ', ')} is not active and cannot be ordered` };
    },
    'error.order-api.productNotAssignedToVendor': (params) => {
        // add spacing between the product codes for better readability on the screen
        return { message: `Product(s) ${params[0]?.replace(',', ', ')} not assigned to vendor and cannot be ordered` };
    },
    'error.order-api.productIsObsolete': (params) => {
        // add spacing between the product codes for better readability on the screen
        return { message: `Product(s) ${params[0]?.replace(',', ', ')} is obsolete and cannot be ordered` };
    },
    'error.order-api.invalidProduct': (params) => {
        // add spacing between the product codes for better readability on the screen
        return { message: `Product(s) ${params[0]?.replace(',', ', ')} is invalid` };
    },
    'error.order-api.productNotAvailableForOrder': () => {},
    'error.order-api.quantityLessThanMinimumOrderQuantity': (params) => {
        return {
            message: `Product ${params[0]} Order Qty cannot have an Order Qty less than the Min Order Qty ${params[1]}`,
        };
    },
    'error.order-api.quantityNotMultipleOfQuantityPerPack': (params) => {
        return { message: `Product ${params[0]} Order Qty must be a multiple of Qty Per Pack ${params[1]}` };
    },
    'error.order-api.receiptAlreadyFinalized': () => {
        return { message: 'Cannot modify a Receipt that has already been finalized.' };
    },
    'error.order-api.inactiveProducts': (params) => {
        return {
            message: `The following products are inactive, please contact the help desk. ${params.join(', ')}`,
        };
    },
    'error.order-api.duplicateProducts': (params) => {
        return { message: `Found duplicate products ${params[0]}` };
    },
    'error.order-api.duplicateReceiptProducts': (params) => {
        return { message: `Found duplicate products ${params[0]} in receipt` };
    },
    'error.order-api.splitReceiptWithoutFinalize': () => {
        return { message: 'Can only split a receipt when finalizing.' };
    },
    'error.order-api.invalidReceiptType': () => {
        return { message: 'The requested receipt type is not valid.' };
    },
    'error.order-api.invalidQuantityReceivedForSplitReceipt': () => {
        return {
            message:
                'Can only split a receipt when it has at least one product with received quantity different to zero.',
        };
    },
    'error.order-api.productQuantityReceived': () => {
        return { message: 'A product contained an invalid quantity received.' };
    },
    'error.order-api.notFoundReceiptType': () => {
        return { message: 'The requested receipt type is not valid.' };
    },
    'error.order-api.productNotFound': () => {
        return { message: `A requested product is not valid.` };
    },
    'error.order-api.vendorNotAtStore': (params) => {
        return { message: `Vendor ${params[0]} is not valid.` };
    },
    'error.order-api.vendorIdNotAtStore': () => {
        return { message: `The requested vendor is not valid.` };
    },
    'error.order-api.invalidSplitReceiptType': () => {
        return { message: 'Can only split a regular receipt.' };
    },
    'error.order-api.orderTooOld': () => {
        return {
            message:
                'The order you are attempting to save is too old, it will need to be cancelled and a new order created.',
        };
    },

    // end order-api

    // organization-api

    'error.organization-api.activeFilter': () => {},
    'error.organization-api.organizationalResourceNotFound': () => {},
    'error.organization-api.tooManyParents': () => {},
    'error.organization-api.unparseableResource': () => {},

    // end organization-api

    // product-api
    'error.product-api.productInactive': () => {
        return { message: 'Product is deactivated at the Catalog level. Please activate to continue.' };
    },
    'error.product-api.circularProductCategoryHierarchy': () => {
        return {
            message:
                'The selected Parent Category cannot have a relation with the current category, please select another Parent Category.',
        };
    },
    'error.product-api.rootCategoryIncludesMotorInfo': () => {
        return { message: 'A Product Category without a Parent cannot have Motor Information.' };
    },
    'error.product-api.productCategoryCodeAlreadyExists': () => {
        return { message: 'Cannot add Product Category. Category Code already exists.' };
    },
    'error.product-api.unassignableProductCategory': () => {
        return {
            message:
                'The product has an invalid category. The category must be active and cannot be a parent category.',
        };
    },
    'error.product-api.productAlreadyExists': () => {
        return { message: 'Cannot add Product. Code already exists.' };
    },
    // end product-api

    // service-api
    'error.service-api.cannotDeactivateServiceActiveAtCompanies': () => {
        return {
            message:
                'This service is active for one or more companies. Please deactivate at the company level before proceeding.',
        };
    },
    'error.service-api.cannotDeactivateServiceActiveAtStores': () => {
        return {
            message:
                'This service is active for one or more stores. Please deactivate at the store level before proceeding.',
        };
    },
    'error.service-api.cannotDeactivateCompanyServiceActiveAtStores': () => {
        return {
            message:
                'This company service is active for one or more stores. Please deactivate at the store level before proceeding.',
        };
    },
    'error.service-api.premiumMismatchChildCategory': () => {
        return {
            message:
                'This category has child categories that are not premium. Please make those premium before proceeding.',
        };
    },
    'error.service-api.premiumMismatchParentCategory': () => {
        return { message: 'A child category must be premium if its parent is premium.' };
    },
    'error.service-api.serviceInactive': () => {
        return { message: 'Service is deactivated at the Catalog level. Please activate to continue.' };
    },
    'error.service-api.inactiveParentCategory': () => {
        return { message: 'The selected parent category is deactivated. Please activate to continue.' };
    },
    'error.service-api.serviceCategoryAlreadyExists': () => {
        return { message: 'Cannot add Service Category. Category Code already exists.' };
    },
    'error.service-api.unassignableServiceCategory': () => {
        return {
            message:
                'The service has an invalid category. The category must be active and cannot be a parent category.',
        };
    },
    'error.service-api.serviceAlreadyExists': () => {
        return { message: 'Cannot add Service. Code already exists.' };
    },
    // end service-api

    // tsb-alert-api
    'error.tsb-api.serviceCategoryNoVehicles': () => {
        return { message: 'At least one vehicle must be supplied to add a service category.' };
    },
    // end tsb-alert-api

    // discount-api
    'error.discount-api.discountNotFound': () => {
        return { message: 'Discount not found.' };
    },
    // end discount-api

    'error.persistence': () => {},
    'error.pessimisticLockingFailure': () => {
        return { message: 'Another user is currently updating this record, please try again later' };
    },
    'error.requestBinding': () => {},
    'error.requestMethodNotSupported': () => {},
    'error.requiredMediaTypeMissing': () => {},
    'error.requiredPathVariableMissing': () => {},
    'error.requiredRequestBodyMissing': () => {},
    'error.requiredRequestHeaderMissing': () => {},
    'error.requiredRequestParameterMissing': () => {},
    'error.staleDataException': () => {
        return { message: 'The record has be changed by another user, please reload the page and try again' };
    },
    'error.transactionFailed': () => {},
    'error.typeMismatch': () => {},
    'error.unsupportedMediaType': () => {},
};

/**
 * Generic error message to be shown when an issue arises on the page that is outside of the users control.
 */
export const GENERIC_ERROR_MESSAGE = {
    message: 'Your request could not be processed, please contact the Help Desk for more details or assistance',
    hasTimeout: false,
};

/**
 * Function used to display a user friendly message on the screen when an error occurs. If the messageKey exists in the `STANDARD_ERROR_MESSAGES`
 * and has a message provided, then a custom message will be returned based on the parameters of the error. If no a generic message is displayed to
 * the user.
 */
export function getErrorMessage(messageKey: string, params?: string[]): { message: string; hasTimeout?: boolean } {
    const logger = Loggers.get('util-message', 'getErrorMessage');

    if (STANDARD_ERROR_MESSAGES[messageKey]) {
        const error = STANDARD_ERROR_MESSAGES[messageKey](params);
        if (error) {
            logger.debug('displaying message', () => `"${error.message}"`, 'for:', { messageKey, parameters: params });
            return { ...error, hasTimeout: isNullOrUndefined(error.hasTimeout) ? true : error.hasTimeout };
        } else {
            logger.debug('displaying generic message', () => `"${GENERIC_ERROR_MESSAGE}"`, 'for:', {
                messageKey,
                parameters: params,
            });

            return { ...GENERIC_ERROR_MESSAGE, message: `${GENERIC_ERROR_MESSAGE.message}: ${messageKey}` };
        }
    } else {
        logger.debug('unsupported message for:', { messageKey, parameters: params });
        return { ...GENERIC_ERROR_MESSAGE, message: `${GENERIC_ERROR_MESSAGE.message}: ${messageKey}` };
    }
}
