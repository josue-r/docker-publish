import type { Meta, StoryObj } from '@storybook/angular';
import { SimpleTableComponent } from './simple-table.component';
import { ColumnConfiguration } from './simple-table.model';

type Element = {
    position: number;
    name: string;
    weight: number;
    symbol: string;
};

const meta: Meta<SimpleTableComponent<Element>> = {
    component: SimpleTableComponent,
    title: 'SimpleTableComponent',
    tags: ['autodocs'],
    argTypes: {
        columnConfigurations: {
            control: { type: 'object' },
            description: 'Defines the configuration for columns',
        },
        data: {
            control: { type: 'object' },
            description: 'Defines the data to be displayed in the table',
        },
    },
};

export default meta;
type Story = StoryObj<SimpleTableComponent<Element>>;

const columnConfigurations: ColumnConfiguration[] = [
    {
        columnId: 'position',
        isVisible: true,
        label: 'No.',
        customStyles: {
            width: '10%',
        },
    },
    {
        columnId: 'name',
        isVisible: true,
        label: 'Name',
        customStyles: {
            width: '20%',
        },
    },
    {
        columnId: 'weight',
        isVisible: true,
        label: 'Weight',
        customStyles: {
            width: '20%',
        },
    },
    {
        columnId: 'symbol',
        isVisible: true,
        label: 'Symbol',
        customStyles: {
            width: '50%',
        },
    },
];

export const Default: Story = {
    args: {
        columnConfigurations: columnConfigurations,
        data: [
            { position: 1, name: 'Hydrogen', weight: 1.0079, symbol: 'H' },
            { position: 2, name: 'Helium', weight: 4.0026, symbol: 'He' },
            { position: 3, name: 'Lithium', weight: 6.941, symbol: 'Li' },
            { position: 4, name: 'Beryllium', weight: 9.0122, symbol: 'Be' },
            { position: 5, name: 'Boron', weight: 10.811, symbol: 'B' },
            { position: 6, name: 'Carbon', weight: 12.0107, symbol: 'C' },
            { position: 7, name: 'Nitrogen', weight: 14.0067, symbol: 'N' },
            { position: 8, name: 'Oxygen', weight: 15.9994, symbol: 'O' },
            { position: 9, name: 'Fluorine', weight: 18.9984, symbol: 'F' },
            { position: 10, name: 'Neon', weight: 20.1797, symbol: 'Ne' },
        ],
    },
};
