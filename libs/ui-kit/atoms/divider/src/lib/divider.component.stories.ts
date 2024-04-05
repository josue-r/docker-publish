import type { Meta, StoryObj } from '@storybook/angular';
import { DividerComponent } from './divider.component';

import { DividerConstants } from './divider.constants';

const meta: Meta<DividerComponent> = {
    component: DividerComponent,
    title: 'DividerComponent',
    tags: ['autodocs'],
    argTypes: {
        orientation: {
            options: Object.values(DividerConstants.Orientation),
            control: { type: 'select' },
            defaultValue: [DividerConstants.Orientation.Horizontal],
            description: 'Orientation of the divider',
        },
        color: {
            options: Object.values(DividerConstants.Color),
            control: { type: 'select' },
            defaultValue: [DividerConstants.Color.Aluminum],
            description: 'Defines the color of the divider',
        },
        thickness: {
            options: Object.values(DividerConstants.Thickness),
            control: { type: 'select' },
            defaultValue: [DividerConstants.Thickness.Thin],
            description: 'Defines the color of the divider',
        },
    },
};

export default meta;
type Story = StoryObj<DividerComponent>;

export const Horizontal: Story = {
    args: {
        orientation: DividerConstants.Orientation.Horizontal,
        color: DividerConstants.Color.Aluminum,
        thickness: DividerConstants.Thickness.Thin,
    },
};

export const Vertical: Story = {
    args: {
        orientation: DividerConstants.Orientation.Vertical,
        color: DividerConstants.Color.Red,
        thickness: DividerConstants.Thickness.Thick,
    },
};
