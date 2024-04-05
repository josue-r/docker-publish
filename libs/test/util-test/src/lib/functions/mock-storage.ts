export function mockStorage(initialStore?: object): Storage {
    let store = initialStore || {};
    const mock = {
        getItem: (key: string): string => {
            return key in store ? store[key] : null;
        },
        setItem: (key: string, value: string) => {
            store[key] = `${value}`;
        },
        removeItem: (key: string) => {
            delete store[key];
        },
        clear: () => {
            store = {};
        },
    } as Storage;
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(mock.getItem);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(mock.setItem);
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(mock.removeItem);
    jest.spyOn(Storage.prototype, 'clear').mockImplementation(mock.clear);
    return mock;
}
