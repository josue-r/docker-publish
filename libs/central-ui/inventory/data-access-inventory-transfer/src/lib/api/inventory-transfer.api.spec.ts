import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { V3Request } from '@pact-foundation/pact';
import { eachLike, integer, like, string } from '@pact-foundation/pact/src/dsl/matchers';
import { acceptJsonHeader, likeDescribed, standardJsonHeaders } from '@vioc-angular/test/util-test';
import { pactWith } from 'jest-pact/dist/v3';
import { InventoryTransfer } from '../model/inventory-transfer.model';
import { InventoryTransferApi } from './inventory-transfer.api';

describe('InventoryTransferApi', () => {
    let http: HttpClient;
    let api: InventoryTransferApi;

    const path = '/v1/inventory-transfers';

    describe('contract tests', () => {
        pactWith(
            {
                consumer: 'central-ui',
                provider: 'inventory-api',
                cors: true,
            },
            (interaction) => {
                interaction('create an instance', ({ provider, execute }) => {
                    beforeEach(() => {
                        TestBed.configureTestingModule({
                            imports: [HttpClientModule],
                        });
                        http = TestBed.inject(HttpClient);
                    });

                    it('should create an instance', () => {
                        return provider.executeTest(async (mockServer) => {
                            api = new InventoryTransferApi(`${mockServer.url}`, { http });
                            expect(api).toBeTruthy();
                        });
                    });
                });
                interaction('findByStoreCodeAndTransferId', ({ provider, execute }) => {
                    const fromStoreCode = '101010';

                    const transferId = '1001';

                    const inventoryTransferPkResponseBody = {
                        storeId: integer(),
                        transferId: string(),
                    };

                    const employeeResponseBody = {
                        id: string(),
                        name: string(),
                        firstName: string(),
                        lastName: string(),
                        version: integer(),
                    };

                    const inventoryTransferProductsResponseBody = {
                        product: likeDescribed(),
                        uom: likeDescribed(),
                        quantity: integer(),
                        quantityOnHand: integer(),
                        version: integer(),
                    };

                    const inventoryTransferResponseBody = {
                        id: like(inventoryTransferPkResponseBody),
                        fromStore: likeDescribed(),
                        toStore: likeDescribed(),
                        createdByEmployee: like(employeeResponseBody),
                        createdOn: string(),
                        finalizedByEmployee: like(employeeResponseBody),
                        finalizedOn: string(),
                        status: likeDescribed(),
                        carrier: string(),
                        inventoryTransferProducts: eachLike(inventoryTransferProductsResponseBody),
                        updatedBy: string(),
                        updatedOn: string(),
                        version: integer(),
                    };

                    const inventoryTransferResponse = {
                        status: 200,
                        body: inventoryTransferResponseBody,
                    };
                    // defines what the request will look like
                    const request: V3Request = {
                        method: 'GET',
                        path,
                        headers: standardJsonHeaders(),
                        query: {
                            fromStore: fromStoreCode,
                            transferId: transferId,
                        },
                    };
                    // defines any pre-existing conditions that must be met for this test to work on the provider side.
                    // This string will need to be matches exactly by a state in the provider tests. This ensure that
                    // necessary relationships exist for the product to be properly created
                    const state =
                        'a transfer with store code 101010 and transfer id 1001 with non-null values and a product with non-null values';

                    it('should return inventory transfer with the given store code and id', async () => {
                        // adds a mocked interaction to the provider service for the api to call to and validate
                        provider.addInteraction({
                            states: [{ description: state }],
                            // a unique string identifying this interaction
                            uponReceiving: 'A request to find transfer by store code and transfer id',
                            withRequest: request,
                            // mock provider will return a response of 200 with inventoryTransferResponse body
                            willRespondWith: inventoryTransferResponse,
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new InventoryTransferApi(`${mockServer.url}`, { http });
                            // call the actual api method so that the provider can validate it against the added interaction
                            await api.findByFromStoreAndTransferId(fromStoreCode, transferId).toPromise();
                        });
                    });
                });

                interaction('delete', ({ provider, execute }) => {
                    it('should delete the open Inventory Transfer', async () => {
                        provider.addInteraction({
                            states: [
                                {
                                    description:
                                        'an open InventoryTransfer[id=1] with fromStore with code VAL001 exists',
                                },
                            ],
                            uponReceiving: 'a request to delete transferId [1] and fromStore [VAL001]',
                            withRequest: {
                                method: 'DELETE',
                                headers: acceptJsonHeader(),
                                path: path,
                                query: {
                                    fromStore: 'VAL001',
                                    transferId: '1',
                                },
                            },
                            willRespondWith: {
                                status: 200,
                            },
                        });
                        await provider.executeTest(async (mockServer) => {
                            api = new InventoryTransferApi(`${mockServer.url}`, { http });
                            await api.delete([], { fromStore: 'VAL001', transferId: '1' }).toPromise();
                        });
                    });
                });
            }
        );
    });

    describe('unit tests', () => {
        beforeEach(() => {
            api = new InventoryTransferApi(null, { http: null });
            api.put = jest.fn();
            api.get = jest.fn();
            api.post = jest.fn();
            api.delete = jest.fn();
        });

        it('should create an instance', () => {
            expect(api).toBeTruthy();
        });

        describe('finalize', () => {
            describe('a new InventoryTransfer', () => {
                it('should delegate to post method', () => {
                    const transfer = new InventoryTransfer();
                    api.finalize(transfer);
                    expect(api.post).toHaveBeenCalledWith([], transfer, { status: 'FINALIZED' });
                });
            });

            describe('an existing InventoryTransfer', () => {
                it('should delegate to put method', () => {
                    const transfer = { ...new InventoryTransfer(), id: { storeId: 1234, transferId: '5678' } };
                    api.finalize(transfer);
                    expect(api.put).toHaveBeenCalledWith([], transfer, { status: 'FINALIZED' });
                });
            });
        });

        describe('productLookup', () => {
            it('should delegate to POST method', () => {
                jest.spyOn(api, 'post').mockImplementation();
                const productCodes: string[] = ['PROD1', 'PROD2'];
                api.productLookup('fromStore', 'toStore', productCodes);
                expect(api.post).toHaveBeenCalledWith(['product-lookup'], productCodes, {
                    from: 'fromStore',
                    to: 'toStore',
                });
            });
        });

        describe('getToStores', () => {
            it('should delegate to get method', () => {
                const fromStore = 'VAL002';
                api.getToStores(fromStore);
                expect(api.get).toHaveBeenCalledWith(['to-stores'], { from: fromStore });
            });
        });

        describe('cancelInventoryTransfer', () => {
            it('should delegate to the delete method', () => {
                const fromStore = 'TEST';
                const transferId = '1';
                api.cancelInventoryTransfer(fromStore, transferId);
                expect(api.delete).toHaveBeenCalledWith([], { fromStore: fromStore, transferId: transferId });
            });
        });
    });
});
