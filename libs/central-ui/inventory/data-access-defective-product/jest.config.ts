export default {
    displayName: 'central-ui-inventory-data-access-defective-product',
    preset: '../../../../jest.preset.js',
    setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],

    transformIgnorePatterns: ['node_modules/(?!.*.mjs$)'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
    coverageDirectory: '../../../../coverage/libs/central-ui/inventory/data-access-defective-product',
    transform: {
        '^.+.(ts|mjs|js|html)$': [
            'jest-preset-angular',
            {
                stringifyContentPathRegex: '\\.(html|svg)$',

                tsconfig: '<rootDir>/tsconfig.spec.json',
            },
        ],
    },
};
