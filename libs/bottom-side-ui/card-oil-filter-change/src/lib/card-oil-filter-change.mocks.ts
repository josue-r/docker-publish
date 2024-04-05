import {
    EngineDrainPlugTorque,
    OilFilterTorque,
    Part,
} from '@vioc-angular/bottom-side-ui/config/data-access-vehicle-specifications';
import { WorkingBayServices } from '@vioc-angular/bottom-side-ui/config/data-access-working-bay';

const OIL_FILTER: Part[] = [
    {
        part: 'VO106',
        id: 'ValvolineFilters.713.oil_filter',
        type: null,
        qualifier: null,
        notes: [
            {
                id: '00S',
                value: '1 (Qty)',
            },
            null,
        ],
    },
    {
        part: 'VO200',
        id: 'ValvolineFilters.713.oil_filter',
        type: null,
        qualifier: null,
        notes: [
            {
                id: '200',
                value: '1 (Qty)',
            },
            null,
        ],
    },
    {
        part: 'VO333',
        id: 'ValvolineFilters.713.oil_filter',
        type: null,
        qualifier: null,
        notes: [
            {
                id: '333',
                value: '1 (Qty)',
            },
            null,
        ],
    },
];

const OIL_FILTER_TORQUE: OilFilterTorque = {
    id: 1,
    qualifier: 'QUALIFIER',
    torque_f: 'torque_f',
    torque_n: 'torque_n',
    oilFilterProcedure: [
        {
            id: 'oilFilterProcedureID',
            value: 'oilFilterProcedure VALUE',
        },
    ],
    oilFilterType: [
        {
            id: 'oilFilterTypeID',
            value: 'oilFilterType VALUE',
        },
    ],
    notes: [
        {
            id: '333',
            value: '1 (Qty)',
        },
        null,
    ],
};

const ENGINE_DRAIN_PLUG_TORQUE: EngineDrainPlugTorque = {
    id: 1,
    type: 'ENGINE_DRAIN_PLUG_TORQUE TYPE',
    torqueFtLbs: 'FtLbs',
    notes: [
        {
            id: '333',
            value: '1 (Qty)',
        },
        null,
    ],
};

const OIL_CHANGE: WorkingBayServices = {
    id: 6,
    rootServiceCategory: {
        id: '1011',
        code: 'OC',
        description: 'Oil change',
        version: 5,
    },
    service: {
        id: '1227',
        code: 'MAXLIFEOC',
        description: 'Maxlife Oil Change',
        version: 5,
    },
    products: [
        {
            id: '6',
            productCategory: {
                id: 10952,
                code: '11589',
                description: 'DRAIN PLUG 11589',
                version: 5,
            },
            product: {
                id: '28435',
                code: '0W20MXD',
                description: 'VAL 0W20 MAXLIFE DRUM',
                version: 5,
            },
            quantity: '3.7',
            uom: {
                id: 10952,
                code: '11589',
                description: 'DRAIN PLUG 11589',
                version: 5,
            },
        },
    ],
};

export const CARD_OIL_FILTER_CHANGE_MOCK = {
    OIL_FILTER,
    OIL_FILTER_TORQUE,
    ENGINE_DRAIN_PLUG_TORQUE,
    OIL_CHANGE,
};
