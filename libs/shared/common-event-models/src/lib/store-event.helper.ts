const propExistInObject = (objToValidate: any, propName: string): boolean => {
    return propName in objToValidate;
};

const isValidGuid = (guid: string): boolean => {
    const guidPattern = /^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/;
    return guidPattern.test(guid);
};

const valueValidations = {
    eventId: [isValidGuid],
    eventTime: [],
    eventType: [],
    bayType: [],
    bayNumber: [],
    visitId: [],
    visitGuid: [isValidGuid],
    storeNumber: [],
};

export const executeEventValidations = (data) => {
    for (const [key, validators] of Object.entries(valueValidations)) {
        if (!propExistInObject(data, key)) {
            throw new Error(`property: ${key} is required`);
        }
        for (const valueValidator of validators) {
            if (!valueValidator(data[key])) {
                throw new Error(`Validation failed for property: ${key}, Function name: ${valueValidator.name}`);
            }
        }
    }
};
