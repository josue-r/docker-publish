import { Described } from '@vioc-angular/shared/common-functionality';
import { of } from 'rxjs';
import { CompanyExportState } from '../state/company-export-state';
import { CompanyExportFacade } from './company-export-facade';

describe('CompanyExportFacade', () => {
    let state: CompanyExportState;
    let facade: CompanyExportFacade;

    beforeEach(() => {
        state = new CompanyExportState();
        facade = new CompanyExportFacade('//gateway', null, state);
    });

    describe('findByCompanyAndType', () => {
        it('should use what is in state if cached', async () => {
            jest.spyOn(facade['api'], 'findByCompanyAndType').mockImplementation();
            // put in state and verify that state is used
            state.cacheByCompanyAndType('VAL', 'COST', of([{ id: 1 } as Described]));

            const actual = await facade.findByCompanyAndType('val', 'COST').toPromise();
            expect(actual.map((d) => d.id)).toEqual([1]);
            expect(facade['api'].findByCompanyAndType).not.toHaveBeenCalled();
        });

        it('should fetch from API and cache if not cached', async () => {
            // put in another type in state
            state.cacheByCompanyAndType('VAL', 'SALES', of([{ id: 0 } as Described]));
            state.cacheByCompanyAndType('ABX', 'COST', of([{ id: 1 } as Described]));

            jest.spyOn(facade['api'], 'findByCompanyAndType').mockImplementation(() => of([{ id: 2 } as Described]));

            const actual = await facade.findByCompanyAndType('VAL', 'COST').toPromise();
            expect(actual.map((d) => d.id)).toEqual([2]);
            expect(facade['api'].findByCompanyAndType).toHaveBeenCalledTimes(1);
            // call again and verify API was not called as second time
            await facade.findByCompanyAndType('VAL', 'COST').toPromise();
            expect(facade['api'].findByCompanyAndType).toHaveBeenCalledTimes(1);
        });
    });
});
