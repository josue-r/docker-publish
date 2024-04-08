const nxPreset = require('@nx/jest/preset').default;
module.exports = {
    ...nxPreset,
    verbose: false,
    testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
    transform: {
        '^.+\\.(ts|js|html)$': [
            'ts-jest',
            {
                isolatedModules: true,
            },
        ],
    },
    transformIgnorePatterns: ['/node_modules/(?!lodash-es)'],
    resolver: '@nx/jest/plugins/resolver',
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageReporters: ['lcov'],
    passWithNoTests: true,
    // Slow windows tests - https://github.com/nrwl/nx/issues/1299 - A better fix may be posted here but this is the workaround for now
    watchPathIgnorePatterns: ['pact/logs/*', 'pact/pacts/*'],
};
