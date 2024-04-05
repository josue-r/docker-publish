import { QueryPage, QuerySearch, QuerySort, SearchLine } from '@vioc-angular/shared/common-api-models';
import { Described } from '@vioc-angular/shared/common-functionality';
import { EntityPatch, ResponseEntity } from '@vioc-angular/shared/util-api';
import { Column, Comparators } from '@vioc-angular/shared/util-column';
import { EMPTY, of } from 'rxjs';
import { StoreProductApi } from '../api/store-product-api';
import { StoreProductMassUpdate } from '../model/store-product-mass-update.model';
import { StoreProduct } from '../model/store-product.model';
import { StoreProductFacade } from './store-product-facade';

describe('StoreProductFacade', () => {
    let api: StoreProductApi;
    let facade: StoreProductFacade;

    beforeEach(() => {
        // facade = new CompanyProductFacade('//gateway',null)
        facade = new StoreProductFacade(null, null);
        api = facade['api'];
    });

    describe('update', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'update').mockImplementation((sp) => {
                expect(sp.id).toEqual({ productId: 1, storeId: 2 });
                return EMPTY;
            });

            facade.update({ id: { productId: 1, storeId: 2 } });

            expect.assertions(1); // verify that the expect was called in the update method
        });

        it.each`
            extraChargeAmount | expectedAmount | expectedDecription | expectedTaxable
            ${5}              | ${5}           | ${'Desc'}          | ${false}
            ${null}           | ${null}        | ${null}            | ${null}
            ${0}              | ${null}        | ${null}            | ${null}
        `(
            'should clear unnecessary extra charge info',
            ({ extraChargeAmount, expectedAmount, expectedDecription, expectedTaxable }) => {
                jest.spyOn(api, 'update').mockImplementation((sp) => {
                    expect(sp.extraChargeAmount).toEqual(expectedAmount);
                    expect(sp.extraChargeDescription).toEqual(expectedDecription);
                    expect(sp.extraChargeTaxable).toEqual(expectedTaxable);
                    return EMPTY;
                });

                facade.update({ extraChargeAmount, extraChargeDescription: 'Desc', extraChargeTaxable: false });

                expect.assertions(3);
            }
        );

        it.each`
            schedulePriceDate | expectedSchedulePriceChange
            ${'2020-03-29'}   | ${40}
            ${null}           | ${null}
            ${''}             | ${null}
        `(
            'should clear unnecessary scheduled retail price change info',
            ({ schedulePriceDate, expectedSchedulePriceChange }) => {
                jest.spyOn(api, 'update').mockImplementation((sp) => {
                    expect(sp.schedulePriceDate).toEqual(schedulePriceDate);
                    expect(sp.schedulePriceChange).toEqual(expectedSchedulePriceChange);
                    return EMPTY;
                });

                facade.update({ schedulePriceDate, schedulePriceChange: 40 });

                expect.assertions(2);
            }
        );

        it.each`
            wholesalePriceChangeDate | expectedWholesalePriceChange
            ${'2020-03-29'}          | ${40}
            ${null}                  | ${null}
            ${''}                    | ${null}
        `(
            'should clear unnecessary scheduled wholesale price change info',
            ({ wholesalePriceChangeDate, expectedWholesalePriceChange }) => {
                jest.spyOn(api, 'update').mockImplementation((sp) => {
                    expect(sp.wholesalePriceChangeDate).toEqual(wholesalePriceChangeDate);
                    expect(sp.wholesalePriceChange).toEqual(expectedWholesalePriceChange);
                    return EMPTY;
                });

                facade.update({ wholesalePriceChangeDate, wholesalePriceChange: 40 });

                expect.assertions(2);
            }
        );

        it.each`
            promotionPriceStartDate | expectPromotionPriceEndDate | expectedPromotionPrice
            ${'2020-03-29'}         | ${'2020-03-31'}             | ${40}
            ${null}                 | ${null}                     | ${null}
            ${''}                   | ${null}                     | ${null}
        `(
            'should clear unnecessary scheduled promotion price change info',
            ({ promotionPriceStartDate, expectPromotionPriceEndDate, expectedPromotionPrice }) => {
                jest.spyOn(api, 'update').mockImplementation((sp) => {
                    expect(sp.promotionPriceStartDate).toEqual(promotionPriceStartDate);
                    expect(sp.promotionPriceEndDate).toEqual(expectPromotionPriceEndDate);
                    expect(sp.promotionPrice).toEqual(expectedPromotionPrice);
                    return EMPTY;
                });

                facade.update({
                    promotionPriceStartDate,
                    promotionPriceEndDate: '2020-03-31',
                    promotionPrice: 40,
                });

                expect.assertions(3);
            }
        );

        it.each`
            overridable | min     | max     | minMaxOverridable
            ${true}     | ${1.1}  | ${2.2}  | ${true}
            ${false}    | ${null} | ${null} | ${false}
        `(
            'should clear unnecessary min/max override fields if not overridable',
            ({ overridable, min, max, minMaxOverridable }) => {
                jest.spyOn(api, 'update').mockImplementation((sp) => {
                    expect(sp.overridable).toEqual(overridable);
                    expect(sp.minOverridePrice).toEqual(min);
                    expect(sp.maxOverridePrice).toEqual(max);
                    expect(sp.minMaxOverridable).toEqual(minMaxOverridable);
                    return EMPTY;
                });

                facade.update({
                    overridable,
                    minOverridePrice: 1.1,
                    maxOverridePrice: 2.2,
                    minMaxOverridable: true,
                });

                expect.assertions(4);
            }
        );
    });

    describe('findByStoreAndProduct', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findByStoreAndProduct').mockImplementation();

            facade.findByStoreAndProduct('FOO', 'BAR');

            // verify that it delegated to api;
            expect(api.findByStoreAndProduct).toBeCalledWith('FOO', 'BAR');
        });
    });

    describe('findByStoreAndProducts', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'findByStoreAndProducts').mockImplementation();
            const productCodes: string[] = ['PROD1', 'PROD2'];
            facade.findByStoreAndProducts('STORE', productCodes);
            // verify that it delegated to api;
            expect(api.findByStoreAndProducts).toBeCalledWith('STORE', productCodes);
        });
    });

    describe('activate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'activate').mockImplementation();

            const id12 = { storeId: 1, productId: 2 };
            const id34 = { storeId: 3, productId: 4 };

            facade.activate([id12, id34]);

            // verify that it delegated to api;
            expect(api.activate).toBeCalledWith([id12, id34], ['v1/store-products/activate']);
        });
    });

    describe('deactivate', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'deactivate').mockImplementation();

            const id12 = { storeId: 1, productId: 2 };
            const id34 = { storeId: 3, productId: 4 };

            facade.deactivate([id12, id34]);

            // verify that it delegated to api;
            expect(api.deactivate).toBeCalledWith([id12, id34], ['v1/store-products/deactivate']);
        });
    });

    describe('search', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'query').mockImplementation();

            const column = Column.of({ name: 'Test', apiFieldPath: 'test', type: 'string' });
            const querySearch: QuerySearch = {
                queryRestrictions: [new SearchLine(column, Comparators.notBlank).toQueryRestriction()],
                sort: new QuerySort(column),
                page: new QueryPage(0, 20),
            };

            facade.search(querySearch);

            // verify that it delegated to api;
            expect(api.query).toBeCalledWith(querySearch, ['v1/store-products/search']);
        });
    });

    describe('entityPatch', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'entityPatch').mockImplementation();

            const patch: EntityPatch<{ storeId: number; productId: number }> = {
                id: { storeId: 1, productId: 2 },
                fields: ['active'],
                updateValues: { active: true },
            };

            facade.entityPatch([patch]);

            // verify that it delegated to api;
            expect(api.entityPatch).toBeCalledWith(['v1/store-products/patch'], patch);
        });
    });

    describe('dataSync', () => {
        it('should just delegate to API', () => {
            jest.spyOn(api, 'dataSync').mockImplementation();

            const id = { storeId: 1, productId: 2 };

            facade.dataSync([id]);

            // verify that it delegated to api;
            expect(api.dataSync).toBeCalledWith([id], ['v1/store-products/datasync']);
        });
    });

    describe('add', () => {
        it('should map product and store ids and pass on the storeProduct, useDefaultVendor, and useDefaultReportOrder fields', () => {
            const massAdd = {
                stores: [
                    { id: 1, code: 'store 1' },
                    { id: 2, code: 'store 2' },
                ],
                products: [
                    { id: 101, code: 'prod 101' },
                    { id: 102, code: 'prod 102' },
                ],
                storeProduct: { retailPrice: 4.99, includeInCount: true },
                useDefaultVendor: true,
                useDefaultReportOrder: false,
            };
            jest.spyOn(api, 'post').mockImplementation((path, body) => {
                expect(path).toEqual(['v1/store-products/mass-add']);
                expect(body.storeIds).toEqual([1, 2]);
                expect(body.retailPrice).toEqual(massAdd.storeProduct.retailPrice);
                expect(body.includeInCount).toEqual(massAdd.storeProduct.includeInCount);
                return EMPTY;
            });
            facade.add(massAdd);
            expect.assertions(4);
        });
    });

    describe('findAssignableStores', () => {
        it('should delegate to the api', () => {
            jest.spyOn(api, 'findAssignableStores').mockImplementation();
            const productCode = 'TEST_PRODUCT';
            facade.findAssignableStores(productCode);
            expect(api.findAssignableStores).toHaveBeenCalledWith(productCode);
        });
    });

    describe('previewMassAdd', () => {
        it('should delegate to the api and pass on the store ids and prod ids', () => {
            const storeIds = [1, 2];
            const prodIds = [101, 102];
            jest.spyOn(api, 'post').mockImplementation((path, body) => {
                expect(path).toEqual(['v1/store-products/mass-add-preview']);
                expect(body.storeIds).toEqual(storeIds);
                expect(body.prodIds).toEqual(prodIds);
                return EMPTY;
            });
            facade.previewMassAdd(storeIds, prodIds);
            expect.assertions(3);
        });
    });

    describe('searchAssignedProductsByStore', () => {
        it('should just delegate to the API', async () => {
            const responseEntity: ResponseEntity<Described> = {
                content: [{ id: 1, code: 'PROD', description: 'Test Product' }],
                totalElements: 1,
            };
            jest.spyOn(api, 'searchAssignedProductsByStore').mockReturnValue(of(responseEntity));
            const stores = [
                { id: 1, code: 'STORE1', description: 'Test Store 1' },
                { id: 2, code: 'STORE2', description: 'Test Store 2' },
            ];
            const column: Column = Column.of({
                apiFieldPath: 'code',
                name: 'Product Code',
                type: 'string',
            });
            const querySearch: QuerySearch = {
                queryRestrictions: [new SearchLine(column, Comparators.startsWith, 'p').toQueryRestriction()],
                page: new QueryPage(0, 10),
                sort: new QuerySort(column),
            };
            expect(await facade.searchAssignedProductsByStore(querySearch, stores).toPromise()).toEqual(responseEntity);
            expect(api.searchAssignedProductsByStore).toHaveBeenCalledWith(querySearch, stores);
        });
    });

    describe('massUpdate', () => {
        it('should just delegate to API', async () => {
            jest.spyOn(api, 'massUpdate').mockReturnValue(of(1));

            const massUpdate: StoreProductMassUpdate = {
                stores: [{ id: 1, code: 'STORE', description: 'Test Store' }],
                products: [{ id: 1, code: 'PROD', description: 'Test Product' }],
                patch: { ...new StoreProduct(), retailPrice: 1.23 },
            };

            expect(await facade.massUpdate(massUpdate, ['retailPrice']).toPromise()).toEqual(1);
            expect(api.massUpdate).toBeCalledWith(massUpdate, ['retailPrice']);
        });
    });

    describe('getInventoryDetails', () => {
        it('should just delegate to API', async () => {
            jest.spyOn(api, 'getInventoryDetails').mockImplementation();
            const storeCode = 'S1';
            const vendorCode = 'V1';
            const productCodes = ['P1', 'P2'];

            facade.getInventoryDetails(storeCode, vendorCode, productCodes);

            expect(api.getInventoryDetails).toBeCalledWith(storeCode, vendorCode, productCodes);
        });
    });
});
