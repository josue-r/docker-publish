import { ResourceFilterCriteria } from './resource-filter-criteria';

const company = {
    code: 'COMP',
};
const region = {
    code: 'REG',
};
const market = {
    code: 'MAR',
};
const area = {
    code: 'ARE',
};
const store = {
    code: 'STR',
};

describe('ResourceFilterCriteria', () => {
    describe('byCompany', () => {
        it.each`
            parameter       | criteria
            ${company.code} | ${'COMP'}
            ${company}      | ${'COMP'}
        `('should return company criteria when provided $parameter', ({ parameter, criteria }) => {
            const filter = ResourceFilterCriteria.byCompany(parameter);
            expect(filter.criteria).toEqual(criteria);
        });
    });
    describe('byRegion', () => {
        it.each`
            parameters                     | criteria
            ${[company.code, region.code]} | ${'COMP>REG'}
            ${[company, region]}           | ${'COMP>REG'}
        `('should return company criteria when provided $parameter', ({ parameters, criteria }) => {
            const filter = ResourceFilterCriteria.byRegion(parameters[0], parameters[1]);
            expect(filter.criteria).toEqual(criteria);
        });
    });
    describe('byMarket', () => {
        it.each`
            parameters                                  | criteria
            ${[company.code, region.code, market.code]} | ${'COMP>REG>MAR'}
            ${[company, region, market]}                | ${'COMP>REG>MAR'}
        `('should return company criteria when provided $parameter', ({ parameters, criteria }) => {
            const filter = ResourceFilterCriteria.byMarket(parameters[0], parameters[1], parameters[2]);
            expect(filter.criteria).toEqual(criteria);
        });
    });
    describe('byArea', () => {
        it.each`
            parameters                                             | criteria
            ${[company.code, region.code, market.code, area.code]} | ${'COMP>REG>MAR>ARE'}
            ${[company, region, market, area]}                     | ${'COMP>REG>MAR>ARE'}
        `('should return company criteria when provided $parameter', ({ parameters, criteria }) => {
            const filter = ResourceFilterCriteria.byArea(parameters[0], parameters[1], parameters[2], parameters[3]);
            expect(filter.criteria).toEqual(criteria);
        });
    });
});
